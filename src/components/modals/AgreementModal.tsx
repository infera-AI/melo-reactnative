/**
 * 0.1.1: 用户服务协议 (内嵌WebView) - 以可滚动文本形式展示用户服务协议完整内容
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';

interface AgreementModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'user' | 'privacy';
}

const { width, height } = Dimensions.get('window');

const AgreementModal: React.FC<AgreementModalProps> = ({
  visible,
  onClose,
  type,
}) => {
  const { t } = useI18n();

  const getTitle = () => {
    return type === 'user' ? t('register.userAgreement') : t('register.privacyPolicy');
  };

  const getContent = () => {
    if (type === 'user') {
      return {
        preamble: "本协议是您与Lingo AI耳机应用之间关于使用本应用服务的法律协议。请您仔细阅读本协议的全部内容，特别是免责条款和对用户权利的限制条款。当您点击同意、注册或以其他方式使用本应用时，即表示您已充分理解并同意遵守本协议的所有条款。",
        sections: [
          {
            title: "第一条 服务条款",
            content: "1.1 本应用为用户提供AI智能翻译、语音克隆、智能沟通等相关服务。\n1.2 本应用有权根据业务发展需要，对服务内容进行调整、升级或暂停。\n1.3 用户使用本应用服务应遵守相关法律法规及本协议的约定。"
          },
          {
            title: "第二条 用户注册与账户管理",
            content: "2.1 用户需提供真实、准确、完整的个人信息进行注册。\n2.2 用户有义务保护账户信息的安全，对账户下的所有活动承担责任。\n2.3 每个用户只能注册一个账户，禁止恶意注册多个账户。\n2.4 如发现虚假信息或违规行为，本应用有权暂停或注销用户账户。"
          },
          {
            title: "第三条 服务使用规范",
            content: "3.1 用户不得利用本应用从事任何违法违规活动。\n3.2 禁止发布、传播有害、虚假、误导性或侵犯他人权益的内容。\n3.3 不得干扰或破坏本应用的正常运行，包括但不限于恶意攻击、传播病毒等。\n3.4 不得逆向工程、反编译或以其他方式获取本应用的源代码。"
          },
          {
            title: "第四条 知识产权保护",
            content: "4.1 本应用的所有内容，包括但不限于文字、图片、音频、视频、软件代码等，均受知识产权法律保护。\n4.2 未经本应用书面许可，用户不得复制、修改、传播、销售或以其他方式使用上述内容。\n4.3 用户生成的内容，用户保留所有权，但需授权本应用为提供服务而使用。"
          },
          {
            title: "第五条 隐私保护",
            content: "5.1 本应用重视用户隐私保护，具体请参见隐私政策。\n5.2 本应用将采取合理的技术和管理措施保护用户个人信息安全。\n5.3 除法律法规要求或用户同意外，本应用不会向第三方泄露用户个人信息。"
          },
          {
            title: "第六条 免责声明",
            content: "6.1 本应用按现状提供服务，不对服务的准确性、可靠性、完整性作任何明示或暗示的保证。\n6.2 因不可抗力、网络故障、系统维护等原因导致的服务中断，本应用不承担责任。\n6.3 用户因使用本应用而产生的任何直接或间接损失，本应用的责任以用户实际支付的费用为限。"
          },
          {
            title: "第七条 协议变更与终止",
            content: "7.1 本应用有权根据需要修改本协议，修改后的协议将在应用内公布并生效。\n7.2 如用户不同意修改后的协议，可选择停止使用本应用。\n7.3 本应用有权在必要时终止对违规用户的服务提供。"
          },
          {
            title: "第八条 争议解决",
            content: "8.1 本协议的签订、履行、解释及争议解决均适用中华人民共和国法律。\n8.2 因本协议产生的争议，双方应首先通过友好协商解决。\n8.3 协商不成的，任何一方均可向本应用所在地人民法院提起诉讼。"
          }
        ],
        footer: "本协议自用户同意之日起生效。\n\n生效日期：2024年1月1日\n最后更新：2024年1月1日\n\n如有任何疑问，请联系我们的客服团队：\n邮箱：support@lingo.com\n电话：400-123-4567"
      };
    } else {
      return {
        preamble: "Lingo AI耳机应用非常重视用户的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。请您仔细阅读本政策，以了解我们的隐私处理方式。",
        sections: [
          {
            title: "第一条 信息收集",
            content: "1.1 我们收集您主动提供的信息，包括注册信息、个人资料、使用偏好等。\n1.2 我们自动收集设备信息、IP地址、操作系统、应用使用情况等技术数据。\n1.3 我们可能通过合作伙伴或第三方服务收集相关分析数据，以改进服务质量。"
          },
          {
            title: "第二条 信息使用",
            content: "2.1 为您提供、维护和改进我们的服务。\n2.2 与您进行沟通，包括客户支持、服务通知等。\n2.3 进行数据分析，优化产品功能和用户体验。\n2.4 遵守适用的法律法规要求。\n2.5 保护本应用和用户的合法权益。"
          },
          {
            title: "第三条 信息共享",
            content: "3.1 我们不会向第三方出售、租借或以其他方式泄露您的个人信息。\n3.2 在获得您明确同意的情况下，我们可能与合作伙伴共享必要信息。\n3.3 在法律要求或为保护合法权益的情况下，我们可能需要披露相关信息。\n3.4 我们可能与服务提供商共享去标识化的技术数据，以改进服务。"
          },
          {
            title: "第四条 信息安全",
            content: "4.1 我们采用业界标准的安全技术和管理措施保护您的个人信息。\n4.2 定期进行安全评估，及时更新和完善安全防护策略。\n4.3 严格限制员工对个人信息的访问权限，确保信息安全。\n4.4 在发生数据泄露事件时，我们将及时通知您并采取补救措施。"
          },
          {
            title: "第五条 您的权利",
            content: "5.1 您有权访问、查询您的个人信息。\n5.2 您有权要求更正不准确或不完整的个人信息。\n5.3 您有权要求删除您的个人信息，法律法规另有规定的除外。\n5.4 您有权拒绝接收营销信息。\n5.5 您有权要求获取您个人信息的副本。"
          },
          {
            title: "第六条 儿童隐私",
            content: "6.1 我们不会故意收集13岁以下儿童的个人信息。\n6.2 如发现无意中收集了儿童信息，我们将立即删除相关数据。\n6.3 如果您是儿童的监护人，发现儿童向我们提供了个人信息，请及时联系我们。"
          }
        ],
        footer: "本隐私政策自发布之日起生效。\n\n生效日期：2024年1月1日\n最后更新：2024年1月1日\n\n如对本隐私政策有任何疑问，请联系我们：\n隐私保护邮箱：privacy@lingo.com\n客服电话：400-123-4567"
      };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{getTitle()}</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            {(() => {
              const content = getContent();
              return (
                <View>
                  <Text style={styles.preamble}>{content.preamble}</Text>
                  {content.sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                  ))}
                  <Text style={styles.footer}>{content.footer}</Text>
                </View>
              );
            })()}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onClose}
            >
              <Text style={styles.confirmButtonText}>
                {t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    minHeight: height * 0.5,
    maxHeight: height * 0.9,
    width: width - 40,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
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
  backButtonText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  preamble: {
    fontSize: 14,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 24,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    paddingLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    fontSize: 12,
    lineHeight: 20,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AgreementModal; 