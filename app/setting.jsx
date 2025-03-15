import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, useColorScheme, Modal, TextInput, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme(); // Detect the current system theme (light or dark)
  
  const [theme, setTheme] = useState(systemColorScheme); // Initialize theme state
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (theme === 'system') {
      setTheme(systemColorScheme); // Sync theme with system color scheme when 'system' is selected
    }
  }, [systemColorScheme]);

  const handlePress = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  // Set colors based on the selected theme
  const iconColor = theme === 'dark' ? 'white' : 'black';
  const textColor = theme === 'dark' ? 'white' : 'black';
  const modalBackgroundColor = theme === 'dark' ? '#333' : '#fff'; // Modal background based on theme
  const modalTextColor = theme === 'dark' ? 'white' : 'black'; // Text color in modal

  const handleCloseModal = () => {
    setModalVisible(false);
    Keyboard.dismiss(); // Dismiss keyboard when closing the modal
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme); // Update theme state directly
    if (newTheme === 'system') {
      setTheme(systemColorScheme); // Sync with system theme if 'system' is selected
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? 'black' : 'white' }]}>

      {/* Settings Items */}
      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('Units')}>
        <MaterialCommunityIcons name="snowflake" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>Units</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('Calculations')}>
        <MaterialCommunityIcons name="calculator-variant-outline" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>Calculations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('Theme')}>
        <Entypo name="light-up" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('Disclaimer')}>
        <AntDesign name="filetext1" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>Disclaimer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('Report Error')}>
        <Octicons name="bug" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>Report Error</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('Privacy Settings')}>
        <Feather name="shield" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>Privacy Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SettingsItems} onPress={() => handlePress('About')}>
        <AntDesign name="exclamationcircleo" size={24} color={iconColor} />
        <Text style={[styles.text, { color: textColor }]}>About</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
                <Text style={[styles.modalTitle, { color: modalTextColor }]}> {modalContent}</Text>
                {modalContent === 'Units' && (
                  <TextInput
                    style={[styles.input, { color: modalTextColor, borderColor: modalTextColor }]}
                    placeholder="Enter Unit"
                    placeholderTextColor={modalTextColor}
                  />
                )}
                {modalContent === 'Calculations' && (
                  <Text style={{ color: modalTextColor }}>Adjust your calculation preferences here.</Text>
                )}
                {modalContent === 'Theme' && (
                  <View style={styles.themeContainer}>
                    <TouchableOpacity style={styles.ThemeItems} onPress={() => handleThemeChange('system')}>
                      <MaterialCommunityIcons name="theme-light-dark" size={24} color={modalTextColor} />
                      <Text style={[styles.text, { color: modalTextColor }]}>System default</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ThemeItems} onPress={() => handleThemeChange('light')}>
                      <MaterialCommunityIcons name="weather-sunny" size={24} color={modalTextColor} />
                      <Text style={[styles.text, { color: modalTextColor }]}>Light</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ThemeItems} onPress={() => handleThemeChange('dark')}>
                      <MaterialCommunityIcons name="weather-night" size={24} color={modalTextColor} />
                      <Text style={[styles.text, { color: modalTextColor }]}>Dark</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {modalContent === 'About' && (
                  <Text style={{ color: modalTextColor }}>
                    This app provides customizable settings for units, calculations, themes, and more.
                  </Text>
                )}
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Text style={[styles.closeButtonItem, { color: modalTextColor }]}>Close </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  SettingsItems: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  ThemeItems: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  text: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 8,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  closeButtonItem: {
    marginTop: 10,
    alignSelf: 'flex-end',
  }
});
