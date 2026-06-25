import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

interface Props {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await register(email.trim(), password);
      setAuth(data.token, data.user);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-10">
          <Text className="text-4xl mb-2">✅</Text>
          <Text className="text-3xl font-bold text-gray-900">Habit Tracker</Text>
          <Text className="text-gray-500 mt-1">Start your journey today</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-md p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Create Account</Text>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          <Text className="text-sm text-gray-500 mb-1">Email</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mb-4"
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="text-sm text-gray-500 mb-1">Password</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mb-4"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text className="text-sm text-gray-500 mb-1">Confirm Password</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mb-6"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="bg-indigo-600 rounded-xl py-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Create Account</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Login')} className="mt-6 items-center">
          <Text className="text-gray-500">
            Already have an account?{' '}
            <Text className="text-indigo-600 font-semibold">Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
