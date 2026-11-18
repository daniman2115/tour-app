import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const TimeSlotPicker = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Time slots data
  const timeSlots = [
    ['09:00 AM', '09:30 AM', '10:00 AM'],
    ['10:30 AM', '11:00 AM', '11:30 AM'],
    ['03:00 PM', '03:30 PM', '04:00 PM'],
    ['04:30 PM', '05:00 PM', '05:30 PM']
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {timeSlots.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedSlot === time && styles.selectedSlot
              ]}
              onPress={() => setSelectedSlot(time)}
            >
              <Text style={[
                styles.timeText,
                selectedSlot === time && styles.selectedText
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: '#A5ED47',
  },
  timeText: {
    color: '#333',
  },
  selectedText: {
    color: 'white',
  },
});

export default TimeSlotPicker;