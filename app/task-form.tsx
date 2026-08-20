import { useMemo, useState, type ReactNode } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { TextField } from '../components/TextField';
import { Dropdown } from '../components/Dropdown';
import { DateField } from '../components/DateField';
import { GradientButton } from '../components/GradientButton';
import { NotesList } from '../components/NotesList';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { tasks, vendors, mediaTypes, lightTypes, type PhotoType } from '../data/mockData';

const mediaTypeOptions = mediaTypes.map((name, index) => ({ id: `mt-${index}`, name }));
const lightTypeOptions = lightTypes.map((name, index) => ({ id: `lt-${index}`, name }));

export default function TaskForm() {
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

  const goToOffset = (offset: number) => {
    if (taskIndex < 0) return;
    const nextIndex = taskIndex + offset;
    if (nextIndex < 0 || nextIndex >= tasks.length) return;
    router.setParams({ taskId: tasks[nextIndex].id });
  };

  const onSubmit = () => {
    Alert.alert('Submitted', 'Task details have been saved.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  const onReject = () => {
    Alert.alert('Reject task', 'Are you sure you want to reject this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const onComplete = () => {
    Alert.alert('Complete task', 'Mark this task as complete?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Task</Text>

        <Field label="Campaign name">
          <TextField icon="pricetag-outline" placeholder="Enter campaign name" value={campaignName} onChangeText={setCampaignName} />
        </Field>

        <Field label="Media">
          <TextField icon="images-outline" placeholder="Enter media name" value={media} onChangeText={setMedia} />
        </Field>

        <Field label="Media type">
          <Dropdown icon="layers-outline" placeholder="Select media type" value={mediaType} options={mediaTypeOptions} onSelect={setMediaType} />
        </Field>

        <Field label="Display start date">
          <DateField placeholder="Enter display start date" value={startDate} onChange={setStartDate} />
        </Field>

        <Field label="Display end date">
          <DateField placeholder="Enter display end date" value={endDate} onChange={setEndDate} />
        </Field>

        <Field label="Vendor">
          <Dropdown icon="business-outline" placeholder="Select vendor" value={vendor} options={vendors} onSelect={setVendor} />
        </Field>

        <Field label="Light type">
          <Dropdown icon="bulb-outline" placeholder="Select light type" value={lightType} options={lightTypeOptions} onSelect={setLightType} />
        </Field>

        <Field label="Size">
          <TextField icon="resize-outline" placeholder="Enter size" value={size} onChangeText={setSize} />
        </Field>

        <Field label="Quantity">
          <TextField icon="calculator-outline" placeholder="Enter quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
        </Field>

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

      <View style={styles.footer}>
        <Pressable onPress={onReject}>
          <Text style={styles.rejectText}>Reject</Text>
        </Pressable>
        <View style={styles.footerNav}>
          <Pressable onPress={() => goToOffset(-1)} hitSlop={10}>
            <Ionicons name="play-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.footerCircle} />
          <Pressable onPress={() => goToOffset(1)} hitSlop={10}>
            <Ionicons name="play-forward" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Pressable onPress={onComplete}>
          <Text style={styles.completeText}>Complete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
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
    borderRadius: radius.md,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.primaryStart,
  },
  rejectText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  completeText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 15,
  },
});
