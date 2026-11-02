import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Image, SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedTabScreen from '@/components/animated-tab-screen';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchVehicleDocumentsThunk } from '../../store/thunks/documentsThunks';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';

export default function DocumentsScreen() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.documents);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchVehicleDocumentsThunk());
    }, [dispatch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchVehicleDocumentsThunk());
    setRefreshing(false);
  }, [dispatch]);

  const handleDownload = async (url: string) => {
    try {
      setDownloading(true);
      const filename = url.split('/').pop() || 'document.jpg';
      const fileUri = `${FileSystem.documentDirectory || ''}${filename}`;
      
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloading(false);
    }
  };

  const renderDocumentRow = (label: string, icon: any, imageUrls: string | string[] | undefined) => {
    let url = null;
    if (imageUrls) {
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        url = imageUrls[0];
      } else if (typeof imageUrls === 'string' && imageUrls.length > 0) {
        try {
          const parsed = JSON.parse(imageUrls);
          if (Array.isArray(parsed) && parsed.length > 0) {
            url = parsed[0];
          }
        } catch {
          url = imageUrls;
        }
      }
    }

    return (
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name={icon} size={18} color={Colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoText}>{url ? 'Uploaded' : 'Not Uploaded'}</Text>
        </View>
        {url && (
          <TouchableOpacity onPress={() => setSelectedImage(url)} style={styles.viewDocBtn}>
            <Feather name="eye" size={14} color={Colors.accent} />
            <Text style={styles.viewDocText}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <AnimatedTabScreen 
      style={styles.container}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={styles.scrollContent}
    >
      {loading && !data && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={() => dispatch(fetchVehicleDocumentsThunk())} />
        </View>
      ) : data ? (
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.headerIconCircle}>
              <Feather name="file-text" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Vehicle Documents</Text>
            <Text style={styles.subtitle}>{data.name} • {data.vehicleNumber}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            
            {renderDocumentRow('Registration (RC)', 'card-account-details-outline', data.rcImage)}
            {renderDocumentRow('Insurance', 'shield-car', data.insuranceImage)}
            {renderDocumentRow('Pollution (PUC)', 'cloud-check', data.pollutionImage)}
            {renderDocumentRow('Other Registration Image', 'file-document-outline', data.registrationImage)}
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Feather name="info" size={36} color={Colors.textMuted} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyText}>No active vehicle assignment found.</Text>
        </View>
      )}

      {/* Full Screen Image Viewer Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.iconButton} onPress={() => selectedImage && handleDownload(selectedImage)} disabled={downloading}>
              {downloading ? (
                <ActivityIndicator color={Colors.accentText} size="small" />
              ) : (
                <Feather name="download" size={20} color={Colors.accentText} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSelectedImage(null)}>
              <Feather name="x" size={22} color={Colors.accentText} />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 12, paddingBottom: 32, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: Colors.error, marginBottom: 16 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  contentWrapper: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  subtitle: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  section: { backgroundColor: Colors.surface, borderRadius: 8, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 13.5, fontWeight: 'bold', color: Colors.text, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  infoLabel: { fontSize: 10.5, color: Colors.textMuted, marginBottom: 1 },
  infoText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  viewDocBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accentSubtle, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, gap: 4, borderWidth: 1, borderColor: 'rgba(183, 243, 74, 0.3)' },
  viewDocText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { position: 'absolute', top: 40, right: 20, zIndex: 10, flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8, backgroundColor: Colors.accent, borderRadius: 20, justifyContent: 'center', alignItems: 'center', width: 40, height: 40 },
  fullImage: { width: '92%', height: '80%' }
});
