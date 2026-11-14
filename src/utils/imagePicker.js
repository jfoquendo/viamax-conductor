import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const IMAGE_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
};

async function pickFromGallery() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(
      'Debes permitir acceso a la galería para seleccionar una imagen'
    );
  }

  const result = await ImagePicker.launchImageLibraryAsync(
    IMAGE_OPTIONS
  );

  if (result.canceled) return null;

  return result.assets?.[0]?.uri ?? null;
}

async function takeWithCamera() {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error(
      'Debes permitir acceso a la cámara para tomar una foto'
    );
  }

  const result = await ImagePicker.launchCameraAsync({
    ...IMAGE_OPTIONS,
    cameraType: ImagePicker.CameraType.back,
  });

  if (result.canceled) return null;

  return result.assets?.[0]?.uri ?? null;
}

export function selectImageSource() {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige cómo quieres agregar la fotografía',
      [
        {
          text: 'Cámara',
          onPress: () => {
            takeWithCamera()
              .then(resolve)
              .catch(reject);
          },
        },
        {
          text: 'Galería',
          onPress: () => {
            pickFromGallery()
              .then(resolve)
              .catch(reject);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(null),
      }
    );
  });
}