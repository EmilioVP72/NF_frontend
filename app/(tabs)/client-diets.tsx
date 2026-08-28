import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

export default function ClientDietsPanel() {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [diets, setDiets] = useState<any[]>([]);
  const [expandedDietId, setExpandedDietId] = useState<string | null>(null);

  useEffect(() => {
    if (session) fetchDiets();
  }, [session]);

  const fetchDiets = async () => {
    try {
      const response = await fetch(`${API_URL}/diets/client`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setDiets(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedDietId(expandedDietId === id ? null : id);
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
        Mi Plan de <Text className="text-gold">Alimentación</Text>
      </Text>
      
      <FlatList
        data={diets}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expandedDietId === item.id;
          
          return (
            <View className="bg-black-surface p-5 rounded-2xl border border-black-border mb-5 shadow-sm shadow-gold/5">
              <TouchableOpacity onPress={() => toggleExpand(item.id)} className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-silver mb-1">{item.name}</Text>
                  <Text className="text-silver-dark text-xs uppercase tracking-wider mb-2">
                    Entrenador: {item.trainer?.full_name || 'Tu Entrenador'}
                  </Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#D4AF37" />
              </TouchableOpacity>
              
              {item.description && (
                <Text className="text-silver-dark mb-4">{item.description}</Text>
              )}
              
              {isExpanded && (
                <View className="mt-4 border-t border-silver-dark/20 pt-4">
                  <Text className="text-gold font-bold mb-4 uppercase tracking-wider">Platillos del Día:</Text>
                  
                  {item.diet_dishes?.map((dd: any) => (
                    <View key={dd.id} className="bg-[#111111] p-4 rounded-xl mb-4 border border-silver-dark/10">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white font-bold text-lg">{dd.meal_type || 'Comida'}</Text>
                        {dd.dish?.calories ? (
                          <Text className="text-gold text-xs font-bold">{dd.dish.calories} kcal</Text>
                        ) : null}
                      </View>
                      
                      <Text className="text-silver font-bold mb-2">{dd.dish?.name}</Text>
                      
                      {dd.dish?.description && (
                        <Text className="text-silver-dark text-sm mb-3">{dd.dish.description}</Text>
                      )}
                      
                      {dd.dish?.ingredients && (
                        <View className="mb-3">
                          <Text className="text-silver text-xs font-bold mb-1">Ingredientes:</Text>
                          <Text className="text-silver-dark text-sm">{dd.dish.ingredients}</Text>
                        </View>
                      )}
                      
                      <View className="flex-row justify-between mt-2 pt-2 border-t border-silver-dark/10">
                        <Text className="text-silver-dark text-xs">Proteína: <Text className="text-white">{dd.dish?.protein_g || 0}g</Text></Text>
                        <Text className="text-silver-dark text-xs">Carbos: <Text className="text-white">{dd.dish?.carbs_g || 0}g</Text></Text>
                        <Text className="text-silver-dark text-xs">Grasas: <Text className="text-white">{dd.dish?.fats_g || 0}g</Text></Text>
                      </View>
                      
                      {dd.dish?.image_urls && dd.dish.image_urls.length > 0 && (
                        <ScrollView horizontal className="mt-4">
                          {dd.dish.image_urls.map((url: string, idx: number) => (
                            <Image 
                              key={idx} 
                              source={{ uri: url }} 
                              style={{ width: 120, height: 120, borderRadius: 12, marginRight: 12 }} 
                            />
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Ionicons name="restaurant-outline" size={48} color="#718096" className="mb-4" />
            <Text className="text-silver-dark text-center leading-6">Aún no tienes planes de alimentación.</Text>
            <Text className="text-gold font-bold mt-2 text-center text-xs uppercase tracking-widest">Pídele a tu entrenador que te asigne uno.</Text>
          </View>
        }
      />
    </View>
  );
}
