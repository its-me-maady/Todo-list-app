import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'taskflow_auth';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export async function saveSession(session: AuthSession): Promise<void> {
  try {
    const jsonValue = JSON.stringify(session);
    await AsyncStorage.setItem(AUTH_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save auth session:', e);
  }
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(AUTH_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load auth session:', e);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
}
