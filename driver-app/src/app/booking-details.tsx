import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Colors } from '../constants/Colors';
import { updateBookingStatus } from '../store/slices/dashboardSlice';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();

  const bookingIdParam = (params.id as string) || 'BK-9842';

  const { recentBookings, trip, assignment, vehicle } = useSelector((state: RootState) => state.dashboard);

  // Find booking from Redux or fallback to default
  const booking = recentBookings.find(b => b.id === bookingIdParam || b.bookingNumber === bookingIdParam) || {
    id: 'BK-9842',
    bookingNumber: '#BK-9842',
    customerName: trip?.customerName || 'Apex Logistics Ltd',
    customerPhone: trip?.customerPhone || '+1 (555) 234-5678',
    pickupLocation: assignment?.tripFrom || 'Central Logistics Depot, Gate 4',
    pickupTime: trip?.pickupTime || 'Today, 10:30 AM',
    dropLocation: assignment?.tripTo || 'Metro Distribution Center, Dock 12',
    dropTime: trip?.dropTime || 'Today, 03:45 PM',
    cargoType: trip?.cargoType || 'Industrial Equipment',
    weight: trip?.weight || '14.2 Tons',
    payout: trip?.payout || '$480.00',
    status: (trip?.status || 'EN_ROUTE') as any,
  };

  const getStatusStyle = (status: string) => {
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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleUpdateStatus = () => {
    let nextStatus = 'COMPLETED';
    if (booking.status === 'ASSIGNED') nextStatus = 'EN_ROUTE';
    else if (booking.status === 'EN_ROUTE') nextStatus = 'COMPLETED';

    Alert.alert(
      'Update Booking Status',
      `Change booking status to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            dispatch(updateBookingStatus(nextStatus));
            Alert.alert('Status Updated', `Booking ${booking.bookingNumber} updated to ${nextStatus}`);
          }
        }
      ]
    );
  };

  const currentStatusStyle = getStatusStyle(booking.status);

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
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Status & Payout Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.labelMuted}>BOOKING NUMBER</Text>
              <Text style={styles.bookingNumberText}>{booking.bookingNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: currentStatusStyle.text }]}>
                {currentStatusStyle.label}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.labelMuted}>CARGO WEIGHT</Text>
              <Text style={styles.payoutText}>{booking.weight}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.labelMuted}>CARGO TYPE</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 2 }}>
                {booking.cargoType}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Customer Details</Text>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.customerNameText}>{booking.customerName}</Text>
              <Text style={styles.customerPhoneText}>{booking.customerPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(booking.customerPhone)}
              activeOpacity={0.8}
            >
              <Feather name="phone-call" size={12} color={Colors.accentText} />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Route Timeline Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Trip Route & Locations</Text>

          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>PICKUP LOCATION • {booking.pickupTime}</Text>
                <Text style={styles.routeAddressText}>{booking.pickupLocation}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: Colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>DROP-OFF LOCATION • {booking.dropTime}</Text>
                <Text style={styles.routeAddressText}>{booking.dropLocation}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.labelMuted}>DISTANCE</Text>
              <Text style={styles.metricValue}>84.5 km</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.labelMuted}>EST. DURATION</Text>
              <Text style={styles.metricValue}>1h 45m</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.labelMuted}>CARGO</Text>
              <Text style={styles.metricValue}>{booking.weight}</Text>
            </View>
          </View>
        </View>

        {/* Cargo & Vehicle Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Cargo & Vehicle Summary</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Feather name="box" size={14} color={Colors.accent} />
              <View>
                <Text style={styles.labelMuted}>Cargo Type</Text>
                <Text style={styles.infoCellVal}>{booking.cargoType}</Text>
              </View>
            </View>

            <View style={styles.infoCell}>
              <Feather name="truck" size={14} color={Colors.accent} />
              <View>
                <Text style={styles.labelMuted}>Assigned Vehicle</Text>
                <Text style={styles.infoCellVal}>{vehicle?.vehicleNumber || 'TRK-4089'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/map-fullscreen')}
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={14} color={Colors.accentText} />
            <Text style={styles.primaryBtnText}>Navigate on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleUpdateStatus}
            activeOpacity={0.8}
          >
            <Feather name="check-square" size={14} color={Colors.accent} />
            <Text style={styles.secondaryBtnText}>Update Status</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
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
  bookingNumberText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  payoutText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  customerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  customerPhoneText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    marginBottom: 10,
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
  routeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  routeAddressText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCellVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 11,
    borderRadius: 6,
    gap: 6,
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentText,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingVertical: 11,
    borderRadius: 6,
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
});
