import { useAuth } from '@/hooks/use-auth';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function TeacherDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Text variant="headlineSmall">Teacher Dashboard</Text>
      <Text>Welcome, {profile?.full_name}</Text>
      <Button mode="outlined" onPress={signOut}>Log Out</Button>
    </View>
  );
}