// HomeScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { loadTodaySectionsData, deleteItemFromSection, addItemToSelectedDate } from '@/components/redux/diarySlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import RingProgress from '../../components/RingProgress';
import ArcProgress from '../../components/ArcProgress';
export default function HomeScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const route = useRoute();
    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';

    const todaySelection = useSelector(state => state.diary.todaySectionsData);

    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [mealSelectionVisible, setMealSelectionVisible] = useState(false);


    useEffect(() => {
        dispatch(loadTodaySectionsData());
    }, [dispatch]);

    useEffect(() => {
        if (route.params?.product && !selectedItem) {
            const productData = JSON.parse(route.params.product);
            console.log("🆕 New product scanned:", productData);

            // Chờ 300ms trước khi cập nhật state, tránh lỗi Fragment
            setTimeout(() => {
                setSelectedItem(productData);
                setMealSelectionVisible(true);
            }, 300);
        }
    }, [route.params]);

    const handleMealSelection = (meal) => {
        if (selectedItem) {
            console.log(`📌 Adding item to Redux: ${JSON.stringify(selectedItem)}`);
            dispatch(addItemToSelectedDate({ section: meal, item: selectedItem }));
        }

        // Đóng modal trước khi reset state
        setMealSelectionVisible(false);

        // Đợi 500ms để tránh lỗi Fragment chưa gắn vào UI
        setTimeout(() => {
            console.log("✅ Item added successfully. Resetting productData...");
            setSelectedItem(null);
            navigation.setParams({ product: null });
        }, 500);
    };

    const deleteItem = () => {
        dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
        setModalVisible(false);
    };

    const renderItemContent = (section, item, isDarkMode) => {
        console.log("renderItemContent:", { section, item, isDarkMode }); // ✅ Log các props
        if (section === "Activity") {
            // console.log("Activity item:", item); // ✅ Log item nếu là Activity
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

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={{ marginBottom: 20 }}>
                    <ArcProgress progress={1000}  size={200} kcalLeft={2147} strokeWidth={15} />
                </View>

                 {/* Nutrition Stats */}
                 <View style={styles.nutritionContainer}>
                    {[
                        { name: "Carbs", progress: 100, max: 200 },
                        { name: "Fat", progress: 21, max: 70 },
                        { name: "Protein", progress: 105, max: 150 }
                    ].map((nutrient, index) => (
                        <View key={index} style={styles.nutritionItem}>
                        <RingProgress progress={(nutrient.progress / nutrient.max) * 100} size={40} strokeWidth={6} />
                        <Text style={[styles.nutritionText, { color: isDarkMode ? 'gray' : 'black' }]}>
                            {nutrient.progress}/{nutrient.max} g {nutrient.name.toLowerCase()}
                        </Text>
                        </View>
                    ))}
                    </View>

                {Object.keys(todaySelection).map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                            <FontAwesome5 name={
                                section === "Activity" ? "running" :
                                    section === "Breakfast" ? "bread-slice" :
                                        section === "Lunch" ? "hamburger" :
                                            section === "Dinner" ? "utensils" : "cookie"
                            } size={16} color={isDarkMode ? 'white' : 'black'} />{" "}
                            {section}
                        </Text>

                        <View style={styles.dataContainer}>
                            {todaySelection[section].map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.dataItem}
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

                            {/* Nếu có dưới 3 mục thì hiển thị nút thêm và di chuyển sang phải */}
                            {todaySelection[section].length < 3 && (
                                <TouchableOpacity
                                    style={[styles.dataItem, styles.addButton]}
                                    onPress={() => navigation.navigate(section === "Activity" ? "Data" : "Search", { section })}
                                >
                                    <Text style={[styles.plus, { color: isDarkMode ? 'white' : 'black' }]}>+</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate('Camera')}>
                <FontAwesome5 name="camera" size={24} color="white" />
            </TouchableOpacity>

            {/* Modal chọn bữa ăn */}
            <Modal animationType="slide" transparent={true} visible={mealSelectionVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={{ color: 'black', fontSize: 16, marginBottom: 10 }}>
                            Chọn bữa ăn cho "{selectedItem?.name}"
                        </Text>
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal) => (
                            <TouchableOpacity
                                key={meal}
                                style={styles.modalButton}
                                onPress={() => handleMealSelection(meal)}
                            >
                                <Text style={{ color: 'black' }}>{meal}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={{ color: 'black', fontSize: 16, marginBottom: 10 }}>
                            Do you want to delete "{selectedItem?.name}"?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                <Text style={{ color: 'black' }}>Cancel </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={deleteItem} style={[styles.modalButton, { backgroundColor: 'red' }]}>
                                <Text style={{ color: 'white' }}>Delete </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    scrollContainer: { paddingBottom: 100 },
    section: { padding: 15, borderRadius: 10, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    dataContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    dataItem: {
        width: 80, height: 80, borderRadius: 10, borderWidth: 1,
        borderColor: 'gray', alignItems: 'center', justifyContent: 'center', marginRight: 10
    },
    plus: { fontSize: 30, fontWeight: 'bold' },
    modalContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: 250, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center'
    },
    modalButton: { padding: 10, margin: 5, borderRadius: 5, alignItems: 'center', width: 80, backgroundColor: '#ddd' },
    cameraButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007bff',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5
    },
    foodImage: {
        width: 75,
        height: 75,
        borderRadius: 10,
        resizeMode: 'cover'
    },
    activityName: {
        textAlign: 'center',
    },
    imageContainer: {
        position: 'relative',
        width: 80, // Điều chỉnh kích thước ảnh
        height: 80,
        borderRadius: 10,
        overflow: 'hidden', // Đảm bảo overlay không bị tràn ra ngoài
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Lớp mờ
        paddingVertical: 3,
        padding: 3,
        paddingBottom: 5
        // alignItems: 'center',
    },
    
    overlayText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    nutritionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    nutritionItem: {
        flexDirection: 'row',  
        alignItems: 'center',   
        padding: 5,
    },
    nutritionText: {
        marginLeft: 5, 
        fontSize: 14,
        fontWeight: '500',
    }
});