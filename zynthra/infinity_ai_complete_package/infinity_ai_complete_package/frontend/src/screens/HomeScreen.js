import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, clearChat } from '../store/actions/chatActions';
import { RippleButton } from '../components/RippleButton';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const dispatch = useDispatch();
  const { messages, loading } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  
  const onSpeechStart = () => {
    setIsListening(true);
  };
  
  const onSpeechEnd = () => {
    setIsListening(false);
  };
  
  const onSpeechResults = (e) => {
    const text = e.value[0];
    setInput(text);
    handleSend(text);
  };
  
  const startListening = async () => {
    try {
      await Voice.start(user.preferredLanguage || 'en-US');
    } catch (error) {
      console.error(error);
    }
  };
  
  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSend = (text = input) => {
    if (text.trim()) {
      dispatch(sendMessage(text));
      setInput('');
    }
  };
  
  const renderSuggestions = () => {
    const suggestions = [
      { text: t('weather_forecast'), icon: 'weather-partly-cloudy' },
      { text: t('set_reminder'), icon: 'bell-outline' },
      { text: t('daily_challenge'), icon: 'trophy-outline' },
      { text: t('emergency_contacts'), icon: 'phone-alert' },
    ];
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.suggestionItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleSend(suggestion.text)}
          >
            <Icon name={suggestion.icon} size={16} color={colors.primary} />
            <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <View style={styles.emptyChat}>
          <Image 
            source={require('../assets/images/assistant.png')} 
            style={styles.assistantImage} 
          />
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            {t('welcome_message')}
          </Text>
          {renderSuggestions()}
        </View>
      );
    }
    
    return (
      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <View 
            key={index} 
            style={[
              styles.messageWrapper, 
              message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
            ]}
          >
            {!message.isUser && (
              <Image 
                source={require('../assets/images/assistant.png')} 
                style={styles.messageAvatar} 
              />
            )}
            <View 
              style={[
                styles.messageBubble, 
                message.isUser 
                  ? [styles.userBubble, { backgroundColor: colors.primary }] 
                  : [styles.aiBubble, { backgroundColor: colors.cardBackground }]
              ]}
            >
              <Text 
                style={[
                  styles.messageText, 
                  { color: message.isUser ? '#FFFFFF' : colors.text }
                ]}
              >
                {message.text}
              </Text>
            </View>
            {message.isUser && (
              <Image 
                source={{ uri: user.avatar || 'https://ui-avatars.com/api/?name=' + user.name }} 
                style={styles.messageAvatar} 
              />
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        )}
      </ScrollView>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('ai_assistant')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="cog" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {renderMessages()}
      
      <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
        <TextInput 
          style={[styles.input, { color: colors.text }]}
          placeholder={t('type_message')}
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity 
          style={[styles.voiceButton, isListening && styles.listeningButton]}
          onPressIn={startListening}
          onPressOut={stopListening}
        >
          <Icon 
            name={isListening ? "microphone" : "microphone-outline"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sendButton, !input.trim() && styles.disabledButton]}
          onPress={() => handleSend()}
          disabled={!input.trim()}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    marginRight: 8,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    marginLeft: 8,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  listeningButton: {
    backgroundColor: '#E53935',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0091EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  assistantImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  suggestionsContainer: {
    flexGrow: 0,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    marginLeft: 6,
    fontSize: 14,
  },
});

export default HomeScreen;
