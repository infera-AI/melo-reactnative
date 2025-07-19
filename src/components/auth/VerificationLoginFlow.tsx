/**
 * 验证码登录流程管理组件 - 整合验证码登录的所有步骤
 */
import React, { useState } from 'react';
import VerificationLoginInputScreen from './VerificationLoginInputScreen';
import VerificationLoginScreen from './VerificationLoginScreen';

type VerificationLoginStep = 'input' | 'verification';

interface VerificationLoginFlowProps {
  onBack: () => void;
  onLoginSuccess: (userStatus: 'new' | 'existing' | 'first_time', deviceActivated: boolean) => void;
}

const VerificationLoginFlow: React.FC<VerificationLoginFlowProps> = ({
  onBack,
  onLoginSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<VerificationLoginStep>('input');
  const [contactInfo, setContactInfo] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');

  // 处理验证码发送成功
  const handleCodeSent = (identifier: string, type: 'phone' | 'email') => {
    setContactInfo(identifier);
    setContactType(type);
    setCurrentStep('verification');
  };

  // 处理验证码登录成功
  const handleLoginSuccess = (userStatus: 'new' | 'existing' | 'first_time', deviceActivated: boolean) => {
    onLoginSuccess(userStatus, deviceActivated);
  };

  // 处理返回操作
  const handleStepBack = () => {
    switch (currentStep) {
      case 'verification':
        setCurrentStep('input');
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
          <VerificationLoginInputScreen
            onBack={handleStepBack}
            onCodeSent={handleCodeSent}
          />
        );

      case 'verification':
        return (
          <VerificationLoginScreen
            contactInfo={contactInfo}
            contactType={contactType}
            onBack={handleStepBack}
            onLoginSuccess={handleLoginSuccess}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentStep();
};

export default VerificationLoginFlow; 