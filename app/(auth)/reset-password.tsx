import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const { height } = useWindowDimensions();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      return Alert.alert('Error', 'Por favor llena todos los campos.');
    }

    if (password.length < 8) {
      return Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return Alert.alert('Error', 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden.');
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        Alert.alert('Error', error.message || 'No se pudo actualizar la contraseña.');
      } else {
        setSuccess(true);
      }
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
              {success ? '¡Contraseña Actualizada!' : 'Nueva Contraseña'}
            </Text>
            <Text className="text-silver-dark text-center text-sm px-2">
              {success
                ? 'Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
                : 'Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'}
            </Text>
          </View>

          {success ? (
            <View className="space-y-6">
              {/* Icono de éxito */}
              <View className="items-center mb-4">
                <View className="bg-gold/20 rounded-full p-4">
                  <Ionicons name="checkmark-circle-outline" size={48} color="#C9A84C" />
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-gold py-4 rounded-xl flex-row justify-center items-center mt-4 shadow-md shadow-gold/20"
                onPress={async () => {
                  await supabase.auth.signOut();
                  router.replace('/(auth)/login');
                }}
              >
                <Text className="text-black font-extrabold text-base uppercase tracking-wider mr-2">
                  Iniciar Sesión
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#050505" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-6">
              <View>
                <Text className="text-silver font-bold text-sm mb-2">Nueva Contraseña</Text>
                <View className="flex-row items-center bg-black-surface/50 border border-silver-dark/30 rounded-xl px-4 py-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#A9A9A9" />
                  <TextInput
                    className="flex-1 text-silver ml-3 outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="#A9A9A9"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#A9A9A9" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-4">
                <Text className="text-silver font-bold text-sm mb-2">Confirmar Contraseña</Text>
                <View className="flex-row items-center bg-black-surface/50 border border-silver-dark/30 rounded-xl px-4 py-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#A9A9A9" />
                  <TextInput
                    className="flex-1 text-silver ml-3 outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="#A9A9A9"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onSubmitEditing={handleResetPassword}
                    returnKeyType="go"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#A9A9A9" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password strength indicators */}
              <View className="mt-2 space-y-1">
                <View className="flex-row items-center">
                  <Ionicons 
                    name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={14} 
                    color={password.length >= 8 ? '#C9A84C' : '#A9A9A9'} 
                  />
                  <Text className={`ml-2 text-xs ${password.length >= 8 ? 'text-gold' : 'text-silver-dark'}`}>
                    Mínimo 8 caracteres
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={14} 
                    color={/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? '#C9A84C' : '#A9A9A9'} 
                  />
                  <Text className={`ml-2 text-xs ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'text-gold' : 'text-silver-dark'}`}>
                    Mayúsculas y minúsculas
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={/\d/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={14} 
                    color={/\d/.test(password) ? '#C9A84C' : '#A9A9A9'} 
                  />
                  <Text className={`ml-2 text-xs ${/\d/.test(password) ? 'text-gold' : 'text-silver-dark'}`}>
                    Al menos un número
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-gold py-4 rounded-xl flex-row justify-center items-center mt-6 shadow-md shadow-gold/20"
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#050505" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#050505" />
                    <Text className="text-black font-extrabold text-base uppercase tracking-wider ml-2">
                      Actualizar Contraseña
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
