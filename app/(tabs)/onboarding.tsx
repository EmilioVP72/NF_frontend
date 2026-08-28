import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

const GOALS = [
  { value: 'VOLUME', label: 'Volumen', icon: 'barbell-outline' },
  { value: 'DEFINITION', label: 'Definición', icon: 'body-outline' },
  { value: 'STRENGTH', label: 'Fuerza', icon: 'fitness-outline' },
  { value: 'RECOMPOSITION', label: 'Recomposición', icon: 'sync-outline' },
  { value: 'MAINTENANCE', label: 'Mantenimiento', icon: 'shield-checkmark-outline' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { completeOnboarding, uploadAvatar } = useProfileStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    first_name: '',
    last_name_paternal: '',
    last_name_maternal: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    goal: 'MAINTENANCE',
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  // Food Preferences State
  const [likedFoodInput, setLikedFoodInput] = useState('');
  const [dislikedFoodInput, setDislikedFoodInput] = useState('');
  const [likedFoods, setLikedFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);

  const handleNext = () => {
    // Basic validation
    if (step === 1) {
      if (!form.first_name || !form.last_name_paternal || !form.age) {
        return Alert.alert('Error', 'Por favor llena los campos obligatorios');
      }
    }
    if (step === 2) {
      if (!form.height_cm || !form.weight_kg) {
        return Alert.alert('Error', 'Por favor ingresa tu peso y estatura');
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const addFood = (type: 'liked' | 'disliked') => {
    if (type === 'liked' && likedFoodInput.trim()) {
      if (!likedFoods.includes(likedFoodInput.trim())) {
        setLikedFoods([...likedFoods, likedFoodInput.trim()]);
      }
      setLikedFoodInput('');
    } else if (type === 'disliked' && dislikedFoodInput.trim()) {
      if (!dislikedFoods.includes(dislikedFoodInput.trim())) {
        setDislikedFoods([...dislikedFoods, dislikedFoodInput.trim()]);
      }
      setDislikedFoodInput('');
    }
  };

  const removeFood = (type: 'liked' | 'disliked', index: number) => {
    if (type === 'liked') {
      setLikedFoods(likedFoods.filter((_, i) => i !== index));
    } else {
      setDislikedFoods(dislikedFoods.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!session?.access_token) return;
    setLoading(true);

    try {
      // 1. Upload avatar if selected
      let uploadedAvatarUrl = null;
      if (avatarUri) {
        const formData = new FormData();
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        } as any);

        const uploadRes = await fetch('http://localhost:3000/api/v1/profiles/me/avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data?.avatar_url) {
          uploadedAvatarUrl = uploadData.data.avatar_url;
        }
      }

      // 2. Complete onboarding
      const payload = {
        first_name: form.first_name,
        last_name_paternal: form.last_name_paternal,
        last_name_maternal: form.last_name_maternal,
        age: parseInt(form.age, 10),
        height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg),
        goal: form.goal,
        liked_foods: likedFoods,
        disliked_foods: dislikedFoods,
        avatar_url: uploadedAvatarUrl,
      };

      const success = await completeOnboarding(session.access_token, payload);
      
      if (success) {
        // Redirection handled by _layout.tsx based on profile_completed flag
        Alert.alert('¡Bienvenido!', 'Tu perfil ha sido configurado.');
      } else {
        Alert.alert('Error', 'No se pudo guardar el perfil.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un problema de red.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => (
    <View className="flex-row items-center mb-8 px-4 justify-center">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
            step >= i ? 'bg-gold border-gold' : 'bg-black border-silver-dark'
          }`}>
            <Text className={`font-bold text-xs ${step >= i ? 'text-black' : 'text-silver-dark'}`}>
              {i}
            </Text>
          </View>
          {i < 4 && (
            <View className={`h-[2px] w-8 md:w-16 mx-1 ${
              step > i ? 'bg-gold' : 'bg-silver-dark'
            }`} />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#050505' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 40, paddingHorizontal: 20 }}>
        
        <View className="items-center mb-6">
          <Text className="text-3xl font-extrabold text-silver tracking-widest uppercase">
            Completa tu <Text className="text-gold">Perfil</Text>
          </Text>
          <Text className="text-silver-dark text-sm mt-2 text-center">
            Necesitamos algunos datos para personalizar tu experiencia.
          </Text>
        </View>

        {renderProgress()}

        <View className="flex-1 max-w-lg w-full self-center">
          
          {/* STEP 1: Personal Data */}
          {step === 1 && (
            <View className="space-y-4 animate-fade-in">
              <Text className="text-gold text-lg font-bold mb-2">Datos Personales</Text>
              
              <View>
                <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Nombre(s) *</Text>
                <TextInput
                  className="w-full bg-black-surface text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                  value={form.first_name}
                  onChangeText={(val) => setForm({...form, first_name: val})}
                  placeholder="Ej. Juan"
                  placeholderTextColor="#555"
                />
              </View>

              <View>
                <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Apellido Paterno *</Text>
                <TextInput
                  className="w-full bg-black-surface text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                  value={form.last_name_paternal}
                  onChangeText={(val) => setForm({...form, last_name_paternal: val})}
                  placeholder="Ej. Pérez"
                  placeholderTextColor="#555"
                />
              </View>

              <View>
                <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Apellido Materno</Text>
                <TextInput
                  className="w-full bg-black-surface text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                  value={form.last_name_maternal}
                  onChangeText={(val) => setForm({...form, last_name_maternal: val})}
                  placeholder="Ej. López"
                  placeholderTextColor="#555"
                />
              </View>

              <View>
                <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Edad *</Text>
                <TextInput
                  className="w-full bg-black-surface text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                  value={form.age}
                  onChangeText={(val) => setForm({...form, age: val})}
                  placeholder="Ej. 25"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* STEP 2: Physical Data */}
          {step === 2 && (
            <View className="space-y-4 animate-fade-in">
              <Text className="text-gold text-lg font-bold mb-2">Datos Físicos</Text>

              <View className="items-center mb-4">
                <TouchableOpacity onPress={pickImage} className="relative">
                  <View className="w-32 h-32 rounded-full bg-black-surface border-2 border-gold/50 overflow-hidden items-center justify-center">
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="camera" size={40} color="#D4AF37" opacity={0.5} />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 bg-gold rounded-full p-2 shadow-lg">
                    <Ionicons name="pencil" size={16} color="#050505" />
                  </View>
                </TouchableOpacity>
                <Text className="text-silver-dark text-xs mt-2">Sube una foto de perfil</Text>
              </View>

              <View>
                <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Estatura (cm) *</Text>
                <TextInput
                  className="w-full bg-black-surface text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                  value={form.height_cm}
                  onChangeText={(val) => setForm({...form, height_cm: val})}
                  placeholder="Ej. 175"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-silver-dark uppercase text-xs tracking-wider mb-2 font-bold">Peso actual (kg) *</Text>
                <TextInput
                  className="w-full bg-black-surface text-silver px-5 py-4 rounded-2xl border border-black-border focus:border-gold"
                  value={form.weight_kg}
                  onChangeText={(val) => setForm({...form, weight_kg: val})}
                  placeholder="Ej. 70.5"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* STEP 3: Goal */}
          {step === 3 && (
            <View className="space-y-4 animate-fade-in">
              <Text className="text-gold text-lg font-bold mb-4">¿Cuál es tu objetivo?</Text>
              
              <View className="gap-3">
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    onPress={() => setForm({...form, goal: g.value})}
                    className={`flex-row items-center p-4 rounded-2xl border-2 transition-all ${
                      form.goal === g.value 
                        ? 'bg-gold/10 border-gold' 
                        : 'bg-black-surface border-black-border'
                    }`}
                  >
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                      form.goal === g.value ? 'bg-gold' : 'bg-black-border'
                    }`}>
                      <Ionicons 
                        name={g.icon as any} 
                        size={20} 
                        color={form.goal === g.value ? '#050505' : '#A9A9A9'} 
                      />
                    </View>
                    <Text className={`font-bold text-base ${
                      form.goal === g.value ? 'text-gold' : 'text-silver'
                    }`}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 4: Food Preferences */}
          {step === 4 && (
            <View className="space-y-6 animate-fade-in">
              <Text className="text-gold text-lg font-bold">Preferencias Alimenticias</Text>
              
              <View>
                <Text className="text-silver uppercase text-xs tracking-wider mb-2 font-bold">Alimentos que te gustan</Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 bg-black-surface text-silver px-5 py-4 rounded-l-2xl border border-black-border focus:border-gold"
                    value={likedFoodInput}
                    onChangeText={setLikedFoodInput}
                    placeholder="Ej. Pollo, Avena..."
                    placeholderTextColor="#555"
                    onSubmitEditing={() => addFood('liked')}
                  />
                  <TouchableOpacity 
                    onPress={() => addFood('liked')}
                    className="bg-gold h-full px-5 items-center justify-center rounded-r-2xl border-y border-r border-gold"
                  >
                    <Ionicons name="add" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {likedFoods.map((food, idx) => (
                    <View key={idx} className="flex-row items-center bg-green-900/40 border border-green-700/50 rounded-full px-3 py-1.5">
                      <Text className="text-green-400 text-sm mr-2">{food}</Text>
                      <TouchableOpacity onPress={() => removeFood('liked', idx)}>
                        <Ionicons name="close-circle" size={16} color="#4ade80" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-silver uppercase text-xs tracking-wider mb-2 font-bold">Alimentos que NO te gustan</Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 bg-black-surface text-silver px-5 py-4 rounded-l-2xl border border-black-border focus:border-red-500"
                    value={dislikedFoodInput}
                    onChangeText={setDislikedFoodInput}
                    placeholder="Ej. Brócoli, Pescado..."
                    placeholderTextColor="#555"
                    onSubmitEditing={() => addFood('disliked')}
                  />
                  <TouchableOpacity 
                    onPress={() => addFood('disliked')}
                    className="bg-red-500/80 h-full px-5 items-center justify-center rounded-r-2xl border-y border-r border-red-500/80"
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {dislikedFoods.map((food, idx) => (
                    <View key={idx} className="flex-row items-center bg-red-900/40 border border-red-700/50 rounded-full px-3 py-1.5">
                      <Text className="text-red-400 text-sm mr-2">{food}</Text>
                      <TouchableOpacity onPress={() => removeFood('disliked', idx)}>
                        <Ionicons name="close-circle" size={16} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-10 max-w-lg w-full self-center gap-4">
          {step > 1 ? (
            <TouchableOpacity 
              className="flex-1 bg-black-surface py-4 rounded-2xl items-center border border-black-border"
              onPress={handleBack}
            >
              <Text className="text-silver font-bold uppercase">Atrás</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-1" />
          )}

          <TouchableOpacity 
            className="flex-1 bg-gold py-4 rounded-2xl items-center shadow-lg shadow-gold/20"
            onPress={step < 4 ? handleNext : handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-extrabold uppercase tracking-wider">
                {step < 4 ? 'Siguiente' : 'Finalizar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
