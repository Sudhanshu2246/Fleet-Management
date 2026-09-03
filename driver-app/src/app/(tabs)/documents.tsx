import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Image, SafeAreaView, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedTabScreen from '@/components/animated-tab-screen';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchVehicleDocumentsThunk } from '../../store/thunks/documentsThunks';
import { Button } from '../../components/ui/Button';

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
    // Some images might be stored as a string or an array of strings in JSON
    let url = null;
    if (imageUrls) {
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        url = imageUrls[0];
      } else if (typeof imageUrls === 'string' && imageUrls.length > 0) {
        // Just in case it's stringified array or direct url
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
        <MaterialCommunityIcons name={icon} size={20} color="#D4AF37" />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoText}>{url ? 'Uploaded' : 'Not Uploaded'}</Text>
        </View>
        {url && (
          <TouchableOpacity onPress={() => setSelectedImage(url)} style={styles.viewDocBtn}>
            <Feather name="eye" size={16} color="#D4AF37" />
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
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={() => dispatch(fetchVehicleDocumentsThunk())} />
        </View>
      ) : data ? (
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Feather name="file-text" size={48} color="#D4AF37" style={{ marginBottom: 12 }} />
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
          <Feather name="info" size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No active vehicle assignment found.</Text>
        </View>
      )}

      {/* Full Screen Image Viewer Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.iconButton} onPress={() => selectedImage && handleDownload(selectedImage)} disabled={downloading}>
              {downloading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
              <Feather name="download" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSelectedImage(null)}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#ef4444', marginBottom: 16 },
  emptyText: { color: '#6B7280', fontSize: 16, textAlign: 'center' },
  contentWrapper: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  section: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  infoLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 2 },
  infoText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  viewDocBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF3715', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  viewDocText: { color: '#D4AF37', fontSize: 12, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { position: 'absolute', top: 50, right: 20, zIndex: 10, flexDirection: 'row', gap: 15 },
  iconButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, justifyContent: 'center', alignItems: 'center', width: 48, height: 48 },
  fullImage: { width: '90%', height: '80%' }
});
