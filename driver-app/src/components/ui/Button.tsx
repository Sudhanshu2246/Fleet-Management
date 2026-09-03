import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator, TextStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({ title, loading, style, textStyle, ...props }: ButtonProps) {
  return (
      <TouchableOpacity
      className="w-full flex-row items-center justify-center px-5 py-4"
      style={[{ backgroundColor: Colors.gold, borderRadius: 10, boxShadow: '0px 4px 14px 0px rgba(212, 175, 55, 0.3)' as any, elevation: 5 }, style]}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-white font-bold text-lg" style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
