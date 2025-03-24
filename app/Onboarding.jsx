import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    SafeAreaView,
    StyleSheet,
    Platform,
    Appearance, // Import Appearance
    useColorScheme // Import useColorScheme
} from 'react-native';
import * as Progress from 'react-native-progress';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { saveUserData } from '@/components/redux/diarySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const [userData, setUserData] = useState({
        gender: null,
        birthday: null,
        height: null,
        weight: null,
        goal: null,
        activityLevel: null,
        dietType: null
    });

    const totalPages = 7;
    const colorScheme = useColorScheme(); // Get the current color scheme
    const isDarkMode = colorScheme === 'dark';

    const handleNext = async () => {
        if (page < totalPages) {
            setPage(page + 1);
        } else {
            console.log('✅ Onboarding completed! Saving user data...');
            try {
                await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
                const result = await dispatch(saveUserData(userData));

                if (saveUserData.fulfilled.match(result)) {
                    console.log('✅ User data saved successfully!');
                    setTimeout(() => {
                        router.replace('/');
                    }, 500);
                } else {
                    console.warn('❌ Lưu userData thất bại:', result.error.message);
                }
            } catch (error) {
                console.error('❌ Lỗi khi lưu dữ liệu:', error);
            }
        }
    };

    const handlePrevious = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const renderPageContent = () => {
        switch (page) {
            case 1:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>What's your gender?</Text>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                userData.gender === 'Male' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.gender === 'Male' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, gender: 'Male' })}
                        >
                            <Text style={[
                                styles.genderButtonText,
                                userData.gender === 'Male' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.gender === 'Male' && styles.selectedDarkText
                            ]}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                userData.gender === 'Female' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.gender === 'Female' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, gender: 'Female' })}
                        >
                            <Text style={[
                                styles.genderButtonText,
                                userData.gender === 'Female' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.gender === 'Female' && styles.selectedDarkText
                            ]}>Female</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>When's your birthday?</Text>
                        <View style={styles.dateInputContainer}>
                            <TextInput
                                style={[styles.dateInputBox, isDarkMode && styles.darkInput]}
                                placeholder="DD"
                                keyboardType="number-pad"
                                maxLength={2}
                                value={userData.birthday?.day || ''}
                                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, day: text } })}
                                placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                            />
                            <Text style={[styles.slash, isDarkMode && styles.darkText]}>/</Text>
                            <TextInput
                                style={[styles.dateInputBox, isDarkMode && styles.darkInput]}
                                placeholder="MM"
                                keyboardType="number-pad"
                                maxLength={2}
                                value={userData.birthday?.month || ''}
                                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, month: text } })}
                                placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                            />
                            <Text style={[styles.slash, isDarkMode && styles.darkText]}>/</Text>
                            <TextInput
                                style={[styles.dateInputBox, isDarkMode && styles.darkInput]}
                                placeholder="YYYY"
                                keyboardType="number-pad"
                                maxLength={4}
                                value={userData.birthday?.year || ''}
                                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, year: text } })}
                                placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                            />
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>How tall are you?</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="Enter height in cm"
                            keyboardType="number-pad"
                            value={userData.height ? userData.height.toString() : ''}
                            onChangeText={text => setUserData({ ...userData, height: parseInt(text) || 0 })}
                            placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                        />
                    </View>
                );

            case 4:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>What's your current weight?</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="Enter weight in kg"
                            keyboardType="number-pad"
                            value={userData.weight ? userData.weight.toString() : ''}
                            onChangeText={text => setUserData({ ...userData, weight: parseInt(text) || 0 })}
                            placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                        />
                    </View>
                );

            case 5:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>What's your target weight?</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="Enter target weight in kg"
                            keyboardType="number-pad"
                            value={userData.goal ? userData.goal.toString() : ''}
                            onChangeText={text => setUserData({ ...userData, goal: text })}
                            placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                        />
                    </View>
                );

            case 6:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>How active are you?</Text>
                        <TouchableOpacity
                            style={[
                                styles.activityButton,
                                userData.activityLevel === 'sedentary' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.activityLevel === 'sedentary' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, activityLevel: 'sedentary' })}
                        >
                            <Text style={[
                                styles.activityButtonText,
                                userData.activityLevel === 'sedentary' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.activityLevel === 'sedentary' && styles.selectedDarkText
                            ]}>Sedentary</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.activityButton,
                                userData.activityLevel === 'Low Active' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.activityLevel === 'Low Active' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, activityLevel: 'Low Active' })}
                        >
                            <Text style={[
                                styles.activityButtonText,
                                userData.activityLevel === 'Low Active' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.activityLevel === 'Low Active' && styles.selectedDarkText
                            ]}>Low Active </Text>
                        </TouchableOpacity>
                        {/*<TouchableOpacity
                            style={[
                                styles.activityButton,
                                userData.activityLevel === 'moderate' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.activityLevel === 'moderate' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, activityLevel: 'moderate' })}
                        >
                            <Text style={[
                                styles.activityButtonText,
                                userData.activityLevel === 'moderate' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.activityLevel === 'moderate' && styles.selectedDarkText
                            ]}>Moderate </Text>
                        </TouchableOpacity>*/}
                        <TouchableOpacity
                            style={[
                                styles.activityButton,
                                userData.activityLevel === 'active' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.activityLevel === 'active' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, activityLevel: 'active' })}
                        >
                            <Text style={[
                                styles.activityButtonText,
                                userData.activityLevel === 'active' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.activityLevel === 'active' && styles.selectedDarkText
                            ]}>Active</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.activityButton,
                                userData.activityLevel === 'Very active' && styles.selectedButton,
                                isDarkMode && styles.darkButton,
                                isDarkMode && userData.activityLevel === 'Very active' && styles.selectedDarkButton
                            ]}
                            onPress={() => setUserData({ ...userData, activityLevel: 'Very active' })}
                        >
                            <Text style={[
                                styles.activityButtonText,
                                userData.activityLevel === 'Very active' && styles.selectedButtonText,
                                isDarkMode && styles.darkText,
                                isDarkMode && userData.activityLevel === 'Very active' && styles.selectedDarkText
                            ]}>Very active</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 7:
                return (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>Review your details:</Text>
                        <View style={[styles.reviewContainer, isDarkMode && styles.darkReviewContainer]}>
                            <Text style={[styles.reviewText, isDarkMode && styles.darkText]}>Gender: {userData.gender}</Text>
                            <Text style={[styles.reviewText, isDarkMode && styles.darkText]}>Birthday: {userData.birthday ? `${userData.birthday?.day}/${userData.birthday?.month}/${userData.birthday?.year}` : 'N/A'}</Text>
                            <Text style={[styles.reviewText, isDarkMode && styles.darkText]}>Height: {userData.height ? `${userData.height} cm` : 'N/A'}</Text>
                            <Text style={[styles.reviewText, isDarkMode && styles.darkText]}>Weight: {userData.weight ? `${userData.weight} kg` : 'N/A'}</Text>
                            <Text style={[styles.reviewText, isDarkMode && styles.darkText]}>Goal: {userData.goal ? `${userData.goal} kg` : 'N/A'}</Text>
                            <Text style={[styles.reviewText, isDarkMode && styles.darkText]}>Activity Level: {userData.activityLevel}</Text>
                        </View>
                    </View>
                );

            default:
                return <Text>Error: Page not found</Text>;
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                {page > 1 && (
                    <TouchableOpacity style={styles.backButtonContainer} onPress={handlePrevious}>
                        <Text style={[styles.backButton, isDarkMode && styles.darkText]}>Back</Text>
                    </TouchableOpacity>
                )}
                <Progress.Bar progress={page / totalPages} width={250} color="#86CB52" />
                <Text style={[styles.pageNumber, isDarkMode && styles.darkText]}>{page}/{totalPages}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {renderPageContent()}
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={[styles.continueButton]} onPress={handleNext}>
                    <Text style={styles.continueButtonText}>{page === totalPages ? 'Finish & Save' : 'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    darkContainer: {
        backgroundColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    darkHeader: {
        backgroundColor: '#1a1a1a',
        shadowColor: '#fff',
    },
    backButtonContainer: {
        padding: 5,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    contentContainer: {
        width: '80%',
        alignItems: 'center',
        paddingBottom: 30,
    },
    questionText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    darkText: {
        color: '#fff',
    },
    genderButton: {
        width: '100%',
        paddingVertical: 18,
        borderWidth: 2,
        borderColor: '#d3d3d3',
        borderRadius: 35,
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    darkButton: {
        backgroundColor: '#444',
        borderColor: '#555',
    },
    genderButtonText: {
        fontSize: 18,
        color: '#333',
    },
    selectedButton: {
        backgroundColor: '#86CB52',
        borderColor: '#86CB52',
    },
    selectedButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    dateInputBox: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 10,
        padding: 12,
        fontSize: 18,
        width: 90,
        textAlign: 'center',
        backgroundColor: '#fff',
        color: '#333'
    },
    darkInput: {
        backgroundColor: '#444',
        borderColor: '#555',
        color: '#fff'
    },
    slash: {
        fontSize: 24,
        marginHorizontal: 8,
        color: '#888',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 10,
        padding: 15,
        fontSize: 18,
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#fff',
        color: '#333'
    },
    bottomContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 30,
    },
    continueButton: {
        backgroundColor: '#86CB52',
        paddingVertical: 18,
        borderRadius: 35,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    activityButton: {
        width: '100%',
        paddingVertical: 18,
        borderWidth: 2,
        borderColor: '#d3d3d3',
        borderRadius: 35,
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    activityButtonText: {
        fontSize: 18,
        color: '#333',
    },
    backButton: {
        color: '#86CB52',
        fontSize: 18,
    },
    pageNumber: {
        fontSize: 16,
        color: '#555',
    },
    reviewContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%',
    },
    darkReviewContainer: {
        backgroundColor: '#444',
        shadowColor: '#fff',
    },
    reviewText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#444',
    },
    // New styles for dark mode selected buttons
    selectedDarkButton: {
        backgroundColor: '#86CB52', // The requested green color
        borderColor: '#86CB52',
    },
    selectedDarkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;