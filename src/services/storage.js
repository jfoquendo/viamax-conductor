import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves de almacenamiento usadas en la app
export const STORAGE_KEYS = {
  driverProfile: '@viamax_driver_profile',   
  authToken: '@viamax_auth_token',           // Token de sesión
  isAvailable: '@viamax_is_available',       // Estado de disponibilidad
  tripHistory: '@viamax_trip_history',       
  appLanguage: '@viamax_language',           
};

// Guarda un valor en AsyncStorage 
export const saveData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error al guardar datos:', error);
    throw error;
  }
};

// Lee un valor de AsyncStorage 
export const getData = async (key) => {
  try {
    const json = await AsyncStorage.getItem(key);
    return json !== null ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error al leer datos:', error);
    throw error;
  }
};

// Elimina un valor específico de AsyncStorage
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar dato:', error);
    throw error;
  }
};

// Limpia todo el AsyncStorage
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error al limpiar almacenamiento:', error);
    throw error;
  }
};