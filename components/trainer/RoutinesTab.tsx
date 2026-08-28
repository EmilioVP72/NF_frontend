import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/lib/supabase';
import { API_URL } from '@/config';

export default function RoutinesTab() {
  const [routines, setRoutines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  
  // Data
  const [availableExercises, setAvailableExercises] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  
  // Selections
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  useEffect(() => {
    fetchRoutines();
    fetchExercises();
    fetchClients();
  }, []);

  const fetchRoutines = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/routines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setRoutines(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExercises = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAvailableExercises(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/profiles/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAvailableClients(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleExerciseSelection = (exercise: any) => {
    const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, { 
        ...exercise, 
        sets: exercise.default_sets || 4, 
        reps: exercise.default_reps || 12,
        rest_seconds: 60,
        order: selectedExercises.length 
      }]);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const updateExerciseConfig = (id: string, field: string, value: string) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === id) {
        return { ...ex, [field]: parseInt(value) || 0 };
      }
      return ex;
    }));
  };

  const saveRoutine = async () => {
    if (!name) return alert('Por favor, ingresa el nombre de la rutina');
    if (selectedExercises.length === 0) return alert('Debes seleccionar al menos un ejercicio');

    setLoading(true);
    try {
      const token = await getToken();
      
      const payload = {
        name,
        notes,
        client_ids: selectedClients,
        exercises: selectedExercises.map((ex, index) => ({
          exercise_id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          order: index
        }))
      };

      const response = await fetch(`${API_URL}/routines`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        alert('Rutina creada y asignada');
        setModalVisible(false);
        resetForm();
        fetchRoutines();
      } else {
        alert('Error al crear la rutina');
      }
    } catch (error) {
      console.error(error);
      alert('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setNotes('');
    setMuscleGroupFilter('');
    setSelectedExercises([]);
    setSelectedClients([]);
  };

  const filteredExercises = muscleGroupFilter 
    ? availableExercises.filter((e: any) => e.muscle_group.toLowerCase().includes(muscleGroupFilter.toLowerCase()))
    : availableExercises;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rutinas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Asignada a {item.assignments?.length || 0} clientes</Text>
              {item.notes && <Text style={styles.cardDescription}>{item.notes}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay rutinas creadas.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Rutina</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formScroll}>
            <Text style={styles.label}>Nombre de la Rutina *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Rutina Fuerza Torso" />
            
            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Recomendaciones generales..." multiline />
            
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>1. Selección de Ejercicios</Text>
            <TextInput 
              style={styles.input} 
              value={muscleGroupFilter} 
              onChangeText={setMuscleGroupFilter} 
              placeholder="Filtrar por grupo muscular (Ej. Pecho, Espalda)" 
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exercisesHScroll}>
              {filteredExercises.map((ex: any) => {
                const isSelected = selectedExercises.some(e => e.id === ex.id);
                return (
                  <TouchableOpacity 
                    key={ex.id} 
                    style={[styles.exercisePill, isSelected && styles.exercisePillActive]}
                    onPress={() => toggleExerciseSelection(ex)}
                  >
                    <Text style={[styles.exercisePillText, isSelected && styles.exercisePillTextActive]}>{ex.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedExercises.length > 0 && (
              <View style={styles.selectedExercisesContainer}>
                <Text style={styles.label}>Ejercicios Seleccionados ({selectedExercises.length})</Text>
                {selectedExercises.map((ex, index) => (
                  <View key={ex.id} style={styles.selectedExerciseRow}>
                    <Text style={styles.selectedExerciseName}>{index + 1}. {ex.name}</Text>
                    <View style={styles.exerciseConfigRow}>
                      <TextInput 
                        style={styles.configInput} 
                        value={ex.sets.toString()} 
                        onChangeText={(v) => updateExerciseConfig(ex.id, 'sets', v)} 
                        keyboardType="numeric" 
                        placeholder="Series"
                      />
                      <Text style={{marginHorizontal: 5}}>x</Text>
                      <TextInput 
                        style={styles.configInput} 
                        value={ex.reps.toString()} 
                        onChangeText={(v) => updateExerciseConfig(ex.id, 'reps', v)} 
                        keyboardType="numeric" 
                        placeholder="Reps"
                      />
                      <TextInput 
                        style={[styles.configInput, { marginLeft: 10, width: 60 }]} 
                        value={ex.rest_seconds.toString()} 
                        onChangeText={(v) => updateExerciseConfig(ex.id, 'rest_seconds', v)} 
                        keyboardType="numeric" 
                        placeholder="Descanso(s)"
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>2. Asignar a Clientes (Opcional)</Text>
            {availableClients.map((client: any) => {
              const isSelected = selectedClients.includes(client.id);
              return (
                <TouchableOpacity 
                  key={client.id} 
                  style={[styles.clientSelectRow, isSelected && styles.clientSelectRowActive]}
                  onPress={() => toggleClientSelection(client.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.clientSelectName}>{client.full_name}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.submitButton} onPress={saveRoutine} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Guardar y Asignar Rutina</Text>}
            </TouchableOpacity>
            <View style={{height: 60}}/>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#2D3748' },
  addButton: { backgroundColor: '#4A5568', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  cardSubtitle: { fontSize: 14, color: '#3182CE', marginTop: 4, fontWeight: '600' },
  cardDescription: { fontSize: 14, color: '#718096', marginTop: 6 },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#2D3748' },
  formScroll: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 6, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 12, marginTop: 12 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16, color: '#2D3748', marginBottom: 10 },
  textArea: { height: 80, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 16 },
  exercisesHScroll: { flexDirection: 'row', marginBottom: 16, maxHeight: 50 },
  exercisePill: { backgroundColor: '#EDF2F7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, alignSelf: 'flex-start' },
  exercisePillActive: { backgroundColor: '#4A5568' },
  exercisePillText: { color: '#4A5568', fontWeight: '600' },
  exercisePillTextActive: { color: '#FFF' },
  selectedExercisesContainer: { backgroundColor: '#F7FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedExerciseRow: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', paddingBottom: 12 },
  selectedExerciseName: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  exerciseConfigRow: { flexDirection: 'row', alignItems: 'center' },
  configInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, padding: 8, width: 50, textAlign: 'center' },
  clientSelectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  clientSelectRowActive: { backgroundColor: '#F7FAFC' },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: '#48BB78', borderColor: '#48BB78' },
  clientSelectName: { fontSize: 16, color: '#2D3748' },
  submitButton: { backgroundColor: '#4A5568', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
