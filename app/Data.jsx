// AI.jsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, useColorScheme } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { addItemToSelectedDate } from '@/components/redux/diarySlice'; // Import action Redux

const Data = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';
  const dispatch = useDispatch(); // Khởi tạo dispatch

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [recentlyUsed, setRecentlyUsed] = useState([]);

  const activities = [
    { id: 'bicycling', name: 'Bicycling', details: 'general', icon: 'bicycle' },
    { id: 'bicycling_mountain', name: 'Bicycling, Mountain', details: 'general', icon: 'bicycle' },
    { id: 'unicycling', name: 'Unicycling', details: 'general', icon: 'wheelchair' },
    { id: 'bicycling_stationary', name: 'Bicycling, Stationary', details: 'general', icon: 'dumbbell' },
    { id: 'calisthenics', name: 'Calisthenics', details: 'light or moderate effort, general (e.g., back exercises)', icon: 'running' },
    { id: 'resistance_training', name: 'Resistance training', details: 'weight lifting, free weight, nautilus or universal', icon: 'weight-hanging' },
    { id: 'rope_skipping', name: 'Rope skipping', details: 'general', icon: 'shoe-prints' },
    { id: 'water_exercise', name: 'Water exercise', details: 'water aerobics, water calisthenics', icon: 'water' },
    { id: 'aerobic', name: 'Aerobic', details: 'general', icon: 'music' },
    { id: 'jogging', name: 'Jogging', details: 'general', icon: 'running' },
    { id: 'running', name: 'Running', details: 'general', icon: 'running' },
    { id: 'archery', name: 'Archery', details: 'non-hunting', icon: 'bow-arrow' },
    { id: 'badminton', name: 'Badminton', details: 'social singles and doubles, general', icon: 'shuttlecock' },
    { id: 'basketball', name: 'Basketball', details: 'general', icon: 'basketball-ball' },
    { id: 'billiards', name: 'Billiards', details: 'general', icon: 'circle' },
    { id: 'bowling', name: 'Bowling', details: 'general', icon: 'bowling-ball' },
    { id: 'boxing_ring', name: 'Boxing', details: 'in ring, general', icon: 'fist-raised' },
    { id: 'boxing_bag', name: 'Boxing', details: 'punching bag', icon: 'fist-raised' }, // Same icon because no bag specific icon exists
    { id: 'broomball', name: 'Broomball', details: 'general', icon: 'skating' },
    { id: 'childrens_games', name: 'Children\'s games', details: '(e.g., hopscotch, 4-square, dodgeball, playground apparatus, t-ball, tetherball, etc.)', icon: 'wheelchair' },
    { id: 'cheerleading', name: 'Cheerleading', details: 'gymnastic moves, competitive', icon: 'users' },
    { id: 'cricket', name: 'Cricket', details: 'batting, bowling, fielding', icon: 'baseball-ball' },
    { id: 'croquet', name: 'Croquet', details: 'general', icon: 'trophy' },
    { id: 'curling', name: 'Curling', details: 'general', icon: 'ice-skating' }, //no curling icon, so using ice-skating
    { id: 'darts', name: 'Darts', details: 'wall or lawn', icon: 'bullseye' },
    { id: 'auto_racing', name: 'Auto racing', details: 'open wheel', icon: 'car' },
    { id: 'fencing', name: 'Fencing', details: 'general', icon: 'sword' },
    { id: 'football', name: 'Football', details: 'touch, flag, general', icon: 'football-ball' },
    { id: 'football_or_baseball', name: 'Football or baseball', details: 'playing catch', icon: 'baseball-ball' },
    { id: 'frisbee_playing', name: 'Frisbee playing', details: 'general', icon: 'ticket-alt' }, //Using ticket because there is not frizbee
    { id: 'golf', name: 'Golf', details: 'general', icon: 'golf-ball' },
    { id: 'gymnastics', name: 'Gymnastics', details: 'general', icon: 'running' }, //using running for lack of better match
    { id: 'hacky_sack', name: 'Hacky sack', details: 'general', icon: 'ticket-alt' },  //no Hacky sack so using ticket-alt
    { id: 'handball', name: 'Handball', details: 'general', icon: 'users' }, //users is kinda good. Not a single icon
    { id: 'hang_gliding', name: 'Hang gliding', details: 'general', icon: 'medal' },
    { id: 'hockey_field', name: 'Hockey, field', details: 'general', icon: 'hockey-puck' },
    { id: 'ice_hockey', name: 'Ice hockey', details: 'general', icon: 'hockey-puck' }, // Same Icon for both Hockey for lack
    { id: 'horseback_riding', name: 'Horseback riding', details: 'general', icon: 'horse' },
    { id: 'jai_alai', name: 'Jai alai', details: 'general', icon: 'medal' }, //no Jai alai specific icon so reusing medal
    { id: 'martial_arts', name: 'Martial arts', details: 'different types, slower pace, novice performers, practice', icon: 'running' },
      { id: 'paddleball', name: 'Paddleball', details: 'casual, general', icon: 'medal' },// No specific icons
    { id: 'polo', name: 'Polo', details: 'on horseback', icon: 'horse' },
        { id: 'racquetball', name: 'Racquetball', details: 'general', icon: 'ticket-alt' },//Using ticket again for lack of match
        { id: 'climbing', name: 'Climbing', details: 'rock or mountain climbing', icon: 'question-circle' }, //no good climbing, so using the question mark
        { id: 'rodeo_sports', name: 'Rodeo sports', details: 'general, moderate effort', icon: 'horse' },
        { id: 'rope_jumping', name: 'Rope jumping', details: 'moderate pace, 100-120 skips/min, general, 2 foot skip, plain bounce', icon: 'shoe-prints' },
        { id: 'rugby_union', name: 'Rugby', details: 'union, team, competitive', icon: 'football-ball' },
        { id: 'rugby_touch', name: 'Rugby', details: 'touch, non-competitive', icon: 'football-ball' }, // same with
        { id: 'shuffleboard', name: 'Shuffleboard', details: 'general', icon: 'medal' },//no shuffleboard icon
        { id: 'skateboarding', name: 'Skateboarding', details: 'general, moderate effort', icon: 'skating' },
        { id: 'roller_skating', name: 'Roller skating', details: 'general', icon: 'skating' },
        { id: 'rollerblading', name: 'Rollerblading', details: 'in-line skating', icon: 'skating' }, // Same icon for both, if you find one please change.
        { id: 'skydiving', name: 'Skydiving', details: 'skydiving, base jumping, bungee jumping', icon: 'parachute-box' },
        { id: 'soccer', name: 'Soccer', details: 'casual, general', icon: 'soccer-ball' },
        { id: 'softball_baseball', name: 'Softball / baseball', details: 'fast or slow pitch, general', icon: 'baseball-ball' },

        //Added last set from images
        { id: 'squash', name: 'Squash', details: 'general', icon: 'ticket-alt' },  // There wasn't another useful.
        { id: 'table_tennis', name: 'Table tennis', details: 'table tennis, ping pong', icon: 'table-tennis' },
        { id: 'tai_chi', name: 'Tai chi, qi gong', details: 'general', icon: 'running' },//Same as gymnastic
        { id: 'tennis', name: 'Tennis', details: 'general', icon: 'tennis-ball' },
        { id: 'trampoline', name: 'Trampoline', details: 'recreational', icon: 'medal' }, //Used ticket because better here
  ];

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const displayedActivities = activeTab === "All" ? filteredActivities : recentlyUsed;

  const handleActivityPress = (activity) => {
    // Add the activity to the recentlyUsed list if it's not already there
    if (!recentlyUsed.some((item) => item.id === activity.id)) {
      setRecentlyUsed([activity, ...recentlyUsed]);
    }
  };

  const handleAddActivity = (activity) => {
    // Dispatch action Redux để thêm hoạt động
    dispatch(addItemToSelectedDate({ section: "Activity", item: activity })); // "Activity" là section mặc định

    // Sau khi dispatch, quay lại màn hình trước
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={24} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : 'black' }]}>Activity</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <FontAwesome5 name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchBar, { color: isDarkMode ? 'white' : 'black' }]}
            placeholder="Search"
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "All" && styles.activeTab]}
            onPress={() => setActiveTab("All")}
          >
            <Text style={[styles.tabText, { color: isDarkMode ? 'white' : 'black' }, activeTab === "All" && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Recently" && styles.activeTab]}
            onPress={() => setActiveTab("Recently")}
          >
            <Text style={[styles.tabText, { color: isDarkMode ? 'white' : 'black' }, activeTab === "Recently" && styles.activeTabText]}>Recently</Text>
          </TouchableOpacity>
        </View>

        {/* Activity List */}
        <ScrollView>
          {displayedActivities.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityItem} onPress={() => handleActivityPress(activity)}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name={activity.icon} size={24} color={isDarkMode ? 'white' : 'black'} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.activityName, { color: isDarkMode ? 'white' : 'black' }]}>{activity.name}</Text>
                <Text style={[styles.activityDetails, { color: 'gray' }]}>{activity.details}</Text>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddActivity(activity)}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    color: "white",
    textAlignVertical:'center',
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityDetails: {
    fontSize: 12,
    color: "#777",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Data;