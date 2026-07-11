import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useLoginMutation } from '../redux/services/apiSlice';
import { Truck, Phone, User, ShieldCheck } from 'lucide-react-native';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result));
    } catch (err) {
      alert(err.data?.message || 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-12">
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Truck color="white" size={40} />
          </View>
          <Text className="text-3xl font-bold text-dark">FleetIQ Driver</Text>
          <Text className="text-slate-500 mt-2">Enterprise Trip Tracking</Text>
        </View>

        <View className="bg-slate-50 p-6 rounded-3xl shadow-sm border border-slate-100">
          <Text className="text-xl font-semibold text-dark mb-6">Driver Login</Text>

          {/* Driver Name */}
          <View className="mb-4">
            <Text className="text-slate-600 mb-2 ml-1">Driver Name</Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
              <User size={20} color="#64748b" />
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="flex-1 ml-3 text-dark"
                    placeholder="Enter full name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="driverName"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-slate-600 mb-2 ml-1">Phone Number</Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
              <Phone size={20} color="#64748b" />
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="flex-1 ml-3 text-dark"
                    placeholder="Mobile number"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="driverPhone"
              />
            </View>
          </View>

          {/* Vehicle Number */}
          <View className="mb-6">
            <Text className="text-slate-600 mb-2 ml-1">Vehicle Number</Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
              <ShieldCheck size={20} color="#64748b" />
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="flex-1 ml-3 text-dark"
                    placeholder="e.g. MH-12-AB-1234"
                    autoCapitalize="characters"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="vehicleNumber"
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`bg-primary py-4 rounded-xl items-center shadow-md ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Verifying...' : 'Login & Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto items-center py-6">
          <Text className="text-slate-400">© 2026 FleetIQ Logistics Solutions</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
