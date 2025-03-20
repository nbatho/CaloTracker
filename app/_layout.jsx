import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Provider, useDispatch } from 'react-redux';  
import store from '../components/redux/store';
import { loadTotalNutrients } from '../components/redux/diarySlice';

import { useColorScheme } from '@/hooks/useColorScheme';
import { View, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

// 🆕 Tạo component riêng để dùng dispatch
function AppContent() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    dispatch(loadTotalNutrients()); // 🚀 Load totalNutrients khi app khởi động

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="setting" options={{ title: "Settings" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}> 
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
