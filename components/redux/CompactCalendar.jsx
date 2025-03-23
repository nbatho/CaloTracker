// CompactCalendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, useColorScheme } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CompactCalendar = ({ selectedDate, onDayPress, theme, isDarkMode }) => {
    const [showFullCalendar, setShowFullCalendar] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getWeek(selectedDate));
    const colorScheme = useColorScheme();
    const colors = isDarkMode ? darkColors : lightColors;
    const calendarHeight = useRef(new Animated.Value(0)).current;
    const compactHeight = useRef(new Animated.Value(1)).current;

    // Bảng màu
    const lightColors = {
        primary: '#BB86FC',
        background: '#F5F5F5',
        text: '#212121',
        secondaryText: '#757575',
        accent: '#03DAC5',
        surface: '#FFFFFF',
        error: '#B00020',
        card: '#FFFFFF',
        shadow: '#000',
        border: '#CCCCCC',
    };

    const darkColors = {
        primary: '#BB86FC',
        background: '#121212',
        text: '#FFFFFF',
        secondaryText: '#BDBDBD',
        accent: '#03DAC5',
        surface: '#212121',
        error: '#CF6679',
        card: '#333333',
        shadow: '#FFFFFF',
        border: '#555555',
    };

    useEffect(() => {
        setCurrentWeek(getWeek(selectedDate));
    }, [selectedDate]);

    function getWeek(date) {
        const day = new Date(date);
        const dayOfWeek = day.getDay(); // 0 (Sunday) - 6 (Saturday)
        const startDate = new Date(day);
        startDate.setDate(day.getDate() - dayOfWeek); // Start of the week (Sunday)

        const week = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            week.push(currentDate.toISOString().split('T')[0]); // Format as 'YYYY-MM-DD'
        }
        return week;
    }

    const handleToggleCalendar = () => {
      Animated.timing(calendarHeight, {
        toValue: showFullCalendar ? 0 : 350, // Adjust 350 based on your full calendar height
        duration: 300,
        useNativeDriver: false,
      }).start();
      Animated.timing(compactHeight, {
        toValue: showFullCalendar ? 1 : 0, // Adjust 350 based on your full calendar height
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowFullCalendar(!showFullCalendar));
    };

    const renderDay = (date) => {
        const day = new Date(date);
        const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'short' });
        const dayOfMonth = day.getDate();
        const isSelected = date === selectedDate;

        return (
            <TouchableOpacity
                key={date}
                style={[
                    styles.dayContainer,
                    isSelected && styles.selectedDay,
                    { backgroundColor: isSelected ? theme.selectedDayBackgroundColor : 'transparent' } // Apply background color dynamically
                ]}
                onPress={() => onDayPress({ dateString: date })}
            >
                <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    { color: isSelected ? theme.selectedDayTextColor : theme.dayTextColor } // Apply text color dynamically
                ]}>
                    {dayOfWeek}
                </Text>
                <Text style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayText,
                    { color: isSelected ? theme.selectedDayTextColor : theme.dayTextColor } // Apply text color dynamically
                ]}>
                    {dayOfMonth}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <Animated.View style={{height: compactHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 60]
            }), overflow: 'hidden'}}>
                <View style={styles.compactCalendarContainer}>
                    {currentWeek.map(renderDay)}
                </View>
            </Animated.View>

            <Animated.View style={{height: calendarHeight, overflow: 'hidden'}}>
                <Calendar
                    style={styles.fullCalendar}
                    theme={theme}
                    onDayPress={onDayPress}
                    markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.selectedDayBackgroundColor } }}
                    key={isDarkMode ? 'dark' : 'light'} // Force re-render on theme change
                />
            </Animated.View>

            <TouchableOpacity style={styles.expandButton} onPress={handleToggleCalendar}>
                <FontAwesome5 name={showFullCalendar ? "chevron-up" : "chevron-down"} size={20} color={theme.arrowColor} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    compactCalendarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    dayContainer: {
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectedDay: {
        // backgroundColor: '#007bff', // Màu nền cho ngày được chọn
    },
    dayText: {
        fontSize: 12,
        // color: '#333',
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        // color: '#333',
    },
    selectedDayText: {
        color: '#fff', // Màu chữ cho ngày được chọn
    },
    expandButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    fullCalendar: {
        marginTop: 0,
        borderRadius: 10,
    },
});

export default CompactCalendar;