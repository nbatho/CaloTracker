// HomeScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ScrollView, Image, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { loadTodaySectionsData, deleteItemFromSection, addItemToSelectedDate } from '@/components/redux/diarySlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import RingProgress from '../../components/RingProgress';
import ArcProgress from '../../components/ArcProgress';

const SPACING = 20;
const AVATAR_SIZE = 72;

export default function HomeScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const route = useRoute();
    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';
    const [scrollY] = useState(new Animated.Value(0));
    const [modalVisible, setModalVisible] = useState(false);

    const todaySelection = useSelector(state => state.diary.todaySectionsData);
    const totalNutrients = useSelector(state => state.diary.totalNutrients);

    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [mealSelectionVisible, setMealSelectionVisible] = useState(false);

    // user
    const [TOTAL_KCAL, setTOTAL_KCAL] = useState(0);

    useEffect(() => {
        if (userData) {
            setTOTAL_KCAL(calculateTDEE(userData));
        }
    }, [userData]);

    // console.log("TOTAL_KCAL (TDEE):", TOTAL_KCAL);
    
    const Weight = 70;
    const suppliedKcal = totalNutrients.energy || 0;
    // console.log(totalNutrients)
    const userData = useSelector(state => state.diary.userData);
    const gender = userData?.gender || "unknown";
    const activityLevel = userData?.activityLevel || "unknown";
    // Lấy giá trị height và weight từ userData, có kiểm tra nếu dữ liệu chưa có
    const height = userData?.height || 0;
    const weight = userData?.weight || 0;
    const time = 1; // gio 
    const burnedKcal = totalNutrients.totalMET * weight * 1|| 0;
    useEffect(() => {
        if (userData && userData.weight && userData.height) {
            setTOTAL_KCAL(calculateTDEE(userData));
        }
    }, [userData]);
    const calculateTDEE = (userData) => {
        if (!userData) return 0; // Tránh lỗi nếu userData không tồn tại
    
        const { gender, weight, height, birthday, activityLevel } = userData;
    
        // Tính tuổi từ ngày sinh
        const birthYear = parseInt(birthday?.year, 10);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
    
        // Kiểm tra dữ liệu hợp lệ
        if (!weight || !height || !age || !gender || !activityLevel) return 0;
    
        // Tính BMR dựa trên giới tính
        let BMR;
        if (gender === "male") {
            BMR = 10 * weight + 6.25 * height - 5 * age + 5;
        } else if (gender === "female") {
            BMR = 10 * weight + 6.25 * height - 5 * age - 161;
        } else {
            return 0; // Trường hợp giới tính không hợp lệ
        }
    
        // Hệ số hoạt động
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9,
        };
    
        const activityFactor = activityMultipliers[activityLevel] || 1.2; // Mặc định nếu không có giá trị hợp lệ
    
        // Tính TDEE
        const TDEE = Math.round(BMR * activityFactor);
        return TDEE;
    };
    const [macros, setMacros] = useState({ carbs: 0, protein: 0, fat: 0 });
    const calculateMacros = (TDEE, goal = "maintenance") => {
        const macroRatios = {
            cutting: { carbs: 0.3, protein: 0.4, fat: 0.3 }, // Giảm cân
            bulking: { carbs: 0.4, protein: 0.3, fat: 0.3 }, // Tăng cơ
            maintenance: { carbs: 0.5, protein: 0.25, fat: 0.25 } // Duy trì
        };
    
        const { carbs, protein, fat } = macroRatios[goal] || macroRatios.maintenance;
    
        return {
            carbs: Math.round((TDEE * carbs) / 4), // 1g carb = 4 kcal
            protein: Math.round((TDEE * protein) / 4), // 1g protein = 4 kcal
            fat: Math.round((TDEE * fat) / 9) // 1g fat = 9 kcal
        };
    };
    useEffect(() => {
        if (TOTAL_KCAL > 0 && userData?.mainGoal) {
            const calculatedMacros = calculateMacros(TOTAL_KCAL, userData.mainGoal.toLowerCase());
            setMacros(calculatedMacros);
        }
    }, [TOTAL_KCAL, userData?.mainGoal]);
    useEffect(() => {
        console.log("User Data:", userData);
        console.log(macros)
    }, [userData]);
    


    useEffect(() => {
        dispatch(loadTodaySectionsData());
    }, [dispatch]);
    useEffect(() => {
        dispatch(loadTodaySectionsData());
    }, [totalNutrients]);

    useEffect(() => {
        if (route.params?.product && !selectedItem) {
            const productData = JSON.parse(route.params.product);
            setTimeout(() => {
                setSelectedItem(productData);
                setMealSelectionVisible(true);
            }, 300);
        }
    }, [route.params]);

    useEffect(() => {
        Animated.timing(scrollY, {
            toValue: scrollY.__getValue(), // Giữ nguyên giá trị hiện tại
            duration: 0,
            useNativeDriver: true,
        }).start();
    }, [todaySelection]);

    const handleMealSelection = (meal) => {
        if (selectedItem) {
            console.log("✅ Thêm Activity:", selectedItem);
            dispatch(addItemToSelectedDate({ section: meal, item: selectedItem }));
        }
        setMealSelectionVisible(false);

        setTimeout(() => {
            setSelectedItem(null);
            navigation.setParams({ product: null });
        }, 500);
    };

    const deleteItem = () => {
        dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
        setModalVisible(false);
    };

    const renderItemContent = (section, item, isDarkMode) => {
        if (section === "Activity") {
            return (
                <View style={{ alignItems: 'center' }}>
                    <FontAwesome5 name={item.icon} size={30} color={isDarkMode ? 'white' : 'black'} />
                    <Text style={[styles.activityName, { color: isDarkMode ? 'white' : 'black', fontSize: 12 }]}>{item.name}</Text>
                </View>
            );
        } else if (item.image_url) {
            return (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image_url }}
                        style={styles.foodImage}
                        onError={(error) => console.log("❌ Image Load Error:", error.nativeEvent)}
                    />
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>{item.energy} kcal</Text>
                        <Text style={styles.overlayText}>
                            {item.name.length > 10 ? item.name.slice(0, 10) + "…" : item.name}
                        </Text>
                        <Text style={styles.overlayText}>
                            {item.quantity}
                        </Text>
                    </View>
                </View>
            );
        } else {
            return (
                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{item.name}</Text>
            );
        }
    };

    const backgroundTopOpacity = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
            <Animated.View
                style={[
                    styles.backgroundTop,
                    {
                        backgroundColor: isDarkMode ? '#a1ce50ff' : '#a1ce50ff',
                        opacity: backgroundTopOpacity,
                    },
                ]}
            />
            <View style={[styles.backgroundBottom, { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' }]} />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                onScroll={(event) => {
                    scrollY.setValue(event.nativeEvent.contentOffset.y);
                }}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                
            >

                {/* Progress and Nutrition Stats */}
                <View style={[styles.topSection, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
                    <View style={styles.progressContainer}>
                        <View style={styles.nutritionBox}>
                            {/* Thay đổi icon và label cho Supplied */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome5 name="carrot" size={12} color={isDarkMode ? 'orange' : 'orange'} />
                                <Text style={[styles.labelText, { color: isDarkMode ? 'white' : 'black', marginLeft: 5 }]}>Eaten</Text>
                            </View>
                            <Text style={[styles.kcalText, { color: isDarkMode ? 'white' : 'black' }]}>{suppliedKcal}</Text>
                            <Text style={[styles.kcalLabel, { color: isDarkMode ? 'white' : 'gray' }]}>kcal</Text>
                        </View>
                        <ArcProgress progress={suppliedKcal } size={180} kcalLeft={TOTAL_KCAL - suppliedKcal + burnedKcal} strokeWidth={15} />
                        <View style={styles.nutritionBox}>
                            {/* Thay đổi icon và label cho Burned */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome5 name="fire" size={12} color={isDarkMode ? '#FFC107' : '#FFB300'} />
                                <Text style={[styles.labelText, { color: isDarkMode ? 'white' : 'black', marginLeft: 5 }]}>Burned</Text>
                            </View>
                            <Text style={[styles.kcalText, { color: isDarkMode ? 'white' : 'black' }]}>{burnedKcal}</Text>
                            <Text style={[styles.kcalLabel, { color: isDarkMode ? 'white' : 'gray' }]}>kcal</Text>
                        </View>
                    </View>

                    {/* Thêm container cho "Eaten" */}
                    <View style={styles.eatenContainer}>
                        <Text style={[styles.eatenText, { color: isDarkMode ? 'gray' : 'gray' }]}>Eaten </Text>
                        <Text style={[styles.eatenText, styles.eatenLine, { color: isDarkMode ? 'gray' : 'gray' }]}> —————————————————————————————————————</Text>
                    </View>

                    <View style={styles.nutritionContainer}>
                        {[
                            {
                                name: "Carbs",
                                progress: Math.round(totalNutrients.carbohydrates),
                                max: macros.carbs,
                                color: "#F44336",
                                endPointColor: "#F44336",
                                type: "Carbs",
                                emptyColor: "#F44336"
                            },
                            {
                                name: "Fat",
                                progress: Math.round(totalNutrients.fat),
                                max: macros.fat,
                                color: "#F44336",
                                endPointColor: "#F44336",
                                type: "Fat",
                                emptyColor: "#FF9800"
                            },
                            {
                                name: "Protein",
                                progress: Math.round(totalNutrients.proteins),
                                max: macros.protein,
                                color: "#FF9800",
                                endPointColor: "#FF9800",
                                type: "Protein",
                                emptyColor: "#2196F3"
                            }
                        ].map((nutrient, index) => (
                            <View key={index} style={styles.nutritionItem}>
                                <RingProgress
                                    progress={Math.round((nutrient.progress / nutrient.max) * 100)}
                                    size={88}
                                    strokeWidth={10}
                                    fillColor={nutrient.color}
                                    endPointColor={nutrient.endPointColor}
                                    nutrientType={nutrient.type}
                                    emptyColor={nutrient.emptyColor}
                                />
                                <View style={styles.nutritionInfo}>
                                    <Text style={[styles.nutritionText, { color: isDarkMode ? 'white' : 'black' }]}>
                                        {nutrient.progress}/{nutrient.max} g
                                    </Text>
                                    <Text style={[styles.nutritionLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                        {nutrient.name}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Meal Sections */}
                {Object.keys(todaySelection).map((section, index) => (
                    <View key={index} style={[styles.section, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
                        <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>{section}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.dataContainer}>
                                {todaySelection[section].map((item, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.dataItem, { backgroundColor: isDarkMode ? '#444444' : '#FAFAFA' }]}
                                        onLongPress={() => {
                                            setSelectedItem(item);
                                            setSelectedSection(section);
                                            setModalVisible(true);
                                        }}
                                    >
                                        {(() => {
                                            try {
                                                return renderItemContent(section, item, isDarkMode);
                                            } catch (error) {
                                                console.error("❌ Error rendering item:", error);
                                                return <Text style={{ color: 'red' }}>Error</Text>;
                                            }
                                        })()}
                                    </TouchableOpacity>
                                ))}

                                {/* Nút thêm luôn hiển thị ở cuối */}
                                <TouchableOpacity
                                    style={[
                                        styles.dataItem,
                                        styles.addButton,
                                        { backgroundColor: isDarkMode ? '#a1ce50ff' : '#b4d873ff' },
                                    ]}
                                    onPress={() => navigation.navigate(section === "Activity" ? "Data" : "Search", { section })}
                                >
                                    <Text style={[styles.plus, { color: isDarkMode ? 'white' : 'black' }]}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate('Camera')}>
                <FontAwesome5 name="camera" size={24} color="white" />
            </TouchableOpacity>

            {/* Modal chọn bữa ăn */}
            <Modal animationType="slide" transparent={true} visible={mealSelectionVisible}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                            Chọn bữa ăn
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: isDarkMode ? 'gray' : 'gray' }]}>
                            cho "{selectedItem?.name}"
                        </Text>
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal) => (
                            <TouchableOpacity
                                key={meal}
                                style={[styles.mealButton, { backgroundColor: isDarkMode ? '#444444' : '#DDDDDD' }]}
                                onPress={() => handleMealSelection(meal)}
                            >
                                <Text style={[styles.mealButtonText, { color: isDarkMode ? 'white' : 'black' }]}>{meal} </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#222222' : '#FFFFFF' }]}>
                        <Text style={[styles.modalText, { color: isDarkMode ? 'white' : 'black' }]}>
                            Do you want to delete "{selectedItem?.name}"?
                        </Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: isDarkMode ? '#555555' : '#EEEEEE' }]}>
                                <Text style={{ color: isDarkMode ? 'white' : 'black', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={deleteItem} style={[styles.modalButton, { backgroundColor: 'red' }]}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: SPACING, backgroundColor: '#F5F5F5' },
    scrollContainer: { borderColor: 'transparent', overflow: 'hidden', borderWidth: 0 },
    topSection: { // Style cho phần kcal và nutrition
        padding: SPACING,
        borderRadius: 10,
        marginBottom: SPACING,
        marginTop: 80,
        paddingBottom: SPACING * 2,
    },
    section: {
        padding: SPACING,
        borderRadius: 10,
        marginBottom: SPACING,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING / 2,
    },
    dataContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    dataItem: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: 10,
        //borderWidth: 1,
        //borderColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING / 2,
    },
    addButton: {
        borderRadius: AVATAR_SIZE / 2, // Biến thành hình tròn
        width: 55, // Thay đổi chiều rộng
        height: 55, // Thay đổi chiều cao
    },
    plus: {
        fontSize: 27,
        fontWeight: '100',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        marginBottom: 16,
    },
    mealButton: {
        backgroundColor: '#DDDDDD',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 8,
        width: '100%',
        alignItems: 'center',
    },
    mealButtonText: {
        fontSize: 16,
    },
    deleteModalContainer: {
        width: '80%',
        padding: 20,
        borderRadius: 15, // Bo góc modal
        alignItems: 'center',
        elevation: 5, // Hiệu ứng đổ bóng
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,

    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10, // Bo góc nút
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cameraButton: {
        position: 'absolute',
        bottom: SPACING * 2,
        right: SPACING,
        backgroundColor: '#a1ce50ff',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5
    },
    foodImage: {
        width: AVATAR_SIZE - 5,
        height: AVATAR_SIZE - 5,
        borderRadius: 10,
        resizeMode: 'cover'
    },
    activityName: {
        textAlign: 'center',
    },
    imageContainer: {
        position: 'relative',
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: 10,
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 3,
        padding: 3,
        paddingBottom: 5
    },

    overlayText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    nutritionContainer: {
        flexDirection: 'row', // Xếp thành hàng ngang
        justifyContent: 'space-around', // Giãn cách đều giữa các nhóm
        alignItems: 'center',
        marginTop: 30, // Điều chỉnh giá trị này để dịch chuyển xuống (giảm giá trị, tiến lên, tăng giá trị, tiến xuống)
        marginBottom: 10,
    },
    nutritionItem: {
        flexDirection: 'colum', // Xếp vòng tròn và text theo hàng ngang
        alignItems: 'center', // Căn giữa theo chiều dọc
        marginHorizontal: 8.5,
    },
    nutritionInfo: {
        marginLeft: 12, // Tăng khoảng cách giữa RingProgress và text
        alignItems: 'flex-start', // Căn text sang trái
        marginTop: 10, // Thêm khoảng cách giữa vòng tròn và text
    },
    nutritionText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nutritionLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
        marginTop: 2, // Khoảng cách với số liệu progress
        textAlign: 'center', // Căn giữa theo chiều ngang
    },
    kcalText: { fontSize: 16, fontWeight: 'bold', color: 'black' },
    labelText: { fontSize: 16, fontWeight: 'bold', color: 'black' },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nutritionBox: {
        alignItems: 'center',
    },
    kcalLabel: { fontSize: 12 }, // Style cho chữ "kcal"
    eatenContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    eatenText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backgroundTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    backgroundBottom: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        bottom: 0,
    },
    eatenLine: {
        marginLeft: 0, // Giảm hoặc loại bỏ khoảng cách nếu cần
        letterSpacing: -2, // Điều chỉnh khoảng cách giữa các ký tự nếu cần
        fontSize: 11,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Hiệu ứng mờ nền
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
    },
    modalText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
});