/**
 * 账号登录页面 - 引导用户通过手机号或邮箱及密码登录Lingo账号
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
import UserStore from '../../stores/UserStore';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (userStatus: 'new' | 'existing' | 'first_time', deviceActivated: boolean) => void;
  onForgotPassword: () => void;
  onVerificationLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onLoginSuccess,
  onForgotPassword,
  onVerificationLogin,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>({
    code: 'CN',
    name: '中国',
    dialCode: '+86',
  });

  // 创建UserStore实例
  const userStore = new UserStore();

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

  // 检查是否可以登录
  const canLogin = (): boolean => {
    if (!password) return false;
    
    if (activeTab === 'phone') {
      return validatePhoneNumber(phoneNumber);
    } else {
      return validateEmail(email);
    }
  };

  // 处理登录
  const handleLogin = async () => {
    if (!canLogin()) {
      const errorMessage = activeTab === 'phone' 
        ? (t('login.invalidPhone') || '请输入正确的手机号和密码')
        : (t('login.invalidEmail') || '请输入正确的邮箱和密码');
      Alert.alert(t('login.loginFailed') || '登录失败', errorMessage);
      return;
    }

    setIsLoading(true);
    
    try {
      // 准备登录参数
      const identifier = activeTab === 'phone' 
        ? `${phoneNumber}`
        : email;

      // 使用UserStore的登录方法，自动处理持久化
      await userStore.login(identifier, password);
      
      // 登录成功
      Alert.alert(t('login.loginSuccess') || '登录成功', '欢迎回来！', [
        {
          text: t('common.confirm') || '确定',
          onPress: () => {
            // 模拟判断用户状态（实际项目中应该从服务器获取）
            const userStatus: 'new' | 'existing' | 'first_time' = 'existing';
            const deviceActivated = true; // 实际项目中应该从服务器获取
            onLoginSuccess(userStatus, deviceActivated);
          }
        }
      ]);
      
    } catch (error: any) {
      console.error('登录失败:', error);
      Alert.alert(t('login.loginFailed') || '登录失败', error.message || (t('login.networkError') || '网络连接失败，请重试'));
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
        <Text style={styles.title}>{t('login.title') || '登录Lingo账号'}</Text>
        <View style={styles.placeholder} />
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
        {/* 账号输入区域 */}
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

        {/* 密码输入区域 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('login.password') || '密码'}</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('login.passwordPlaceholder') || '请输入登录密码'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? '👁' : '👁‍🗨'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            canLogin() ? styles.loginButtonActive : styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!canLogin() || isLoading}
        >
          <Text style={[
            styles.loginButtonText,
            canLogin() ? styles.loginButtonTextActive : styles.loginButtonTextDisabled,
          ]}>
            {isLoading ? (t('login.loggingIn') || '登录中...') : (t('login.loginButton') || '登录')}
          </Text>
        </TouchableOpacity>

        {/* 辅助操作链接区域 */}
        <View style={styles.auxiliaryContainer}>
          <TouchableOpacity onPress={onForgotPassword} style={styles.linkButton}>
            <Text style={styles.linkText}>{t('login.forgotPassword') || '忘记密码？'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onVerificationLogin} style={styles.linkButton}>
            <Text style={styles.linkText}>{t('login.verificationLogin') || '验证码登录'}</Text>
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
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
    paddingTop: 30,
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
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginButtonActive: {
    backgroundColor: '#3b82f6',
  },
  loginButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonTextActive: {
    color: '#ffffff',
  },
  loginButtonTextDisabled: {
    color: '#9ca3af',
  },
  auxiliaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 