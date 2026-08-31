import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { useMemo } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

export type PickedImage = {
  uri: string;
  sizeLabel: string;
};

type Props = {
  images: PickedImage[];
  onAdd: (image: PickedImage) => void;
  label?: string;
};

// Upload reliability: full-resolution camera photos can be several MB, which
// makes the multipart upload much more likely to time out or drop on a weak
// connection. Downscaling to a sane max width before upload keeps payloads
// small without a visible quality loss for a mounting/removal proof photo.
const MAX_WIDTH = 1200;

export function ImagesList({ images, onAdd, label = 'Add images' }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const addFromResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];

    try {
      const context = ImageManipulator.manipulate(asset.uri);
      if (asset.width > MAX_WIDTH) {
        context.resize({ width: MAX_WIDTH });
      }
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      let kb = 0;
      try {
        kb = Math.max(1, Math.round(new File(saved.uri).size / 1024));
      } catch {
        kb = 0;
      }

      onAdd({ uri: saved.uri, sizeLabel: kb ? `Size: ${kb}KB` : 'Ready to upload' });
    } catch {
      // Manipulation failed (rare) — fall back to the original picked asset
      // rather than blocking the user from attaching a photo at all.
      const kb = asset.fileSize ? Math.max(1, Math.round(asset.fileSize / 1024)) : 20;
      onAdd({ uri: asset.uri, sizeLabel: `Size: ${kb}KB` });
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    addFromResult(result);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    addFromResult(result);
  };

  const addImage = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.addButton} onPress={addImage}>
          <Ionicons name="add" size={18} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {images.map((image, index) => (
          <View key={`${image.uri}-${index}`} style={styles.thumbWrap}>
            <Image source={{ uri: image.uri }} style={styles.thumb} />
            <Text style={styles.sizeLabel}>{image.sizeLabel}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    addButton: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.primaryStart,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    thumbWrap: {
      width: '23%',
      alignItems: 'center',
    },
    thumb: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sizeLabel: {
      marginTop: 4,
      fontSize: 11,
      color: colors.textMuted,
    },
  });
}
