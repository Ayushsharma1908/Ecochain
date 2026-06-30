import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Compass } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Space } from '@/constants/theme';
import { Text, Button, IconBadge } from '@/components/ui';

export default function NotFoundScreen() {
  const theme = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background, padding: Space.xl }}>
        <IconBadge icon={Compass} accent={theme.clay} size={56} />
        <Text variant="h1" style={{ marginTop: Space.lg }}>
          Off the loop
        </Text>
        <Text variant="bodySm" color={theme.textSecondary} center style={{ marginTop: 6, marginBottom: Space.xl, maxWidth: 260 }}>
          This screen doesn&rsquo;t exist. Let&rsquo;s get you back to scanning.
        </Text>
        <Link href="/(tabs)" asChild>
          <Button label="Back to home" />
        </Link>
      </View>
    </>
  );
}
