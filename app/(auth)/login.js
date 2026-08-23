import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg('Invalid email or password.');
      return;
    }

    // Successful login — root layout's redirect logic (built next) will
    // send the user to the correct role-based dashboard automatically.
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        SSUET Copilot
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Log in to continue
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}>
        Log In
      </Button>

      <Link href="/(auth)/signup" style={styles.link}>
        <Text>Don't have an account? Sign up</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: '#B3261E',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
  },
});