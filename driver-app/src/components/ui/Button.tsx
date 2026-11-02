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
      className="w-full flex-row items-center justify-center px-4 py-3"
      style={[{ backgroundColor: Colors.accent, borderRadius: 6, elevation: 3 }, style]}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={Colors.accentText} size="small" />
      ) : (
        <Text style={[{ color: Colors.accentText, fontWeight: '800', fontSize: 13 }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
