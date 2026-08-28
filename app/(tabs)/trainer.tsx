import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ClientsTab from '../../components/trainer/ClientsTab';
import RoutinesTab from '../../components/trainer/RoutinesTab';
import ExercisesTab from '../../components/trainer/ExercisesTab';
import DietsTab from '../../components/trainer/DietsTab';
import MessagesTab from '../../components/trainer/MessagesTab';

const TABS = [
  { id: 'clients', label: 'Clientes', icon: 'people' },
  { id: 'routines', label: 'Rutinas', icon: 'list' },
  { id: 'exercises', label: 'Ejercicios', icon: 'barbell' },
  { id: 'diets', label: 'Alimentación', icon: 'restaurant' },
  { id: 'messages', label: 'Mensajes', icon: 'chatbubbles' },
];

export default function TrainerPanel() {
  const [activeTab, setActiveTab] = useState('routines');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'clients': return <ClientsTab />;
      case 'routines': return <RoutinesTab />;
      case 'exercises': return <ExercisesTab />;
      case 'diets': return <DietsTab />;
      case 'messages': return <MessagesTab />;
      default: return null;
    }
  };

  return (
    <View className="flex-1 bg-[#050505]">
      {/* Top Navigation */}
      <View className="px-4 pt-8 pb-4 bg-[#111111] border-b border-silver-dark/20">
        <Text className="text-3xl font-extrabold text-silver tracking-widest uppercase mb-4">
          Panel <Text className="text-gold">Entrenador</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-row items-center px-4 py-2 mr-3 rounded-full border ${
                  isActive ? 'bg-gold/20 border-gold' : 'bg-transparent border-silver-dark/30 hover:bg-white/5'
                }`}
              >
                <Ionicons name={tab.icon as any} size={18} color={isActive ? '#D4AF37' : '#A9A9A9'} />
                <Text className={`ml-2 font-bold text-sm ${isActive ? 'text-gold' : 'text-silver'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        {renderTabContent()}
      </View>
    </View>
  );
}
