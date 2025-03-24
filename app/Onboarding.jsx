import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  Platform
} from 'react-native';
import * as Progress from 'react-native-progress';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { saveUserData } from '@/components/redux/diarySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons'; // Thêm thư viện icon

const OnboardingScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme(); // Lấy theme của hệ thống
  const [page, setPage] = useState(1);
  const [userData, setUserData] = useState({
    gender: null,
    birthday: { day: '', month: '', year: '' }, // Khởi tạo birthday là object
    height: '',
    weight: '',
    goal: '',
    activityLevel: null,
    mainGoal: null,
  });

  const totalPages = 8;

  // Định nghĩa theme màu
  const theme = {
    colors: {
      background: colorScheme === 'dark' ? '#333' : '#F9F9F9',  // Thay đổi màu nền
      text: colorScheme === 'dark' ? '#fff' : '#212121',      // Thay đổi màu chữ chính
      textSecondary: colorScheme === 'dark' ? '#ccc' : '#757575', // Thay đổi màu chữ phụ
      primary: '#86CB52', // Giữ nguyên màu chính
      border: colorScheme === 'dark' ? '#555' : '#E0E0E0',    // Thay đổi màu viền
      inputBackground: colorScheme === 'dark' ? '#444' : '#FFFFFF', // Màu nền input
      buttonBackground: colorScheme === 'dark' ? '#444' : '#fff', // Màu nền button
      reviewBackground: colorScheme === 'dark' ? '#444' : '#fff',
    },
  };

  // Hàm lưu trữ dữ liệu
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

  //Hàm quay lại trang trước
  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  // Hàm render nội dung trang
  const renderPageContent = () => {
    switch (page) {
      case 1:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>What's your gender?</Text>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userData.gender === 'Male' && styles.selectedButton,
                { backgroundColor: userData.gender === 'Male' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setUserData({ ...userData, gender: 'Male' })}
            >
              {/* <FontAwesome5 name="male" size={24} color={userData.gender === 'male' ? '#fff' : theme.colors.text} style={styles.genderIcon} /> */}
              <Text style={[
                styles.genderButtonText,
                { color: userData.gender === 'Male' ? '#fff' : theme.colors.text }
              ]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userData.gender === 'Female' && styles.selectedButton,
                { backgroundColor: userData.gender === 'Female' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, gender: 'Female' })}
            >
              {/* <FontAwesome5 name="female" size={24} color={userData.gender === 'female' ? '#fff' : theme.colors.text} style={styles.genderIcon} /> */}
              <Text style={[
                styles.genderButtonText,
                { color: userData.gender === 'Female' ? '#fff' : theme.colors.text }
              ]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>When's your birthday?</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.dateInputBox, {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border
                }]}
                placeholder="DD"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                value={userData.birthday?.day || ''}
                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, day: text } })}
              />
              <Text style={[styles.slash, { color: theme.colors.text }]}>/</Text>
              <TextInput
                style={[styles.dateInputBox, {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border
                }]}
                placeholder="MM"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                value={userData.birthday?.month || ''}
                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, month: text } })}
              />
              <Text style={[styles.slash, { color: theme.colors.text }]}>/</Text>
              <TextInput
                style={[styles.dateInputBox, {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border
                }]}
                placeholder="YYYY"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                value={userData.birthday?.year || ''}
                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, year: text } })}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>How tall are you?</Text>
            <TextInput
              style={[styles.heightInput, {
                color: theme.colors.text,
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter height in cm"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              value={userData.height}
              onChangeText={text => setUserData({ ...userData, height: text })}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>What's your current weight?</Text>
            <TextInput
              style={[styles.weightInput, {
                color: theme.colors.text,
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter weight in kg"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              value={userData.weight}
              onChangeText={text => setUserData({ ...userData, weight: text })}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>What's your target weight?</Text>
            <TextInput
              style={[styles.targetWeightInput, {
                color: theme.colors.text,
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border
              }]}
              placeholder="Enter target weight in kg"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              value={userData.goal}
              onChangeText={text => setUserData({ ...userData, goal: text })}
            />
          </View>
        );

      case 6:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>How active are you?</Text>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Sedentary' && styles.selectedGoalButton,
                { backgroundColor: userData.activityLevel === 'Sedentary' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Sedentary' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.activityLevel === 'Sedentary' ? '#fff' : theme.colors.text }]}>Sedentary </Text>
            </TouchableOpacity>
            {/*<TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Light' && styles.selectedGoalButton,
                { backgroundColor: userData.activityLevel === 'Light' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Light' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.activityLevel === 'Light' ? '#fff' : theme.colors.text }]}>Light </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Low Active' && styles.selectedGoalButton,
                { backgroundColor: userData.activityLevel === 'Low Active' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Low Active' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.activityLevel === 'Low Active' ? '#fff' : theme.colors.text }]}>Low Active </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Active' && styles.selectedGoalButton,
                { backgroundColor: userData.activityLevel === 'Active' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Active' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.activityLevel === 'Active' ? '#fff' : theme.colors.text }]}>Active </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.activityLevel === 'Very Active' && styles.selectedGoalButton,
                { backgroundColor: userData.activityLevel === 'Very Active' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, activityLevel: 'Very Active' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.activityLevel === 'Very Active' ? '#fff' : theme.colors.text }]}>Very Active </Text>
            </TouchableOpacity>
          </View>
        );
      case 7:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>What is your goal?</Text>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.mainGoal === 'Cutting' && styles.selectedGoalButton,
                { backgroundColor: userData.mainGoal === 'Cutting' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, mainGoal: 'Cutting' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.mainGoal === 'Cutting' ? '#fff' : theme.colors.text }]}>Cutting </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.mainGoal === 'Bulking' && styles.selectedGoalButton,
                { backgroundColor: userData.mainGoal === 'Bulking' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, mainGoal: 'Bulking' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.mainGoal === 'Bulking' ? '#fff' : theme.colors.text }]}>Bulking </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalButton,
                userData.mainGoal === 'Maintenance' && styles.selectedGoalButton,
                { backgroundColor: userData.mainGoal === 'Maintenance' ? theme.colors.primary : theme.colors.buttonBackground,
                  borderColor: theme.colors.border, }
              ]}
              onPress={() => setUserData({ ...userData, mainGoal: 'Maintenance' })}
            >
              <Text style={[styles.goalButtonText, { color: userData.mainGoal === 'Maintenance' ? '#fff' : theme.colors.text }]}>Maintenance </Text>
            </TouchableOpacity>
          </View>
        );
      case 8:
        return (
          <View style={styles.contentContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>Review your details: </Text>
               <View style={[styles.reviewContainer, { backgroundColor: theme.colors.reviewBackground }]}>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Gender: {userData.gender} </Text>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Birthday: {`${userData.birthday?.day}/${userData.birthday?.month}/${userData.birthday?.year}`} </Text>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Height: {userData.height} cm </Text>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Weight: {userData.weight} kg </Text>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Goal: {userData.goal} </Text>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Activity Level: {userData.activityLevel} </Text>
                    <Text style={[styles.reviewText, { color: theme.colors.text }]}>Main Goal: {userData.mainGoal} </Text>
              </View>
          </View>
        );

      default:
        return <Text style={{ color: theme.colors.text }}>Error: Page not found</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <View style={[styles.progressContainer, { backgroundColor: theme.colors.background, paddingTop: 75 }]}>
        {page > 1 ? (
          <TouchableOpacity onPress={handlePrevious}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>Back </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} /> // Placeholder để giữ cân bằng
        )}
        <Progress.Bar progress={page / totalPages} width={250} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text }}>{page}/{totalPages} </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderPageContent()}
      </ScrollView>

      <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.colors.primary }]} onPress={handleNext}>
        <Text style={styles.continueButtonText}>{page === totalPages ? 'Finish & Save' : 'Continue'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
  },
  darkHeader: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#fff',
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
    paddingBottom: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  genderButton: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: '#d3d3d3',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  genderButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  genderIcon: {
    marginRight: 5
  },
  darkButton: {
        backgroundColor: '#444',
        borderColor: '#555',
  },
  selectedDarkButton: {
        backgroundColor: '#86CB52', // The requested green color
        borderColor: '#86CB52',
  },
  selectedDarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',

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

  },
  slash: {
    fontSize: 20,
    marginHorizontal: 5,
  },
  heightInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 5
  },
  weightInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 5
  },
  targetWeightInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 5
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
    alignSelf: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  goalButton: {
    width: '100%',
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: '#d3d3d3',
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  goalButtonText: {
    fontSize: 16,
  },
  selectedGoalButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
  backButton: {
    fontSize: 16,
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
  reviewText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#444',
  },
});

export default OnboardingScreen;