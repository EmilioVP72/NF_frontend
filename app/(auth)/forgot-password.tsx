import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, useWindowDimensions, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const { height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleForgotPassword() {
    if (!email) return Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
    setLoading(true);

    try {
      // En web, redirigir a la URL actual del navegador. En mobile, usar deep link.
      const redirectTo = Platform.OS === 'web'
        ? `${window.location.origin}/reset-password`
        : 'hvcoaching://reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        // Log silenciosamente, no revelar si el email existe
        console.warn('Reset password error:', error.message);
      }

      // Siempre mostrar éxito para no revelar emails existentes
      setSent(true);
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta más tarde.');
    } finally {
      setLoading(false);
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

            <Text className="text-silver text-2xl font-bold mt-6 mb-2">
              {sent ? 'Correo Enviado' : 'Recuperar Contraseña'}
            </Text>
            <Text className="text-silver-dark text-center text-sm px-2">
              {sent
                ? 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.'
                : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.'}
            </Text>
          </View>

          {sent ? (
            <View className="space-y-6">
              {/* Icono de éxito */}
              <View className="items-center mb-4">
                <View className="bg-gold/20 rounded-full p-4">
                  <Ionicons name="mail-open-outline" size={48} color="#C9A84C" />
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-gold py-4 rounded-xl flex-row justify-center items-center mt-4 shadow-md shadow-gold/20"
                onPress={() => router.push('/(auth)/login')}
              >
                <Ionicons name="arrow-back" size={20} color="#050505" />
                <Text className="text-black font-extrabold text-base uppercase tracking-wider ml-2">
                  Volver al Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="items-center mt-4"
                onPress={() => { setSent(false); setEmail(''); }}
              >
                <Text className="text-silver-dark text-sm">
                  ¿No llegó? <Text className="text-gold font-bold underline">Reenviar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-6">
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
                    onSubmitEditing={handleForgotPassword}
                    returnKeyType="send"
                  />
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-gold py-4 rounded-xl flex-row justify-center items-center mt-6 shadow-md shadow-gold/20"
                onPress={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#050505" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={20} color="#050505" />
                    <Text className="text-black font-extrabold text-base uppercase tracking-wider ml-2">
                      Enviar Enlace
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View className="h-[1px] bg-silver-dark/30 my-6" />

              <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="items-center flex-row justify-center">
                <Ionicons name="arrow-back-outline" size={16} color="#A9A9A9" className="mr-2" />
                <Text className="text-silver-dark text-sm ml-2">
                  Volver a <Text className="text-gold font-bold underline">Iniciar Sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
