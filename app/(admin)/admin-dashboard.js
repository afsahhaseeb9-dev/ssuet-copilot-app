import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Text variant="headlineSmall">Admin Dashboard</Text>
      <Text>Welcome, {profile?.full_name}</Text>
      <Button mode="contained" onPress={() => router.push('/(admin)/role-requests')}>
        Review Role Requests
      </Button>
      <Button mode="outlined" onPress={signOut}>Log Out</Button>
    </View>
  );
}