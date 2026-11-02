import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Colors } from '../constants/Colors';
import { updateBookingStatus } from '../store/slices/dashboardSlice';

export default function ActiveBookingScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { trip, assignment, vehicle } = useSelector((state: RootState) => state.dashboard);

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [routeDist, setRouteDist] = useState<string>('84.5');
  const [routeDur, setRouteDur] = useState<string>('1h 45m');

  const startLat = trip?.sourceLat || assignment?.tripFromLat || 28.6139;
  const startLng = trip?.sourceLng || assignment?.tripFromLng || 77.2090;
  const endLat = trip?.destLat || assignment?.tripToLat || 28.4595;
  const endLng = trip?.destLng || assignment?.tripToLng || 77.0266;

  const startPoint = { latitude: startLat, longitude: startLng };
  const endPoint = (endLat && endLng) ? { latitude: endLat, longitude: endLng } : null;

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({}).catch(() => null);
          if (location) {
            setCurrentLocation(location);
            setSpeed(Math.round((location.coords.speed || 0) * 2.23694));
          }

          Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
            (newLoc) => {
              setCurrentLocation(newLoc);
              setSpeed(Math.round((newLoc.coords.speed || 0) * 2.23694));
            }
          ).catch(() => null);
        }
      } catch (e) {
        console.warn('Location error:', e);
      }
    })();
  }, []);

  const getVehicleSvg = (type: string | undefined) => {
    switch (type) {
      case 'truck': return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
      default: return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background: #101211; }
        html, body, #map { height: 100%; width: 100vw; }
        .ping-icon { position: relative; width: 28px; height: 28px; }
        .vehicle-icon-wrapper { width: 28px; height: 28px; background-color: #B7F34A; border-radius: 50%; position: absolute; top: 0px; left: 0px; display: flex; align-items: center; justify-content: center; border: 2px solid #101211; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .ringring { border: 2px solid #B7F34A; border-radius: 50%; height: 34px; width: 34px; position: absolute; left: -3px; top: -3px; animation: pulsate 1.5s ease-out infinite; opacity: 0; z-index: 1; }
        @keyframes pulsate { 0% { transform: scale(0.1); opacity: 0.0; } 50% { opacity: 1.0; } 100% { transform: scale(1.2); opacity: 0.0; } }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${startPoint.latitude}, ${startPoint.longitude}], 12);
        L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(map);

        var startMarker = L.marker([${startPoint.latitude}, ${startPoint.longitude}]).addTo(map).bindPopup('Pickup');
        ${endPoint ? `var endMarker = L.marker([${endPoint.latitude}, ${endPoint.longitude}]).addTo(map).bindPopup('Drop-off');` : ''}

        var pingIcon = L.divIcon({
          className: 'ping-icon',
          html: '<div class="ringring"></div><div class="vehicle-icon-wrapper">${getVehicleSvg(vehicle?.type || 'truck')}</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        ${currentLocation ? `var currentMarker = L.marker([${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}], { icon: pingIcon }).addTo(map).bindPopup('You');` : ''}

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
              var routeLine = L.polyline(coords, { color: '#B7F34A', weight: 4, opacity: 0.9 }).addTo(map);
              map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

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

  const currentStatus = trip?.status || assignment?.status || 'EN_ROUTE';

  const handleUpdateStatus = () => {
    Alert.alert(
      'Complete Active Trip',
      'Are you sure you want to mark this trip as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Trip',
          onPress: () => {
            dispatch(updateBookingStatus('COMPLETED'));
            Alert.alert('Trip Completed', 'Booking status updated to COMPLETED.');
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={18} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTagText}>ACTIVE TRIP EN ROUTE</Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/map-fullscreen')}
          activeOpacity={0.8}
        >
          <Feather name="maximize-2" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Interactive Map Preview Card */}
        <TouchableOpacity
          style={styles.mapCard}
          activeOpacity={0.9}
          onPress={() => router.push('/map-fullscreen')}
        >
          {Platform.OS === 'web' ? (
            <View style={styles.webFallback}>
              <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Interactive Map View</Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} pointerEvents="none">
              <WebView
                style={styles.map}
                source={{ html: mapHtml }}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === 'ROUTE_DATA') {
                      const distKm = (data.distance / 1000).toFixed(1);
                      let durSec = data.duration;
                      if (vehicle?.type === 'truck') durSec *= 1.2;
                      const durHrs = Math.floor(durSec / 3600);
                      const durMins = Math.floor((durSec % 3600) / 60);
                      setRouteDist(distKm);
                      setRouteDur(durHrs > 0 ? `${durHrs}h ${durMins}m` : `${durMins}m`);
                    }
                  } catch(e) {}
                }}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Live Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Feather name="activity" size={15} color={Colors.accent} />
            <Text style={styles.metricVal}>{speed}</Text>
            <Text style={styles.metricLabel}>Speed (mph)</Text>
          </View>

          <View style={styles.metricCard}>
            <Feather name="map-pin" size={15} color={Colors.accent} />
            <Text style={styles.metricVal}>{routeDist} km</Text>
            <Text style={styles.metricLabel}>Distance</Text>
          </View>

          <View style={styles.metricCard}>
            <Feather name="clock" size={15} color={Colors.accent} />
            <Text style={styles.metricVal}>{routeDur}</Text>
            <Text style={styles.metricLabel}>Est. Time</Text>
          </View>
        </View>

        {/* Customer & Booking Summary */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.labelMuted}>BOOKING ID</Text>
              <Text style={styles.bookingIdText}>{trip?.bookingNumber || '#BK-9842'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.labelMuted}>CARGO WEIGHT</Text>
              <Text style={styles.payoutText}>{trip?.weight || '14.2 Tons'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.labelMuted}>CUSTOMER</Text>
              <Text style={styles.customerName}>{trip?.customerName || 'Apex Logistics Ltd'}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${trip?.customerPhone || '+15552345678'}`)}
              activeOpacity={0.8}
            >
              <Feather name="phone-call" size={12} color={Colors.accentText} />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Route Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Navigation</Text>

          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTime}>PICKUP • {trip?.pickupTime || '10:30 AM'}</Text>
                <Text style={styles.routeAddress}>{assignment?.tripFrom || 'Central Logistics Depot, Gate 4'}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: Colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTime}>DROP-OFF • {trip?.dropTime || '03:45 PM'}</Text>
                <Text style={styles.routeAddress}>{assignment?.tripTo || 'Metro Distribution Center, Dock 12'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Complete Trip Action Button */}
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={handleUpdateStatus}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={15} color={Colors.accentText} />
          <Text style={styles.completeBtnText}>Complete Active Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(183, 243, 74, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
  },
  mapCard: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelMuted: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  bookingIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 1,
  },
  payoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  customerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    gap: 4,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentText,
  },
  routeBox: {
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
  },
  verticalLine: {
    width: 1.5,
    height: 12,
    backgroundColor: Colors.borderStrong,
    marginLeft: 3,
    marginVertical: 1,
  },
  routeTime: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 1,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
    marginTop: 4,
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accentText,
  },
});
