import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, StyleSheet, Platform, TouchableOpacity, useColorScheme, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors } from '../../constants/Colors';
import AnimatedTabScreen from '@/components/animated-tab-screen';

let WebView: any = null;
if (Platform.OS !== 'web') {
  const wv = require('react-native-webview');
  WebView = wv.WebView;
}

export default function MapFullscreenScreen() {
  const router = useRouter();
  const scheme = useColorScheme();

  const { trip, assignment, vehicle } = useSelector((state: RootState) => state.dashboard);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [speed, setSpeed] = useState<number>(0);

  const getVehicleSvg = (type: string | undefined) => {
    switch (type) {
      case 'truck': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
      case 'bus': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 5.9 18.9 5 17 5H3c-1.4 0-2.5 1.1-2.5 2.5v9.5C.5 18.4 1.6 19.5 3 19.5h1"/><circle cx="6" cy="18" r="2"/><path d="M8 18h6"/><circle cx="16" cy="18" r="2"/></svg>';
      default: return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#101211" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let location = await Location.getCurrentPositionAsync({}).catch(() => null);
        if (location) {
          setCurrentLocation(location);
          setSpeed(Math.round((location.coords.speed || 0) * 2.23694));
        }

        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
          (newLoc) => {
            setCurrentLocation(newLoc);
            const currentSpeedMph = Math.round((newLoc.coords.speed || 0) * 2.23694);
            setSpeed(currentSpeedMph);
          }
        ).catch(() => null);
      } catch (error) {
        console.warn("Location error:", error);
      }
    })();
  }, []);
  
  // Dynamic map points from Redux
  const startLat = trip?.sourceLat || assignment?.tripFromLat || 28.6139;
  const startLng = trip?.sourceLng || assignment?.tripFromLng || 77.2090;
  const endLat = trip?.destLat || assignment?.tripToLat || 28.4595;
  const endLng = trip?.destLng || assignment?.tripToLng || 77.0266;

  const startPoint = { latitude: startLat, longitude: startLng };
  const endPoint = (endLat && endLng) ? { latitude: endLat, longitude: endLng } : null;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
      <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
      <style>
        body { padding: 0; margin: 0; background: #101211; }
        html, body, #map { height: 100%; width: 100vw; position: relative; }
        
        .ping-icon { position: relative; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; }
        .vehicle-icon-wrapper { width: 32px; height: 32px; background-color: #B7F34A; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #101211; z-index: 2; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); }
        .ringring { border: 3px solid #B7F34A; border-radius: 50%; height: 40px; width: 40px; position: absolute; animation: pulsate 1.5s ease-out infinite; opacity: 0; z-index: 1; }
        @keyframes pulsate { 0% { transform: scale(0.1); opacity: 0.0; } 50% { opacity: 1.0; } 100% { transform: scale(1.2); opacity: 0.0; } }
        
        .maplibregl-ctrl-bottom-right { 
          right: 16px !important; 
          bottom: 32px !important; 
          display: flex !important; 
          flex-direction: column !important; 
          align-items: flex-end;
          gap: 12px; 
        }
        .maplibregl-ctrl-group { border-radius: 8px !important; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important; border: 1px solid #303830 !important; margin: 0 !important; background: #1B211D !important; }
        .maplibregl-ctrl-group button { width: 42px !important; height: 42px !important; }
        .maplibregl-ctrl-icon { filter: invert(0.9); }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script>
        var map = new maplibregl.Map({
          container: 'map',
          style: {
            version: 8,
            sources: {
              'google-satellite': {
                type: 'raster',
                tiles: ['http://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'],
                tileSize: 256
              }
            },
            layers: [{
              id: 'satellite',
              type: 'raster',
              source: 'google-satellite',
              minzoom: 0,
              maxzoom: 22
            }]
          },
          center: [${startPoint.longitude}, ${startPoint.latitude}],
          zoom: 13,
          pitchWithRotate: true,
          dragRotate: true,
          touchPitch: true
        });

        var compassCtrl = new maplibregl.NavigationControl({ showZoom: false, visualizePitch: true });
        map.addControl(compassCtrl, 'bottom-right');

        var zoomCtrl = new maplibregl.NavigationControl({ showCompass: false });
        map.addControl(zoomCtrl, 'bottom-right');

        var locateCtrl = document.createElement('div');
        locateCtrl.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        locateCtrl.innerHTML = '<button type="button" id="locate-btn" title="My Location" style="display:flex; align-items:center; justify-content:center; cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DCE5D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg></button>';
        document.querySelector('.maplibregl-ctrl-bottom-right').appendChild(locateCtrl);

        var bounds = new maplibregl.LngLatBounds();
        bounds.extend([${startPoint.longitude}, ${startPoint.latitude}]);
        
        var startPopup = new maplibregl.Popup({ offset: 25 }).setHTML(\`<div style="font-family:sans-serif; color:#101211;"><b>Pickup</b><br/>${assignment?.tripFrom || 'Origin'}</div>\`);
        new maplibregl.Marker({ color: '#4ADE80' })
          .setLngLat([${startPoint.longitude}, ${startPoint.latitude}])
          .setPopup(startPopup)
          .addTo(map);

        ${endPoint ? `
        bounds.extend([${endPoint.longitude}, ${endPoint.latitude}]);
        var endPopup = new maplibregl.Popup({ offset: 25 }).setHTML(\`<div style="font-family:sans-serif; color:#101211;"><b>Drop-off</b><br/>${assignment?.tripTo || 'Destination'}</div>\`);
        new maplibregl.Marker({ color: '#FB7185' })
          .setLngLat([${endPoint.longitude}, ${endPoint.latitude}])
          .setPopup(endPopup)
          .addTo(map);
        ` : ''}

        ${currentLocation ? `
        bounds.extend([${currentLocation.coords.longitude}, ${currentLocation.coords.latitude}]);
        
        var el = document.createElement('div');
        el.className = 'ping-icon';
        el.innerHTML = '<div class="ringring"></div><div class="vehicle-icon-wrapper">${getVehicleSvg(vehicle?.type || 'truck')}</div>';
        
        var currentPopup = new maplibregl.Popup({ offset: 25 }).setHTML('<div style="font-family:sans-serif; color:#101211;"><b>You are here</b><br/>Current Location</div>');
        new maplibregl.Marker({ element: el })
          .setLngLat([${currentLocation.coords.longitude}, ${currentLocation.coords.latitude}])
          .setPopup(currentPopup)
          .addTo(map);
        ` : ''}

        map.on('load', function() {
          map.fitBounds(bounds, { padding: 40, animate: false });

          ${endPoint ? `
          var routeWaypoints = [];
          ${currentLocation ? `routeWaypoints.push('${currentLocation.coords.longitude},${currentLocation.coords.latitude}');` : ''}
          routeWaypoints.push('${startPoint.longitude},${startPoint.latitude}');
          routeWaypoints.push('${endPoint.longitude},${endPoint.latitude}');
          
          fetch('https://router.project-osrm.org/route/v1/driving/' + routeWaypoints.join(';') + '?overview=full&geometries=geojson')
            .then(res => res.json())
            .then(data => {
              if (data.routes && data.routes.length > 0) {
                var coords = data.routes[0].geometry.coordinates;
                map.addSource('route', {
                  'type': 'geojson',
                  'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                      'type': 'LineString',
                      'coordinates': coords
                    }
                  }
                });
                map.addLayer({
                  'id': 'route',
                  'type': 'line',
                  'source': 'route',
                  'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  'paint': {
                    'line-color': '#B7F34A',
                    'line-width': 5
                  }
                });
              }
            })
            .catch(e => console.log('Routing error:', e));
          ` : ''}
        });

        document.getElementById('locate-btn').addEventListener('click', function() {
          ${currentLocation ? `
            map.flyTo({ center: [${currentLocation.coords.longitude}, ${currentLocation.coords.latitude}], zoom: 18, duration: 1000 });
          ` : `
            alert('Current location not available yet.');
          `}
        });
      </script>
    </body>
    </html>
  `;

  return (
    <AnimatedTabScreen style={styles.container}>
      {Platform.OS === 'web' || !WebView ? (
        <View style={styles.mapWrapper}>
          <Text style={{ color: Colors.textSecondary }}>Interactive Map View</Text>
        </View>
      ) : (
        <View style={styles.mapWrapper}>
          <WebView
            source={{ html: mapHtml }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
          />
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Feather name="arrow-left" size={20} color={Colors.text} />
      </TouchableOpacity>

      {/* Live Speedometer HUD Card */}
      <View style={styles.speedometerCard}>
        <View style={styles.speedIconWrapper}>
          <Feather name="activity" size={16} color={Colors.accent} />
        </View>
        <View>
          <Text style={styles.speedNumber}>{speed}</Text>
          <Text style={styles.speedUnit}>MPH</Text>
        </View>
      </View>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  mapWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  speedometerCard: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  speedIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 1,
    marginTop: -2,
  },
});
