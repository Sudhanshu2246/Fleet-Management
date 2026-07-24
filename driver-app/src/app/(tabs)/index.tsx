import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, useColorScheme, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardDataThunk } from '../../store/thunks/dashboardThunks';
import AnimatedTabScreen from '@/components/animated-tab-screen';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isMapDark = scheme === 'dark'; 

  const dispatch = useDispatch<AppDispatch>();
  const { assignment, trip, vehicle, loading } = useSelector((state: RootState) => state.dashboard);

  const [locationPermissionGranted, setLocationPermissionGranted] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [routeDist, setRouteDist] = useState<string>('--');
  const [routeDur, setRouteDur] = useState<string>('--');
  
  // Dynamic map points from Redux
  const startLat = trip?.sourceLat || assignment?.tripFromLat || 22.9734;
  const startLng = trip?.sourceLng || assignment?.tripFromLng || 78.6569;
  const endLat = trip?.destLat || assignment?.tripToLat;
  const endLng = trip?.destLng || assignment?.tripToLng;

  const startPoint = { latitude: startLat, longitude: startLng };
  const endPoint = (endLat && endLng) ? { latitude: endLat, longitude: endLng } : null;

  const getVehicleSvg = (type: string | undefined) => {
    switch (type) {
      case 'truck': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
      case 'bus': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 5.9 18.9 5 17 5H3c-1.4 0-2.5 1.1-2.5 2.5v9.5C.5 18.4 1.6 19.5 3 19.5h1"/><circle cx="6" cy="18" r="2"/><path d="M8 18h6"/><circle cx="16" cy="18" r="2"/></svg>';
      case 'motorcycle': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>';
      default: return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'; // car
    }
  };

  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(trip?.distanceTravelled || 0);
  
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissionGranted(false);
          return;
        }
        
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setLocationPermissionGranted(false);
          return;
        }

        setLocationPermissionGranted(true);

        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
        
        // Keep tracking location
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (newLoc) => {
            setCurrentLocation(newLoc);
            setSpeed(Math.round((newLoc.coords.speed || 0) * 2.23694)); // m/s to mph
          }
        );
      } catch (error) {
        console.warn("Location error:", error);
        setLocationPermissionGranted(false);
      }
    })();

    // Fetch dynamic dashboard data
    dispatch(fetchDashboardDataThunk());
  }, [dispatch]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; }
        .ping-icon { position: relative; width: 32px; height: 32px; }
        .vehicle-icon-wrapper { width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; position: absolute; top: 0px; left: 0px; display: flex; align-items: center; justify-content: center; border: 2px solid white; z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.4); }
        .ringring { border: 3px solid #3b82f6; border-radius: 50%; height: 40px; width: 40px; position: absolute; left: -4px; top: -4px; animation: pulsate 1.5s ease-out infinite; opacity: 0; z-index: 1; }
        @keyframes pulsate { 0% { transform: scale(0.1); opacity: 0.0; } 50% { opacity: 1.0; } 100% { transform: scale(1.2); opacity: 0.0; } }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${startPoint.latitude}, ${startPoint.longitude}], 13);
        L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(map);

        var startMarker = L.marker([${startPoint.latitude}, ${startPoint.longitude}]).addTo(map).bindPopup('Start');
        ${endPoint ? `var endMarker = L.marker([${endPoint.latitude}, ${endPoint.longitude}]).addTo(map).bindPopup('End');` : ''}
        
        var pingIcon = L.divIcon({
          className: 'ping-icon',
          html: '<div class="ringring"></div><div class="vehicle-icon-wrapper">${getVehicleSvg(vehicle?.type)}</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        ${currentLocation ? `var currentMarker = L.marker([${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}], { icon: pingIcon }).addTo(map).bindPopup('You are here');` : ''}

        var group = new L.featureGroup([startMarker${endPoint ? ', endMarker' : ''}${currentLocation ? ', currentMarker' : ''}]);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });

        ${endPoint ? `
        var routeWaypoints = [];
        ${currentLocation ? `routeWaypoints.push('${currentLocation.coords.longitude},${currentLocation.coords.latitude}');` : ''}
        routeWaypoints.push('${startPoint.longitude},${startPoint.latitude}');
        routeWaypoints.push('${endPoint.longitude},${endPoint.latitude}');
        
        fetch('https://router.project-osrm.org/route/v1/driving/' + routeWaypoints.join(';') + '?overview=full&geometries=geojson')
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              var coords = data.routes[0].geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
              var routeLine = L.polyline(coords, { color: '#D4AF37', weight: 5, opacity: 0.9 }).addTo(map);
              map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'ROUTE_DATA', 
                  distance: data.routes[0].distance, 
                  duration: data.routes[0].duration 
                }));
              }
            }
          })
          .catch(e => console.log('Routing error:', e));
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <AnimatedTabScreen style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Blocking Location Modal */}
        <Modal visible={!locationPermissionGranted} animationType="fade" transparent>
          <View style={styles.permissionModal}>
            <Feather name="map-pin" size={48} color={Colors.gold} style={{ marginBottom: 16 }} />
            <Text style={styles.permissionTitle}>Location Access Required</Text>
            <Text style={styles.permissionText}>
              This app requires location access to track your trip and provide real-time updates. Please enable location services in your device settings to continue.
            </Text>
          </View>
        </Modal>

        {/* Map Card */}
        <TouchableOpacity 
          style={[styles.mapCard, { overflow: 'hidden' }]} 
          activeOpacity={0.8}
          onPress={() => router.push('/map-fullscreen')}
        >
          {Platform.OS === 'web' ? (
            <View style={[styles.map, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
              <Text>Web map coming soon</Text>
            </View>
          ) : (
            <WebView 
              style={styles.map} 
              source={{ html: mapHtml }} 
              scrollEnabled={false}
              pointerEvents="none"
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'ROUTE_DATA') {
                    const distKm = (data.distance / 1000).toFixed(1);
                    let durSec = data.duration;
                    // If truck, increase estimated duration by 20%
                    if (vehicle?.type === 'truck') {
                      durSec *= 1.2;
                    }
                    const durHrs = Math.floor(durSec / 3600);
                    const durMins = Math.floor((durSec % 3600) / 60);
                    setRouteDist(distKm);
                    setRouteDur(durHrs > 0 ? `${durHrs}h ${durMins}m` : `${durMins}m`);
                  }
                } catch(e) {}
              }}
            />
          )}
        </TouchableOpacity>

        {/* Stat Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Feather name="activity" size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{speed}</Text>
            <Text style={styles.statLabel}>Current Speed (mph)</Text>
          </View>

          <View style={styles.statCard}>
            <Feather name="clock" size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{routeDur}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
        
        {/* Additional Stat Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Feather name="map-pin" size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{routeDist} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

        <View style={styles.statCard}>
          <Feather name="check-circle" size={24} color={'#10B981'} />
          <Text style={styles.statValue}>{assignment?.status || 'Offline'}</Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      {/* Trip Route Details */}
      {assignment && (
        <View style={[styles.statsContainer, { paddingBottom: 10 }]}>
          <View style={[styles.statCard, { alignItems: 'flex-start' }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8 }}>Route</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Feather name="circle" size={12} color="green" style={{ marginRight: 8 }} />
              <Text style={{ color: '#4B5563', flex: 1 }} numberOfLines={1}>{assignment.tripFrom || 'Unknown'}</Text>
            </View>
            <View style={{ width: 1, height: 16, backgroundColor: '#E5E7EB', marginLeft: 5, marginVertical: 2 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="map-pin" size={12} color="red" style={{ marginRight: 8 }} />
              <Text style={{ color: '#4B5563', flex: 1 }} numberOfLines={1}>{assignment.tripTo || 'Unknown'}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12, width: '100%' }}>
              <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Distance</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 4 }}>{routeDist} km</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Est. Duration</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 4 }}>{routeDur}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Vehicle Details */}
      {vehicle && (
        <View style={[styles.statsContainer, { paddingBottom: 20 }]}>
          <View style={[styles.statCard, { alignItems: 'flex-start' }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 }}>Vehicle Information</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather name="truck" size={16} color={Colors.gold} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Number Plate</Text>
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 14 }}>{vehicle.vehicleNumber || 'N/A'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather name="tag" size={16} color={Colors.gold} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Name / Model</Text>
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 14 }}>{vehicle.name || 'N/A'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="info" size={16} color={Colors.gold} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Type</Text>
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 14, textTransform: 'capitalize' }}>{vehicle.type || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Co-Driver Details */}
      {trip?.CoDriver && (
        <View style={[styles.statsContainer, { paddingBottom: 20 }]}>
          <View style={[styles.statCard, { alignItems: 'flex-start' }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 }}>Co-Driver Information</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather name="users" size={16} color={Colors.gold} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Name</Text>
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 14 }}>{trip.CoDriver.firstName} {trip.CoDriver.lastName}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather name="phone" size={16} color={Colors.gold} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Phone Number</Text>
                <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 14 }}>{trip.CoDriver.phone || 'N/A'}</Text>
              </View>
            </View>
            {trip.CoDriver.email && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="mail" size={16} color={Colors.gold} style={{ marginRight: 12 }} />
                <View>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Email</Text>
                  <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 14 }}>{trip.CoDriver.email}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      </ScrollView>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapCard: {
    height: 300,
    width: '100%',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  permissionModal: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  webFallbackText: {
    marginTop: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  }
});
