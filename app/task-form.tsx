import { useMemo, useState, type ReactNode } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { TextField } from '../components/TextField';
import { Dropdown } from '../components/Dropdown';
import { DateField } from '../components/DateField';
import { GradientButton } from '../components/GradientButton';
import { NotesList } from '../components/NotesList';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { tasks, vendors, mediaTypes, lightTypes, type PhotoType } from '../data/mockData';

const mediaTypeOptions = mediaTypes.map((name, index) => ({ id: `mt-${index}`, name }));
const lightTypeOptions = lightTypes.map((name, index) => ({ id: `lt-${index}`, name }));

export default function TaskForm() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const taskIndex = useMemo(() => tasks.findIndex((t) => t.id === taskId), [taskId]);
  const task = taskIndex >= 0 ? tasks[taskIndex] : null;

  const [campaignName, setCampaignName] = useState(task?.title ?? '');
  const [media, setMedia] = useState('');
  const [mediaType, setMediaType] = useState<{ id: string; name: string } | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [vendor, setVendor] = useState<{ id: string; name: string } | null>(null);
  const [lightType, setLightType] = useState<{ id: string; name: string } | null>(null);
  const [size, setSize] = useState(task?.bannerSize ?? '');
  const [quantity, setQuantity] = useState('');
  const [photoType, setPhotoType] = useState<PhotoType>('day');
  const [notes, setNotes] = useState<string[]>(
    task ? [`Size of banner is ${task.bannerSize ?? ''}`] : []
  );
  const [images, setImages] = useState<PickedImage[]>([]);

  const onSubmit = () => {
    Alert.alert('Submitted', 'Task details have been saved.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Task" />

        <Card tint="muted" style={styles.section}>
          <Field label="Campaign name" styles={styles}>
            <TextField icon="pricetag-outline" placeholder="Enter campaign name" value={campaignName} onChangeText={setCampaignName} />
          </Field>

          <Field label="Media" styles={styles}>
            <TextField icon="images-outline" placeholder="Enter media name" value={media} onChangeText={setMedia} />
          </Field>

          <Field label="Media type" styles={styles} last>
            <Dropdown icon="layers-outline" placeholder="Select media type" value={mediaType} options={mediaTypeOptions} onSelect={setMediaType} searchable />
          </Field>
        </Card>

        <Card tint="muted" style={styles.section}>
          <Field label="Display start date" styles={styles}>
            <DateField placeholder="Enter display start date" value={startDate} onChange={setStartDate} />
          </Field>

          <Field label="Display end date" styles={styles} last>
            <DateField placeholder="Enter display end date" value={endDate} onChange={setEndDate} />
          </Field>
        </Card>

        <Card tint="muted" style={styles.section}>
          <Field label="Vendor" styles={styles}>
            <Dropdown icon="business-outline" placeholder="Select vendor" value={vendor} options={vendors} onSelect={setVendor} searchable />
          </Field>

          <Field label="Light type" styles={styles}>
            <Dropdown icon="bulb-outline" placeholder="Select light type" value={lightType} options={lightTypeOptions} onSelect={setLightType} searchable />
          </Field>

          <Field label="Size" styles={styles}>
            <TextField icon="resize-outline" placeholder="Enter size" value={size} onChangeText={setSize} />
          </Field>

          <Field label="Quantity" styles={styles} last>
            <TextField icon="calculator-outline" placeholder="Enter quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
          </Field>
        </Card>

        <Text style={styles.sectionLabel}>Photo type</Text>
        <View style={styles.photoTypeRow}>
          <Pressable
            style={[styles.photoTypeButton, { backgroundColor: colors.day }, photoType !== 'day' && styles.photoTypeInactive]}
            onPress={() => setPhotoType('day')}
          >
            <Ionicons name="sunny" size={22} color={colors.white} />
          </Pressable>
          <Pressable
            style={[styles.photoTypeButton, { backgroundColor: colors.night }, photoType !== 'night' && styles.photoTypeInactive]}
            onPress={() => setPhotoType('night')}
          >
            <Ionicons name="moon" size={22} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <NotesList notes={notes} onAdd={(note) => setNotes((prev) => [...prev, note])} onRemove={(index) => setNotes((prev) => prev.filter((_, i) => i !== index))} />

        <View style={styles.divider} />

        <ImagesList images={images} onAdd={(image) => setImages((prev) => [...prev, image])} />

        <GradientButton label="Submit" onPress={onSubmit} style={styles.submitButton} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  children,
  styles,
  last,
}: {
  label: string;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
  last?: boolean;
}) {
  return (
    <View style={[styles.field, last && styles.fieldLast]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    section: {
      marginBottom: spacing.md,
    },
    field: {
      marginBottom: spacing.md,
    },
    fieldLast: {
      marginBottom: 0,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    photoTypeRow: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    photoTypeButton: {
      width: 48,
      height: 48,
      borderRadius: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    photoTypeInactive: {
      opacity: 0.4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    submitButton: {
      marginTop: spacing.lg,
    },
  });
}
