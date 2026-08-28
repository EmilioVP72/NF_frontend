import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  { value: 'VOLUME', label: 'Volumen' },
  { value: 'DEFINITION', label: 'Definición' },
  { value: 'STRENGTH', label: 'Fuerza' },
  { value: 'RECOMPOSITION', label: 'Recomposición' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
];

export default function ProfileScreen() {
  const { session } = useAuthStore();
  const { profile, loading, updateProfile, uploadAvatar } = useProfileStore();
  const [saving, setSaving] = useState(false);
  
  // Local form state
  const [form, setForm] = useState({
    first_name: '',
    last_name_paternal: '',
    last_name_maternal: '',
    age: '',
    weight_kg: '',
    height_cm: '',
    target_weight_kg: '',
    goal: 'MAINTENANCE',
  });

  const [likedFoodInput, setLikedFoodInput] = useState('');
  const [dislikedFoodInput, setDislikedFoodInput] = useState('');
  const [likedFoods, setLikedFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name_paternal: profile.last_name_paternal || '',
        last_name_maternal: profile.last_name_maternal || '',
        age: profile.age?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        target_weight_kg: profile.target_weight_kg?.toString() || '',
        goal: profile.goal || 'MAINTENANCE',
      });
      setLikedFoods(profile.liked_foods || []);
      setDislikedFoods(profile.disliked_foods || []);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    
    const payload = {
      first_name: form.first_name,
      last_name_paternal: form.last_name_paternal,
      last_name_maternal: form.last_name_maternal,
      age: parseInt(form.age, 10) || null,
      weight_kg: parseFloat(form.weight_kg) || null,
      height_cm: parseFloat(form.height_cm) || null,
      target_weight_kg: parseFloat(form.target_weight_kg) || null,
      goal: form.goal,
      liked_foods: likedFoods,
      disliked_foods: dislikedFoods,
    };

    const success = await updateProfile(session.access_token, payload);
    setSaving(false);

    if (success) {
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } else {
      Alert.alert('Error', 'Error al actualizar el perfil');
    }
  };

  const pickImage = async () => {
    if (!session?.access_token) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const avatarUri = result.assets[0].uri;
      const formData = new FormData();
      const filename = avatarUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('avatar', {
        uri: avatarUri,
        name: filename,
        type,
      } as any);

      const success = await uploadAvatar(session.access_token, formData);
      if (success) {
        Alert.alert('Éxito', 'Avatar actualizado');
      } else {
        Alert.alert('Error', 'No se pudo subir el avatar');
      }
    }
  };

  const addFood = (type: 'liked' | 'disliked') => {
    if (type === 'liked' && likedFoodInput.trim()) {
      if (!likedFoods.includes(likedFoodInput.trim())) setLikedFoods([...likedFoods, likedFoodInput.trim()]);
      setLikedFoodInput('');
    } else if (type === 'disliked' && dislikedFoodInput.trim()) {
      if (!dislikedFoods.includes(dislikedFoodInput.trim())) setDislikedFoods([...dislikedFoods, dislikedFoodInput.trim()]);
      setDislikedFoodInput('');
    }
  };

  const removeFood = (type: 'liked' | 'disliked', index: number) => {
    if (type === 'liked') setLikedFoods(likedFoods.filter((_, i) => i !== index));
    else setDislikedFoods(dislikedFoods.filter((_, i) => i !== index));
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
      
      {/* Header & Avatar */}
      <View className="items-center mb-8 mt-4">
        <TouchableOpacity onPress={pickImage} className="relative mb-4">
          <View className="w-32 h-32 rounded-full bg-black-surface border-2 border-gold/50 overflow-hidden items-center justify-center">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
            ) : (
              <Text className="text-4xl text-gold font-bold">{profile?.first_name?.charAt(0) || 'U'}</Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-gold rounded-full p-2 shadow-lg">
            <Ionicons name="camera" size={16} color="#050505" />
          </View>
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-silver uppercase tracking-wider text-center">
          {profile?.full_name || 'Mi Perfil'}
        </Text>
        <Text className="text-gold text-sm font-bold tracking-widest mt-1">{profile?.role}</Text>
      </View>

      <View className="space-y-6">
        
        {/* Datos Personales */}
        <View className="bg-black-surface p-5 rounded-3xl border border-black-border space-y-4">
          <Text className="text-gold font-bold text-lg mb-2">Datos Personales</Text>
          <View>
            <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Nombre(s)</Text>
            <TextInput
              className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
              value={form.first_name}
              onChangeText={(text) => setForm({...form, first_name: text})}
              placeholderTextColor="#555"
            />
          </View>
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Apellido Paterno</Text>
              <TextInput
                className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                value={form.last_name_paternal}
                onChangeText={(text) => setForm({...form, last_name_paternal: text})}
                placeholderTextColor="#555"
              />
            </View>
            <View className="flex-1">
              <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Apellido Materno</Text>
              <TextInput
                className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                value={form.last_name_maternal}
                onChangeText={(text) => setForm({...form, last_name_maternal: text})}
                placeholderTextColor="#555"
              />
            </View>
          </View>
        </View>

        {/* Datos Físicos */}
        <View className="bg-black-surface p-5 rounded-3xl border border-black-border space-y-4">
          <Text className="text-gold font-bold text-lg mb-2">Físico actual</Text>
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Edad</Text>
              <TextInput
                className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                keyboardType="numeric"
                value={form.age}
                onChangeText={(text) => setForm({...form, age: text})}
                placeholderTextColor="#555"
              />
            </View>
            <View className="flex-1">
              <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Altura (cm)</Text>
              <TextInput
                className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                keyboardType="numeric"
                value={form.height_cm}
                onChangeText={(text) => setForm({...form, height_cm: text})}
                placeholderTextColor="#555"
              />
            </View>
          </View>
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Peso actual</Text>
              <TextInput
                className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                keyboardType="numeric"
                value={form.weight_kg}
                onChangeText={(text) => setForm({...form, weight_kg: text})}
                placeholderTextColor="#555"
              />
            </View>
            <View className="flex-1">
              <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Peso objetivo</Text>
              <TextInput
                className="w-full bg-black text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                keyboardType="numeric"
                value={form.target_weight_kg}
                onChangeText={(text) => setForm({...form, target_weight_kg: text})}
                placeholderTextColor="#555"
              />
            </View>
          </View>
        </View>

        {/* Objetivo */}
        <View className="bg-black-surface p-5 rounded-3xl border border-black-border">
          <Text className="text-gold font-bold text-lg mb-4">Objetivo Principal</Text>
          <View className="flex-row flex-wrap">
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.value}
                onPress={() => setForm({...form, goal: g.value})}
                className={`px-4 py-3 rounded-xl border-2 mb-3 mr-3 ${
                  form.goal === g.value 
                    ? 'bg-gold/10 border-gold' 
                    : 'bg-black border-black-border'
                }`}
              >
                <Text className={`font-bold ${
                  form.goal === g.value ? 'text-gold' : 'text-silver-dark'
                }`}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alimentos Gustan */}
        <View className="bg-black-surface p-5 rounded-3xl border border-black-border">
          <Text className="text-gold font-bold text-lg mb-4">Alimentos que te gustan</Text>
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 bg-black text-silver px-5 py-3 rounded-l-xl border border-black-border focus:border-gold"
              value={likedFoodInput}
              onChangeText={setLikedFoodInput}
              placeholder="Añadir..."
              placeholderTextColor="#555"
              onSubmitEditing={() => addFood('liked')}
            />
            <TouchableOpacity 
              onPress={() => addFood('liked')}
              className="bg-gold h-full px-4 items-center justify-center rounded-r-xl border-y border-r border-gold"
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {likedFoods.map((food, idx) => (
              <View key={idx} className="flex-row items-center bg-green-900/30 border border-green-700/50 rounded-full px-3 py-1.5">
                <Text className="text-green-400 text-sm mr-2">{food}</Text>
                <TouchableOpacity onPress={() => removeFood('liked', idx)}>
                  <Ionicons name="close" size={16} color="#4ade80" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Alimentos NO Gustan */}
        <View className="bg-black-surface p-5 rounded-3xl border border-black-border">
          <Text className="text-gold font-bold text-lg mb-4">Alimentos que NO te gustan</Text>
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 bg-black text-silver px-5 py-3 rounded-l-xl border border-black-border focus:border-red-500"
              value={dislikedFoodInput}
              onChangeText={setDislikedFoodInput}
              placeholder="Añadir..."
              placeholderTextColor="#555"
              onSubmitEditing={() => addFood('disliked')}
            />
            <TouchableOpacity 
              onPress={() => addFood('disliked')}
              className="bg-red-500/80 h-full px-4 items-center justify-center rounded-r-xl border-y border-r border-red-500/80"
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {dislikedFoods.map((food, idx) => (
              <View key={idx} className="flex-row items-center bg-red-900/30 border border-red-700/50 rounded-full px-3 py-1.5">
                <Text className="text-red-400 text-sm mr-2">{food}</Text>
                <TouchableOpacity onPress={() => removeFood('disliked', idx)}>
                  <Ionicons name="close" size={16} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Historial de Progreso Link */}
        <TouchableOpacity 
          className="bg-black-surface p-5 rounded-3xl border border-black-border flex-row items-center justify-between"
          onPress={() => Alert.alert('Próximamente', 'Aquí podrás ver tu progreso en una gráfica detallada.')}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center mr-4 border border-gold/30">
              <Ionicons name="trending-up" size={20} color="#D4AF37" />
            </View>
            <View>
              <Text className="text-gold font-bold text-lg">Historial de Progreso</Text>
              <Text className="text-silver-dark text-xs">Ver evolución de tu físico</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full bg-gold py-4 rounded-2xl items-center mt-4 shadow-lg shadow-gold/20"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#050505" />
          ) : (
            <Text className="text-black font-extrabold text-lg uppercase tracking-wider">Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full bg-transparent py-4 rounded-2xl border border-red-500/50 items-center mt-2 mb-8"
          onPress={async () => {
            useProfileStore.setState({ profile: null });
            await supabase.auth.signOut();
          }}
        >
          <Text className="text-red-500 font-bold text-sm uppercase tracking-wider">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
