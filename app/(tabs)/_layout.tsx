import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
      headerTitleAlign: 'center',
    }}>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Maç Takvimi',
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
          animation: 'slide_from_right',
          statusBarStyle: 'light',
        }}
      />
    </Stack>
  );
}