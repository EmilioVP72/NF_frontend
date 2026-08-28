import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function UsersPanel() {
  const { session } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de nuevo usuario
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'TRAINER' | 'CLIENT'>('CLIENT');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    if (!newEmail || !newPassword || !newFullName) {
      return Alert.alert('Error', 'Llena todos los campos');
    }
    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newFullName,
          role: newRole
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al crear');
      
      Alert.alert('Éxito', 'Usuario creado correctamente');
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      fetchUsers();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(id: string) {
    Alert.alert('Confirmar', '¿Estás seguro de eliminar este usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/admin/users/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            if (!response.ok) throw new Error('Error al eliminar');
            fetchUsers();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#050505]">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#050505] p-8">
      
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Usuarios y Roles</Text>
        <Text className="text-silver-dark">Gestiona los accesos y miembros de tu plataforma</Text>
      </View>

      <View className="flex-row flex-wrap mb-8 gap-y-4">
        <View className="flex-1 min-w-[300px] bg-[#111111] p-6 rounded-2xl border border-silver-dark/20 shadow-lg mr-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-xl">Crear Nuevo Usuario</Text>
            <Ionicons name="person-add" size={20} color="#D4AF37" />
          </View>
          
          <View className="flex-row gap-4 mb-4">
            <TextInput 
              className="flex-1 bg-black text-white p-4 rounded-xl border border-silver-dark/20"
              placeholder="Nombre completo"
              placeholderTextColor="#A9A9A9"
              value={newFullName}
              onChangeText={setNewFullName}
            />
            <TextInput 
              className="flex-1 bg-black text-white p-4 rounded-xl border border-silver-dark/20"
              placeholder="Correo electrónico"
              placeholderTextColor="#A9A9A9"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newEmail}
              onChangeText={setNewEmail}
            />
          </View>
          
          <View className="flex-row gap-4 mb-6">
            <TextInput 
              className="flex-[2] bg-black text-white p-4 rounded-xl border border-silver-dark/20"
              placeholder="Contraseña temporal"
              placeholderTextColor="#A9A9A9"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            
            <View className="flex-1 flex-row bg-black rounded-xl border border-silver-dark/20 overflow-hidden">
              <TouchableOpacity 
                className={`flex-1 justify-center items-center ${newRole === 'CLIENT' ? 'bg-gold' : 'bg-transparent'}`}
                onPress={() => setNewRole('CLIENT')}
              >
                <Text className={`font-bold ${newRole === 'CLIENT' ? 'text-black' : 'text-silver'}`}>CLIENTE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 justify-center items-center ${newRole === 'TRAINER' ? 'bg-gold' : 'bg-transparent'}`}
                onPress={() => setNewRole('TRAINER')}
              >
                <Text className={`font-bold ${newRole === 'TRAINER' ? 'text-black' : 'text-silver'}`}>ENTRENADOR</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            className="bg-gold p-4 rounded-xl items-center"
            onPress={handleCreateUser}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#050505" />
            ) : (
              <Text className="text-black font-bold text-lg">Guardar Usuario</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-[#111111] p-6 rounded-2xl border border-silver-dark/20 shadow-lg mb-8">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white font-bold text-xl">Directorio de Usuarios</Text>
          <Ionicons name="search" size={20} color="#A9A9A9" />
        </View>

        <View className="flex-row justify-between items-center py-3 border-b border-silver-dark/20 px-4 mb-2">
          <Text className="text-silver-dark font-bold flex-1">Nombre</Text>
          <Text className="text-silver-dark font-bold flex-1 hidden sm:flex">Correo</Text>
          <Text className="text-silver-dark font-bold w-24 text-center">Rol</Text>
          <Text className="text-silver-dark font-bold w-24 text-right">Acción</Text>
        </View>

        {users.map((item, index) => (
          <View key={item.id} className={`flex-row justify-between items-center p-4 rounded-xl ${index % 2 === 0 ? 'bg-black/30' : 'bg-transparent'}`}>
            <View className="flex-1 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-silver-dark/20 items-center justify-center mr-3">
                <Text className="text-gold font-bold">{item.full_name.charAt(0)}</Text>
              </View>
              <Text className="text-white font-bold">{item.full_name}</Text>
            </View>
            <Text className="text-silver flex-1 hidden sm:flex">{item.email}</Text>
            <View className="w-24 items-center">
              <View className={`px-3 py-1 rounded-full ${item.role === 'ADMIN' ? 'bg-red-500/20' : item.role === 'TRAINER' ? 'bg-gold/20' : 'bg-blue-500/20'}`}>
                <Text className={`text-xs font-bold ${item.role === 'ADMIN' ? 'text-red-400' : item.role === 'TRAINER' ? 'text-gold' : 'text-blue-400'}`}>
                  {item.role}
                </Text>
              </View>
            </View>
            <TouchableOpacity className="w-24 items-end" onPress={() => handleDeleteUser(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
