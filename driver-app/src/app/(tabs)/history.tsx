import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors } from '../../constants/Colors';
import AnimatedTabScreen from '@/components/animated-tab-screen';

export default function HistoryScreen() {
  const router = useRouter();
  const { recentBookings, trip } = useSelector((state: RootState) => state.dashboard);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EN_ROUTE' | 'COMPLETED' | 'SCHEDULED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filteredBookings = useMemo(() => {
    let list = recentBookings || [];

    if (activeFilter !== 'ALL') {
      list = list.filter(b => b.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.pickupLocation.toLowerCase().includes(q) ||
        b.dropLocation.toLowerCase().includes(q)
      );
    }

    return list;
  }, [recentBookings, activeFilter, searchQuery]);

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

  const handleBookingPress = (item: any) => {
    if (item.status === 'EN_ROUTE') {
      router.push('/active-booking');
    } else {
      router.push({
        pathname: '/booking-details',
        params: { id: item.id }
      });
    }
  };

  return (
    <AnimatedTabScreen 
      style={styles.container}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Top Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <Feather name="clock" size={16} color={Colors.accentText} />
          </View>
          <Text style={styles.headerTitle}>Trip History & Bookings</Text>
        </View>
      </View>

      {/* Summary KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>24</Text>
          <Text style={styles.kpiLabel}>Total Trips</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: Colors.success }]}>22</Text>
          <Text style={styles.kpiLabel}>Completed</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: Colors.accent }]}>98%</Text>
          <Text style={styles.kpiLabel}>On-Time Rate</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Feather name="search" size={14} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Booking ID, customer or city..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'EN_ROUTE', 'COMPLETED', 'SCHEDULED'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive
              ]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterTabText,
                isActive && styles.filterTabTextActive
              ]}>
                {filter === 'EN_ROUTE' ? 'En Route' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bookings List */}
      <View style={styles.listContainer}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((item) => {
            const badgeStyle = getStatusBadgeStyle(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.bookingCard}
                onPress={() => handleBookingPress(item)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.bookingNumberText}>{item.bookingNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                        {badgeStyle.label}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.customerRow}>
                  <Feather name="user" size={11} color={Colors.textMuted} />
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.cargoInfo}>{item.cargoType} ({item.weight})</Text>
                </View>

                <View style={styles.routeContainer}>
                  <View style={styles.routeRow}>
                    <Feather name="circle" size={9} color={Colors.success} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {item.pickupLocation}
                    </Text>
                  </View>

                  <View style={styles.routeRow}>
                    <Feather name="map-pin" size={9} color={Colors.error} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {item.dropLocation}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.timeText}>{item.pickupTime}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.detailsLink}>View Details</Text>
                    <Feather name="chevron-right" size={12} color={Colors.accent} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={32} color={Colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySub}>No trips matched your search filter criteria.</Text>
          </View>
        )}
      </View>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerBar: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 6,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.text,
  },
  kpiLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 6,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.accentSubtle,
    borderColor: 'rgba(183, 243, 74, 0.4)',
  },
  filterTabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.accent,
    fontWeight: '800',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  payoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.success,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  customerName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dot: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  cargoInfo: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  routeContainer: {
    backgroundColor: Colors.surfaceElevated,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 11,
    color: Colors.text,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  detailsLink: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  emptyContainer: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
