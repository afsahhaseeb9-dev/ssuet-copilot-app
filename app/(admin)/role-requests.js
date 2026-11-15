import { supabase } from '@/lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
export default function RoleRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  async function loadRequests() {
    const { data, error } = await supabase
      .from('role_requests')
      .select('*, requester:profiles!role_requests_requester_id_fkey(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.log('Error loading role requests:', error.message);
    } else {
      setRequests(data);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );
async function handleDecision(request, approve) {
  setProcessingId(request.id);

  if (approve) {
    // Change the role first, and check that a row was really updated
    const { data: updatedRows, error: roleError } = await supabase
      .from('profiles')
      .update({ role: request.requested_role })
      .eq('id', request.requester_id)
      .select();

    if (roleError || !updatedRows || updatedRows.length === 0) {
      console.log('Role update failed:', roleError?.message ?? 'no rows updated');
      Alert.alert('Could not update role', 'The request was left pending. Please try again.');
      setProcessingId(null);
      return;
    }
  }

  const { error: updateError } = await supabase
    .from('role_requests')
    .update({
      status: approve ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', request.id);

  if (updateError) {
    console.log('Error updating request:', updateError.message);
  }

  setProcessingId(null);
  loadRequests();
}
  function renderInfo(info) {
    return Object.entries(info)
      .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`)
      .join('  •  ');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Pending Role Requests
      </Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRequests();
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No pending requests right now.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.requester?.full_name}</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                {item.requester?.email}
              </Text>
              <Text style={{ marginTop: 8 }}>
                Requesting: <Text style={{ fontWeight: 'bold' }}>{item.requested_role}</Text>
              </Text>
              <Text style={{ marginTop: 4, opacity: 0.8 }}>
                {renderInfo(item.submitted_info)}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button

                onPress={() => handleDecision(item, false)}
                loading={processingId === item.id}
                disabled={processingId === item.id}
                textColor="#B3261E">
                Reject
              </Button>
              <Button
                mode="contained"
                onPress={() => handleDecision(item, true)}
                loading={processingId === item.id}
                disabled={processingId === item.id}>
                Approve
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      <Button mode="text" onPress={() => router.back()} style={styles.back}>
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { textAlign: 'center', marginTop: 24, marginBottom: 8 },
  card: { marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 40, opacity: 0.6 },
  back: { marginBottom: 16 },
});