import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          }
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            title: 'Maç Takvimi',
          }}
        />
      </Stack>
    </View>
  );
}