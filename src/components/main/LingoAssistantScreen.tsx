/**
 * Lingo助手页面
 * T1.1.8：提供统一的聊天机器人界面，用于与Lingo助手进行多语言AI对话、口语练习或知识问答
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';

// 定义状态类型
type AssistantState = 'listening' | 'speaking' | 'conversation';

// 定义消息类型
interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 组件Props接口
interface LingoAssistantScreenProps {
  onBack: () => void;
}

const LingoAssistantScreen: React.FC<LingoAssistantScreenProps> = ({
  onBack,
}) => {
  const [currentState, setCurrentState] = useState<AssistantState>('listening');
  const [messages, setMessages] = useState<Message[]>([]);
  const [micAnimation] = useState(new Animated.Value(1));
  const [avatarAnimation] = useState(new Animated.Value(1));

  // 麦克风缩放动画
  useEffect(() => {
    if (currentState === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(micAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      micAnimation.setValue(1);
    }
  }, [currentState, micAnimation]);

  // 头像脉冲动画
  useEffect(() => {
    if (currentState === 'listening' || currentState === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(avatarAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      avatarAnimation.setValue(1);
    }
  }, [currentState, avatarAnimation]);

  // 处理麦克风点击
  const handleMicPress = () => {
    if (currentState === 'listening') {
      setCurrentState('speaking');
      // 模拟用户说话后切换到对话状态
      setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: '介绍一些亚述王朝的历史',
          timestamp: new Date(),
        };
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '亚述王朝存在于公元前3000年到公元前600多年，是美索不达米亚的一个古老王国。它最强盛的时候，领土横跨西亚和北非。亚述人军事力量强大，发明了很多先进的武器和战术。他们的建筑也很有特色，宫殿和神庙都很宏伟。不过，亚述王朝后期政治腐败，内部矛盾激化，再加上外部入侵，最后被巴比伦和米底联军给灭了。',
          timestamp: new Date(),
        };
        setMessages([userMessage, assistantMessage]);
        setCurrentState('conversation');
      }, 2000);
    } else if (currentState === 'speaking') {
      // 点击打断说话
      setCurrentState('listening');
    } else {
      // 对话状态下开始新的语音输入
      setCurrentState('listening');
    }
  };

  // 渲染状态文字
  const renderStatusText = () => {
    switch (currentState) {
      case 'listening':
        return '正在听...';
      case 'speaking':
        return '说话或点击打断';
      case 'conversation':
        return '说话或点击打断';
      default:
        return '';
    }
  };

  // 渲染消息气泡
  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.assistantMessageText,
          ]}>
            {message.content}
          </Text>
        </View>
        {!isUser && (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>□</Text>
          </View>
        )}
        {isUser && (
          <View style={styles.userAvatarPlaceholder}>
            <Text style={styles.avatarText}>□</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部字幕按钮 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.subtitleButton}>
          <Text style={styles.subtitleButtonText}>字幕</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.contentArea}>
        {currentState === 'conversation' ? (
          // 对话状态 - 显示聊天记录
          <ScrollView style={styles.conversationArea} showsVerticalScrollIndicator={false}>
            {messages.map(renderMessage)}
          </ScrollView>
        ) : (
          // 聆听/说话状态 - 显示头像
          <View style={styles.avatarArea}>
            <Animated.View
              style={[
                styles.melonAvatar,
                {
                  transform: [{ scale: avatarAnimation }],
                },
              ]}
            >
              <Text style={styles.melonAvatarText}>Melon头像</Text>
            </Animated.View>
          </View>
        )}
      </View>

      {/* 底部状态和控制区域 */}
      <View style={styles.bottomArea}>
        {/* 状态文字 */}
        <View style={styles.statusArea}>
          {currentState === 'speaking' && (
            <View style={styles.speakingIndicator}>
              <Text style={styles.speakingIndicatorText}>■</Text>
            </View>
          )}
          <Text style={styles.statusText}>{renderStatusText()}</Text>
        </View>

        {/* 控制按钮 */}
        <View style={styles.controlButtons}>
          <Animated.View
            style={{
              transform: [{ scale: micAnimation }],
            }}
          >
            <TouchableOpacity
              style={styles.micButton}
              onPress={handleMicPress}
            >
              <Text style={styles.micButtonText}>🎤</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onBack}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  subtitleButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  subtitleButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  melonAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  melonAvatarText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  conversationArea: {
    flex: 1,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  userMessage: {
    backgroundColor: '#ffffff',
    marginLeft: 10,
  },
  assistantMessage: {
    backgroundColor: '#ffffff',
    marginRight: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000',
  },
  assistantMessageText: {
    color: '#000000',
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    color: '#000000',
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statusArea: {
    alignItems: 'center',
    marginBottom: 30,
  },
  speakingIndicator: {
    marginBottom: 10,
  },
  speakingIndicatorText: {
    fontSize: 20,
    color: '#000000',
  },
  statusText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonText: {
    fontSize: 24,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default LingoAssistantScreen; 