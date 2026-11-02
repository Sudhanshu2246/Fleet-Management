import React, { useCallback, useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue } from 'react-native-reanimated';

export default function AnimatedTabScreen({ 
  children, 
  style,
  onRefresh,
  refreshing = false,
  contentContainerStyle,
}: { 
  children: React.ReactNode, 
  style?: any,
  onRefresh?: () => void,
  refreshing?: boolean,
  contentContainerStyle?: any,
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const progress = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      progress.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.quad)
      });
    } else {
      progress.value = 0;
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentProgress = isFocused ? progress.value : 1;
    
    return {
      opacity: currentProgress,
    };
  }, [isFocused]);

  const content = onRefresh ? (
    <ScrollView
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#B7F34A']} tintColor="#B7F34A" />
      }
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: '#101211' }, animatedStyle, style]}>
      {content}
    </Animated.View>
  );
}
