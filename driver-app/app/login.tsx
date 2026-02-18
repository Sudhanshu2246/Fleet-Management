import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [driverName, setDriverName] = useState("");
  const [conductorName, setConductorName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const handleLogin = () => {
    if (!driverName || !conductorName || !vehicleNumber) {
      Alert.alert("Error", "Please fill all details");
      return;
    }

    // Static Credentials (Hardcoded)
    if (
      driverName === "Rahul" &&
      conductorName === "Amit" &&
      vehicleNumber === "UP32AB1234"
    ) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", "Invalid Driver Details");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <Text style={styles.title}>🚌 Driver Login</Text>
        <Text style={styles.subtitle}>
          Enter driver details to continue
        </Text>

        <TextInput
          placeholder="Driver Name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={driverName}
          onChangeText={setDriverName}
        />

        <TextInput
          placeholder="Conductor Name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={conductorName}
          onChangeText={setConductorName}
        />

        <TextInput
          placeholder="Vehicle Number"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Demo: Rahul / Amit / UP32AB1234
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    textAlign: "center",
    marginTop: 15,
    color: "#9CA3AF",
    fontSize: 12,
  },
});
