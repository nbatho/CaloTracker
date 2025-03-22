// Import các thư viện cần thiết
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Các hằng số cấu hình
const CHAT_STORAGE_KEY = 'nutrition_chat_history'; // Key để lưu trữ lịch sử chat
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'; // Endpoint của OpenRouter API
const API_KEY = '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'; // API key của OpenRouter

// Hướng dẫn cho AI về cách trả lời
const SYSTEM_MESSAGE = `Bạn là một chuyên gia dinh dưỡng thân thiện, nhiệt tình và đầy trách nhiệm. Hãy:
- Ghi nhớ và kết nối thông tin từ các câu hỏi trước đó của người dùng
- Thể hiện sự quan tâm và đồng cảm trong câu trả lời
- Trả lời với giọng điệu thân thiện, gần gũi
- Nếu người dùng hỏi bằng tiếng Anh, trả lời bằng tiếng Anh
- Giải thích mọi thứ một cách dễ hiểu và có tính giáo dục
- Đưa ra lời khuyên thực tế và có tính xây dựng
- Độ dài câu trả lời khoảng 3-4 câu để đảm bảo đầy đủ thông tin
- Sử dụng từ ngữ phù hợp với ngữ cảnh văn hóa
- Nhắc lại và kết nối với những điểm đã thảo luận trước đó
- Tỏ ra hứng thú với câu hỏi của người dùng
- Khuyến khích người dùng đặt thêm câu hỏi nếu cần`;

// Sửa hàm formatBotMessage
const formatBotMessage = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')  // Xóa dấu ** 
    .replace(/\*/g, '')    // Xóa dấu *
    .replace(/\\n/g, '\n') // Giữ nguyên xuống dòng
    .trim();               // Xóa khoảng trắng thừa
};

// Component modal hiển thị lịch sử chat
const ChatHistoryModal = ({ visible, onClose, chatHistory, onSelectChat, onDeleteChat, onClearAll }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Lịch sử trò chuyện</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClearAll} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.historyList}>
          {chatHistory.map((chat) => (
            <View key={chat.id} style={styles.historyItem}>
              <TouchableOpacity 
                style={styles.historyItemContent}
                onPress={() => onSelectChat(chat)}
              >
                <Text style={styles.historyItemTitle}>
                  {chat.title || 'New chat'}
                </Text>
                <Text style={styles.historyItemPreview} numberOfLines={1}>
                  {chat.messages[0]?.text || ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => onDeleteChat(chat.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="close-circle" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Component chính của ứng dụng
const AI = () => {
  // Các state quản lý dữ liệu
  const [messages, setMessages] = useState([]); // Lưu tin nhắn của cuộc hội thoại hiện tại
  const [inputText, setInputText] = useState(""); // Quản lý text input
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [showHistory, setShowHistory] = useState(false); // Hiển thị/ẩn modal lịch sử
  const [chatHistory, setChatHistory] = useState([]); // Lưu trữ lịch sử các cuộc hội thoại
  const [currentChatId, setCurrentChatId] = useState(Date.now()); // ID của cuộc hội thoại hiện tại
  const scrollViewRef = useRef();

  // Tải lịch sử chat khi khởi động
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Update loadChatHistory
  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('chat_history');
      if (history) {
        setChatHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử', error);
    }
  };

  // Các hàm xử lý chức năng
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    const userMessage = { 
      id: Date.now(), 
      text: inputText, 
      type: 'user' 
    };
    
    try {
      // Thêm tin nhắn người dùng trước
      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setInputText("");

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nutrition-ai.com',
          'X-Title': 'NutritionAI',
        },
        body: JSON.stringify({
          model: "google/gemma-3-4b-it:free",
          messages: [
            {
              role: "system",
              content: SYSTEM_MESSAGE
            },
            // Tăng context window để nhớ nhiều hơn
            ...messages.slice(-5).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: "user",
              content: inputText
            }
          ],
          temperature: 0.7, // Tăng temperature để câu trả lời tự nhiên hơn
          max_tokens: 500,  // Tăng max_tokens để trả lời dài hơn
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) throw new Error('Lỗi kết nối mạng');

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const botResponse = {
          id: Date.now() + 1,
          text: formatBotMessage(data.choices[0].message.content),
          type: 'bot'
        };

        const updatedMessages = [...currentMessages, botResponse];
        setMessages(updatedMessages);

        // Tạo hoặc cập nhật chat trong lịch sử
        const newChat = {
          id: currentChatId,
          title: generateChatTitle(updatedMessages),
          messages: updatedMessages,
          timestamp: new Date().toISOString()
        };

        // Kiểm tra xem chat đã tồn tại chưa
        const chatExists = chatHistory.some(chat => chat.id === currentChatId);
        const updatedHistory = chatExists
          ? chatHistory.map(chat => chat.id === currentChatId ? newChat : chat)
          : [newChat, ...chatHistory];

        setChatHistory(updatedHistory);
        await AsyncStorage.setItem('chat_history', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Chi tiết lỗi:', error);
      Alert.alert('Lỗi', 'Không thể kết nối với server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true, // Bật tính năng chuyển đổi ảnh sang base64
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const base64Image = result.assets[0].base64;
        
        // Hiển thị ảnh trong chat
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          type: 'image', 
          uri, 
          sender: 'user' 
        }]);

        // Gửi ảnh đến API để phân tích
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://your-app-domain.com',
            'X-Title': 'NutritionAI',
          },
          body: JSON.stringify({
            model: "google/gemma-3-4b-it:free",
            messages: [
              {
                role: "system",
                content: "Hãy phân tích thông tin dinh dưỡng từ hình ảnh thực phẩm này."
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Hãy cho tôi biết thông tin dinh dưỡng của món ăn này?"
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`
                    }
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();
        
        // Xử lý phản hồi từ API về phân tích ảnh
        if (data.choices && data.choices[0]?.message?.content) {
          const botResponse = {
            id: Date.now() + 1,
            text: data.choices[0].message.content,
            type: 'bot'
          };
          setMessages(prev => [...prev, botResponse]);
        }
      }
    } catch (error) {
      console.error('Lỗi:', error);
      Alert.alert('Lỗi', 'Không thể xử lý ảnh');
    }
  };

  // Thêm function xóa lịch sử
  const clearHistory = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
          }
        }
      ]
    );
  };

  // Add function to generate chat title
  const generateChatTitle = (messages) => {
    if (messages.length === 0) return 'New chat';
    return messages[0].text.slice(0, 30) + (messages[0].text.length > 30 ? '...' : '');
  };

  // Add chat management functions
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(Date.now());
  };

  const handleSelectChat = (chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowHistory(false);
  };

  const handleDeleteChat = async (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    await AsyncStorage.setItem('chat_history', JSON.stringify(updatedHistory));
    
    if (chatId === currentChatId) {
      handleNewChat();
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả lịch sử trò chuyện?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: async () => {
            setChatHistory([]);
            await AsyncStorage.removeItem('chat_history');
            handleNewChat();
            setShowHistory(false);
          }
        }
      ]
    );
  };

  // Cập nhật renderMessage
  const renderMessage = (msg) => {
    if (!msg) return null;

    if (msg.type === 'image') {
      return <Image source={{ uri: msg.uri }} style={styles.image} />;
    }
    
    const messageText = msg.text || '';
    
    return (
      <Text 
        style={[
          styles.messageText, 
          msg.type === 'bot' && styles.botText
        ]}
        allowFontScaling={false}
      >
        {Platform.select({
          ios: messageText,
          android: messageText.replace(/<b>(.*?)<\/b>/g, '$1')
        })}
      </Text>
    );
  };

  // Giao diện người dùng
  return (
    <View style={styles.container}>
      {/* Header với nút menu và tạo chat mới */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowHistory(true)}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {generateChatTitle(messages)}
        </Text>
        <TouchableOpacity onPress={handleNewChat}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Phần hiển thị tin nhắn */}
      <ScrollView 
        ref={scrollViewRef} 
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={msg.type === 'user' ? styles.userMessage : styles.botMessage}>
            {renderMessage(msg)}
          </View>
        ))}
        {isLoading && <ActivityIndicator size="small" color="#007AFF" />}
      </ScrollView>

      {/* Phần input và các nút chức năng */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleImageUpload} style={styles.iconButton}>
          <Ionicons name="images" size={24} color="#000" />
        </TouchableOpacity>
        <TextInput 
          style={styles.input} 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="Nhập câu hỏi..." 
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.iconButton}>
          <Ionicons name="paper-plane" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={clearHistory} style={styles.iconButton}>
          <Ionicons name="brush" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Modal lịch sử chat */}
      <ChatHistoryModal 
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onClearAll={handleClearAll}
      />
    </View>
  );
};

// Định nghĩa styles
const styles = StyleSheet.create({
  // Styles cho container
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#fff' 
  },
  // Styles cho tin nhắn người dùng
  userMessage: { 
    alignSelf: 'flex-end', 
    padding: 10, 
    backgroundColor: '#dcf8c6', 
    marginVertical: 2, 
    borderRadius: 8,
    maxWidth: '80%' // Giới hạn chiều rộng tin nhắn
  },
  // Styles cho tin nhắn bot
  botMessage: { 
    alignSelf: 'flex-start', 
    padding: 10, 
    backgroundColor: '#f1f0f0', 
    marginVertical: 2,
    marginLeft: 10,
    marginRight: 50,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    maxWidth: '80%'
  },
  // Styles cho input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  // Styles cho input
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  // Styles cho icon button
  iconButton: {
    padding: 8,
  },
  // Styles cho image
  image: { width: 200, height: 200, borderRadius: 8 },
  // Styles cho message text
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'left'
  },
  // Styles cho bot text
  botText: {
    color: '#000000',
    ...Platform.select({
      ios: {
        fontWeight: '400',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  // Styles cho modal container
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  // Styles cho modal header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  // Styles cho modal title
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Styles cho modal actions
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Styles cho clear all button
  clearAllButton: {
    marginRight: 15,
  },
  // Styles cho clear all text
  clearAllText: {
    color: '#000000', // Đổi từ #FF3B30 thành #000000
    fontWeight: '500',
  },
  // Styles cho history list
  historyList: {
    flex: 1,
  },
  // Styles cho history item
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  // Styles cho history item content
  historyItemContent: {
    flex: 1,
  },
  // Styles cho history item title
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  // Styles cho history item preview
  historyItemPreview: {
    fontSize: 14,
    color: '#666',
  },
  // Styles cho delete button
  deleteButton: {
    padding: 5,
  },
  // Styles cho header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  // Styles cho header title
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AI;
