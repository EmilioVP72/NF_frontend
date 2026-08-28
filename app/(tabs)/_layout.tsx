import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Slot as ExpoSlot, useRouter as useExpoRouter, usePathname as useExpoPathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout() {
  const { role } = useAuthStore();
  const router = useExpoRouter();
  const pathname = useExpoPathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const isOnboarding = pathname === '/onboarding';

  const adminMenu = [
    { name: 'Dashboard', path: '/admin', icon: 'stats-chart' },
    { name: 'Usuarios', path: '/users', icon: 'people' },
    { name: 'Perfil', path: '/profile', icon: 'person' },
  ];

  const trainerMenu = [
    { name: 'Entrenador', path: '/trainer', icon: 'barbell' },
    { name: 'Perfil', path: '/profile', icon: 'person' },
  ];

  const clientMenu = [
    { name: 'Mis Rutinas', path: '/client', icon: 'list' },
    { name: 'Mi Dieta', path: '/client-diets', icon: 'restaurant' },
    { name: 'Perfil', path: '/profile', icon: 'person' },
  ];

  const menu = role === 'ADMIN' ? adminMenu : role === 'TRAINER' ? trainerMenu : clientMenu;

  if (isOnboarding) {
    return (
      <View className="flex-1 bg-black">
        <ExpoSlot />
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row bg-[#050505]">
      {/* Sidebar (Oculto en móviles muy pequeños, aunque idealmente se haría un drawer) */}
      {!isMobile && (
        <View className="w-20 md:w-64 bg-[#111111] border-r border-silver-dark/20 h-full py-6 flex flex-col justify-between items-center md:items-stretch">
          <View>
            <View className="mb-10 px-0 md:px-6 items-center md:items-start flex-row">
              <View className="w-10 h-10 bg-gold rounded-xl items-center justify-center mr-0 md:mr-3 shadow-lg shadow-gold/20">
                <Text className="text-[#050505] font-black text-xl">HV</Text>
              </View>
              <Text className="text-white font-black text-2xl hidden md:flex tracking-widest">COACHING</Text>
            </View>

            <View className="px-2 md:px-4 gap-2">
              {menu.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <TouchableOpacity
                    key={item.path}
                    onPress={() => router.push(item.path as any)}
                    className={`flex-row items-center justify-center md:justify-start px-0 md:px-4 py-4 rounded-xl transition-all ${
                      isActive ? 'bg-gold/10' : 'bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={isActive ? '#D4AF37' : '#A9A9A9'} 
                      className={isActive ? 'opacity-100' : 'opacity-70'}
                    />
                    <Text className={`hidden md:flex ml-4 font-bold ${
                      isActive ? 'text-gold' : 'text-silver'
                    }`}>
                      {item.name}
                    </Text>
                    {isActive && (
                      <View className="absolute left-0 w-1 h-8 bg-gold rounded-r-full hidden md:flex" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="px-2 md:px-4">
            <TouchableOpacity
              onPress={() => {
                useAuthStore.getState().setSession(null);
                router.replace('/(auth)/login');
              }}
              className="flex-row items-center justify-center md:justify-start px-0 md:px-4 py-4 rounded-xl bg-transparent hover:bg-white/5"
            >
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text className="hidden md:flex ml-4 font-bold text-red-500">Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contenido Principal */}
      <View className="flex-1 overflow-hidden">
        <ExpoSlot />
        
        {/* TabBar Inferior solo para móviles */}
        {isMobile && (
          <View className="flex-row justify-around items-center bg-[#111111] py-4 border-t border-silver-dark/20 pb-8">
            {menu.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => router.push(item.path as any)}
                  className="items-center justify-center"
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={isActive ? '#D4AF37' : '#A9A9A9'} 
                  />
                  <Text className={`text-xs mt-1 ${isActive ? 'text-gold' : 'text-silver-dark'}`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
