/**
 * 核心价值轮播组件
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80;
const CARD_SPACING = 20;

interface Feature {
  key: string;
  title: string;
  description: string;
  icon: string;
}

const FeatureCarousel: React.FC = () => {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const features: Feature[] = [
    {
      key: 'translation',
      title: t('welcome.features.translation.title'),
      description: t('welcome.features.translation.description'),
      icon: t('welcome.features.translation.icon'),
    },
    {
      key: 'voiceClone',
      title: t('welcome.features.voiceClone.title'),
      description: t('welcome.features.voiceClone.description'),
      icon: t('welcome.features.voiceClone.icon'),
    },
    {
      key: 'companion',
      title: t('welcome.features.companion.title'),
      description: t('welcome.features.companion.description'),
      icon: t('welcome.features.companion.icon'),
    },
  ];

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % features.length;
      setCurrentIndex(nextIndex);
      
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextIndex * (CARD_WIDTH + CARD_SPACING),
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, features.length]);

  // 处理手动滑动
  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  // 渲染单个卡片
  const renderFeatureCard = (feature: Feature, index: number) => {
    return (
      <View key={feature.key} style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{feature.icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{feature.title}</Text>
        <Text style={styles.cardDescription}>{feature.description}</Text>
      </View>
    );
  };

  // 渲染指示器
  const renderIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {features.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
      >
        {features.map((feature, index) => renderFeatureCard(feature, index))}
      </ScrollView>
      
      {renderIndicators()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    marginHorizontal: CARD_SPACING / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f9ff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
});

export default FeatureCarousel; 