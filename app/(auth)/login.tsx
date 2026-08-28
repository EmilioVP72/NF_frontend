import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleLogin() {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email || !password) return setErrorMsg('Por favor llena todos los campos');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('¡Sesión iniciada correctamente! Redirigiendo...');
      setTimeout(() => {
        router.replace('/');
      }, 1000);
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
        <View className="w-full max-w-md bg-[#111111]/80 backdrop-blur-lg rounded-3xl p-8 py-12 border border-silver-dark/30 shadow-2xl">
          
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-silver-dark tracking-tighter mb-1">
              H<Text className="text-gold">V</Text>
            </Text>
            <Text className="text-silver text-xl font-bold tracking-[0.2em] uppercase">
              Coaching
            </Text>
            
            <Text className="text-silver text-2xl font-bold mt-6 mb-2">
              Portal de Clientes
            </Text>
            <Text className="text-silver-dark text-center text-sm">
              Bienvenido, por favor inicia sesión para acceder a tu plataforma.
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
                  onSubmitEditing={handleLogin}
                  returnKeyType="go"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/forgot-password')} 
              className="self-end mt-2"
            >
              <Text className="text-gold text-xs font-semibold">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full bg-gold py-4 rounded-xl flex-row justify-center items-center mt-6 shadow-md shadow-gold/20"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#050505" />
              ) : (
                <>
                  <Text className="text-black font-extrabold text-base uppercase tracking-wider mr-2">
                    Iniciar Sesión
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#050505" />
                </>
              )}
            </TouchableOpacity>
            
            <View className="h-[1px] bg-silver-dark/30 my-6" />

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} className="items-center flex-row justify-center">
              <Ionicons name="key-outline" size={16} color="#A9A9A9" className="mr-2" />
              <Text className="text-silver-dark text-sm ml-2">
                ¿No tienes cuenta? <Text className="text-gold font-bold underline">Regístrate aquí</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}
