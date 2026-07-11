import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useGetHistoryQuery } from '../redux/services/apiSlice';
import { logout } from '../redux/slices/authSlice';
import { Truck, MapPin, Calendar, Clock, LogOut, ChevronRight, Plus } from 'lucide-react-native';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, vehicle } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useGetHistoryQuery(page);

  const renderTripCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('TripDetails', { id: item._id })}
      className="bg-white mx-4 mb-4 p-5 rounded-3xl shadow-sm border border-slate-100"
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="bg-slate-100 px-3 py-1 rounded-full">
          <Text className="text-slate-600 text-xs font-bold uppercase">{item.tripId}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${item.status === 'ongoing' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          <Text className={`text-xs font-bold uppercase ${item.status === 'ongoing' ? 'text-amber-700' : 'text-emerald-700'}`}>
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <View className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
        <Text className="text-dark font-medium flex-1" numberOfLines={1}>{item.source?.address || 'Source'}</Text>
      </View>
      <View className="flex-row items-center mb-4">
        <View className="w-2 h-2 rounded-full bg-danger mr-3" />
        <Text className="text-dark font-medium flex-1" numberOfLines={1}>{item.destination?.address || 'Destination'}</Text>
      </View>

      <View className="flex-row border-t border-slate-50 pt-4 justify-between">
        <View className="flex-row items-center">
          <Calendar size={14} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-1">
            {new Date(item.startTime).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Truck size={14} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-1">{item.distanceTravelled?.toFixed(1)} km</Text>
        </View>
        <ChevronRight size={18} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-primary px-6 pt-8 pb-10 rounded-b-[40px] shadow-xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/70 text-base">Welcome Back,</Text>
            <Text className="text-white text-2xl font-bold">{user?.name}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => dispatch(logout())}
            className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center"
          >
            <LogOut color="white" size={24} />
          </TouchableOpacity>
        </View>

        <View className="bg-white/10 p-4 rounded-3xl flex-row items-center">
          <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center mr-4">
            <Truck color="white" size={24} />
          </View>
          <View>
            <Text className="text-white/70 text-xs">Active Vehicle</Text>
            <Text className="text-white text-lg font-bold">{vehicle?.vehicleId}</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 -mt-6">
        <View className="flex-row justify-between items-center px-6 mb-4">
          <Text className="text-dark text-xl font-bold">Trip History</Text>
          <TouchableOpacity>
            <Text className="text-secondary font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data?.trips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isLoading || isFetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-slate-400">No trips found</Text>
            </View>
          }
        />
      </View>

      {/* Floating START TRIP Button */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Navigation')}
        className="absolute bottom-8 right-6 bg-primary px-8 py-5 rounded-full flex-row items-center shadow-2xl"
        style={{ elevation: 10 }}
      >
        <Plus color="white" size={24} className="mr-2" />
        <Text className="text-white font-bold text-lg">START TRIP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DashboardScreen;
