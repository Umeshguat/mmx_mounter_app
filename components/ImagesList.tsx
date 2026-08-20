import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export type PickedImage = {
  uri: string;
  sizeLabel: string;
};

type Props = {
  images: PickedImage[];
  onAdd: (image: PickedImage) => void;
};

export function ImagesList({ images, onAdd }: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    const kb = asset.fileSize ? Math.max(1, Math.round(asset.fileSize / 1024)) : 20;
    onAdd({ uri: asset.uri, sizeLabel: `Size: ${kb}KB` });
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Add images</Text>
        <Pressable style={styles.addButton} onPress={pickImage}>
          <Ionicons name="add" size={18} color={colors.text} />
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

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumbWrap: {
    width: 88,
    alignItems: 'center',
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  sizeLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
});
