import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { Provider, useDispatch } from 'react-redux';
import store from '../components/redux/store';
import { loadTotalNutrients, loadUserData } from '../components/redux/diarySlice';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

function AppContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const navigationState = useRootNavigationState(); // Kiểm tra router đã sẵn sàng
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (!navigationState?.key || !loaded) return; // Chỉ chạy khi router đã sẵn sàng và font đã load

    const checkOnboarding = async () => {
      try {
        await SplashScreen.hideAsync(); // Đảm bảo SplashScreen đã ẩn trước khi chuyển trang

        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        console.log("Trạng thái Onboarding:", hasCompletedOnboarding);

        if (!hasCompletedOnboarding || hasCompletedOnboarding === 'false') {
          console.log("🚀 Chuyển đến Onboarding (do chưa hoàn tất)");
          router.replace('/Onboarding');
          return;
        }

        // Load dữ liệu người dùng
        const userData = await dispatch(loadUserData()).unwrap();
        console.log("📌 Dữ liệu userData sau khi load:", userData);

        if (!userData) {
          console.log("🚀 Chuyển đến Onboarding (do userData null)");
          router.replace('/Onboarding');
        }
      } catch (error) {
        console.error("❌ Lỗi khi kiểm tra Onboarding:", error);
      }
    };

    checkOnboarding();
  }, [navigationState?.key, loaded]);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="Onboarding" options={{ headerShown: false }} />
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
