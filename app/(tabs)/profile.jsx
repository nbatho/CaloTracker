import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, useColorScheme, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// Function to Calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height || height === 0) return "N/A"; // Prevent division by zero
  return parseFloat((weight / (height * height)).toFixed(1)); // Round to 1 decimal place
};

// Circular BMI Component
const BMICircle = ({ bmi, size = 180 }) => {
  const theme = useColorScheme();
  const circleColor = theme === 'dark' ? 'lightgreen' : 'green';
  const fillColor = theme === 'dark' ? '#0F0F0F' : '#F4F4F4';

  return (
    <View style={[styles.bmiContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" stroke={circleColor} strokeWidth="6" fill={fillColor} />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.bmiText, { fontSize: size * 0.2, color: circleColor }]}>{bmi}</Text>
        <Text style={[styles.bmiLabel, { fontSize: size * 0.12, color: circleColor }]}>BMI</Text>
      </View>
    </View>
  );
};

// Profile Screen
export default function ProfileScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [weight, setWeight] = useState(""); // Store weight in kg
  const [height, setHeight] = useState(""); // Store height in cm

  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';

  const backgroundColor = isDarkMode ? '#0F0F0F' : '#F4F4F4';
  const textColor = isDarkMode ? 'white' : 'black';

  // Convert height to meters before calculating BMI
  const bmi = calculateBMI(parseFloat(weight), parseFloat(height) / 100);

  const handlePress = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    Keyboard.dismiss();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      {/* BMI Circle */}
      <BMICircle bmi={bmi} size={180} />

      {/* Status Text */}
      <Text style={[styles.status, { color: textColor }]}>Normal Weight</Text>
      <Text style={[styles.risk, { color: isDarkMode ? 'lightgray' : 'gray' }]}>Risk of comorbidities: Average</Text>

      {/* Profile Details (Pressable Icons) */}
      <View style={styles.profileItems}>
        <ProfileItem icon="running" label="Activity" onPress={() => handlePress('Activity')} />
        <ProfileItem icon="weight" label="Weight" onPress={() => handlePress('Weight')} />
        <ProfileItem icon="ruler" label="Height" onPress={() => handlePress('Height')} />
        <ProfileItem icon="bullseye" label="Goal" onPress={() => handlePress('Goal')} />
        <ProfileItem icon="user" label="Age" onPress={() => handlePress('Age')} />
        <ProfileItem icon="venus-mars" label="Gender" onPress={() => handlePress('Gender')} />
      </View>

      {/* Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Enter {modalContent}</Text>

                {/* Dynamic Input Fields Based on Selection */}
                {modalContent === 'Weight' && (
                  <TextInput
                    style={getInputStyle(isDarkMode)}
                    placeholder="Enter weight in kg"
                    placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                )}
                {modalContent === 'Height' && (
                  <TextInput
                    style={getInputStyle(isDarkMode)}
                    placeholder="Enter height in cm"
                    placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                )}


                {/* Close Button */}
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Text style={[styles.closeButtonItem, { color: isDarkMode ? 'lightgray' : 'gray' }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}
const getInputStyle = (isDarkMode) => ({
  width: '100%',
  height: 40,
  borderWidth: 1,
  borderRadius: 5,
  marginBottom: 20,
  paddingLeft: 10,
  color: isDarkMode ? 'white' : 'black',
  backgroundColor: isDarkMode ? '#222' : '#FFF',
  borderColor: isDarkMode ? 'lightgray' : 'gray',
});

// Component for Pressable Profile Items
const ProfileItem = ({ icon, label, onPress }) => {
  const theme = useColorScheme();
  const backgroundColor = theme === 'dark' ? '#333' : '#F4F4F4';
  const textColor = theme === 'dark' ? 'white' : 'black';
  const iconColor = theme === 'dark' ? 'white' : 'black';

  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
      <FontAwesome5 name={icon} size={24} color={iconColor} />
      <Text style={[styles.textColor, { color: textColor, fontSize: 18, flex: 1, marginLeft: 15 }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensures scrolling works properly
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20, // Prevents content from being cut off at the bottom
  },
  bmiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 15,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  bmiText: {
    fontWeight: 'bold',
  },
  bmiLabel: {
    fontWeight: 'bold',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  risk: {
    fontSize: 14,
    marginBottom: 15,
  },
  profileItems: {
    width: '100%',
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // More padding for better spacing
    borderRadius: 8,
    marginVertical: 8,
  },
  textColor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

