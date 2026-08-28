import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getToken } from '@/lib/supabase';
import { API_URL } from '@/config';

export default function ExercisesTab() {
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState('MEDIA');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/exercises`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setExercises(data.data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const pickImage = async () => {
    if (images.length >= 4) {
      alert('Puedes subir hasta 4 imágenes máximo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setVideo(result.assets[0]);
    }
  };

  const createExercise = async () => {
    if (!name || !muscleGroup) {
      alert('Por favor, ingresa el nombre y grupo muscular.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('muscle_group', muscleGroup);
      formData.append('description', description);
      formData.append('intensity_level', intensity);
      formData.append('default_sets', sets);
      formData.append('default_reps', reps);
      
      images.forEach((img, index) => {
        const localUri = img.uri;
        const filename = localUri.split('/').pop() || `image_${index}.jpg`;
        const type = img.mimeType || 'image/jpeg';
        formData.append('images', { uri: localUri, name: filename, type } as any);
      });

      if (video) {
        const localUri = video.uri;
        const filename = localUri.split('/').pop() || 'video.mp4';
        const type = video.mimeType || 'video/mp4';
        formData.append('video', { uri: localUri, name: filename, type } as any);
      }

      const response = await fetch(`${API_URL}/exercises`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is set automatically by fetch
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert('Ejercicio creado exitosamente');
        setModalVisible(false);
        resetForm();
        fetchExercises();
      } else {
        alert('Error al crear el ejercicio');
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setMuscleGroup('');
    setDescription('');
    setIntensity('MEDIA');
    setSets('');
    setReps('');
    setImages([]);
    setVideo(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ejercicios</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_urls && item.image_urls.length > 0 && (
              <Image source={{ uri: item.image_urls[0] }} style={styles.cardImage} />
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.muscle_group} | Intensidad: {item.intensity_level}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay ejercicios registrados.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Ejercicio</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.label}>Nombre del Ejercicio *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Press de Banca" />
            
            <Text style={styles.label}>Grupo Muscular *</Text>
            <TextInput style={styles.input} value={muscleGroup} onChangeText={setMuscleGroup} placeholder="Ej. Pecho" />
            
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Instrucciones de ejecución..." multiline numberOfLines={3} />
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Intensidad</Text>
                <TextInput style={styles.input} value={intensity} onChangeText={setIntensity} placeholder="BAJA, MEDIA, ALTA" />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Series (Opcional)</Text>
                <TextInput style={styles.input} value={sets} onChangeText={setSets} placeholder="Ej. 4" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Reps (Opcional)</Text>
                <TextInput style={styles.input} value={reps} onChangeText={setReps} placeholder="Ej. 12" keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Imágenes ({images.length}/4)</Text>
            <ScrollView horizontal style={styles.mediaPreviewContainer}>
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img.uri }} style={styles.previewImage} />
              ))}
              {images.length < 4 && (
                <TouchableOpacity style={styles.addMediaBox} onPress={pickImage}>
                  <Ionicons name="image-outline" size={32} color="#888" />
                </TouchableOpacity>
              )}
            </ScrollView>

            <Text style={styles.label}>Video Demostrativo</Text>
            <View style={styles.mediaPreviewContainer}>
              {video ? (
                <View style={styles.videoPreview}>
                  <Ionicons name="videocam" size={24} color="#FFF" />
                  <Text style={styles.videoPreviewText}>Video seleccionado</Text>
                  <TouchableOpacity onPress={() => setVideo(null)} style={{ marginLeft: 'auto' }}>
                    <Ionicons name="trash" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.addMediaBox, { width: '100%', height: 60, flexDirection: 'row' }]} onPress={pickVideo}>
                  <Ionicons name="videocam-outline" size={24} color="#888" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#888' }}>Seleccionar Video</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={createExercise} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Guardar Ejercicio</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  addButton: {
    backgroundColor: '#4A5568',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  formScroll: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  addMediaBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5568',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  videoPreviewText: {
    color: '#FFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4A5568',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
