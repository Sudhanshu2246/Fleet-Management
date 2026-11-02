import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
}

export function Dropdown({ label, placeholder = 'Select an option', value, options, onSelect, icon, required }: DropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: Colors.error, marginLeft: 3 }}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity 
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <Text style={[styles.text, !selectedOption && { color: Colors.textMuted }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Feather name="x" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        item.value === value && { backgroundColor: Colors.accentSubtle }
                      ]}
                      onPress={() => {
                        onSelect(item.value);
                        setModalVisible(false);
                      }}
                    >
                      {item.icon && (
                        <MaterialIcons 
                          name={item.icon} 
                          size={20}
                          color={item.value === value ? Colors.accent : Colors.textMuted}
                          style={styles.optionIcon}
                        />
                      )}
                      <Text style={[
                        styles.optionText,
                        item.value === value && { color: Colors.accent, fontWeight: 'bold' }
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === value && (
                        <Feather name="check" size={18} color={Colors.accent} />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceElevated,
    height: 42,
  },
  leftIcon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '70%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
