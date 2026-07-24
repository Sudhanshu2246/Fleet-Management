import { TextInput, TextInputProps, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export function Input({ label, icon, style, required, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', letterSpacing: 0.5, marginBottom: 6 }}>
          {label}
          {required && <Text style={{ color: '#ef4444', marginLeft: 3 }}> *</Text>}
        </Text>
      )}
      <View 
        className="flex-row items-center border px-4 py-3"
        style={{ 
          backgroundColor: '#F0F4F8', 
          borderColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 10,
        }}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          className="flex-1 text-base text-gray-900"
          placeholderTextColor={Colors.textLight}
          {...props}
        />
      </View>
    </View>
  );
}
