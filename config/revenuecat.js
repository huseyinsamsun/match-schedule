import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API anahtarı
const API_KEY = 'appl_UxTNzxnTuDBrzTyHoDfKqLxuIlO';

// Ürün paketleri
export const PACKAGES = {
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
};

// RevenueCat başlatma fonksiyonu
export const initializeRevenueCat = async () => {
  try {
    if (Platform.OS !== 'ios') return;
    
    await Purchases.configure({ apiKey: API_KEY });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('RevenueCat initialization error:', error);
  }
};

// Mevcut aboneliği kontrol et
export const checkSubscriptionStatus = async () => {
  try {
    if (Platform.OS !== 'ios') return { isPremium: false, expirationDate: null };

    const customerInfo = await Purchases.getCustomerInfo();
    return {
      isPremium: customerInfo?.entitlements?.active?.premium ?? false,
      expirationDate: customerInfo?.entitlements?.active?.premium?.expirationDate,
    };
  } catch (error) {
    console.error('Subscription check error:', error);
    return { isPremium: false, expirationDate: null };
  }
};

// Mevcut paketleri getir
export const getAvailablePackages = async () => {
  try {
    if (Platform.OS !== 'ios') return [];

    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch (error) {
    console.error('Get packages error:', error);
    return [];
  }
};

// Satın alma işlemi
export const purchasePackage = async (packageToPurchase) => {
  try {
    if (Platform.OS !== 'ios') return { success: false, error: 'iOS only' };

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return {
      success: true,
      isPremium: customerInfo?.entitlements?.active?.premium ?? false,
    };
  } catch (error) {
    console.error('Purchase error:', error);
    return { success: false, error: error.message };
  }
};

// Restore satın almaları
export const restorePurchases = async () => {
  try {
    if (Platform.OS !== 'ios') return { success: false, error: 'iOS only' };

    const customerInfo = await Purchases.restorePurchases();
    return {
      success: true,
      isPremium: customerInfo?.entitlements?.active?.premium ?? false,
    };
  } catch (error) {
    console.error('Restore purchases error:', error);
    return { success: false, error: error.message };
  }
}; 