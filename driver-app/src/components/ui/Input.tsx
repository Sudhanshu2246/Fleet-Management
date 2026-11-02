import { TextInput, TextInputProps, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export function Input({ label, icon, style, required, ...props }: InputProps) {
  return (
    <View className="mb-3">
      {label && (
        <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4 }}>
          {label}
          {required && <Text style={{ color: Colors.error, marginLeft: 2 }}> *</Text>}
        </Text>
      )}
      <View 
        className="flex-row items-center border px-3 py-2"
        style={{ 
          backgroundColor: Colors.surfaceElevated,
          borderColor: Colors.border,
          borderRadius: 6,
        }}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          className="flex-1 text-sm"
          style={{ color: Colors.text }}
          placeholderTextColor={Colors.textMuted}
          {...props}
        />
      </View>
    </View>
  );
}
