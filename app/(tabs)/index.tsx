import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';

export default function IndexRedirect() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfileStore();
  const { role } = useAuthStore(); // Usar el role de AuthStore por si el profile aún no carga

  useEffect(() => {
    // Si aún está cargando o no hay perfil, esperar.
    // Usaremos el auth role como fallback rápido si está disponible
    const userRole = profile?.role || role;

    if (userRole) {
      if (userRole === 'ADMIN') {
        router.replace('/(tabs)/admin');
      } else if (userRole === 'TRAINER') {
        router.replace('/(tabs)/trainer');
      } else {
        router.replace('/(tabs)/client');
      }
    }
  }, [profile, role]);

  return (
    <View className="flex-1 justify-center items-center bg-[#050505]">
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}
