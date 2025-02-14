import React, { useEffect } from 'react';
import { initializeRevenueCat } from './config/revenuecat';
// ... diğer importlar ...

export default function App() {
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // ... mevcut kod ...
} 