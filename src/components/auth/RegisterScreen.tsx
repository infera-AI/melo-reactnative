/**
 * 账号注册页面 - 手机号/邮箱注册和验证码发送
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';
import { RegionSelector, Region } from '../settings';
import { AgreementModal } from '../modals';
import VerificationCodeScreen from './VerificationCodeScreen';
import SetPasswordScreen from './SetPasswordScreen';
import { BluetoothPairingScreen } from '../bluetooth';
import authService, { RecipientType } from '../../api/services/authService';
import { httpClient } from '../../api';
import { AUTH_CONSTANTS } from '../../api/config';

interface RegisterScreenProps {
  onClose: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onClose }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>({
    code: 'CN',
    name: '中国大陆',
    dialCode: '+86',
  });
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState<'user' | 'privacy'>('user');
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [showBluetoothPairingScreen, setShowBluetoothPairingScreen] = useState(false);
  // 存储验证码和用户输入信息  
  const [_verificationCode, setVerificationCode] = useState('');
  const [currentIdentifier, setCurrentIdentifier] = useState('');
  const [currentRecipientType, setCurrentRecipientType] = useState<RecipientType>('phone');

  // 验证手机号格式
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 验证邮箱格式
  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  // 检查是否可以发送验证码
  const canSendCode = (): boolean => {
    if (!isAgreed) return false;
    
    if (activeTab === 'phone') {
      return validatePhoneNumber(phoneNumber);
    } else {
      return validateEmail(email);
    }
  };

  // 处理发送验证码
  const handleSendCode = async () => {
    if (!canSendCode()) {
      if (!isAgreed) {
        Alert.alert(t('common.error'), t('register.agreementError'));
        return;
      }
      
      const errorMessage = activeTab === 'phone' 
        ? t('register.phoneError') 
        : t('register.emailError');
      Alert.alert(t('common.error'), errorMessage);
      return;
    }

    setIsSending(true);
    
    try {
      // 获取当前的标识符和类型
      const identifier = activeTab === 'phone' 
        ? phoneNumber.toString()
        : email;
      const recipient_type: RecipientType = activeTab;

      // 调用authService发送验证码
      const response = await authService.sendRegisterCode({
        identifier,
        recipient_type
      });

      if (response.code === 200) {
        // 保存当前的用户信息
        setCurrentIdentifier(identifier);
        setCurrentRecipientType(recipient_type);
        
        Alert.alert(t('common.success'), t('register.sendSuccess'));
        // 跳转到验证码输入页面
        setShowVerificationScreen(true);
      } else {
        Alert.alert(t('common.error'), response.message || t('register.sendFailed'));
      }
      
    } catch (error) {
      console.error('发送验证码失败:', error);
      Alert.alert(t('common.error'), t('register.sendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  // 获取当前联系方式信息
  const getCurrentContactInfo = () => {
    if (activeTab === 'phone') {
      return `${phoneNumber}`;
    } else {
      return email;
    }
  };

  // 处理验证码页面返回
  const handleVerificationBack = () => {
    setShowVerificationScreen(false);
  };

  // 处理验证码验证
  const handleVerificationNext = async (code: string) => {
    try {
      // 保存验证码
      setVerificationCode(code);
      
      // 调用authService验证验证码
      const response = await authService.verifyCode({
        identifier: currentIdentifier,
        verification_code: code,
        auth_purpose: 'register',
        recipient_type: currentRecipientType
      });

      if (response.code === 200) {
        // 从响应中提取action_token并保存到本地
        if (response.data && response.data.action_token) {
          try {
            // 获取当前设备的真实信息
            const { getDeviceInfo } = await import('../../utils/deviceInfo');
            const deviceInfo = getDeviceInfo();
            
            // 调用注册接口
            const registerResult = await authService.registerWithToken({
              auth_type: currentRecipientType,
              identifier: currentIdentifier,
              action_token: response.data.action_token,
              country_code: "86", // 默认使用中国区号，后续可以添加国家选择器
            });
            
            if (registerResult.code === 200) {
              // 调用登录接口并传入当前设备的真实信息
              const loginResult = await authService.loginWithDevice({
                auth_type: currentRecipientType,
                identifier: currentIdentifier,
                password: AUTH_CONSTANTS.DEFAULT_TEMP_PASSWORD, // 默认临时密码
                device_info: deviceInfo
              });
              
              if (loginResult.code === 200 && loginResult.data) {
                // 保存登录返回的token到本地
                await httpClient.setActionToken(loginResult.data.token);
                console.log('注册并登录成功:', loginResult);
                
                // 跳转到密码设置页面
                setShowVerificationScreen(false);
                setShowPasswordScreen(true);
                Alert.alert('验证成功', '注册成功，即将跳转到密码设置页面');
              } else {
                throw new Error('登录失败: ' + (loginResult.message || '未知错误'));
              }
            } else {
              throw new Error('注册失败: ' + (registerResult.message || '未知错误'));
            }
          } catch (registerError: any) {
            console.error('注册或登录失败:', registerError);
            Alert.alert(t('common.error'), registerError.message || '注册失败，请重试');
            return;
          }
        } else {
          console.warn('No action_token found in response data');
          Alert.alert(t('common.error'), '验证码验证失败，未获取到action_token');
          return;
        }
      } else {
        Alert.alert(t('common.error'), response.message || '验证失败');
      }
    } catch (error) {
      console.error('验证码验证失败:', error);
      Alert.alert(t('common.error'), '验证码验证失败，请重试');
    }
  };

  // 处理密码设置页面返回
  const handlePasswordBack = () => {
    setShowPasswordScreen(false);
    setShowVerificationScreen(true);
  };

  // 处理完成设置密码
  const handleRegisterComplete = async (password: string) => {
    try {
      // 调用首次设置密码API
      const response = await authService.modifyPassword({
        old_password:  AUTH_CONSTANTS.DEFAULT_TEMP_PASSWORD,
        new_password: password,
        confirm_password: password
      });

      if (response.code === 200) {
        Alert.alert('密码设置成功', '密码设置完成！即将跳转到设备配对流程', [
          {
            text: '确定',
            onPress: () => {
              // 跳转到蓝牙配对页面
              setShowPasswordScreen(false);
              setShowBluetoothPairingScreen(true);
            }
          }
        ]);
      } else {
        Alert.alert(t('common.error'), response.message || '密码设置失败，请重试');
      }
    } catch (error: any) {
      console.error('密码设置失败:', error);
      Alert.alert(t('common.error'), error.message || '密码设置失败，请重试');
    }
  };

  // 处理蓝牙配对完成
  const handleBluetoothPairingComplete = () => {
    console.log('蓝牙配对完成，进入应用主界面');
    Alert.alert('配对成功', '设备配对完成！', [
      {
        text: '确定',
        onPress: () => {
          onClose(); // 关闭整个注册流程
        }
      }
    ]);
  };

  // 处理重新发送验证码
  const handleResendCode = async () => {
    try {
      // 重新发送验证码
      const response = await authService.sendRegisterCode({
        identifier: currentIdentifier,
        recipient_type: currentRecipientType
      });

      if (response.code === 200) {
        Alert.alert(t('common.success'), '验证码已重新发送');
      } else {
        Alert.alert(t('common.error'), response.message || '重新发送验证码失败');
      }
    } catch (error) {
      console.error('重新发送验证码失败:', error);
      Alert.alert(t('common.error'), '重新发送验证码失败');
    }
  };

  // 处理协议链接点击
  const handleAgreementClick = (type: 'user' | 'privacy') => {
    setAgreementType(type);
    setShowAgreementModal(true);
  };

  // 如果显示蓝牙配对页面，渲染蓝牙配对组件
  if (showBluetoothPairingScreen) {
    return (
      <BluetoothPairingScreen
        onClose={handleBluetoothPairingComplete}
      />
    );
  }

  // 如果显示密码设置页面，渲染密码设置组件
  if (showPasswordScreen) {
    return (
      <SetPasswordScreen
        onBack={handlePasswordBack}
        onComplete={handleRegisterComplete}
      />
    );
  }

  // 如果显示验证码页面，渲染验证码组件
  if (showVerificationScreen) {
    return (
      <VerificationCodeScreen
        contactInfo={getCurrentContactInfo()}
        contactType={activeTab}
        onBack={handleVerificationBack}
        onNext={handleVerificationNext}
        onResendCode={handleResendCode}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('register.title')}</Text>
        <View style={styles.backButton} />
      </View>

      {/* 标签页切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'phone' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('phone')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'phone' && styles.activeTabText,
          ]}>
            {t('register.phoneTab')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'email' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('email')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'email' && styles.activeTabText,
          ]}>
            {t('register.emailTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        {activeTab === 'phone' ? (
          <>
            {/* 手机号注册区域 */}
            <View style={styles.phoneInputContainer}>
              <RegionSelector
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
              />
              <TextInput
                style={styles.phoneInput}
                placeholder={t('register.phonePlaceholder')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                maxLength={11}
              />
            </View>
          </>
        ) : (
          <>
            {/* 邮箱注册区域 */}
            <TextInput
              style={styles.emailInput}
              placeholder={t('register.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        {/* 发送验证码按钮 */}
        <TouchableOpacity
          style={[
            styles.sendCodeButton,
            canSendCode() && styles.sendCodeButtonActive,
            isSending && styles.sendCodeButtonSending,
          ]}
          onPress={handleSendCode}
          disabled={!canSendCode() || isSending}
        >
          <Text style={[
            styles.sendCodeButtonText,
            canSendCode() && styles.sendCodeButtonTextActive,
          ]}>
            {isSending ? t('register.sendingCode') : t('register.sendCode')}
          </Text>
        </TouchableOpacity>

        {/* 协议同意勾选框 */}
        <View style={styles.agreementContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setIsAgreed(!isAgreed)}
          >
            <View style={[
              styles.checkboxInner,
              isAgreed && styles.checkboxChecked,
            ]}>
              {isAgreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          
          <View style={styles.agreementTextContainer}>
            <Text style={styles.agreementText}>
              {t('register.agreementPrefix')}
            </Text>
            <TouchableOpacity onPress={() => handleAgreementClick('user')}>
              <Text style={styles.agreementLink}>
                {t('register.userAgreement')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              {t('register.agreementSeparator')}
            </Text>
            <TouchableOpacity onPress={() => handleAgreementClick('privacy')}>
              <Text style={styles.agreementLink}>
                {t('register.privacyPolicy')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 协议弹窗 */}
      <AgreementModal
        visible={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        type={agreementType}
      />
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
    flex: 1,
    textAlign: 'center',
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
    marginBottom: 24,
  },
  sendCodeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 30,
  },
  sendCodeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sendCodeButtonSending: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
  },
  sendCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  sendCodeButtonTextActive: {
    color: '#ffffff',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  agreementTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  agreementText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  agreementLink: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
});

export default RegisterScreen; 