import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getAvailablePackages,
  purchasePackage,
  restorePurchases,
  checkSubscriptionStatus,
} from '../config/revenuecat';

const PremiumScreen = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadPackages();
    checkCurrentSubscription();
  }, []);

  const checkCurrentSubscription = async () => {
    const status = await checkSubscriptionStatus();
    setIsPremium(status.isPremium);
  };

  const loadPackages = async () => {
    try {
      setLoading(true);
      const availablePackages = await getAvailablePackages();
      setPackages(availablePackages);
    } catch (error) {
      Alert.alert('Hata', 'Paketler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg) => {
    try {
      setLoading(true);
      const result = await purchasePackage(pkg);
      if (result.success) {
        setIsPremium(true);
        Alert.alert('Başarılı', 'Premium üyeliğiniz aktif edildi!');
        onClose();
      } else {
        Alert.alert('Hata', result.error || 'Satın alma işlemi başarısız oldu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Satın alma işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const result = await restorePurchases();
      if (result.success && result.isPremium) {
        setIsPremium(true);
        Alert.alert('Başarılı', 'Premium üyeliğiniz geri yüklendi!');
        onClose();
      } else {
        Alert.alert('Bilgi', 'Geri yüklenecek satın alma bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Geri yükleme işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderFeature = (icon, text) => (
    <View style={styles.featureRow}>
      <MaterialIcons name={icon} size={24} color="#0066cc" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={24} color="#666" />
      </TouchableOpacity>

      <Text style={styles.title}>Premium Özellikleri Keşfedin</Text>

      <View style={styles.featuresContainer}>
        {renderFeature('notifications-active', 'Sınırsız Maç Hatırlatıcısı')}
        {renderFeature('sports-soccer', 'Canlı Maç İstatistikleri')}
        {renderFeature('remove-circle', 'Reklamsız Deneyim')}
        {renderFeature('update', 'Anlık Skor Güncellemeleri')}
      </View>

      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[styles.packageButton, selectedPackage?.identifier === pkg.identifier && styles.selectedPackage]}
            onPress={() => handlePurchase(pkg)}
          >
            <Text style={styles.packageTitle}>{pkg.product.title}</Text>
            <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreText}>Satın Almaları Geri Yükle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a237e',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
    flex: 1,
  },
  packagesContainer: {
    marginBottom: 20,
  },
  packageButton: {
    backgroundColor: '#f5f6fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  selectedPackage: {
    backgroundColor: '#e8f5e9',
    borderColor: '#81c784',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 16,
    color: '#666',
  },
  restoreButton: {
    padding: 15,
    alignItems: 'center',
  },
  restoreText: {
    color: '#0066cc',
    fontSize: 16,
  },
});

export default PremiumScreen; 