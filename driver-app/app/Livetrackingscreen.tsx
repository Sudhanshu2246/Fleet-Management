import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

// ─── Use expo-router params OR React Navigation route params ─────────────────
// Expo Router:
import { useLocalSearchParams, useRouter } from "expo-router";
// React Navigation (uncomment if using RN instead of expo-router):
// import { useRoute, useNavigation } from "@react-navigation/native";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Coord {
  latitude: number;
  longitude: number;
}

type TrackingState = "idle" | "tracking" | "paused" | "stopped";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Haversine formula — returns meters between two coords */
function haversineDistance(a: Coord, b: Coord): number {
  const R = 6371000; // Earth radius in metres
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Format seconds → HH:MM:SS */
function formatElapsed(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/** Format metres → "1.23 km" or "450 m" */
function formatDistance(metres: number): string {
  return metres >= 1000
    ? `${(metres / 1000).toFixed(2)} km`
    : `${Math.round(metres)} m`;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function LiveTrackingScreen() {
  // ── PARAMS (initial lat/lng passed from HomeScreen) ──────────────────────
  const { lat, lng } = useLocalSearchParams<{ lat: string; lng: string }>();
  // React Navigation equivalent:
  // const route = useRoute<any>();
  // const { lat, lng } = route.params;

  const router = useRouter();
  // const navigation = useNavigation(); // React Navigation

  const initialCoord: Coord = useMemo(
    () => ({
      latitude: lat ? parseFloat(lat) : 28.6139,
      longitude: lng ? parseFloat(lng) : 77.209,
    }),
    [lat, lng],
  );

  type MovementType = "walking" | "bike" | "car";
  // ── STATE ─────────────────────────────────────────────────────────────────
  const [trackingState, setTrackingState] = useState<TrackingState>("idle");
  const [routeCoords, setRouteCoords] = useState<Coord[]>([initialCoord]);
  const [currentPos, setCurrentPos] = useState<Coord>(initialCoord);
  const [startCoord] = useState<Coord>(initialCoord);
  const [distanceMetres, setDistanceMetres] = useState<number>(0);
  const [elapsedSecs, setElapsedSecs] = useState<number>(0);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  const [movementType, setMovementType] = useState<MovementType>("walking");
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);

  // ── REFS ──────────────────────────────────────────────────────────────────
  const mapRef = useRef<MapView>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const totalDist = useRef<number>(0);
  const lastCoord = useRef<Coord>(initialCoord);

  // ── PULSE ANIMATION for live dot ─────────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    if (trackingState === "tracking") pulse.start();
    else pulse.stop();
    return () => pulse.stop();
  }, [trackingState, pulseAnim]);

  // ── ELAPSED TIMER ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (trackingState === "tracking") {
      timerRef.current = setInterval(() => {
        setElapsedSecs((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [trackingState]);

  // ── CLEANUP on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── ANIMATE CAMERA to current position ───────────────────────────────────
  const animateCamera = useCallback((coord: Coord) => {
    mapRef.current?.animateCamera(
      {
        center: coord,
        pitch: 30,
        heading: 0,
        zoom: 17,
      },
      { duration: 800 },
    );
  }, []);

  // ── START TRACKING ────────────────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission is required to track your route.");
      return;
    }

    setTrackingState("tracking");

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3,
        timeInterval: 1000,
      },
      (location) => {
        const newCoord: Coord = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // 🔥 SPEED DETECTION
        const speedKmh = (location.coords.speed ?? 0) * 3.6;
        setCurrentSpeed(speedKmh);

        if (speedKmh < 6) {
          setMovementType("walking");
        } else if (speedKmh < 25) {
          setMovementType("bike");
        } else {
          setMovementType("car");
        }

        // 🔥 HEADING (for rotation)
        if (location.coords.heading !== null) {
          setHeading(location.coords.heading);
        }

        // 🔥 DISTANCE FILTER
        const delta = haversineDistance(lastCoord.current, newCoord);

        if (delta > 2 && delta < 100) {
          totalDist.current += delta;
          setDistanceMetres(totalDist.current);
          lastCoord.current = newCoord;
          setRouteCoords((prev) => [...prev, newCoord]);
        }

        setCurrentPos(newCoord);
        animateCamera(newCoord);
      },
    );
  }, [animateCamera]);

  // ── PAUSE TRACKING ────────────────────────────────────────────────────────
  const pauseTracking = useCallback(() => {
    locationSub.current?.remove();
    locationSub.current = null;
    setTrackingState("paused");
  }, []);

  // ── RESUME TRACKING ───────────────────────────────────────────────────────
  const resumeTracking = useCallback(async () => {
    setTrackingState("tracking");

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3,
        timeInterval: 1000,
      },
      (location) => {
        const newCoord: Coord = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // 🔥 SPEED DETECTION
        const speedKmh = (location.coords.speed ?? 0) * 3.6;
        setCurrentSpeed(speedKmh);

        if (speedKmh < 6) {
          setMovementType("walking");
        } else if (speedKmh < 25) {
          setMovementType("bike");
        } else {
          setMovementType("car");
        }

        // 🔥 HEADING
        if (location.coords.heading !== null) {
          setHeading(location.coords.heading);
        }

        const delta = haversineDistance(lastCoord.current, newCoord);

        if (delta > 2 && delta < 100) {
          totalDist.current += delta;
          setDistanceMetres(totalDist.current);
          lastCoord.current = newCoord;
          setRouteCoords((prev) => [...prev, newCoord]);
        }

        setCurrentPos(newCoord);
        animateCamera(newCoord);
      },
    );
  }, [animateCamera]);

  // ── STOP TRACKING ─────────────────────────────────────────────────────────
  const stopTracking = useCallback(() => {
    locationSub.current?.remove();
    locationSub.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setTrackingState("stopped");
  }, []);

  // ── RESET ─────────────────────────────────────────────────────────────────
  const resetTracking = useCallback(() => {
    locationSub.current?.remove();
    locationSub.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setRouteCoords([initialCoord]);
    setCurrentPos(initialCoord);
    setDistanceMetres(0);
    setElapsedSecs(0);
    totalDist.current = 0;
    lastCoord.current = initialCoord;
    setTrackingState("idle");
    animateCamera(initialCoord);
  }, [initialCoord, animateCamera]);

  // ── CONTROL BUTTON LOGIC ──────────────────────────────────────────────────
  const handleMainButton = () => {
    if (trackingState === "idle" || trackingState === "stopped")
      startTracking();
    else if (trackingState === "tracking") pauseTracking();
    else if (trackingState === "paused") resumeTracking();
  };

  const mainButtonLabel = () => {
    if (trackingState === "idle") return "▶  Start Tracking";
    if (trackingState === "tracking") return "⏸  Pause";
    if (trackingState === "paused") return "▶  Resume";
    if (trackingState === "stopped") return "▶  Restart";
    return "";
  };

  const mainButtonColor = () => {
    if (trackingState === "tracking") return "#f97316";
    if (trackingState === "paused") return "#3b82f6";
    return "#22c55e";
  };

  // ── STATUS LABEL ──────────────────────────────────────────────────────────
  const statusLabel = () => {
    if (trackingState === "idle") return { text: "● Ready", color: "#94a3b8" };
    if (trackingState === "tracking")
      return { text: "● Live", color: "#22c55e" };
    if (trackingState === "paused")
      return { text: "⏸ Paused", color: "#f59e0b" };
    if (trackingState === "stopped")
      return { text: "■ Stopped", color: "#ef4444" };
    return { text: "", color: "#fff" };
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Route Tracker</Text>
          <Text style={[styles.statusBadge, { color: statusLabel().color }]}>
            {statusLabel().text}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📍</Text>
          <Text style={styles.statValue}>{formatDistance(distanceMetres)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={[styles.statCard, styles.statCardCenter]}>
          <Text style={styles.statIcon}>⏱</Text>
          <Text style={[styles.statValue, styles.statValueTimer]}>
            {formatElapsed(elapsedSecs)}
          </Text>
          <Text style={styles.statLabel}>Elapsed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🚀</Text>
          <Text style={styles.statValue}>{currentSpeed.toFixed(1)} km/h</Text>
          <Text style={styles.statLabel}>{movementType.toUpperCase()}</Text>
        </View>
      </View>

      {/* ── MAP ───────────────────────────────────────────────────────────── */}
      <View style={styles.mapWrapper}>
        {!isMapReady && (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.mapLoaderText}>Loading Map…</Text>
          </View>
        )}

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: initialCoord.latitude,
            longitude: initialCoord.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false} // we draw our own live dot
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          onMapReady={() => setIsMapReady(true)}
        >
          {/* ── Route Polyline (highlighted orange path) ── */}
          {routeCoords.length > 1 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#f97316"
              strokeWidth={5}
              lineJoin="round"
              lineCap="round"
            />
          )}

          {/* ── START MARKER (green pin) ── */}
          <Marker
            coordinate={startCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            title="Start Point"
            description="Your journey started here"
          >
            <View style={styles.startMarker}>
              <Text style={styles.startMarkerText}>S</Text>
            </View>
          </Marker>

          {/* ── CURRENT POSITION (animated blue dot) ── */}
          {trackingState !== "idle" && (
            // <Marker
            //   coordinate={currentPos}
            //   anchor={{ x: 0.5, y: 0.5 }}
            //   title="You are here"
            //   description={`${currentPos.latitude.toFixed(5)}, ${currentPos.longitude.toFixed(5)}`}
            // >
            //   <View style={styles.liveDotWrapper}>
            //     {/* Pulse ring */}
            //     <Animated.View
            //       style={[
            //         styles.liveDotPulse,
            //         {
            //           transform: [{ scale: pulseAnim }],
            //           opacity: trackingState === "tracking" ? 0.35 : 0,
            //         },
            //       ]}
            //     />
            //     {/* Inner dot */}
            //     <View
            //       style={[
            //         styles.liveDot,
            //         trackingState === "paused" && styles.liveDotPaused,
            //       ]}
            //     />
            //   </View>
            // </Marker>

            <Marker coordinate={currentPos} anchor={{ x: 0.5, y: 0.5 }}>
              <Animated.View
                style={[
                  styles.vehicleWrapper,
                  {
                    transform: [
                      { scale: pulseAnim },
                      { rotate: `${heading}deg` },
                    ],
                  },
                ]}
              >
                <Text style={styles.vehicleIcon}>
                  {movementType === "walking"
                    ? "🚶"
                    : movementType === "bike"
                      ? "🏍"
                      : "🚗"}
                </Text>
              </Animated.View>
            </Marker>
          )}

          {/* ── END MARKER when stopped ── */}
          {trackingState === "stopped" && (
            <Marker
              coordinate={currentPos}
              anchor={{ x: 0.5, y: 0.5 }}
              title="End Point"
              description="Your journey ended here"
            >
              <View style={styles.endMarker}>
                <Text style={styles.endMarkerText}>E</Text>
              </View>
            </Marker>
          )}
        </MapView>

        {/* ── Re-center FAB ── */}
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={() => animateCamera(currentPos)}
        >
          <Text style={styles.recenterIcon}>⊕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.speedOverlay}>
        <Text style={styles.speedValue}>{currentSpeed.toFixed(0)}</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>

      {/* ── CONTROL BUTTONS ───────────────────────────────────────────────── */}
      <View style={styles.controls}>
        {/* Main action button */}
        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: mainButtonColor() }]}
          onPress={handleMainButton}
          activeOpacity={0.82}
        >
          <Text style={styles.mainBtnText}>{mainButtonLabel()}</Text>
        </TouchableOpacity>

        {/* Row: Stop + Reset */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              trackingState === "stopped" && styles.secondaryBtnDisabled,
            ]}
            onPress={stopTracking}
            disabled={trackingState === "idle" || trackingState === "stopped"}
          >
            <Text style={styles.secondaryBtnText}>■ Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={resetTracking}>
            <Text style={styles.secondaryBtnText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SUMMARY CARD (shown when stopped) ─────────────────────────────── */}
      {trackingState === "stopped" && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🏁 Journey Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Distance</Text>
            <Text style={styles.summaryValue}>
              {formatDistance(distanceMetres)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Time</Text>
            <Text style={styles.summaryValue}>
              {formatElapsed(elapsedSecs)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Waypoints Recorded</Text>
            <Text style={styles.summaryValue}>{routeCoords.length}</Text>
          </View>
          {elapsedSecs > 0 && distanceMetres > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Avg Speed</Text>
              <Text style={styles.summaryValue}>
                {((distanceMetres / elapsedSecs) * 3.6).toFixed(1)} km/h
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 10,
  },
  backIcon: {
    color: "#f8fafc",
    fontSize: 24,
    lineHeight: 28,
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 36,
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statCardCenter: {
    borderColor: "#f97316",
    borderWidth: 1.5,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  statValueTimer: {
    fontVariant: ["tabular-nums"],
    color: "#f97316",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Map ──
  mapWrapper: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#334155",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  mapLoaderText: {
    color: "#94a3b8",
    marginTop: 10,
    fontSize: 13,
  },

  // ── Markers ──
  startMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  startMarkerText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 11,
  },
  endMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#ffffff",
    elevation: 5,
  },
  endMarkerText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 11,
  },
  liveDotWrapper: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  liveDotPulse: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
  },
  liveDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    borderWidth: 2.5,
    borderColor: "#ffffff",
    elevation: 5,
  },
  liveDotPaused: {
    backgroundColor: "#f59e0b",
  },

  // ── Re-center button ──
  recenterBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1e293b",
    borderWidth: 1.5,
    borderColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  recenterIcon: {
    color: "#f97316",
    fontSize: 22,
    lineHeight: 26,
  },

  // ── Controls ──
  controls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },
  mainBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  mainBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  secondaryBtnDisabled: {
    opacity: 0.35,
  },
  secondaryBtnText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Summary Card ──
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f97316",
  },
  summaryTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },
  summaryValue: {
    color: "#f97316",
    fontSize: 13,
    fontWeight: "700",
  },
  vehicleWrapper: {
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f97316",
    elevation: 6,
  },

  vehicleIcon: {
    fontSize: 22,
  },
  speedOverlay: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  speedValue: {
    color: "#22c55e",
    fontSize: 26,
    fontWeight: "800",
  },

  speedUnit: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: -4,
  },
});
