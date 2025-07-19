/**
 * 验证码登录输入页面 - 引导用户输入手机号或邮箱以发送登录验证码
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { RegionSelector, Region } from '../settings';
import { useI18n } from '../../hooks/useI18n';
import authService from '../../api/services/authService';

interface VerificationLoginInputScreenProps {
  onBack: () => void;
  onCodeSent: (identifier: string, type: 'phone' | 'email') => void;
}

const VerificationLoginInputScreen: React.FC<VerificationLoginInputScreenProps> = ({
  onBack,
  onCodeSent,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>({
    code: 'CN',
    name: '中国',
    dialCode: '+86',
  });

  // 验证手机号格式
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 检查是否可以发送验证码
  const canSendCode = (): boolean => {
    if (activeTab === 'phone') {
      return validatePhoneNumber(phoneNumber);
    } else {
      return validateEmail(email);
    }
  };

  // 处理发送验证码
  const handleSendCode = async () => {
    if (!canSendCode()) {
      const errorMessage = activeTab === 'phone' 
        ? '请输入正确的手机号码'
        : '请输入正确的邮箱地址';
      Alert.alert('输入错误', errorMessage);
      return;
    }

    setIsLoading(true);
    
    try {
      const identifier = activeTab === 'phone' 
        ? `${phoneNumber}`
        : email;

      // 调用发送登录验证码API
      const response = await authService.sendLoginCode({
        identifier,
        recipient_type: activeTab
      });
      
      if (response.code === 200) {
        // 发送成功，直接跳转到验证码输入页面
        onCodeSent(identifier, activeTab);
      } else {
        Alert.alert('发送失败', response.message || '验证码发送失败，请重试');
      }
      
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      Alert.alert('发送失败', error.message || '网络连接失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>验证码登录</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 引导提示文字 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {activeTab === 'phone' 
            ? '请输入您的手机号码，我们将向其发送登录验证码。'
            : '请输入您的邮箱地址，我们将向其发送登录验证码。'
          }
        </Text>
      </View>

      {/* 标签页切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
          onPress={() => setActiveTab('phone')}
        >
          <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
            {t('login.phoneLogin') || '手机号登录'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'email' && styles.activeTab]}
          onPress={() => setActiveTab('email')}
        >
          <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
            {t('login.emailLogin') || '邮箱登录'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 输入区域 */}
        {activeTab === 'phone' ? (
          <View style={styles.phoneInputContainer}>
            <Text style={styles.inputLabel}>{t('login.phoneNumber') || '手机号'}</Text>
            <View style={styles.phoneInputWrapper}>
              <RegionSelector
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
              />
              <TextInput
                style={styles.phoneInput}
                placeholder={t('login.phoneNumberPlaceholder') || '请输入您的手机号码'}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                maxLength={11}
              />
            </View>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('login.email') || '邮箱'}</Text>
            <TextInput
              style={styles.emailInput}
              placeholder={t('login.emailPlaceholder') || '请输入您的邮箱地址'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* 发送验证码按钮 */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSendCode() ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={handleSendCode}
          disabled={!canSendCode() || isLoading}
        >
          <Text style={[
            styles.sendButtonText,
            canSendCode() ? styles.sendButtonTextActive : styles.sendButtonTextDisabled,
          ]}>
            {isLoading ? '发送中...' : '获取验证码'}
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#374151',
  },
  emailInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#374151',
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  sendButtonActive: {
    backgroundColor: '#3b82f6',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextActive: {
    color: '#ffffff',
  },
  sendButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default VerificationLoginInputScreen; 