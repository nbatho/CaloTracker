import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    useColorScheme,
    ScrollView,
    Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context'; // Đảm bảo nội dung không bị che khuất bởi notch hoặc thanh điều hướng
import { useSelector, useDispatch } from 'react-redux';
import { saveUserData } from '@/components/redux/diarySlice'; // Import action cập nhật Redux
import AsyncStorage from '@react-native-async-storage/async-storage';
// Hàm tính chỉ số BMI và trả về cả giá trị và trạng thái
const calculateBMI = (weight, height) => {
    if (!weight || !height || height === 0) return { bmi: "N/A", status: "N/A" };

    const bmiValue = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));

    let status = "";
    if (bmiValue < 18.5) {
        status = "Suy dinh dưỡng";
    } else if (bmiValue < 23) {
        status = "Bình thường";
    } else if (bmiValue < 25) {
        status = "Thừa cân";
    } else if (bmiValue < 30) {
        status = "Béo phì độ I";
    } else {
        status = "Béo phì độ II";
    }

    return { bmi: bmiValue, status };
};

// Component hiển thị BMI dạng vòng tròn
const BMICircle = ({ bmi, size = 180 }) => {
    const theme = useColorScheme();
    const circleColor = theme === 'dark' ? '#a1ce50ff' : '#a1ce50ff'; // LightGreen/ForestGreen
    const fillColor = theme === 'dark' ? '#1E1E1E' : '#FFFFFF';

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

// Component cho các mục thông tin có thể ấn vào
const ProfileItem = ({ icon, label, onPress }) => {
    const theme = useColorScheme();
    const backgroundColor = theme === 'dark' ? '#2C2C2E' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#F0F0F0' : '#222222';
    const iconColor = theme === 'dark' ? '#A0A0A0' : '#555555';
    const borderColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    const labelParts = label.split(': ');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.item,
                { backgroundColor: backgroundColor, borderColor: borderColor },
            ]}
        >
            <View style={styles.itemContent}>
                <FontAwesome5 name={icon} size={20} color={iconColor} style={styles.itemIcon} />
                <View>
                    <Text style={[styles.itemLabel, { color: textColor }]}>{labelParts[0]}:</Text>
                    <Text style={[styles.itemValue, { color: textColor }]}>{labelParts[1] || 'Chưa chọn'}</Text>
                </View>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={iconColor} />
        </TouchableOpacity>
    );
};

// Màn hình Profile
export default function ProfileScreen() {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.diary.userData) || {};
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [weight, setWeight] = useState(userData.weight?.toString() || "");
    const [height, setHeight] = useState(userData.height?.toString() || "");
    const [age, setAge] = useState(userData.birthday?.year ? (new Date().getFullYear() - parseInt(userData.birthday.year)).toString() : "");
    const [activityLevel, setActivityLevel] = useState(userData.activityLevel || "");
    const [gender, setGender] = useState(userData.gender || "");
    const [weightGoal, setWeightGoal] = useState(userData.goal?.toString() || "");

    // State tạm thời để lưu giá trị trong modal
    const [tempWeight, setTempWeight] = useState("");
    const [tempHeight, setTempHeight] = useState("");
    const [tempAge, setTempAge] = useState("");

    // State BMI
    const [bmi, setBmi] = useState("N/A");
    const [bmiStatus, setBmiStatus] = useState("N/A");

    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';

    const backgroundColor = isDarkMode ? '#121212' : '#F9F9F9';
    const textColor = isDarkMode ? '#EEEEEE' : '#333333';
    const subTextColor = isDarkMode ? '#A0A0A0' : '#666666';
    const modalBackgroundColor = isDarkMode ? '#2C2C2E' : '#FFFFFF';

    const updateUserData = async (updatedData) => {
        try {
            const newUserData = { ...userData, ...updatedData };
            await AsyncStorage.setItem('userData', JSON.stringify(newUserData)); //  Lưu vào AsyncStorage
            dispatch(saveUserData(newUserData)); //  Cập nhật Redux
        } catch (error) {
            console.error("❌ Lỗi khi lưu userData:", error);
        }
    };
    
    // Sử dụng useEffect để tính BMI mỗi khi weight hoặc height thay đổi
    useEffect(() => {
        const { bmi: calculatedBmi, status: calculatedStatus } = calculateBMI(parseFloat(weight), parseFloat(height));
        setBmi(calculatedBmi);
        setBmiStatus(calculatedStatus);
    }, [weight, height]);

    const handlePress = (content) => {
        setModalContent(content);
        setModalVisible(true);

        // Khởi tạo giá trị tạm thời khi mở modal
        if (content === 'Weight') setTempWeight(weight);
        if (content === 'Height') setTempHeight(height);
        if (content === 'Age') setTempAge(age);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        Keyboard.dismiss();
    
        let updatedField = {};
        if (modalContent === 'Weight') {
            setWeight(tempWeight);
            updatedField = { weight: parseFloat(tempWeight) };
        }
        if (modalContent === 'Height') {
            setHeight(tempHeight);
            updatedField = { height: parseFloat(tempHeight) };
        }
        if (modalContent === 'Age') {
            setAge(tempAge);
            updatedField = { birthday: { ...userData.birthday, year: (new Date().getFullYear() - parseInt(tempAge)).toString() } };
        }
    
        updateUserData(updatedField); // Cập nhật Redux & AsyncStorage
    };
    

    const handleActivitySelect = (level) => {
        // console.log("🔹 Đã chọn activityLevel:", level);
        setActivityLevel(level);
        updateUserData({ activityLevel: level });
        setModalVisible(false);
    };

    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
        updateUserData({ gender: selectedGender });
        handleCloseModal();
    };

    const handleWeightGoalSelect = (goal) => {
        setWeightGoal(goal);
        updateUserData({ goal: goal });
        handleCloseModal();
    };
    

    const activityOptions = ['Sedentary', 'Low Active', 'Active', 'Very Active'];
    const genderOptions = ['Male', 'Female', 'Other'];
    const goalOptions = ['Lose Weight', 'Maintain Weight', 'Gain Weight'];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundColor }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileHeader}>
                    <BMICircle bmi={bmi} size={140} />
                    <Text style={[styles.status, { color: textColor }]}>{bmiStatus}</Text>
                    <Text style={[styles.risk, { color: subTextColor }]}>
                        Risk of comorbidities: Average
                    </Text>
                </View>

                <View style={styles.profileItems}>
                    <ProfileItem
                        icon="running"
                        label={`Activity: ${activityLevel || 'Not set'}`}
                        onPress={() => handlePress('Activity')}
                    />
                    <ProfileItem icon="weight" label={`Weight: ${weight || 'Not set'} kg`} onPress={() => handlePress('Weight')} />
                    <ProfileItem icon="ruler" label={`Height: ${height || 'Not set'} cm`} onPress={() => handlePress('Height')} />
                    <ProfileItem
                        icon="bullseye"
                        label={`Goal: ${weightGoal || 'Not set'}`}
                        onPress={() => handlePress('Goal')}
                    />
                    <ProfileItem icon="birthday-cake" label={`Age: ${age || 'Not set'} years`} onPress={() => handlePress('Age')} />
                    <ProfileItem
                        icon="venus-mars"
                        label={`Gender: ${gender || 'Not set'}`}
                        onPress={() => handlePress('Gender')}
                    />
                </View>

                <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
                    <TouchableWithoutFeedback onPress={handleCloseModal}>
                        <View style={styles.modalBackground}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                    <Text style={[styles.modalTitle, { color: textColor }]}>
                                        {modalContent === 'Activity' ? 'Chọn mức độ hoạt động' :
                                            modalContent === 'Gender' ? 'Chọn giới tính' :
                                                modalContent === 'Goal' ? 'Chọn mục tiêu cân nặng' :
                                                    `Nhập ${modalContent}`}
                                    </Text>

                                    {/* Hiển thị các trường nhập liệu tùy theo lựa chọn */}
                                    {modalContent === 'Weight' && (
                                        <TextInput
                                            style={getInputStyle(isDarkMode)}
                                            placeholder="Nhập cân nặng (kg)"
                                            placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                                            keyboardType="numeric"
                                            value={tempWeight}
                                            onChangeText={setTempWeight}
                                        />
                                    )}
                                    {modalContent === 'Height' && (
                                        <TextInput
                                            style={getInputStyle(isDarkMode)}
                                            placeholder="Nhập chiều cao (cm)"
                                            placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                                            keyboardType="numeric"
                                            value={tempHeight}
                                            onChangeText={setTempHeight}
                                        />
                                    )}
                                    {modalContent === 'Age' && (
                                        <TextInput
                                            style={getInputStyle(isDarkMode)}
                                            placeholder="Nhập tuổi"
                                            placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                                            keyboardType="numeric"
                                            value={tempAge}
                                            onChangeText={setTempAge}
                                        />
                                    )}

                                    {/* Lựa chọn mức độ hoạt động */}
                                    {modalContent === 'Activity' && (
                                        <View style={styles.optionsContainer}>
                                            {activityOptions.map((level) => (
                                                <TouchableOpacity
                                                    key={level}
                                                    style={[styles.optionButton, { backgroundColor: activityLevel === level ? (isDarkMode ? '#a1ce50ff' : '#a1ce50ff') : 'transparent' }]}
                                                    onPress={() => handleActivitySelect(level)}
                                                >
                                                    <Text style={[styles.optionText, { color: textColor }]}>{level}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {modalContent === 'Gender' && (
                                        <View style={styles.optionsContainer}>
                                            {genderOptions.map((genderOption) => (
                                                <TouchableOpacity
                                                    key={genderOption}
                                                    style={[styles.optionButton, { backgroundColor: gender === genderOption ? (isDarkMode ? '#a1ce50ff' : '#a1ce50ff') : 'transparent' }]}
                                                    onPress={() => handleGenderSelect(genderOption)}
                                                >
                                                    <Text style={[styles.optionText, { color: textColor }]}>{genderOption}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {modalContent === 'Goal' && (
                                        <View style={styles.optionsContainer}>
                                            {goalOptions.map((goalOption) => (
                                                <TouchableOpacity
                                                    key={goalOption}
                                                    style={[styles.optionButton, { backgroundColor: weightGoal === goalOption ? (isDarkMode ? '#a1ce50ff' : '#a1ce50ff') : 'transparent' }]}
                                                    onPress={() => handleWeightGoalSelect(goalOption)}
                                                >
                                                    <Text style={[styles.optionText, { color: textColor }]}>{goalOption}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                     {/* Nút đóng */}
                                {/* <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                                    <Text style={[styles.closeButtonItem, { color: isDarkMode ? 'lightgray' : 'gray' }]}>Đóng</Text>
                                </TouchableOpacity> */}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

// Style cho ô nhập liệu
const getInputStyle = (isDarkMode) => ({
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: isDarkMode ? '#EEEEEE' : '#333333',
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F2',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
});

// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bmiContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 12,
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
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
    risk: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 16,
    },
    profileItems: {
        width: '100%',
        paddingHorizontal: 24,
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 16,
        width: 24,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemValue: {
        fontSize: 14,
        marginTop: 4,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Thêm background mờ
    },
    modalContent: {
        padding: 20,
        borderRadius: 10,
        width: '80%',
        backgroundColor: '#a1ce50ff' ,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    optionItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    closeButton: {
        alignItems: 'center',
        marginTop: 24,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionsContainer: {
        marginTop: 10,
    },
    optionButton: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
    },
    closeButtonItem: {
        fontSize: 18,
        fontWeight: '500',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    }
    
});