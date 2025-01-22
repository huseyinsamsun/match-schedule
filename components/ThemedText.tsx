import { Text, TextProps } from 'react-native';
import { useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'title' | 'body' | 'link';
}

export function ThemedText({ type = 'body', style, ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseStyle = {
    color: isDark ? '#fff' : '#000',
  };

  const typeStyles = {
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    link: {
      fontSize: 16,
      color: isDark ? '#58a6ff' : '#0366d6',
    },
  };

  return (
    <Text
      style={[baseStyle, typeStyles[type], style]}
      {...props}
    />
  );
} 