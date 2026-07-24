import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function Button({ title, loading, style, ...props }: ButtonProps) {
  return (
      <TouchableOpacity
      className="w-full flex-row items-center justify-center px-5 py-4"
      style={[{ backgroundColor: Colors.gold, borderRadius: 10, boxShadow: '0px 4px 14px 0px rgba(212, 175, 55, 0.3)', elevation: 5 }, style]}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-white font-bold text-lg">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
