import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import * as Progress from 'react-native-progress';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { saveUserData } from '@/components/redux/diarySlice'; // ✅ Import Redux action
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
    switch (page) {
      case 1:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>What's your gender?</Text>
            <TouchableOpacity
              style={[styles.genderButton, userData.gender === 'male' && styles.selectedButton]}
              onPress={() => setUserData({ ...userData, gender: 'male' })}
            >
              <Text style={[styles.genderButtonText, userData.gender === 'male' && styles.selectedButtonText]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, userData.gender === 'female' && styles.selectedButton]}
              onPress={() => setUserData({ ...userData, gender: 'female' })}
            >
              <Text style={[styles.genderButtonText, userData.gender === 'female' && styles.selectedButtonText]}>Female</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>When's your birthday?</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInputBox}
                placeholder="DD"
                keyboardType="number-pad"
                maxLength={2}
                value={userData.birthday?.day || ''}
                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, day: text } })}
              />
              <Text style={styles.slash}>/</Text>
              <TextInput
                style={styles.dateInputBox}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
                value={userData.birthday?.month || ''}
                onChangeText={text => setUserData({ ...userData, birthday: { ...userData.birthday, month: text } })}
              />
              <Text style={styles.slash}>/</Text>
              <TextInput
                style={styles.dateInputBox}
                placeholder="YYYY"
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
            <Text style={styles.questionText}>How tall are you?</Text>
            <TextInput
              style={styles.heightInput}
              placeholder="Enter height in cm"
              keyboardType="number-pad"
              value={userData.height ? userData.height.toString() : ''}
              onChangeText={text => setUserData({ ...userData, height: parseInt(text) || 0 })}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>What's your current weight?</Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Enter weight in kg"
              keyboardType="number-pad"
              value={userData.weight ? userData.weight.toString() : ''}
              onChangeText={text => setUserData({ ...userData, weight: parseInt(text) || 0 })}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>What's your target weight?</Text>
            <TextInput
              style={styles.targetWeightInput}
              placeholder="Enter target weight in kg"
              keyboardType="number-pad"
              value={userData.goal ? userData.goal.toString() : ''}
              onChangeText={text => setUserData({ ...userData, goal: text })}
            />
          </View>
        );

      case 6:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>How active are you?</Text>
            <TouchableOpacity
              style={[styles.goalButton, userData.activityLevel === 'sedentary' && styles.selectedGoalButton]}
              onPress={() => setUserData({ ...userData, activityLevel: 'sedentary' })}
            >
              <Text style={styles.goalButtonText}>Sedentary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.goalButton, userData.activityLevel === 'light' && styles.selectedGoalButton]}
              onPress={() => setUserData({ ...userData, activityLevel: 'light' })}
            >
              <Text style={styles.goalButtonText}>Light </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.goalButton, userData.activityLevel === 'moderate' && styles.selectedGoalButton]}
              onPress={() => setUserData({ ...userData, activityLevel: 'moderate' })}
            >
              <Text style={styles.goalButtonText}>Moderate </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.goalButton, userData.activityLevel === 'active' && styles.selectedGoalButton]}
              onPress={() => setUserData({ ...userData, activityLevel: 'active' })}
            >
              <Text style={styles.goalButtonText}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.goalButton, userData.activityLevel === 'very_active' && styles.selectedGoalButton]}
              onPress={() => setUserData({ ...userData, activityLevel: 'very_active' })}
            >
              <Text style={styles.goalButtonText}>Very active</Text>
            </TouchableOpacity>
          </View>
        );

      case 7:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>Review your details:</Text>
            <Text>Gender: {userData.gender}</Text>
            <Text>Birthday: {`${userData.birthday?.day}/${userData.birthday?.month}/${userData.birthday?.year}`}</Text>
            <Text>Height: {userData.height} cm</Text>
            <Text>Weight: {userData.weight} kg</Text>
            <Text>Goal: {userData.goal}</Text>
            <Text>Activity Level: {userData.activityLevel}</Text>
          </View>
        );

      default:
        return <Text>Error: Page not found</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {page > 1 && (
          <TouchableOpacity onPress={() => setPage(page - 1)}>
            <Text style={styles.backButton}>Back</Text>
          </TouchableOpacity>
        )}
        <Progress.Bar progress={page / totalPages} width={200} color="#86CB52" />
        <Text>{page}/{totalPages}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
            {renderPageContent()}
    </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
        <Text style={styles.continueButtonText}>{page === totalPages ? 'Finish & Save' : 'Continue'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: '100%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
  selectedButtonText: {
    color: '#fff',
  },
  preferNotSayButton: {
    paddingVertical: 10,
  },
  preferNotSayText: {
    color: '#888',
    fontSize: 14,
  },

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Distribute items evenly
  },
  dateInputBox: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: 60, // Adjust width as needed
    textAlign: 'center',
  },
  slash: {
    fontSize: 20,
    marginHorizontal: 5,  //Add some spacing between the slashes and boxes
  },

  unitButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    marginHorizontal: 5,
  },
  unitButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedUnitButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
  selectedUnitButtonText: {
    color: '#fff',
  },
  valueText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
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
  continueButton: {
    backgroundColor: '#86CB52',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalButton: {
    width: '100%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  goalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGoalButton: {
    backgroundColor: '#86CB52',
    borderColor: '#86CB52',
  },
  selectedGoalText: {
    color: '#fff',
  },
  backButton: {
    color: '#86CB52',
    fontSize: 16,
  },
});

export default OnboardingScreen;