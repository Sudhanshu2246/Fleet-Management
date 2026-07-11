import { useState, useEffect } from 'react';
import * as Location from 'react-native-location'; // Or standard Geolocation

export const useLocation = (isTracking) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const startTracking = async () => {
      let { status } = await Location.requestPermission({
        ios: 'whenInUse',
        android: {
          detail: 'fine',
          rationale: {
            title: "We need to access your location",
            message: "We use your location to track your trip and provide navigation.",
            buttonPositive: "OK",
            buttonNegative: "Cancel"
          }
        }
      });

      if (!status) {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      unsubscribe = Location.subscribeToLocationUpdates(locations => {
        const latest = locations[0];
        setLocation({
          latitude: latest.latitude,
          longitude: latest.longitude,
          speed: latest.speed,
          heading: latest.course,
          timestamp: latest.timestamp,
        });
      });
    };

    if (isTracking) {
      startTracking();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isTracking]);

  return { location, errorMsg };
};
