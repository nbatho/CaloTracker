import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
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

// 🔥 **BẬT/TẮT TỰ ĐỘNG VÀO ONBOARDING** 🔥
// 👉 Để debug Onboarding: Đặt `true`
// 👉 Khi xong, đặt lại thành `false`
const FORCE_ONBOARDING = true; // << Thay đổi giá trị này khi cần

function AppContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [userData, setUserData] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const forceOnboarding = FORCE_ONBOARDING
          ? true
          : await AsyncStorage.getItem('forceOnboarding') === 'true';

        if (forceOnboarding) {
          await AsyncStorage.setItem('forceOnboarding', 'false'); // Reset sau khi debug
          router.replace('/Onboarding');
          return;
        }

        const result = await dispatch(loadUserData());
        if (!result.payload) {
          router.replace('/Onboarding');
        } else {
          setUserData(result.payload);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra Onboarding:", error);
      }
      setAppReady(true);
    };

    checkOnboarding();
  }, [router.isReady]);

  useEffect(() => {
    if (loaded && appReady) {
      dispatch(loadTotalNutrients());
      SplashScreen.hideAsync();
    }
  }, [loaded, appReady]);

  if (!loaded || !appReady) {
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
