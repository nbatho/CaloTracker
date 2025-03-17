import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View, TouchableOpacity } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter(); // Use router for navigation

  // Header settings button
  const renderHeaderRight = () => (
    <TouchableOpacity onPress={() => router.push('../setting')}>
      <Ionicons
        name="settings-outline"
        size={24}
        color={Colors[colorScheme ?? 'light'].tint}
        style={{ marginRight: 16 }}
      />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        headerRight: renderHeaderRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Entypo name="home" size={24} color={Colors[colorScheme ?? 'light'].tint} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: Colors[colorScheme ?? 'light'].text,
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="AI"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Entypo name="bar-graph" size={24} color={color} />,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Entypo name="bar-graph" size={24} color={Colors[colorScheme ?? 'light'].tint} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: Colors[colorScheme ?? 'light'].text,
                }}
              >
                AI
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={24} color={color} />,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name="book" size={24} color={Colors[colorScheme ?? 'light'].tint} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: Colors[colorScheme ?? 'light'].text,
                }}
              >
                Diary
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-circle-outline" size={24} color={Colors[colorScheme ?? 'light'].tint} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: Colors[colorScheme ?? 'light'].text,
                }}
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}