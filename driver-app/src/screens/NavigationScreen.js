import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useSelector } from 'react-redux';
import { useSocket } from '../hooks/useSocket';
import { useLocation } from '../hooks/useLocation';
import { searchPlaces, getRoute } from '../services/mapService';
import { useStartTripMutation, useEndTripMutation } from '../redux/services/apiSlice';
import { Search, Navigation as NavIcon, MapPin, X, ChevronUp, ChevronDown, LocateFixed, LogOut } from 'lucide-react-native';

// Set MapLibre options
MapLibreGL.setAccessToken(null); // Not needed for OSM tiles

const { height, width } = Dimensions.get('window');

const NavigationScreen = ({ navigation }) => {
  const { user, vehicle } = useSelector((state) => state.auth);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  
  const { location, errorMsg } = useLocation(true);
  const { emitLocation } = useSocket(activeTrip?.tripId);
  const [startTripApi] = useStartTripMutation();
  const [endTripApi] = useEndTripMutation();

  // Reference for map camera
  const cameraRef = useRef(null);

  // Sync location to socket during active trip
  useEffect(() => {
    if (isNavigating && location && activeTrip) {
      emitLocation({
        tripId: activeTrip.tripId,
        vehicleId: vehicle.vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
      });
    }
  }, [location, isNavigating]);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 3) {
      const results = await searchPlaces(text);
      setSearchResults(results);
    }
  };

  const selectDestination = async (place) => {
    const dest = {
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    };
    setDestination(dest);
    setSearchResults([]);
    setSearchQuery(place.display_name);

    if (location) {
      const route = await getRoute(
        { lat: location.latitude, lng: location.longitude },
        dest
      );
      setRouteData(route);
      
      // Zoom map to show both points
      cameraRef.current?.fitBounds(
        [dest.lng, dest.lat],
        [location.longitude, location.latitude],
        [50, 50, 50, 50],
        1000
      );
    }
  };

  const onStartTrip = async () => {
    try {
      const tripParams = {
        vehicleId: vehicle.vehicleId,
        source: {
          address: 'Current Location',
          location: { coordinates: [location.longitude, location.latitude] }
        },
        destination: {
          address: destination.address,
          location: { coordinates: [destination.lng, destination.lat] }
        },
        coPilotName: "Shubham Kumar", // Placeholder or from a form
        coPilotPhone: "9876543210"
      };

      const result = await startTripApi(tripParams).unwrap();
      setActiveTrip(result.trip);
      setIsNavigating(true);
    } catch (err) {
      alert('Failed to start trip');
    }
  };

  const onEndTrip = async () => {
    try {
      await endTripApi({
        tripId: activeTrip.tripId,
        finalMetrics: {
          distance: routeData.distance / 1000,
          duration: Math.round(routeData.duration / 60),
          averageSpeed: 45,
          maxSpeed: 65
        }
      }).unwrap();
      
      setIsNavigating(false);
      navigation.navigate('Dashboard');
    } catch (err) {
      alert('Error ending trip');
    }
  };

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView 
        style={styles.map}
        styleURL="https://tiles.openfreemap.org/styles/liberty" // Free tile server
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapLibreGL.Camera 
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={location ? [location.longitude, location.latitude] : [77.2090, 28.6139]}
          followUserLocation={isNavigating}
          followUserMode="course"
        />

        {/* Current Location Marker */}
        <MapLibreGL.UserLocation 
          visible={true}
          animated={true}
        />

        {/* Route Polyline */}
        {routeData && (
          <MapLibreGL.ShapeSource id="routeSource" shape={routeData.geometry}>
            <MapLibreGL.LineLayer 
              id="routeLayer" 
              style={{
                lineColor: '#3b82f6',
                lineWidth: 6,
                lineCap: 'round',
                lineJoin: 'round'
              }} 
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Destination Marker */}
        {destination && (
          <MapLibreGL.PointAnnotation 
            id="destination" 
            coordinate={[destination.lng, destination.lat]}
          >
            <View className="bg-danger p-2 rounded-full border-2 border-white">
              <MapPin color="white" size={20} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}
      </MapLibreGL.MapView>

      {/* Floating Header UI */}
      {!isNavigating ? (
        <SafeAreaView className="absolute top-0 w-full px-4 pt-4">
          <View className="bg-white rounded-3xl shadow-2xl p-2 border border-slate-100">
            <View className="flex-row items-center px-4 py-2">
              <Search color="#64748b" size={20} />
              <TextInput 
                className="flex-1 ml-3 text-dark font-medium h-12"
                placeholder="Where to?"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {setSearchQuery(''); setDestination(null); setRouteData(null);}}>
                  <X color="#94a3b8" size={20} />
                </TouchableOpacity>
              )}
            </View>

            {searchResults.length > 0 && (
              <FlatList 
                data={searchResults}
                className="max-h-60 border-t border-slate-50"
                keyExtractor={(item) => item.place_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => selectDestination(item)}
                    className="flex-row items-center px-4 py-4 border-b border-slate-50"
                  >
                    <MapPin color="#94a3b8" size={18} />
                    <Text className="ml-3 text-slate-700 flex-1" numberOfLines={1}>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </SafeAreaView>
      ) : (
        <View className="absolute top-0 w-full bg-primary pt-12 pb-6 px-6 rounded-b-[40px] shadow-2xl">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <NavIcon color="white" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Next Turn</Text>
              <Text className="text-white text-xl font-bold">Drive 500m Straight</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Info Panel */}
      {destination && (
        <View className="absolute bottom-0 w-full bg-white rounded-t-[40px] shadow-2xl px-8 pt-8 pb-10 border-t border-slate-100">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Destination</Text>
              <Text className="text-dark text-lg font-bold w-48" numberOfLines={1}>{destination.address}</Text>
            </View>
            <View className="items-end">
              <Text className="text-secondary text-2xl font-black">
                {routeData ? Math.round(routeData.duration / 60) : '--'} 
                <Text className="text-sm font-bold"> MIN</Text>
              </Text>
              <Text className="text-slate-400 text-xs font-bold uppercase">
                {routeData ? (routeData.distance / 1000).toFixed(1) : '--'} KM
              </Text>
            </View>
          </View>

          {!isNavigating ? (
            <TouchableOpacity 
              onPress={onStartTrip}
              className="bg-primary flex-row items-center justify-center py-5 rounded-3xl shadow-xl"
            >
              <NavIcon color="white" size={22} />
              <Text className="text-white text-xl font-bold ml-3">START TRIP</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-4">
              <View className="flex-1 bg-slate-50 rounded-2xl p-4 items-center justify-center">
                 <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Current Speed</Text>
                 <Text className="text-dark text-xl font-black">{Math.round(location?.speed * 3.6 || 0)} km/h</Text>
              </View>
              <TouchableOpacity 
                onPress={onEndTrip}
                className="flex-1 bg-danger py-5 rounded-3xl items-center justify-center shadow-lg"
              >
                <LogOut color="white" size={22} />
                <Text className="text-white font-bold ml-2">END TRIP</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Recenter Button */}
      {location && (
        <TouchableOpacity 
          onPress={() => cameraRef.current?.setCamera({ centerCoordinate: [location.longitude, location.latitude], zoomLevel: 15, animationDuration: 1000 })}
          className="absolute bottom-48 right-6 w-14 h-14 bg-white rounded-full items-center justify-center shadow-xl border border-slate-100"
        >
          <LocateFixed color="#1e3a8a" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default NavigationScreen;
