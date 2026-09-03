import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { logout } from "../../store/slices/authSlice";
import {
  fetchDriverProfileThunk,
  updateDriverProfileThunk,
} from "../../store/thunks/profileThunks";
import { useAppDispatch, useAppSelector } from "../../store";

import AnimatedTabScreen from "@/components/animated-tab-screen";
import { Button } from "../../components/ui/Button";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, loading, updating, error } = useAppSelector(
    (state) => state.profile,
  );

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    licenseNumber: "",
    licenseType: "",
    licenseExpiryDate: "",
    aadhaarCard: "",
    panCard: "",
  });

  // Image State (URIs from ImagePicker)
  const [newImages, setNewImages] = useState({
    profileImage: null as string | null,
    licenseImage: null as string | null,
    aadhaarImage: null as string | null,
    panImage: null as string | null,
  });

  const user = data?.User || {};

  useEffect(() => {
    if (data) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        licenseNumber: data.licenseNumber || "",
        licenseType: data.licenseType || "",
        licenseExpiryDate: data.licenseExpiryDate || "",
        aadhaarCard: data.aadhaarCard || "",
        panCard: data.panCard || "",
      });
    }
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDriverProfileThunk());
    }, [dispatch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDriverProfileThunk());
    setRefreshing(false);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/login");
  };

  const pickImage = (field: keyof typeof newImages) => {
    Alert.alert(
      "Choose Image Source",
      "Would you like to open the camera or select from the gallery?",
      [
        {
          text: "Camera",
          onPress: async () => {
            const permissionResult =
              await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert(
                "Permission Required",
                "You need to allow camera access to take a photo.",
              );
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setNewImages((prev) => ({
                ...prev,
                [field]: result.assets[0].uri,
              }));
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permissionResult =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert(
                "Permission Required",
                "You need to allow gallery access to pick a photo.",
              );
              return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setNewImages((prev) => ({
                ...prev,
                [field]: result.assets[0].uri,
              }));
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setForm((prev) => ({ ...prev, licenseExpiryDate: formattedDate }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      licenseNumber: data?.licenseNumber || "",
      licenseType: data?.licenseType || "",
      licenseExpiryDate: data?.licenseExpiryDate || "",
      aadhaarCard: data?.aadhaarCard || "",
      panCard: data?.panCard || "",
    });
    setNewImages({
      profileImage: null,
      licenseImage: null,
      aadhaarImage: null,
      panImage: null,
    });
  };

  const handleSaveProfile = async () => {
    dispatch({ type: "profile/updateDriverProfile/pending" });
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });

      Object.entries(newImages).forEach(([key, uri]) => {
        if (uri) {
          const filename = uri.split("/").pop() || "image.jpg";
          const match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1].toLowerCase()}` : `image/jpeg`;
          if (type === "image/jpg") type = "image/jpeg";

          formData.append(key, {
            uri,
            name: filename,
            type,
          } as any);
        }
      });

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(`${apiUrl}/api/v1/driver-profile`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        dispatch({
          type: "profile/updateDriverProfile/fulfilled",
          payload: responseData.driver,
        });
        setIsEditing(false);
        setNewImages({
          profileImage: null,
          licenseImage: null,
          aadhaarImage: null,
          panImage: null,
        });
        dispatch(fetchDriverProfileThunk());
      } else {
        dispatch({
          type: "profile/updateDriverProfile/rejected",
          payload: responseData.message || "Failed to update",
        });
        alert("Failed to update profile: " + (responseData.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Save Profile Error:", error);
      dispatch({
        type: "profile/updateDriverProfile/rejected",
        payload: "Network error",
      });
      alert("Network Error: Could not save profile.");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      setDownloading(true);
      const filename = url.split("/").pop() || "document.jpg";
      const fileUri = `${FileSystem.documentDirectory || ""}${filename}`;

      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !data && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={() => dispatch(fetchDriverProfileThunk())}
        />
        <View style={{ marginTop: 20, width: "100%" }}>
          <Button
            title="Logout"
            onPress={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              boxShadow: "0px 4px 14px 0px rgba(239, 68, 68, 0.3)" as any,
            }}
          />
        </View>
      </View>
    );
  }

  const profileImageUrl = newImages.profileImage || user.profileImage;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <AnimatedTabScreen
        style={styles.container}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => isEditing && pickImage("profileImage")}
              disabled={!isEditing}
            >
              <View style={styles.avatar}>
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user.firstName?.[0] || ""}
                    {user.lastName?.[0] || ""}
                  </Text>
                )}
                {isEditing && (
                  <View style={styles.editIconBadge}>
                    <Feather name="camera" size={12} color="#FFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {!isEditing ? (
              <>
                <Text style={styles.name}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.status}>
                  {data?.isActive ? "Active" : "Inactive"} •{" "}
                  {data?.driverType?.replace("_", " ")}
                </Text>
              </>
            ) : (
              <View style={styles.editNameRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.firstName}
                  onChangeText={(t) => setForm({ ...form, firstName: t })}
                  placeholder="First Name"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.lastName}
                  onChangeText={(t) => setForm({ ...form, lastName: t })}
                  placeholder="Last Name"
                />
              </View>
            )}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Feather name="edit-2" size={18} color="#D4AF37" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Feather name="phone" size={18} color="#D4AF37" />
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(t) => setForm({ ...form, phone: t })}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoText}>{user.phone || "N/A"}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Feather name="mail" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>{user.email || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Documents & License</Text>
          </View>

          <View style={styles.section}>
            {/* License Number */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={18}
                color="#D4AF37"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>License Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={form.licenseNumber}
                    onChangeText={(t) => setForm({ ...form, licenseNumber: t })}
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {data?.licenseNumber || "N/A"}
                  </Text>
                )}
              </View>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => pickImage("licenseImage")}
                  style={styles.editDocBtn}
                >
                  <Feather name="upload" size={16} color="#3b82f6" />
                  <Text style={styles.editDocText}>
                    {newImages.licenseImage ? "Selected" : "Update"}
                  </Text>
                </TouchableOpacity>
              ) : (
                data?.licenseImage &&
                data.licenseImage.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(data.licenseImage[0])}
                    style={styles.viewDocBtn}
                  >
                    <Feather name="eye" size={16} color="#D4AF37" />
                    <Text style={styles.viewDocText}>View</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* License Type */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="card-bulleted-outline"
                size={18}
                color="#D4AF37"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>License Type</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={form.licenseType}
                    onChangeText={(t) => setForm({ ...form, licenseType: t })}
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {data?.licenseType || "N/A"}
                  </Text>
                )}
              </View>
            </View>

            {/* Expiry Date */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={18}
                color="#D4AF37"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Expiry Date</Text>
                {isEditing ? (
                  <>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <View style={styles.input}>
                        <Text style={{ color: form.licenseExpiryDate ? '#111827' : '#9ca3af' }}>
                          {form.licenseExpiryDate || "YYYY-MM-DD"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={form.licenseExpiryDate ? new Date(form.licenseExpiryDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}
                  </>
                ) : (
                  <Text style={styles.infoText}>
                    {data?.licenseExpiryDate || "N/A"}
                  </Text>
                )}
              </View>
            </View>

            {/* Aadhaar Card */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="badge-account-horizontal"
                size={18}
                color="#D4AF37"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Aadhaar Card</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={form.aadhaarCard}
                    onChangeText={(t) => setForm({ ...form, aadhaarCard: t })}
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {data?.aadhaarCard || "N/A"}
                  </Text>
                )}
              </View>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => pickImage("aadhaarImage")}
                  style={styles.editDocBtn}
                >
                  <Feather name="upload" size={16} color="#3b82f6" />
                  <Text style={styles.editDocText}>
                    {newImages.aadhaarImage ? "Selected" : "Update"}
                  </Text>
                </TouchableOpacity>
              ) : (
                data?.aadharImage &&
                data.aadharImage.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(data.aadharImage[0])}
                    style={styles.viewDocBtn}
                  >
                    <Feather name="eye" size={16} color="#D4AF37" />
                    <Text style={styles.viewDocText}>View</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* PAN Card */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="card-text-outline"
                size={18}
                color="#D4AF37"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>PAN Card</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={form.panCard}
                    onChangeText={(t) => setForm({ ...form, panCard: t })}
                  />
                ) : (
                  <Text style={styles.infoText}>{data?.panCard || "N/A"}</Text>
                )}
              </View>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => pickImage("panImage")}
                  style={styles.editDocBtn}
                >
                  <Feather name="upload" size={16} color="#3b82f6" />
                  <Text style={styles.editDocText}>
                    {newImages.panImage ? "Selected" : "Update"}
                  </Text>
                </TouchableOpacity>
              ) : (
                data?.panImage &&
                data.panImage.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(data.panImage[0])}
                    style={styles.viewDocBtn}
                  >
                    <Feather name="eye" size={16} color="#D4AF37" />
                    <Text style={styles.viewDocText}>View</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {isEditing ? (
            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                onPress={handleCancelEdit}
                style={styles.cancelBtn}
                textStyle={{ color: "#6b7280" }}
              />
              <Button
                title={updating ? "Saving..." : "Save Changes"}
                onPress={handleSaveProfile}
                disabled={updating}
                style={styles.saveBtn}
              />
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button
                title="Logout"
                onPress={handleLogout}
                style={{
                  backgroundColor: "#ef4444",
                  boxShadow: "0px 4px 14px 0px rgba(239, 68, 68, 0.3)" as any,
                }}
              />
            </View>
          )}
        </View>

        {/* Full Screen Image Viewer Modal */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => selectedImage && handleDownload(selectedImage)}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Feather name="download" size={24} color="#FFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSelectedImage(null)}
              >
                <Feather name="x" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </SafeAreaView>
        </Modal>
      </AnimatedTabScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "#ef4444", marginBottom: 16 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  contentWrapper: { flex: 1 },
  header: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#D4AF37" },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3b82f6",
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  status: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textTransform: "capitalize",
  },
  editNameRow: { flexDirection: "row", gap: 10, width: "80%" },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
    minWidth: 150,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoLabel: { fontSize: 12, color: "#9ca3af", marginBottom: 2 },
  infoText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  buttonContainer: { width: "100%", marginTop: 10 },
  actionButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, backgroundColor: "#f3f4f6" },
  saveBtn: { flex: 2, backgroundColor: "#10b981" },
  viewDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF3715",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewDocText: { color: "#D4AF37", fontSize: 12, fontWeight: "600" },
  editDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editDocText: { color: "#3b82f6", fontSize: 12, fontWeight: "600" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    height: 48,
  },
  fullImage: { width: "90%", height: "80%" },
});
