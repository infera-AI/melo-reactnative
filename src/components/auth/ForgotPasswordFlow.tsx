/**
 * 忘记密码流程管理组件 - 整合忘记密码的所有步骤
 */
import React, { useState } from 'react';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import ForgotPasswordVerificationScreen from './ForgotPasswordVerificationScreen';
import ForgotPasswordResetScreen from './ForgotPasswordResetScreen';

type ForgotPasswordStep = 'input' | 'verification' | 'reset';

interface ForgotPasswordFlowProps {
  onBack: () => void;
  onComplete: () => void; // 密码重置完成后的回调
}

const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({
  onBack,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('input');
  const [contactInfo, setContactInfo] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [actionToken, setActionToken] = useState('');

  // 处理页面 0.3.2 - 输入手机号/邮箱
  const handleCodeSent = (identifier: string, type: 'phone' | 'email') => {
    setContactInfo(identifier);
    setContactType(type);
    setCurrentStep('verification');
  };

  // 处理页面 0.3.3 - 验证码验证成功
  const handleVerificationSuccess = (token: string) => {
    setActionToken(token);
    setCurrentStep('reset');
  };

  // 处理页面 0.3.4 - 密码重置成功
  const handleResetSuccess = () => {
    onComplete();
  };

  // 处理返回操作
  const handleStepBack = () => {
    switch (currentStep) {
      case 'verification':
        setCurrentStep('input');
        break;
      case 'reset':
        setCurrentStep('verification');
        break;
      case 'input':
      default:
        onBack();
        break;
    }
  };

  // 渲染当前步骤
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'input':
        return (
          <ForgotPasswordScreen
            onBack={handleStepBack}
            onCodeSent={handleCodeSent}
          />
        );

      case 'verification':
        return (
          <ForgotPasswordVerificationScreen
            contactInfo={contactInfo}
            contactType={contactType}
            onBack={handleStepBack}
            onVerificationSuccess={handleVerificationSuccess}
          />
        );

      case 'reset':
        return (
          <ForgotPasswordResetScreen
            actionToken={actionToken}
            contactInfo={contactInfo}
            contactType={contactType}
            onBack={handleStepBack}
            onResetSuccess={handleResetSuccess}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentStep();
};

export default ForgotPasswordFlow; 