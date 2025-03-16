import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, useColorScheme, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

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

// Component cho các mục thông tin có thể ấn vào
const ProfileItem = ({ icon, label, onPress }) => {
    const theme = useColorScheme();
    const backgroundColor = theme === 'dark' ? '#333' : '#F4F4F4';
    const textColor = theme === 'dark' ? 'white' : 'black';
    const iconColor = theme === 'dark' ? 'white' : 'black';

    const labelParts = label.split(': '); // Tách "Activity" và giá trị

    return (
        <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor, flexDirection: 'row', alignItems: 'center' }]}>
            <FontAwesome5 name={icon} size={24} color={iconColor} style={{ marginRight: 15 }} />
            <View style={{ flexDirection: 'column' }}>
                <Text style={[styles.textColor, { color: textColor, fontSize: 18, fontWeight: 'bold' }]}>{labelParts[0]}:</Text>
                <Text style={[styles.textColor, { color: textColor, fontSize: 14 }]}>{labelParts[1] || 'Chưa chọn'}</Text>
            </View>
        </TouchableOpacity>
    );
};

// Màn hình Profile
export default function ProfileScreen() {
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [weightGoal, setWeightGoal] = useState("");

    // State tạm thời để lưu giá trị trong modal
    const [tempWeight, setTempWeight] = useState("");
    const [tempHeight, setTempHeight] = useState("");
    const [tempAge, setTempAge] = useState("");

    // State BMI
    const [bmi, setBmi] = useState("N/A");
    const [bmiStatus, setBmiStatus] = useState("N/A");

    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';

    const backgroundColor = isDarkMode ? '#0F0F0F' : '#F4F4F4';
    const textColor = isDarkMode ? 'white' : 'black';

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

        // Cập nhật state chính khi đóng modal
        if (modalContent === 'Weight') setWeight(tempWeight);
        if (modalContent === 'Height') setHeight(tempHeight);
        if (modalContent === 'Age') setAge(tempAge);
    };

    const handleActivitySelect = (level) => {
        setActivityLevel(level);
        handleCloseModal();
    };

    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
        handleCloseModal();
    };

    const handleWeightGoalSelect = (goal) => {
        setWeightGoal(goal);
        handleCloseModal();
    };

    const activityOptions = ['Sedentary', 'Low Active', 'Active', 'Very Active'];

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
            {/* Vòng tròn BMI */}
            <BMICircle bmi={bmi} size={180} />

            {/* Trạng thái */}
            <Text style={[styles.status, { color: textColor }]}>{bmiStatus}</Text>
            <Text style={[styles.risk, { color: isDarkMode ? 'lightgray' : 'gray' }]}>Risk of comorbidities: Average</Text>

            {/* Các mục thông tin (ấn vào để chỉnh sửa) */}
            <View style={styles.profileItems}>
                <ProfileItem
                    icon="running"
                    label={`Activity: ${activityLevel || 'Chưa chọn'}`}
                    onPress={() => handlePress('Activity')}
                />
                <ProfileItem icon="weight" label={`Weight: ${weight || 'Chưa nhập'} kg`} onPress={() => handlePress('Weight')} />
                <ProfileItem icon="ruler" label={`Height: ${height || 'Chưa nhập'} cm`} onPress={() => handlePress('Height')} />
                <ProfileItem
                    icon="bullseye"
                    label={`Goal: ${weightGoal || 'Chưa chọn'}`}
                    onPress={() => handlePress('Goal')}
                />
                <ProfileItem icon="user" label={`Age: ${age || 'Chưa nhập'} tuổi`} onPress={() => handlePress('Age')} />
                <ProfileItem
                    icon="venus-mars"
                    label={`Gender: ${gender || 'Chưa chọn'}`}
                    onPress={() => handlePress('Gender')}
                />
            </View>

            {/* Modal */}
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
                                    <View>
                                        {activityOptions.map((level) => (
                                            <TouchableOpacity
                                                key={level}
                                                style={styles.activityOption}
                                                onPress={() => handleActivitySelect(level)}
                                            >
                                                <Text style={{ color: textColor }}>{level}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {modalContent === 'Gender' && (
                                    <View>
                                        {['male', 'female'].map((genderOption) => (
                                            <TouchableOpacity
                                                key={genderOption}
                                                style={styles.activityOption}
                                                onPress={() => handleGenderSelect(genderOption)}
                                            >
                                                <Text style={{ color: textColor }}>{genderOption}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {modalContent === 'Goal' && (
                                    <View>
                                        {['Lose Weight', 'Maintain Weight', 'Gain Weight'].map((goalOption) => (
                                            <TouchableOpacity
                                                key={goalOption}
                                                style={styles.activityOption}
                                                onPress={() => handleWeightGoalSelect(goalOption)}
                                            >
                                                <Text style={{ color: textColor }}>{goalOption}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Nút đóng */}
                                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                                    <Text style={[styles.closeButtonItem, { color: isDarkMode ? 'lightgray' : 'gray' }]}>Đóng</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
}

// Style cho ô nhập liệu
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

// Styles
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
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
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textColor: {
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
    activityOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    closeButton: {
        alignItems: 'center',
        padding: 10,
    },
    closeButtonItem: {
        fontSize: 16,
    },
});