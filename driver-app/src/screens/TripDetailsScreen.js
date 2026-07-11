import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useGetTripDetailsQuery } from '../redux/services/apiSlice';
import { ChevronLeft, MapPin, Clock, Gauge, Navigation, Calendar } from 'lucide-react-native';
// Note: In a real app, MapLibre would be here. I'll mock the UI structure.

const { width } = Dimensions.get('window');

const TripDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { data, isLoading } = useGetTripDetailsQuery(id);

  if (isLoading || !data) return null;

  const trip = data.trip;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft color="#0f172a" size={28} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-2">Trip Summary</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Mock Map Placeholder */}
        <View className="h-60 bg-slate-100 items-center justify-center m-4 rounded-[40px] border border-slate-200 overflow-hidden">
          <Text className="text-slate-400">Route Map View</Text>
          <Text className="text-slate-400 text-xs mt-2">{trip.path?.length || 0} GPS Points tracked</Text>
        </View>

        <View className="px-6 pb-12">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-sm">Trip ID</Text>
              <Text className="text-dark text-lg font-bold">{trip.tripId}</Text>
            </View>
            <View className="bg-emerald-100 px-4 py-2 rounded-2xl">
              <Text className="text-emerald-700 font-bold">{trip.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Timeline View */}
          <View className="mb-8">
            <View className="flex-row mb-6">
              <View className="items-center mr-4">
                <View className="w-4 h-4 rounded-full bg-emerald-500" />
                <View className="w-0.5 h-12 bg-slate-200" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">SOURCE</Text>
                <Text className="text-dark font-semibold text-base">{trip.source?.address}</Text>
                <Text className="text-slate-500 text-xs mt-1">{new Date(trip.startTime).toLocaleTimeString()}</Text>
              </View>
            </View>
            <View className="flex-row">
              <View className="items-center mr-4">
                <View className="w-4 h-4 rounded-full bg-danger" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">DESTINATION</Text>
                <Text className="text-dark font-semibold text-base">{trip.destination?.address}</Text>
                <Text className="text-slate-500 text-xs mt-1">
                  {trip.endTime ? new Date(trip.endTime).toLocaleTimeString() : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <Text className="text-dark text-lg font-bold mb-4">Trip Metrics</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] bg-slate-50 p-5 rounded-3xl mb-4 border border-slate-100">
              <Navigation size={24} color="#3b82f6" />
              <Text className="text-slate-400 text-xs mt-3">Distance</Text>
              <Text className="text-dark text-xl font-bold">{trip.distanceTravelled?.toFixed(2)} km</Text>
            </View>
            <View className="w-[48%] bg-slate-50 p-5 rounded-3xl mb-4 border border-slate-100">
              <Clock size={24} color="#f59e0b" />
              <Text className="text-slate-400 text-xs mt-3">Duration</Text>
              <Text className="text-dark text-xl font-bold">{trip.duration} mins</Text>
            </View>
            <View className="w-[48%] bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <Gauge size={24} color="#10b981" />
              <Text className="text-slate-400 text-xs mt-3">Avg Speed</Text>
              <Text className="text-dark text-xl font-bold">{trip.averageSpeed?.toFixed(1)} km/h</Text>
            </View>
            <View className="w-[48%] bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <Calendar size={24} color="#ef4444" />
              <Text className="text-slate-400 text-xs mt-3">Max Speed</Text>
              <Text className="text-dark text-xl font-bold">{trip.maxSpeed?.toFixed(1)} km/h</Text>
            </View>
          </View>

          {/* Details */}
          <View className="mt-8 bg-slate-50 p-6 rounded-3xl">
            <Text className="text-dark font-bold mb-4">Vehicle & Crew</Text>
            <View className="flex-row justify-between mb-3">
              <Text className="text-slate-500">Vehicle</Text>
              <Text className="text-dark font-medium">{trip.vehicle?.vehicleId}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-slate-500">Co-Pilot</Text>
              <Text className="text-dark font-medium">{trip.coPilotName || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500">Logistics ID</Text>
              <Text className="text-dark font-medium">{trip._id.substring(0, 8).toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripDetailsScreen;
