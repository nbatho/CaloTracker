import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const AI = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.text}>Hello, React Native!</Text>
        <Text style={styles.text}>This is a scrollable view.</Text>
        <Text style={styles.text}>Keep adding more content...</Text>
        <Text style={styles.text}>You can scroll down!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
});

export default AI;
