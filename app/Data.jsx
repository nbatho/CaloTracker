import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, useColorScheme } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { addItemToSelectedDate } from '@/components/redux/diarySlice'; // Import action Redux
import activityData from '@/assets/activity/activity_data.json'; // Import dữ liệu JSON
const Data = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';
  const dispatch = useDispatch(); // Khởi tạo dispatch

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [recentlyUsed, setRecentlyUsed] = useState([]);
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const formattedActivities = activityData.physicalActivities.map(activity => ({
      id: activity.id,
      name: activity.name,
      details: activity.description,
      met: activity.met,
      icon: getIcon(activity.name), // Lấy icon chính xác
    }));
    setActivities(formattedActivities);
  }, []);
  const getIcon = (name) => {
    const iconMap = {
      "bicycling": "bicycle",
      "bicycling, mountain": "bicycle",
      "unicycling": "dot-circle",
      "bicycling, stationary": "dumbbell",
      "calisthenics": "running",
      "resistance training": "weight-hanging",
      "rope skipping": "shoe-prints",
      "water exercise": "water",
      "aerobic": "music",
      "jogging": "running",
      "running": "running",
      "archery": "bow-arrow",
      "badminton": "table-tennis",
      "basketball": "basketball-ball",
      "billiards": "circle",
      "bowling": "bowling-ball",
      "boxing": "hand-rock",
      "broomball": "broom",
      "cheerleading": "user-friends",
      "cricket": "baseball-ball",
      "croquet": "golf-ball",
      "curling": "snowflake",
      "darts": "bullseye",
      "auto racing": "car",
      "fencing": "user-shield",
      "football": "football-ball",
      "golf": "golf-ball",
      "gymnastics": "child",
      "handball": "hand-paper",
      "hockey, field": "hockey-puck",
      "ice hockey": "hockey-puck",
      "horseback riding": "horse",
      "martial arts": "hand-rock",
      "paddleball": "table-tennis",
      "polo": "horse",
      "racquetball": "table-tennis",
      "climbing": "mountain",
      "rugby": "football-ball",
      "skateboarding": "skating",
      "roller skating": "skating",
      "rollerblading": "skating",
      "skydiving": "parachute-box",
      "soccer": "futbol",
      "softball / baseball": "baseball-ball",
      "squash": "table-tennis",
      "table tennis": "table-tennis",
      "tennis": "table-tennis",
      "trampoline": "child",
      "volleyball": "volleyball-ball",
      "wrestling": "users",
      "swimming": "swimmer",
      "diving": "swimmer",
      "kayaking": "water",
      "surfing": "water",
      "water polo": "swimmer",
      "ice skating": "snowflake",
      "skiing": "skiing",
      "snow shoveling": "snowflake",
      "walking": "walking",
      "hiking": "hiking",
      "track and field": "running",
      "frisbee playing": "compact-disc",
      "children’s games": "child",
      "juggling": "spinner",
      "hacky sack": "circle",
      "lacrosse": "hockey-puck",
      "orienteering": "map-marked",
      "paddle boarding": "swimmer",
      "tai chi, qi gong": "yin-yang",
      "moto-cross": "motorcycle",
      "rodeo sports": "horse",
      "auto racing": "flag-checkered",
      "archery": "bullseye", 
      "hang gliding": "wind", 
      "jai alai": "volleyball-ball", 
      "lawn bowling": "bowling-ball",
      "rope jumping": "shoe-prints", 
      "shuffleboard": "grip-lines", 
      "wallyball": "volleyball-ball",
      "backpacking": "hiking",
      "walking the dog": "dog", 
      "paddle boat": "ship",
      "sailing": "anchor",
      "water skiing": "swimmer", 
      "snorkeling": "mask", 
      "water aerobics": "swimmer",
    };
  
    return iconMap[name.toLowerCase()] || "question-circle"; // Trả về icon mặc định nếu không có trong danh sách
  };
  
  const filteredActivities = activities.filter(activity =>
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
    dispatch(addItemToSelectedDate({ section: "Activity", item: { ...activity, met: activity.met } }));
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