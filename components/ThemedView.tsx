import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

export function ThemedView(props: ViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
        },
        props.style,
      ]}
    />
  );
} 