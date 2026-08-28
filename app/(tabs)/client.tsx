import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ClientPanel() {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    if (session) fetchRoutines();
  }, [session]);

  const fetchRoutines = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/routines', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRoutines(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-6 pt-10">
      <Text className="text-3xl font-extrabold text-silver tracking-widest uppercase mb-8">
        Mis <Text className="text-gold">Rutinas</Text>
      </Text>
      
      <FlatList
        data={routines}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View className="bg-black-surface p-5 rounded-2xl border border-black-border mb-5 shadow-sm shadow-gold/5">
            <Text className="text-2xl font-bold text-silver mb-1">{item.name}</Text>
            <Text className="text-silver-dark text-xs uppercase tracking-wider mb-6">
              Entrenador: {item.trainer?.full_name || item.trainer_id}
            </Text>
            
            <TouchableOpacity className="w-full bg-gold py-4 rounded-xl items-center shadow-lg shadow-gold/20">
              <Text className="text-black font-extrabold text-base uppercase tracking-wider">Iniciar Entrenamiento</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-silver-dark text-center leading-6">Aún no tienes rutinas asignadas.</Text>
            <Text className="text-gold font-bold mt-2 text-center text-xs uppercase tracking-widest">Pídele a tu entrenador que te asigne una.</Text>
          </View>
        }
      />
    </View>
  );
}
