/**
 * Privacy Zones Component
 * Allows users to define geographic zones where GPS tracking is hidden
 * Phase 3: Privacy Features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

export interface PrivacyZone {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  created_at: string;
}

interface PrivacyZonesProps {
  zones: PrivacyZone[];
  onAddZone: (zone: Omit<PrivacyZone, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onEditZone: (zoneId: string, updates: Partial<PrivacyZone>) => Promise<void>;
  onDeleteZone: (zoneId: string) => Promise<void>;
  loading?: boolean;
}

type RadiusOption = 100 | 250 | 500 | 1000;

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
  { value: 100, label: '100m' },
  { value: 250, label: '250m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
];

export function PrivacyZones({
  zones,
  onAddZone,
  onEditZone,
  onDeleteZone,
  loading = false,
}: PrivacyZonesProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState<PrivacyZone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(250);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Reset form when modal closes
  useEffect(() => {
    if (!modalVisible) {
      setEditingZone(null);
      setZoneName('');
      setAddress('');
      setSelectedRadius(250);
      setAddressSuggestions([]);
    }
  }, [modalVisible]);

  // Load zone data when editing
  useEffect(() => {
    if (editingZone) {
      setZoneName(editingZone.name);
      setAddress(editingZone.address);
      setSelectedRadius(editingZone.radius_meters as RadiusOption);
      setModalVisible(true);
    }
  }, [editingZone]);

  const handleAddressChange = (text: string) => {
    setAddress(text);

    // Mock address suggestions (in production, use Google Places API)
    if (text.length > 2) {
      const mockSuggestions = [
        `${text} Street, City, State`,
        `${text} Avenue, City, State`,
        `${text} Road, City, State`,
      ];
      setAddressSuggestions(mockSuggestions);
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleSelectAddress = (suggestion: string) => {
    setAddress(suggestion);
    setAddressSuggestions([]);
  };

  const handleSave = async () => {
    if (!zoneName.trim()) {
      Alert.alert('Error', 'Please enter a name for this privacy zone');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setSaving(true);

    try {
      // In production, geocode the address to get lat/lng
      // For now, use mock coordinates
      const mockLat = 37.7749 + Math.random() * 0.1;
      const mockLng = -122.4194 + Math.random() * 0.1;

      if (editingZone) {
        await onEditZone(editingZone.id, {
          name: zoneName.trim(),
          address: address.trim(),
          latitude: mockLat,
          longitude: mockLng,
          radius_meters: selectedRadius,
        });
      } else {
        await onAddZone({
          name: zoneName.trim(),
          address: address.trim(),
          latitude: mockLat,
          longitude: mockLng,
          radius_meters: selectedRadius,
        });
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save privacy zone. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = (zone: PrivacyZone) => {
    Alert.alert(
      'Delete Privacy Zone',
      `Are you sure you want to delete "${zone.name}"? Routes passing through this area will become visible.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteZone(zone.id),
        },
      ]
    );
  };

  const renderZoneItem = ({ item }: { item: PrivacyZone }) => (
    <View style={styles.zoneItem}>
      <View style={styles.zoneIcon}>
        <Feather name="map-pin" size={20} color={colors.primary.main} />
      </View>
      <View style={styles.zoneInfo}>
        <Text style={styles.zoneName}>{item.name}</Text>
        <Text style={styles.zoneAddress}>{item.address}</Text>
        <Text style={styles.zoneRadius}>
          Hidden within {item.radius_meters}m radius
        </Text>
      </View>
      <View style={styles.zoneActions}>
        <TouchableOpacity
          onPress={() => setEditingZone(item)}
          style={styles.actionButton}
        >
          <Feather name="edit-2" size={18} color={colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteZone(item)}
          style={styles.actionButton}
        >
          <Feather name="trash-2" size={18} color={colors.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Zones</Text>
        <Text style={styles.headerSubtitle}>
          Hide GPS tracking in specific areas like your home or workplace
        </Text>
      </View>

      {/* Add Zone Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <Feather name="plus-circle" size={20} color={colors.text.inverse} />
        <Text style={styles.addButtonText}>Add Privacy Zone</Text>
      </TouchableOpacity>

      {/* Zones List */}
      {zones.length > 0 ? (
        <FlatList
          data={zones}
          renderItem={renderZoneItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Feather name="shield" size={64} color={colors.text.disabled} />
          <Text style={styles.emptyStateTitle}>No Privacy Zones</Text>
          <Text style={styles.emptyStateText}>
            Add privacy zones to hide your exact location in sensitive areas
          </Text>
        </View>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingZone ? 'Edit Privacy Zone' : 'Add Privacy Zone'}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text
                style={[
                  styles.modalSave,
                  saving && { color: colors.text.disabled },
                ]}
              >
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Zone Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Home, Work, School"
                placeholderTextColor={colors.text.disabled}
                value={zoneName}
                onChangeText={setZoneName}
                maxLength={50}
              />
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter address or location"
                placeholderTextColor={colors.text.disabled}
                value={address}
                onChangeText={handleAddressChange}
                multiline
                numberOfLines={2}
              />
              {/* Address Suggestions */}
              {addressSuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {addressSuggestions.map((suggestion, index) => (
                    <Pressable
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectAddress(suggestion)}
                    >
                      <Feather
                        name="map-pin"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Radius Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Privacy Radius</Text>
              <View style={styles.radiusButtons}>
                {RADIUS_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.radiusButton,
                      selectedRadius === option.value &&
                        styles.radiusButtonActive,
                    ]}
                    onPress={() => setSelectedRadius(option.value)}
                  >
                    <Text
                      style={[
                        styles.radiusButtonText,
                        selectedRadius === option.value &&
                          styles.radiusButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.radiusHint}>
                GPS tracking will be hidden within this radius
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Feather name="info" size={16} color={colors.primary.main} />
              <Text style={styles.infoText}>
                Routes passing through this zone will show grey dashed lines
                instead of your actual path
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      padding: Layout.spacing.large,
      backgroundColor: colors.background.secondary,
    },
    headerTitle: {
      ...Typography.title2,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs,
    },
    headerSubtitle: {
      ...Typography.body,
      color: colors.text.secondary,
      fontSize: Typography.fontSize.sm,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.main,
      borderRadius: Layout.borderRadius.medium,
      paddingVertical: Layout.spacing.medium,
      marginHorizontal: Layout.spacing.large,
      marginTop: Layout.spacing.large,
      gap: Layout.spacing.small,
      height: Layout.touchTarget.secondary,
    },
    addButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.inverse,
    },
    listContent: {
      padding: Layout.spacing.large,
    },
    zoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Layout.spacing.medium,
      minHeight: Layout.touchTarget.listItem,
    },
    zoneIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary.light + '30',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Layout.spacing.medium,
    },
    zoneInfo: {
      flex: 1,
    },
    zoneName: {
      ...Typography.headline,
      color: colors.text.primary,
      marginBottom: 2,
    },
    zoneAddress: {
      ...Typography.body,
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    zoneRadius: {
      ...Typography.caption,
      color: colors.text.disabled,
    },
    zoneActions: {
      flexDirection: 'row',
      gap: Layout.spacing.medium,
    },
    actionButton: {
      padding: Layout.spacing.small,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border.light,
      marginVertical: Layout.spacing.small,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Layout.spacing.large,
      paddingVertical: Layout.spacing.xxlarge * 2,
    },
    emptyStateTitle: {
      ...Typography.title2,
      color: colors.text.primary,
      marginTop: Layout.spacing.large,
      marginBottom: Layout.spacing.small,
    },
    emptyStateText: {
      ...Typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Layout.safeArea.top + Layout.spacing.medium,
      paddingHorizontal: Layout.spacing.large,
      paddingBottom: Layout.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalCancel: {
      ...Typography.body,
      color: colors.primary.main,
      fontSize: Typography.fontSize.md,
    },
    modalTitle: {
      ...Typography.headline,
      color: colors.text.primary,
      fontWeight: '600',
    },
    modalSave: {
      ...Typography.body,
      color: colors.primary.main,
      fontSize: Typography.fontSize.md,
      fontWeight: '600',
    },
    form: {
      padding: Layout.spacing.large,
    },
    formGroup: {
      marginBottom: Layout.spacing.large,
    },
    label: {
      ...Typography.headline,
      color: colors.text.primary,
      marginBottom: Layout.spacing.small,
    },
    input: {
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.medium,
      paddingHorizontal: Layout.spacing.medium,
      paddingVertical: Layout.spacing.medium,
      fontSize: Typography.fontSize.md,
      color: colors.text.primary,
      minHeight: Layout.touchTarget.secondary,
    },
    suggestions: {
      marginTop: Layout.spacing.small,
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.medium,
      overflow: 'hidden',
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Layout.spacing.medium,
      gap: Layout.spacing.small,
      minHeight: Layout.touchTarget.secondary,
    },
    suggestionText: {
      ...Typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    radiusButtons: {
      flexDirection: 'row',
      gap: Layout.spacing.small,
    },
    radiusButton: {
      flex: 1,
      paddingVertical: Layout.spacing.medium,
      borderRadius: Layout.borderRadius.medium,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: Layout.touchTarget.secondary,
    },
    radiusButtonActive: {
      backgroundColor: colors.primary.light + '30',
      borderColor: colors.primary.main,
    },
    radiusButtonText: {
      ...Typography.body,
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    radiusButtonTextActive: {
      color: colors.primary.main,
    },
    radiusHint: {
      ...Typography.caption,
      color: colors.text.disabled,
      marginTop: Layout.spacing.small,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primary.light + '20',
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
      gap: Layout.spacing.small,
      marginTop: Layout.spacing.medium,
    },
    infoText: {
      ...Typography.body,
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      flex: 1,
    },
  });
