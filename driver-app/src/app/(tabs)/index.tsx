import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, useColorScheme, TouchableOpacity, Alert, Linking } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardDataThunk } from '../../store/thunks/dashboardThunks';
import { updateBookingStatus } from '../../store/slices/dashboardSlice';
import AnimatedTabScreen from '@/components/animated-tab-screen';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { assignment, trip, vehicle, recentBookings } = useSelector((state: RootState) => state.dashboard);

  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [routeDist, setRouteDist] = useState<string>('84.5');
  const [routeDur, setRouteDur] = useState<string>('1h 45m');
  const [refreshing, setRefreshing] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(true);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDashboardDataThunk());
    setRefreshing(false);
  }, [dispatch]);
  
  // Dynamic map points
  const startLat = trip?.sourceLat || assignment?.tripFromLat || 28.6139;
  const startLng = trip?.sourceLng || assignment?.tripFromLng || 77.2090;
  const endLat = trip?.destLat || assignment?.tripToLat || 28.4595;
  const endLng = trip?.destLng || assignment?.tripToLng || 77.0266;

  const startPoint = { latitude: startLat, longitude: startLng };
  const endPoint = (endLat && endLng) ? { latitude: endLat, longitude: endLng } : null;

  const getVehicleSvg = (type: string | undefined) => {
    switch (type) {
      case 'truck': return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
      case 'bus': return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 5.9 18.9 5 17 5H3c-1.4 0-2.5 1.1-2.5 2.5v9.5C.5 18.4 1.6 19.5 3 19.5h1"/><circle cx="6" cy="18" r="2"/><path d="M8 18h6"/><circle cx="16" cy="18" r="2"/></svg>';
      default: return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
    }
  };

  const [speed, setSpeed] = useState(0);

  const requestLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setShowLocationBanner(false);

        let location = await Location.getCurrentPositionAsync({}).catch(() => null);
        if (location) setCurrentLocation(location);

        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (newLoc) => {
            setCurrentLocation(newLoc);
            setSpeed(Math.round((newLoc.coords.speed || 0) * 2.23694));
          }
        ).catch(() => null);
      } else {
        setShowLocationBanner(true);
      }
    } catch (error) {
      console.warn("Location error:", error);
      setShowLocationBanner(false);
    }
  };

  useEffect(() => {
    requestLocation();
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
    let nextStatus = 'COMPLETED';
    if (currentStatus === 'ASSIGNED') nextStatus = 'EN_ROUTE';
    else if (currentStatus === 'EN_ROUTE') nextStatus = 'COMPLETED';

    Alert.alert(
      'Update Status',
      `Change status to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            dispatch(updateBookingStatus(nextStatus));
            Alert.alert('Status Updated', `Booking status changed to ${nextStatus}`);
          }
        }
      ]
    );
  };

  const handleCallCustomer = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'EN_ROUTE':
        return { bg: Colors.accentSubtle, text: Colors.accent, label: 'EN ROUTE' };
      case 'COMPLETED':
        return { bg: 'rgba(74, 222, 128, 0.15)', text: Colors.success, label: 'COMPLETED' };
      case 'SCHEDULED':
        return { bg: 'rgba(96, 165, 250, 0.15)', text: Colors.info, label: 'SCHEDULED' };
      default:
        return { bg: Colors.surfaceElevated, text: Colors.textSecondary, label: status };
    }
  };

  return (
    <AnimatedTabScreen 
      style={styles.container}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <View style={styles.brandIconWrapper}>
            <Feather name="truck" size={13} color={Colors.accentText} />
          </View>
          <Text style={styles.appBarTitle}>FleetIQ Driver</Text>
        </View>

        <View style={styles.appBarActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Notifications', '• New trip assigned for tomorrow\n• Vehicle maintenance check due')}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={15} color={Colors.textSecondary} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dutyToggle, isOnDuty ? styles.dutyOn : styles.dutyOff]}
            onPress={() => setIsOnDuty(!isOnDuty)}
            activeOpacity={0.8}
          >
            <View style={[styles.dutyDot, { backgroundColor: isOnDuty ? Colors.success : Colors.textMuted }]} />
            <Text style={[styles.dutyText, { color: isOnDuty ? Colors.success : Colors.textSecondary }]}>
              {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Driver Header Hero Card */}
      <View style={styles.driverHeroCard}>
        <View style={styles.driverAvatarCircle}>
          <Text style={styles.driverAvatarText}>
            {(user?.name || user?.driverName || 'John Doe').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text style={styles.greetingText}>WELCOME BACK 👋</Text>
          <Text style={styles.driverNameText} numberOfLines={1}>
            {user?.name || user?.driverName || 'John Doe'}
          </Text>
          <View style={styles.vehiclePill}>
            <Feather name="truck" size={10} color={Colors.textSecondary} />
            <Text style={styles.vehiclePillText}>{vehicle?.vehicleNumber || user?.vehicleNumber || 'TRK-4089'}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.vehicleModelText}>{vehicle?.name || 'Volvo FH16'}</Text>
          </View>
        </View>
      </View>

      {/* Location Banner */}
      {showLocationBanner && (
        <View style={styles.locationBanner}>
          <Feather name="map-pin" size={14} color={Colors.accent} />
          <Text style={styles.locationBannerText} numberOfLines={1}>Enable location for live trip navigation</Text>
          <TouchableOpacity style={styles.locationBannerBtn} onPress={requestLocation}>
            <Text style={styles.locationBannerBtnText}>Enable</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLocationBanner(false)}>
            <Feather name="x" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Active Booking Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Active Booking</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeStyle(currentStatus).bg }]}>
            <Text style={[styles.statusText, { color: getStatusBadgeStyle(currentStatus).text }]}>
              {getStatusBadgeStyle(currentStatus).label}
            </Text>
          </View>
        </View>

        <View style={styles.bookingCard}>
          {/* Booking ID & Weight */}
          <View style={styles.bookingMainHeader}>
            <View>
              <Text style={styles.bookingIdLabel}>BOOKING ID</Text>
              <Text style={styles.bookingIdVal}>{trip?.bookingNumber || '#BK-9842'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bookingIdLabel}>CARGO WEIGHT</Text>
              <Text style={styles.payoutVal}>{trip?.weight || '14.2 Tons'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Customer info row */}
          <View style={styles.customerRow}>
            <View style={{ flex: 1, paddingRight: 6 }}>
              <Text style={styles.fieldLabel}>CUSTOMER / CLIENT</Text>
              <Text style={styles.customerName} numberOfLines={1}>
                {trip?.customerName || 'Apex Logistics Ltd'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallCustomer(trip?.customerPhone || '+15552345678')}
              activeOpacity={0.7}
            >
              <Feather name="phone-call" size={12} color={Colors.accentText} />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>

          {/* Route Timeline */}
          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTimeLabel}>PICKUP • {trip?.pickupTime || '10:30 AM'}</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {assignment?.tripFrom || 'Central Logistics Depot, Gate 4'}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTimeLabel}>DROP-OFF • {trip?.dropTime || '03:45 PM'}</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {assignment?.tripTo || 'Metro Distribution Center, Dock 12'}
                </Text>
              </View>
            </View>
          </View>

          {/* Cargo Details */}
          <View style={styles.cargoRow}>
            <View style={styles.cargoPill}>
              <Feather name="box" size={12} color={Colors.textSecondary} />
              <Text style={styles.cargoPillText}>{trip?.cargoType || 'Industrial Equipment'}</Text>
            </View>
            <View style={styles.cargoPill}>
              <Feather name="anchor" size={12} color={Colors.textSecondary} />
              <Text style={styles.cargoPillText}>{trip?.weight || '14.2 Tons'}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => router.push('/map-fullscreen')}
              activeOpacity={0.8}
            >
              <Feather name="navigation" size={13} color={Colors.accentText} />
              <Text style={styles.primaryActionText}>Navigate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={handleUpdateStatus}
              activeOpacity={0.8}
            >
              <Feather name="check-square" size={13} color={Colors.accent} />
              <Text style={styles.secondaryActionText}>Update Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map Card Preview */}
      <View style={styles.sectionContainer}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Live Trip Map</Text>
          <TouchableOpacity onPress={() => router.push('/map-fullscreen')}>
            <Text style={styles.linkText}>Fullscreen Map ↗</Text>
          </TouchableOpacity>
        </View>

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
      </View>

      {/* Quick Metrics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Feather name="activity" size={15} color={Colors.accent} />
          <Text style={styles.statValue}>{speed}</Text>
          <Text style={styles.statLabel}>Speed (mph)</Text>
        </View>

        <View style={styles.statCard}>
          <Feather name="map-pin" size={15} color={Colors.accent} />
          <Text style={styles.statValue}>{routeDist} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statCard}>
          <Feather name="clock" size={15} color={Colors.accent} />
          <Text style={styles.statValue}>{routeDur}</Text>
          <Text style={styles.statLabel}>Est. Time</Text>
        </View>
      </View>

      {/* Recent & Upcoming Bookings Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Recent & Scheduled Bookings</Text>

        {recentBookings && recentBookings.length > 0 ? (
          recentBookings.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                  <Text style={styles.historyBookingNum}>{item.bookingNumber}</Text>
                  <View style={[styles.statusPill, { backgroundColor: getStatusBadgeStyle(item.status).bg }]}>
                    <Text style={[styles.statusPillText, { color: getStatusBadgeStyle(item.status).text }]}>
                      {getStatusBadgeStyle(item.status).label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.historyCustomerRow}>
                <Feather name="user" size={11} color={Colors.textMuted} />
                <Text style={styles.historyCustomerText}>{item.customerName}</Text>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.historyCargoText}>{item.cargoType} ({item.weight})</Text>
              </View>

              <View style={{ marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <Feather name="circle" size={9} color={Colors.success} />
                  <Text style={styles.historyLocationText} numberOfLines={1}>{item.pickupLocation}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Feather name="map-pin" size={9} color={Colors.error} />
                  <Text style={styles.historyLocationText} numberOfLines={1}>{item.dropLocation}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>No additional bookings found.</Text>
          </View>
        )}
      </View>

      {/* Vehicle Summary Card */}
      {vehicle && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Assigned Vehicle</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleIconWrapper}>
                <Feather name="truck" size={14} color={Colors.accentText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>{vehicle.name || 'Volvo FH16'}</Text>
                <Text style={styles.vehiclePlate}>{vehicle.vehicleNumber || 'TRK-4089'}</Text>
              </View>
              <View style={styles.vehicleTypeBadge}>
                <Text style={styles.vehicleTypeText}>{(vehicle.type || 'truck').toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  dutyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 5,
  },
  dutyOn: {
    backgroundColor: Colors.accentSubtle,
    borderWidth: 1,
    borderColor: 'rgba(183, 243, 74, 0.3)',
  },
  dutyOff: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dutyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  driverHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  driverAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  driverAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
  },
  greetingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  driverNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 1,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  vehiclePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dotSeparator: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  vehicleModelText: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  locationBannerBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  locationBannerBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentText,
  },
  sectionContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.text,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingMainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  bookingIdVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 1,
  },
  payoutVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    gap: 4,
  },
  callButtonText: {
    color: Colors.accentText,
    fontSize: 11,
    fontWeight: '800',
  },
  routeBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
  },
  routeLine: {
    width: 1.5,
    height: 12,
    backgroundColor: Colors.borderStrong,
    marginLeft: 3,
    marginVertical: 1,
  },
  routeTimeLabel: {
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
  cargoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  cargoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cargoPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 9,
    borderRadius: 6,
    gap: 5,
  },
  primaryActionText: {
    color: Colors.accentText,
    fontSize: 11.5,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingVertical: 9,
    borderRadius: 6,
    gap: 5,
  },
  secondaryActionText: {
    color: Colors.accent,
    fontSize: 11.5,
    fontWeight: '700',
  },
  mapCard: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyBookingNum: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  historyPayout: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.success,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  historyCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  historyCustomerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bullet: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  historyCargoText: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  historyLocationText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vehicleIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.text,
  },
  vehiclePlate: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  vehicleTypeBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleTypeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
});
