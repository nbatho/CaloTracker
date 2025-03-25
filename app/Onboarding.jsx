import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { saveUserData } from '@/components/redux/diarySlice'; // ✅ Import Redux action
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [page, setPage] = useState(1);
  const [userData, setUserData] = useState({
    gender: null,
    birthday: null,
    height: null,
    weight: null,
    goal: null,
    activityLevel: null,
    mainGoal: null,
  });

  const totalPages = 8;

  const handleNext = async () => {
    if (page < totalPages) {
      setPage(page + 1);
    } else {
      console.log('✅ Onboarding completed! Saving user data...');
      try {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        const result = await dispatch(saveUserData(userData)); // Đợi lưu xong

        if (saveUserData.fulfilled.match(result)) {
          console.log('✅ User data saved successfully!');
          setTimeout(() => {
            router.replace('/'); // Chuyển về màn hình chính
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
    const textStyle = [
      styles.questionText,
      isDarkMode ? styles.darkText : styles.lightText,
    ];
    const inputStyle = [
      styles.input,
      isDarkMode ? styles.darkInput : styles.lightInput,
    ];

    switch (page) {
      case 1:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>What's your gender?</Text>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userData.gender === 'male' && styles.selectedButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.gender === 'male' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, gender: 'male' })}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  userData.gender === 'male' && styles.selectedButtonText,
                  isDarkMode ? styles.darkText : styles.lightText,
                  userData.gender === 'male' && isDarkMode ? styles.lightText : {}
                ]}
              >
                Male </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userData.gender === 'female' && styles.selectedButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.gender === 'female' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, gender: 'female' })}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  userData.gender === 'female' && styles.selectedButtonText,
                  isDarkMode ? styles.darkText : styles.lightText,
                  userData.gender === 'female' && isDarkMode ? styles.lightText : {}
                ]}
              >
                Female </Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>When's your birthday?</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[...inputStyle, styles.dateInputBox]}
                placeholder="DD"
                placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                keyboardType="number-pad"
                maxLength={2}
                value={userData.birthday?.day || ''}
                onChangeText={text =>
                  setUserData({
                    ...userData,
                    birthday: { ...userData.birthday, day: text },
                  })
                }
              />
              <Text style={[styles.slash, isDarkMode ? styles.darkText : styles.lightText]}>/</Text>
              <TextInput
                style={[...inputStyle, styles.dateInputBox]}
                placeholder="MM"
                placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                keyboardType="number-pad"
                maxLength={2}
                value={userData.birthday?.month || ''}
                onChangeText={text =>
                  setUserData({
                    ...userData,
                    birthday: { ...userData.birthday, month: text },
                  })
                }
              />
              <Text style={[styles.slash, isDarkMode ? styles.darkText : styles.lightText]}>/</Text>
              <TextInput
                style={[...inputStyle, styles.dateInputBox]}
                placeholder="YYYY"
                placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                keyboardType="number-pad"
                maxLength={4}
                value={userData.birthday?.year || ''}
                onChangeText={text =>
                  setUserData({
                    ...userData,
                    birthday: { ...userData.birthday, year: text },
                  })
                }
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>How tall are you?</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter height in cm"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              keyboardType="number-pad"
              value={userData.height ? userData.height.toString() : ''}
              onChangeText={text =>
                setUserData({ ...userData, height: parseInt(text) || 0 })
              }
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>What's your current weight?</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter weight in kg"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              keyboardType="number-pad"
              value={userData.weight ? userData.weight.toString() : ''}
              onChangeText={text =>
                setUserData({ ...userData, weight: parseInt(text) || 0 })
              }
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>What's your target weight?</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter target weight in kg"
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              keyboardType="number-pad"
              value={userData.goal ? userData.goal.toString() : ''}
              onChangeText={text => setUserData({ ...userData, goal: text })}
            />
          </View>
        );

      case 6:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>How active are you?</Text>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Sedentary' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.activityLevel === 'Sedentary' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Sedentary' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.activityLevel === 'Sedentary' && styles.selectedGoalText,
                userData.activityLevel === 'Sedentary' && isDarkMode ? styles.lightText : {}
                ]}>
                  Sedentary </Text>
            </TouchableOpacity>
            {/*<TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Light' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.activityLevel === 'Light' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Light' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.activityLevel === 'Light' && styles.selectedGoalText,
                userData.activityLevel === 'Light' && isDarkMode ? styles.lightText : {}
                ]}>
                  Light
              </Text>
            </TouchableOpacity>*/}
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Moderate' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.activityLevel === 'Moderate' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Moderate' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.activityLevel === 'Moderate' && styles.selectedGoalText,
                userData.activityLevel === 'Moderate' && isDarkMode ? styles.lightText : {}
                ]}>
                  Moderate </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Active' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.activityLevel === 'Active' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Active' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.activityLevel === 'Active' && styles.selectedGoalText,
                userData.activityLevel === 'Active' && isDarkMode ? styles.lightText : {}
                ]}>
                  Active </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Very_active' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.activityLevel === 'Very_active' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Very_active' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.activityLevel === 'Very_active' && styles.selectedGoalText,
                userData.activityLevel === 'Very_active' && isDarkMode ? styles.lightText : {}
                ]}>
                  Very active </Text>
            </TouchableOpacity>
          </View>
        );
      case 7:
        return (
          <View style={styles.contentContainer}>
            <Text style={textStyle}>What is your main goal?</Text>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.mainGoal === 'Cutting' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.mainGoal === 'Cutting' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, mainGoal: 'Cutting' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.mainGoal === 'Cutting' && styles.selectedGoalText,
                userData.mainGoal === 'Cutting' && isDarkMode ? styles.lightText : {}
                ]}>
                  Cutting </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.mainGoal === 'Bulking' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.mainGoal === 'Bulking' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, mainGoal: 'Bulking' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.mainGoal === 'Bulking' && styles.selectedGoalText,
                userData.mainGoal === 'Bulking' && isDarkMode ? styles.lightText : {}
                ]}>
                  Bulking </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.mainGoal === 'Maintenance' && styles.selectedGoalButton,
                isDarkMode ? styles.darkButton : styles.lightButton,
                userData.mainGoal === 'Maintenance' && isDarkMode ? styles.darkSelectedButton : {}
              ]}
              onPress={() => setUserData({ ...userData, mainGoal: 'Maintenance' })}
            >
              <Text style={[
                styles.goalButtonText,
                isDarkMode ? styles.darkText : styles.lightText,
                userData.mainGoal === 'Maintenance' && styles.selectedGoalText,
                userData.mainGoal === 'Maintenance' && isDarkMode ? styles.lightText : {}
                ]}>
                  Maintenance </Text>
            </TouchableOpacity>
          </View>
        );
      case 8:
        return (
          <View style={[styles.contentContainer, styles.reviewContainer, isDarkMode ? styles.darkReviewContainer : styles.lightReviewContainer]}>
            <Text style={[...textStyle, styles.reviewTitle]}>Review your details:</Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Gender: {userData.gender} </Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Birthday: {`${userData.birthday?.day}/${userData.birthday?.month}/${userData.birthday?.year}`} </Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Height: {userData.height} cm </Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Weight: {userData.weight} kg </Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Goal: {userData.goal} </Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Activity Level: {userData.activityLevel} </Text>
            <Text style={[styles.reviewText, isDarkMode ? styles.darkText : styles.lightText]}>
              Main Goal: {userData.mainGoal} </Text>
          </View>
        );

      default:
        return <Text style={isDarkMode ? styles.darkText : styles.lightText}>Error: Page not found</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.header}>
        {page > 1 && (
          <TouchableOpacity onPress={handlePrevious}>
            <Text style={[styles.backButton, isDarkMode ? styles.darkText : styles.lightText]}>Back</Text>
          </TouchableOpacity>
        )}
        <Progress.Bar
          progress={page / totalPages}
          width={250}
          color="#86CB52"
          unfilledColor={isDarkMode ? '#333' : '#ddd'}
          borderWidth={0} // Remove border for cleaner look
          
        />
        <Text style={[isDarkMode ? styles.darkText : styles.lightText]}>
          {page}/{totalPages} </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderPageContent()}
      </ScrollView>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
            <Text style={styles.continueButtonText}>
                {page === totalPages ? 'Finish & Save' : 'Continue'}
            </Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20, // Add padding at the bottom
  },
  contentContainer: {
    width: '80%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  questionText: {
    fontSize: 24, // Increased size for better readability
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  genderButton: {
    width: '100%',
    paddingVertical: 15,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  genderButtonText: {
    fontSize: 18,
  },
  selectedButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
  selectedButtonText: {
    color: '#fff',
  },

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%', // Ensure full width
  },
  dateInputBox: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    fontSize: 18,
    width: '28%', // Evenly distribute the width
    textAlign: 'center',
  },
  slash: {
    fontSize: 20,
    marginHorizontal: 5,
  },

  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    fontSize: 18,
    width: '100%',
    marginBottom: 15,
  },
  heightInput: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 5
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 5
  },
  targetWeightInput: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 5
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center', // Horizontally center the button
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#86CB52',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  goalButton: {
    width: '100%',
    paddingVertical: 15,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  goalButtonText: {
    fontSize: 18,
  },
  selectedGoalButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
    selectedGoalText: {
    color: '#fff',
  },
  backButton: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  lightInput: {
    backgroundColor: '#fff',
    borderColor: '#d3d3d3',
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  darkButton: {
    borderColor: '#555',
  },
  lightButton: {
    borderColor: '#d3d3d3',
  },
  darkSelectedButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
  reviewContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    width: '90%',
  },
  lightReviewContainer: {
    borderColor: '#d3d3d3',
    backgroundColor: '#f9f9f9',
  },
  darkReviewContainer: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left',
  },
});

export default OnboardingScreen;