import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleRegister() {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email || !password) return setErrorMsg('Todos los campos son obligatorios');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: 'CLIENT'
        }
      }
    });
    setLoading(false);
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('¡Cuenta creada correctamente! Redirigiendo...');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    }
  }

  return (
    <View style={{ flex: 1, minHeight: height }}>
      <Image 
        source={require('../../assets/images/fondo.jpg')} 
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <View className="flex-1 justify-center items-center px-4 bg-black/60">
        <View className="w-full max-w-md bg-[#111111]/80 backdrop-blur-lg rounded-3xl p-8 py-10 border border-silver-dark/30 shadow-2xl">
          
          <View className="items-center mb-8">
            <Text className="text-4xl font-extrabold text-silver-dark tracking-tighter mb-1">
              H<Text className="text-gold">V</Text>
            </Text>
            
            <Text className="text-silver text-2xl font-bold mt-4 mb-2">
              Crear Cuenta
            </Text>
            <Text className="text-silver-dark text-center text-sm">
              Únete a HV Coaching y empieza tu transformación.
            </Text>
          </View>

          <View className="space-y-6">
            {errorMsg ? (
              <View className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#ef4444" className="mr-2" />
                <Text className="text-red-400 flex-1 ml-2 font-semibold text-sm">{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" className="mr-2" />
                <Text className="text-green-400 flex-1 ml-2 font-semibold text-sm">{successMsg}</Text>
              </View>
            ) : null}

            <View>
              <Text className="text-silver font-bold text-sm mb-2">Correo Electrónico</Text>
              <View className="flex-row items-center bg-black-surface/50 border border-silver-dark/30 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#A9A9A9" />
                <TextInput
                  className="flex-1 text-silver ml-3 outline-none"
                  placeholder="tu@correo.com"
                  placeholderTextColor="#A9A9A9"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />
              </View>
            </View>
            
            <View className="mt-4">
              <Text className="text-silver font-bold text-sm mb-2">Contraseña</Text>
              <View className="flex-row items-center bg-black-surface/50 border border-silver-dark/30 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#A9A9A9" />
                <TextInput
                  className="flex-1 text-silver ml-3 outline-none"
                  placeholder="••••••••"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleRegister}
                  returnKeyType="go"
                />
              </View>
            </View>

            <TouchableOpacity 
              className="w-full bg-gold py-4 rounded-xl flex-row justify-center items-center mt-6 shadow-md shadow-gold/20"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#050505" />
              ) : (
                <>
                  <Text className="text-black font-extrabold text-base uppercase tracking-wider mr-2">
                    Registrarse
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#050505" />
                </>
              )}
            </TouchableOpacity>
            
            <View className="h-[1px] bg-silver-dark/30 my-6" />

            <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="items-center flex-row justify-center">
              <Ionicons name="key-outline" size={16} color="#A9A9A9" className="mr-2" />
              <Text className="text-silver-dark text-sm ml-2">
                ¿Ya tienes cuenta? <Text className="text-gold font-bold underline">Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}
