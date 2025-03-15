import React from 'react';
import { Modal as RModal, Platform, KeyboardAvoidingView, TextInput, View, useColorScheme } from 'react-native';
import { setStatusBarTranslucent } from 'expo-status-bar';

export const Modal = ({ isOpen, withInput, children, ...rest }) => {
  const theme = useColorScheme(); // Get the current color scheme (light or dark)

  // Define theme-based colors
  const modalBackgroundColor = theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)';
  const inputBackgroundColor = theme === 'dark' ? '#333' : 'white';
  const inputTextColor = theme === 'dark' ? 'white' : 'black';

  const content = withInput ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: modalBackgroundColor, // Apply modal background color based on theme
      }}
    >
      <TextInput
        style={{
          width: '80%',
          height: 40,
          backgroundColor: inputBackgroundColor, // Apply input background color based on theme
          borderRadius: 8,
          paddingLeft: 10,
          color: inputTextColor, // Apply text color based on theme
        }}
        placeholder="Type here..."
        placeholderTextColor={inputTextColor} // Apply placeholder color based on theme
      />
    </KeyboardAvoidingView>
  ) : (
    children
  );

  return (
    <RModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      {...rest}
    >
      {content}
    </RModal>
  );
};
