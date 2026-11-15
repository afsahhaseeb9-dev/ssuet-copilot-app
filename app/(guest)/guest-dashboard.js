import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function GuestDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Text variant="headlineSmall">Guest Dashboard</Text>
      <Text>Welcome, {profile?.full_name}</Text>
      <Button mode="contained" onPress={() => router.push('/(guest)/request-role')}>
        Request a Role
      </Button>
      <Button mode="outlined" onPress={signOut}>Log Out</Button>
    </View>
  );
}