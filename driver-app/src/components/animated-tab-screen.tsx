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
      // Start the animation to 1
      progress.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.out(Easing.cubic) 
      });
    } else {
      // Instantly reset when navigating away
      progress.value = 0;
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    // Use isFocused directly in the style block.
    // This forces the component to render at progress=0 on the EXACT frame it becomes visible,
    // completely eliminating the 1-frame flash/blink.
    const currentProgress = isFocused ? progress.value : 0;
    
    return {
      // Start at 0.8 opacity so the screen is never blank (prevents the "blink" feeling)
      opacity: 0.8 + (currentProgress * 0.2),
      transform: [
        { 
          // Subtle slide in from 35 pixels
          translateX: (1 - currentProgress) * 35 
        }
      ],
    };
  }, [isFocused]);

  const content = onRefresh ? (
    <ScrollView
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D4AF37']} />
      }
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: '#F3F4F6' }, animatedStyle, style]}>
      {content}
    </Animated.View>
  );
}
