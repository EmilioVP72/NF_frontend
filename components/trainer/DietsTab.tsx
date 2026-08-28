import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getToken } from '@/lib/supabase';
import { API_URL } from '@/config';

export default function DietsTab() {
  const [diets, setDiets] = useState<any[]>([]);
  const [availableDishes, setAvailableDishes] = useState<any[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [dishModalVisible, setDishModalVisible] = useState(false);
  const [dietModalVisible, setDietModalVisible] = useState(false);

  // Dish Form
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [calories, setCalories] = useState('');
  const [dishImages, setDishImages] = useState<any[]>([]);

  // Diet Form
  const [dietName, setDietName] = useState('');
  const [dietDesc, setDietDesc] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [dishFilter, setDishFilter] = useState('');

  useEffect(() => {
    fetchDiets();
    fetchDishes();
    fetchClients();
  }, []);

  const fetchDiets = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/diets/trainer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDiets(data);
    } catch (e) { console.error(e); }
  };

  const fetchDishes = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/dishes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAvailableDishes(data);
    } catch (e) { console.error(e); }
  };

  const fetchClients = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/profiles/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAvailableClients(data.data);
    } catch (e) { console.error(e); }
  };

  // --- DISH LOGIC ---
  const pickImages = async () => {
    if (dishImages.length >= 3) return alert('Máximo 3 imágenes por platillo');
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - dishImages.length,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      setDishImages([...dishImages, ...result.assets].slice(0, 3));
    }
  };

  const saveDish = async () => {
    if (!dishName) return alert('El nombre es requerido');
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('name', dishName);
      formData.append('description', dishDesc);
      formData.append('ingredients', ingredients);
      formData.append('protein_g', protein);
      formData.append('carbs_g', carbs);
      formData.append('fats_g', fats);
      formData.append('calories', calories);

      dishImages.forEach((img, i) => {
        formData.append('images', {
          uri: img.uri,
          name: `dish_${i}.jpg`,
          type: 'image/jpeg'
        } as any);
      });

      const res = await fetch(`${API_URL}/dishes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('Platillo creado exitosamente');
        setDishModalVisible(false);
        resetDishForm();
        fetchDishes();
      } else {
        alert('Error al crear platillo');
      }
    } catch (e) {
      console.error(e);
      alert('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const resetDishForm = () => {
    setDishName(''); setDishDesc(''); setIngredients('');
    setProtein(''); setCarbs(''); setFats(''); setCalories('');
    setDishImages([]);
  };

  // --- DIET LOGIC ---
  const toggleDishSelection = (dish: any) => {
    const isSelected = selectedDishes.some(d => d.id === dish.id);
    if (isSelected) {
      setSelectedDishes(selectedDishes.filter(d => d.id !== dish.id));
    } else {
      setSelectedDishes([...selectedDishes, { 
        ...dish, 
        meal_type: 'Almuerzo',
        order: selectedDishes.length 
      }]);
    }
  };

  const updateSelectedDish = (id: string, field: string, value: string) => {
    setSelectedDishes(selectedDishes.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const toggleClientSelection = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const saveDiet = async () => {
    if (!dietName) return alert('Ingresa el nombre del plan');
    if (selectedDishes.length === 0) return alert('Selecciona al menos un platillo');
    
    setLoading(true);
    try {
      const token = await getToken();
      
      const payload = {
        name: dietName,
        description: dietDesc,
        dishes: selectedDishes.map((d, index) => ({
          dish_id: d.id,
          meal_type: d.meal_type,
          order: index
        }))
      };

      // 1. Create Diet
      const res = await fetch(`${API_URL}/diets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.id) {
        // 2. Assign to clients
        for (const clientId of selectedClients) {
          await fetch(`${API_URL}/diets/assign`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ diet_id: data.id, client_id: clientId })
          });
        }
        alert('Plan de alimentación creado y asignado');
        setDietModalVisible(false);
        resetDietForm();
        fetchDiets();
      } else {
        alert('Error al crear plan');
      }
    } catch (e) {
      console.error(e);
      alert('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const resetDietForm = () => {
    setDietName(''); setDietDesc(''); setSelectedDishes([]); setSelectedClients([]); setDishFilter('');
  };

  const filteredDishes = dishFilter 
    ? availableDishes.filter(d => d.name.toLowerCase().includes(dishFilter.toLowerCase()))
    : availableDishes;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planes de Alimentación</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#718096', marginRight: 10 }]} onPress={() => setDishModalVisible(true)}>
            <Ionicons name="restaurant" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Platillo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setDietModalVisible(true)}>
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Nueva Dieta</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={diets}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Asignada a {item.assignments?.length || 0} clientes</Text>
              {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
              <View style={styles.dishesPreview}>
                <Text style={styles.previewText}>{item.diet_dishes?.length || 0} platillos incluidos</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay planes de alimentación creados.</Text>}
      />

      {/* DISH CREATION MODAL */}
      <Modal visible={dishModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Registrar Platillo</Text>
            <TouchableOpacity onPress={() => setDishModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.formScroll}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={dishName} onChangeText={setDishName} placeholder="Ej. Pollo a la plancha con arroz" />
            
            <Text style={styles.label}>Ingredientes / Receta</Text>
            <TextInput style={[styles.input, styles.textArea]} value={ingredients} onChangeText={setIngredients} placeholder="150g pechuga, 100g arroz..." multiline />
            
            <Text style={styles.sectionTitle}>Macros (Opcional)</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroInputCol}>
                <Text style={styles.macroLabel}>Proteína (g)</Text>
                <TextInput style={styles.input} value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="30" />
              </View>
              <View style={styles.macroInputCol}>
                <Text style={styles.macroLabel}>Carbos (g)</Text>
                <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="45" />
              </View>
              <View style={styles.macroInputCol}>
                <Text style={styles.macroLabel}>Grasas (g)</Text>
                <TextInput style={styles.input} value={fats} onChangeText={setFats} keyboardType="numeric" placeholder="10" />
              </View>
              <View style={styles.macroInputCol}>
                <Text style={styles.macroLabel}>Calorías</Text>
                <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="400" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Fotos ({dishImages.length}/3)</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
              <Ionicons name="images" size={24} color="#FFF" />
              <Text style={styles.imagePickerText}>Seleccionar Fotos</Text>
            </TouchableOpacity>
            <ScrollView horizontal style={{ marginTop: 10 }}>
              {dishImages.map((img, idx) => (
                <Image key={idx} source={{ uri: img.uri }} style={{ width: 100, height: 100, borderRadius: 8, marginRight: 10 }} />
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={saveDish} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Guardar Platillo</Text>}
            </TouchableOpacity>
            <View style={{height: 60}}/>
          </ScrollView>
        </View>
      </Modal>

      {/* DIET CREATION MODAL */}
      <Modal visible={dietModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Plan de Alimentación</Text>
            <TouchableOpacity onPress={() => setDietModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.formScroll}>
            <Text style={styles.label}>Nombre del Plan *</Text>
            <TextInput style={styles.input} value={dietName} onChangeText={setDietName} placeholder="Ej. Dieta Definición 1500kcal" />
            
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, styles.textArea]} value={dietDesc} onChangeText={setDietDesc} placeholder="Recomendaciones..." multiline />
            
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>1. Selección de Platillos</Text>
            <TextInput style={styles.input} value={dishFilter} onChangeText={setDishFilter} placeholder="Buscar platillo..." />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exercisesHScroll}>
              {filteredDishes.map((dish) => {
                const isSelected = selectedDishes.some(d => d.id === dish.id);
                return (
                  <TouchableOpacity key={dish.id} style={[styles.exercisePill, isSelected && styles.exercisePillActive]} onPress={() => toggleDishSelection(dish)}>
                    <Text style={[styles.exercisePillText, isSelected && styles.exercisePillTextActive]}>{dish.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedDishes.length > 0 && (
              <View style={styles.selectedExercisesContainer}>
                <Text style={styles.label}>Platillos Seleccionados</Text>
                {selectedDishes.map((dish, index) => (
                  <View key={dish.id} style={styles.selectedExerciseRow}>
                    <Text style={styles.selectedExerciseName}>{index + 1}. {dish.name}</Text>
                    <TextInput 
                      style={styles.configInput} 
                      value={dish.meal_type} 
                      onChangeText={(v) => updateSelectedDish(dish.id, 'meal_type', v)} 
                      placeholder="Ej. Desayuno, Snack..."
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>2. Asignar a Clientes (Opcional)</Text>
            {availableClients.map((client) => {
              const isSelected = selectedClients.includes(client.id);
              return (
                <TouchableOpacity key={client.id} style={[styles.clientSelectRow, isSelected && styles.clientSelectRowActive]} onPress={() => toggleClientSelection(client.id)}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.clientSelectName}>{client.full_name}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.submitButton} onPress={saveDiet} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Guardar Plan de Alimentación</Text>}
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
  actionsRow: { flexDirection: 'row' },
  addButton: { backgroundColor: '#4A5568', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  cardSubtitle: { fontSize: 14, color: '#3182CE', marginTop: 4, fontWeight: '600' },
  cardDescription: { fontSize: 14, color: '#718096', marginTop: 6 },
  dishesPreview: { marginTop: 8, backgroundColor: '#EDF2F7', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  previewText: { fontSize: 12, color: '#4A5568', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#2D3748' },
  formScroll: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 6, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 12, marginTop: 12 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16, color: '#2D3748', marginBottom: 10 },
  textArea: { height: 80, textAlignVertical: 'top' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroInputCol: { flex: 1, marginHorizontal: 4 },
  macroLabel: { fontSize: 12, fontWeight: '600', color: '#718096', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 16 },
  exercisesHScroll: { flexDirection: 'row', marginBottom: 16, maxHeight: 50 },
  exercisePill: { backgroundColor: '#EDF2F7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, alignSelf: 'flex-start' },
  exercisePillActive: { backgroundColor: '#48BB78' },
  exercisePillText: { color: '#4A5568', fontWeight: '600' },
  exercisePillTextActive: { color: '#FFF' },
  selectedExercisesContainer: { backgroundColor: '#F7FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedExerciseRow: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', paddingBottom: 12 },
  selectedExerciseName: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  configInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, padding: 10 },
  clientSelectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  clientSelectRowActive: { backgroundColor: '#F7FAFC' },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: '#48BB78', borderColor: '#48BB78' },
  clientSelectName: { fontSize: 16, color: '#2D3748' },
  imagePickerBtn: { backgroundColor: '#718096', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginTop: 8 },
  imagePickerText: { color: '#FFF', fontWeight: '700', marginLeft: 8 },
  submitButton: { backgroundColor: '#4A5568', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
