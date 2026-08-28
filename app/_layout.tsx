import '../global.css';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession, initialized, setInitialized } = useAuthStore();
  const { profile, fetchProfile, loading: profileLoading } = useProfileStore();
  const isRecoveringPassword = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Manejar el evento PASSWORD_RECOVERY de Supabase
      if (event === 'PASSWORD_RECOVERY') {
        isRecoveringPassword.current = true;
      }

      // Resetear la flag cuando el usuario cierre sesión
      if (event === 'SIGNED_OUT') {
        isRecoveringPassword.current = false;
        useProfileStore.setState({ profile: null });
      }

      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setTimeout(() => {
          router.replace('/(auth)/reset-password');
        }, 100);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.access_token) {
      fetchProfile(session.access_token);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!initialized) return;

    // No redirigir si estamos en flujo de recuperación de contraseña
    if (isRecoveringPassword.current) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // No auth, redirigir a login solo si no estamos ya en auth
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Auth ok.
      // Esperar a que el perfil se cargue para decidir si necesita onboarding
      if (profileLoading && !profile) return; // Wait for profile fetch
      
      const isProfileCompleted = profile?.profile_completed;
      
      // Si estamos en auth y auth está ok, decidir a dónde ir
      if (inAuthGroup) {
        if (isProfileCompleted === false) {
          router.replace('/(tabs)/onboarding');
        } else if (isProfileCompleted === true) {
          router.replace('/(tabs)');
        }
      } else if (segments[1] !== 'onboarding' && isProfileCompleted === false) {
        // Forzar redirección al onboarding si navega a otro lado sin completarlo
        router.replace('/(tabs)/onboarding');
      } else if (segments[1] === 'onboarding' && isProfileCompleted === true) {
         // Si está en onboarding pero ya lo completó, ir al dashboard
         router.replace('/(tabs)');
      }
    }
  }, [session, initialized, segments, profile, profileLoading]);

  if (!initialized) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
