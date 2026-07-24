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
          {required && <Text style={{ color: '#ef4444', marginLeft: 3 }}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity 
        style={[styles.inputContainer, { backgroundColor: '#F0F4F8', borderColor: 'rgba(255, 255, 255, 0.6)' }]}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <Text style={[styles.text, !selectedOption && { color: Colors.textLight }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={Colors.textLight} />
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
              <View style={[styles.modalContent, { backgroundColor: Colors.bg }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Feather name="x" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        item.value === value && { backgroundColor: Colors.surface }
                      ]}
                      onPress={() => {
                        onSelect(item.value);
                        setModalVisible(false);
                      }}
                    >
                      {item.icon && (
                        <MaterialIcons 
                          name={item.icon} 
                          size={24} 
                          color={item.value === value ? Colors.gold : Colors.textMuted} 
                          style={styles.optionIcon}
                        />
                      )}
                      <Text style={[
                        styles.optionText,
                        item.value === value && { color: Colors.gold, fontWeight: 'bold' }
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === value && (
                        <Feather name="check" size={20} color={Colors.gold} />
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
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 52,
  },
  leftIcon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
  },
});
