import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const { session, user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [usersRes, routinesRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/admin/users', {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        }),
        fetch('http://localhost:3000/api/v1/admin/routines', {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        })
      ]);

      if (!usersRes.ok || !routinesRes.ok) throw new Error('Error al cargar datos');
      
      const usersData = await usersRes.json();
      const routinesData = await routinesRes.json();
      
      setUsers(usersData);
      setRoutines(routinesData);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#050505]">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  // Cálculos para los Widgets
  const totalUsers = users.length;
  const totalTrainers = users.filter(u => u.role === 'TRAINER').length;
  const totalClients = users.filter(u => u.role === 'CLIENT').length;
  const totalRoutines = routines.length;

  return (
    <ScrollView className="flex-1 bg-[#050505]">
      {/* Header tipo Dashboard */}
      <View className="flex-row justify-between items-center px-8 py-6 border-b border-silver-dark/20 bg-[#0A0A0A]">
        <View className="flex-row items-center">
          <Text className="text-white font-bold text-2xl tracking-widest">DASHBOARD</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="notifications-outline" size={24} color="#A9A9A9" className="mr-6" />
          <View className="items-end mr-3 hidden sm:flex">
            <Text className="text-white font-bold">{user?.user_metadata?.full_name || 'Admin'}</Text>
            <Text className="text-silver-dark text-xs">Administrador General</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-gold items-center justify-center">
            <Ionicons name="person" size={20} color="#050505" />
          </View>
        </View>
      </View>

      <View className="p-8">
        {/* Fila de Widgets (Stats) */}
        <View className="flex-row flex-wrap justify-between mb-8 gap-y-4">
          
          <View className="bg-gold p-6 rounded-2xl flex-1 min-w-[200px] mr-4 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-[#050505] font-bold text-lg">Total Usuarios</Text>
              <Ionicons name="people" size={24} color="#050505" />
            </View>
            <Text className="text-[#050505] font-bold text-4xl">{totalUsers}</Text>
            <Text className="text-[#050505]/70 text-sm mt-2">En toda la plataforma</Text>
          </View>

          <View className="bg-[#111111] p-6 rounded-2xl flex-1 min-w-[200px] mr-4 border border-silver-dark/20 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-silver font-bold text-lg">Entrenadores</Text>
              <Ionicons name="barbell" size={24} color="#D4AF37" />
            </View>
            <Text className="text-white font-bold text-4xl">{totalTrainers}</Text>
            <Text className="text-silver-dark text-sm mt-2">Activos</Text>
          </View>

          <View className="bg-[#111111] p-6 rounded-2xl flex-1 min-w-[200px] mr-4 border border-silver-dark/20 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-silver font-bold text-lg">Clientes</Text>
              <Ionicons name="body" size={24} color="#D4AF37" />
            </View>
            <Text className="text-white font-bold text-4xl">{totalClients}</Text>
            <Text className="text-silver-dark text-sm mt-2">Registrados</Text>
          </View>

          <View className="bg-[#111111] p-6 rounded-2xl flex-1 min-w-[200px] border border-silver-dark/20 shadow-lg">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-silver font-bold text-lg">Rutinas Creadas</Text>
              <Ionicons name="document-text" size={24} color="#D4AF37" />
            </View>
            <Text className="text-white font-bold text-4xl">{totalRoutines}</Text>
            <Text className="text-silver-dark text-sm mt-2">Asignadas globalmente</Text>
          </View>

        </View>

        {/* Fila Principal: Gráficos de Resumen */}
        <View className="flex-row flex-wrap mb-8 gap-y-4">
          
          <View className="flex-[2] min-w-[300px] bg-[#111111] p-6 rounded-2xl border border-silver-dark/20 shadow-lg mr-4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-xl">Actividad de Usuarios (Placeholder)</Text>
              <Ionicons name="stats-chart" size={20} color="#A9A9A9" />
            </View>
            
            <View className="h-64 items-end justify-between flex-row">
                <View className="w-[10%] h-[40%] bg-gold/50 rounded-t-sm" />
                <View className="w-[10%] h-[70%] bg-gold/80 rounded-t-sm" />
                <View className="w-[10%] h-[50%] bg-gold/60 rounded-t-sm" />
                <View className="w-[10%] h-[90%] bg-gold rounded-t-sm" />
                <View className="w-[10%] h-[60%] bg-gold/70 rounded-t-sm" />
                <View className="w-[10%] h-[30%] bg-gold/40 rounded-t-sm" />
                <View className="w-[10%] h-[100%] bg-gold shadow-[0_0_15px_#D4AF37] rounded-t-sm" />
            </View>
          </View>

          <View className="flex-1 min-w-[250px] bg-[#111111] p-6 rounded-2xl border border-silver-dark/20 shadow-lg">
            <Text className="text-white font-bold text-xl mb-6">Distribución de Roles</Text>
            <View className="flex-1 justify-center items-center">
              <View className="w-40 h-40 rounded-full border-[16px] border-gold items-center justify-center mb-6">
                 <View className="w-40 h-40 absolute rounded-full border-[16px] border-[#333] border-t-transparent border-r-transparent transform -rotate-45" />
                 <Text className="text-white text-2xl font-bold">{totalUsers}</Text>
                 <Text className="text-silver text-xs">Total</Text>
              </View>
              <View className="flex-row justify-around w-full mt-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-gold rounded-full mr-2" />
                  <Text className="text-silver text-sm">Entrenadores</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-[#333] rounded-full mr-2" />
                  <Text className="text-silver text-sm">Clientes</Text>
                </View>
              </View>
            </View>
          </View>

        </View>

      </View>
    </ScrollView>
  );
}
