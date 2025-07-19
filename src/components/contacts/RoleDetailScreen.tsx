import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';

// 角色数据类型
interface Role {
  id: string;
  name: string;
  avatar?: string;
  tags: string[];
}

// 组件Props接口
interface RoleDetailScreenProps {
  role?: Role;
  onBack?: () => void;
  onEdit?: (roleId: string) => void;
  onVoiceprintManagement?: (roleId: string) => void;
  onKnowledgeManagement?: (roleId: string) => void;
  onHistoryConversations?: (roleId: string) => void;
  onSimulateChat?: (roleId: string) => void;
  onStartChat?: (roleId: string) => void;
  onDeleteRole?: (roleId: string) => void;
}

const RoleDetailScreen: React.FC<RoleDetailScreenProps> = ({
  role,
  onBack,
  onEdit,
  onVoiceprintManagement,
  onKnowledgeManagement,
  onHistoryConversations,
  onSimulateChat,
  onStartChat,
  onDeleteRole,
}) => {
  // 默认角色数据（用于演示）
  const defaultRole: Role = {
    id: '1',
    name: 'Ville',
    tags: ['合作伙伴', '英语'],
  };

  const currentRole = role || defaultRole;

  // 处理返回
  const handleBack = () => {
    console.log('返回通讯录列表页面 T2.1');
    onBack?.();
  };

  // 处理编辑角色
  const handleEdit = () => {
    console.log('进入角色编辑页面');
    onEdit?.(currentRole.id);
  };

  // 处理声纹管理
  const handleVoiceprintManagement = () => {
    console.log('进入声纹管理页面 T2.3.3');
    onVoiceprintManagement?.(currentRole.id);
  };

  // 处理知识管理
  const handleKnowledgeManagement = () => {
    console.log('进入知识管理页面 T2.3.4');
    onKnowledgeManagement?.(currentRole.id);
  };

  // 处理历史会话
  const handleHistoryConversations = () => {
    console.log(`跳转到"${currentRole.name}历史会话"页面 T2.3.1`);
    onHistoryConversations?.(currentRole.id);
  };

  // 处理模拟对话
  const handleSimulateChat = () => {
    console.log(`进入与${currentRole.name}的模拟对话练习 T2.4.1`);
    onSimulateChat?.(currentRole.id);
  };

  // 处理开始对话
  const handleStartChat = () => {
    console.log(`跳转到与${currentRole.name}的实时翻译主界面 T1.1.1`);
    onStartChat?.(currentRole.id);
  };

  // 处理删除角色
  const handleDeleteRole = () => {
    Alert.alert(
      '删除角色',
      `确定要删除角色"${currentRole.name}"吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            console.log(`删除角色: ${currentRole.name}`);
            onDeleteRole?.(currentRole.id);
          }
        }
      ]
    );
  };

  // 渲染配置列表项
  const renderConfigItem = (title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.configItem} onPress={onPress}>
      <Text style={styles.configItemText}>{title}</Text>
      <Text style={styles.configItemArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{currentRole.name}</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 核心信息区 */}
        <View style={styles.roleInfoSection}>
          {/* 头像 */}
          <View style={styles.avatarContainer}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
          
          {/* 角色信息 */}
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>{currentRole.name}</Text>
            
            {/* 标签列表 */}
            {currentRole.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {currentRole.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 详细配置列表 */}
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>配置管理</Text>
          
          <View style={styles.configList}>
            {renderConfigItem('声纹管理', handleVoiceprintManagement)}
            {renderConfigItem('知识管理', handleKnowledgeManagement)}
            {renderConfigItem('历史会话', handleHistoryConversations)}
          </View>
        </View>

        {/* 主要操作按钮 */}
        <View style={styles.actionSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.simulateButton]}
              onPress={handleSimulateChat}
            >
              <Text style={styles.simulateButtonIcon}>👤</Text>
              <Text style={styles.simulateButtonText}>模拟对话</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.chatButton]}
              onPress={handleStartChat}
            >
              <Text style={styles.chatButtonIcon}>💬</Text>
              <Text style={styles.chatButtonText}>对话</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 删除角色按钮 */}
        <View style={styles.deleteSection}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteRole}
          >
            <Text style={styles.deleteButtonText}>删除角色</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // 顶部导航栏样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 20,
  },

  // 主要内容区域
  content: {
    flex: 1,
  },

  // 核心信息区样式
  roleInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cameraIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  roleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  roleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },

  // 配置区域样式
  configSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  configList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  configItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  configItemArrow: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: 'bold',
  },

  // 操作按钮区域样式
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  simulateButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  simulateButtonIcon: {
    fontSize: 20,
  },
  simulateButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#3b82f6',
  },
  chatButtonIcon: {
    fontSize: 20,
  },
  chatButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  // 删除按钮样式
  deleteSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default RoleDetailScreen; 