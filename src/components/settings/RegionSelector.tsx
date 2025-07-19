/**
 * 地区选择器 - 国家地区选择下拉组件
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface Region {
  code: string;
  name: string;
  dialCode: string;
}

interface RegionSelectorProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

const { width } = Dimensions.get('window');

const REGIONS: Region[] = [
  { code: 'CN', name: '中国大陆', dialCode: '+86' },
  { code: 'HK', name: '香港', dialCode: '+852' },
  { code: 'TW', name: '台湾', dialCode: '+886' },
  { code: 'US', name: '美国', dialCode: '+1' },
  { code: 'GB', name: '英国', dialCode: '+44' },
  { code: 'JP', name: '日本', dialCode: '+81' },
  { code: 'KR', name: '韩国', dialCode: '+82' },
  { code: 'SG', name: '新加坡', dialCode: '+65' },
  { code: 'MY', name: '马来西亚', dialCode: '+60' },
  { code: 'TH', name: '泰国', dialCode: '+66' },
];

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionChange,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleRegionSelect = (region: Region) => {
    onRegionChange(region);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.selectorText}>
          {selectedRegion.name} {selectedRegion.dialCode}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择地区</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.regionList}>
              {REGIONS.map((region) => (
                <TouchableOpacity
                  key={region.code}
                  style={[
                    styles.regionItem,
                    selectedRegion.code === region.code && styles.selectedRegion,
                  ]}
                  onPress={() => handleRegionSelect(region)}
                >
                  <Text style={styles.regionName}>{region.name}</Text>
                  <Text style={styles.regionCode}>{region.dialCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 140,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  arrow: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: width - 40,
    maxHeight: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
  regionList: {
    maxHeight: 300,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedRegion: {
    backgroundColor: '#eff6ff',
  },
  regionName: {
    fontSize: 16,
    color: '#374151',
  },
  regionCode: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default RegionSelector;
export type { Region }; 