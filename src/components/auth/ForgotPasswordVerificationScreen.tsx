/**
 * 忘记密码验证码输入页面 - 引导用户输入收到的验证码以验证身份进行密码重置
 */
import React, { useState, useRef, useEffect } from 'react';
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
import { useI18n } from '../../hooks/useI18n';
import authService from '../../api/services/authService';

interface ForgotPasswordVerificationScreenProps {
  onBack: () => void;
  onVerificationSuccess: (actionToken: string) => void;
  contactInfo: string; // 手机号或邮箱
  contactType: 'phone' | 'email'; // 联系方式类型
}

const ForgotPasswordVerificationScreen: React.FC<ForgotPasswordVerificationScreenProps> = ({
  onBack,
  onVerificationSuccess,
  contactInfo,
  contactType,
}) => {
  const { t } = useI18n();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  // 开始倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 处理验证码输入
  const handleCodeChange = (value: string, index: number) => {
    // 只允许输入数字和字母
    const filteredValue = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    
    if (filteredValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = filteredValue;
      setCode(newCode);

      // 自动跳转到下一个输入框
      if (filteredValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // 处理删除
  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 获取完整验证码
  const getFullCode = () => code.join('');

  // 检查是否可以进行下一步
  const canProceed = () => getFullCode().length === 6;

  // 处理验证码验证
  const handleVerifyCode = async () => {
    if (!canProceed()) return;

    setIsVerifying(true);
    
    try {
      const response = await authService.verifyCode({
        identifier: contactInfo,
        verification_code: getFullCode(),
        auth_purpose: 'forgot_password',
        recipient_type: contactType
      });

      if (response.code === 200 && response.data?.action_token) {
        // 验证成功，传递action_token给父组件
        onVerificationSuccess(response.data.action_token);
      } else {
        Alert.alert(
          t('common.error') || '验证失败', 
          response.message || '验证码错误，请重新输入'
        );
        // 清空验证码输入
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('验证码验证失败:', error);
      Alert.alert(
        t('common.error') || '验证失败', 
        error.message || '网络错误，请重试'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // 处理重新获取验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      await authService.sendForgotPasswordCode({
        identifier: contactInfo,
        recipient_type: contactType
      });
      
      setCountdown(60);
      Alert.alert(t('common.success') || '发送成功', '验证码已重新发送');
    } catch (error: any) {
      console.error('重新发送验证码失败:', error);
      Alert.alert(
        t('common.error') || '发送失败', 
        error.message || '重新发送验证码失败，请重试'
      );
    }
  };

  // 格式化联系方式显示
  const formatContactInfo = () => {
    if (contactType === 'phone') {
      // 隐藏手机号中间部分
      const phone = contactInfo.replace(/^(\+\d{1,3})\s*(\d{3})\d{4}(\d{4})$/, '$1 $2****$3');
      return `手机 ${phone}`;
    } else {
      // 隐藏邮箱部分
      const email = contactInfo.replace(/^(.{1,3}).*(@.*)$/, '$1***$2');
      return `邮箱 ${email}`;
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
        <Text style={styles.title}>密码重置验证码</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 引导提示文字 */}
        <Text style={styles.subtitle}>
          验证码已发送至{formatContactInfo()}
        </Text>

        {/* 验证码输入框区域 */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              maxLength={1}
              keyboardType="default"
              autoCapitalize="characters"
              autoFocus={index === 0}
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        {/* 重新获取验证码链接 */}
        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={countdown > 0}
            style={styles.resendButton}
          >
            <Text style={[
              styles.resendText,
              countdown > 0 ? styles.resendTextDisabled : styles.resendTextActive
            ]}>
              重新获取验证码
              {countdown > 0 && (
                <Text style={styles.countdownText}> {countdown}s</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 底部按钮区域 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            canProceed() && !isVerifying ? styles.nextButtonActive : styles.nextButtonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={!canProceed() || isVerifying}
        >
          <Text style={[
            styles.nextButtonText,
            canProceed() && !isVerifying ? styles.nextButtonTextActive : styles.nextButtonTextDisabled,
          ]}>
            {isVerifying ? '验证中...' : '下一步'}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 4,
  },
  codeInputFilled: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 16,
    textAlign: 'center',
  },
  resendTextActive: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: '#9ca3af',
  },
  countdownText: {
    color: '#9ca3af',
  },
  bottomContainer: {
    padding: 20,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#3b82f6',
  },
  nextButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default ForgotPasswordVerificationScreen; 