import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useState } from "react";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const getLocation = async () => {
    setLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const lat = location.coords.latitude.toFixed(6);
    const lng = location.coords.longitude.toFixed(6);

    setLatitude(lat);
    setLongitude(lng);

    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      const place = reverseGeocode[0];
      const fullAddress = `${place.street || ""}, ${place.city || ""}, ${
        place.region || ""
      }, ${place.country || ""}`;
      setAddress(fullAddress);
    }

    setLoading(false);
  };

  const refreshLocation = () => {
    setLatitude(null);
    setLongitude(null);
    setAddress(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.appTitle}>🌍 Live GPS Tracker</Text>
      <Text style={styles.subtitle}>
        Get your real-time location & full address instantly
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📌 Current Location</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Latitude</Text>
          <Text style={styles.value}>{latitude ?? "— — —"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Longitude</Text>
          <Text style={styles.value}>{longitude ?? "— — —"}</Text>
        </View>

        <View style={styles.addressBox}>
          <Text style={styles.label}>📍 Address</Text>
          <Text style={styles.addressText}>
            {address ?? "Location not fetched yet"}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {latitude ? "🟢 Live Location Active" : "🔴 Location Not Loaded"}
          </Text>
        </View>
      </View>

      {latitude && longitude && (
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>🗺 Live Map View</Text>

          <MapView
            style={styles.map}
            region={{
              latitude: Number(latitude),
              longitude: Number(longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: Number(latitude),
                longitude: Number(longitude),
              }}
              title="You are here"
              description={address || "Current Location"}
            />
          </MapView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <>
          <TouchableOpacity style={styles.primaryButton} onPress={getLocation}>
            <Text style={styles.primaryText}>Get Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={refreshLocation}
          >
            <Text style={styles.secondaryText}>Clear Location</Text>
          </TouchableOpacity>
        </>
      )}

      {latitude && longitude && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/Livetrackingscreen",
              params: {
                lat: latitude,
                lng: longitude,
              },
            })
          }
        >
          <Text style={styles.primaryText}>Open Live Map</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    padding: 20,
    justifyContent: "center",
  },

  appTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    textAlign: "center",
    color: "#E0E7FF",
    marginBottom: 30,
    fontSize: 14,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: "#1E3A8A",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  addressBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },

  addressText: {
    fontSize: 14,
    marginTop: 5,
    color: "#374151",
  },

  statusContainer: {
    marginTop: 15,
    alignItems: "center",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
  },

  primaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },

  mapContainer: {
    marginTop: 20,
    height: 250,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },

  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#ffffff",
  },

  map: {
    flex: 1,
  },
});
