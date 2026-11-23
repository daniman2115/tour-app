import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import TimeSlotPicker from "../../components/TimePicker";
import { createBooking } from "../../services/apiService";

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

// Max date: 90 days out
const maxDate = new Date(today);
maxDate.setDate(maxDate.getDate() + 90);
const maxDateStr = maxDate.toISOString().split("T")[0];

function CalendarPicker() {
  const { guideId, guideName } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // "HH:MM"
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedDate) {
      Alert.alert("Select a date", "Please pick a date before confirming.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Select a time", "Please pick a time slot before confirming.");
      return;
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    setLoading(true);
    try {
      await createBooking({
        guideId,
        scheduledAt,
        duration: 60,
        notes: "",
      });
      Alert.alert(
        "Booking requested!",
        `Your tour with ${guideName ?? "the guide"} on ${selectedDate} at ${selectedTime} has been sent. The guide will confirm shortly.`,
        [{ text: "OK", onPress: () => router.replace("/myBookings") }]
      );
    } catch (err) {
      Alert.alert(
        "Booking failed",
        err?.response?.data?.error || err.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center mt-2 mb-6 ml-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center justify-center w-12 h-12 border-[0.3px] border-gray-500 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="ml-5 text-2xl font-bold text-slate-900">
            Book Appointment
          </Text>
        </View>

        {guideName ? (
          <Text className="mb-4 ml-5 text-base text-gray-600">
            with <Text className="font-semibold">{guideName}</Text>
          </Text>
        ) : null}

        <Text className="mb-2 ml-5 text-2xl font-bold text-slate-900">
          Select Date
        </Text>

        <View className="mx-6 overflow-hidden rounded-xl">
          <Calendar
            current={todayStr}
            minDate={todayStr}
            maxDate={maxDateStr}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            monthFormat={"MMMM yyyy"}
            hideArrows={false}
            markingType={"custom"}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#A5ED47",
                customStyles: {
                  container: { borderRadius: 4, width: 36, height: 36, justifyContent: "center" },
                  text: { color: "#000", fontWeight: "bold" },
                },
              },
            }}
            theme={{
              calendarBackground: "#f7f7f7",
              monthTextColor: "#000",
              dayTextColor: "#000",
              todayTextColor: "#22C55E",
              arrowColor: "#4285F4",
            }}
            renderArrow={(direction) => (
              <Text>{direction === "left" ? "<" : ">"}</Text>
            )}
          />
        </View>

        <Text className="mt-8 ml-6 text-2xl font-bold text-slate-900">
          Select Hour
        </Text>

        <TimeSlotPicker
          onSelect={(time) => setSelectedTime(time)}
          selected={selectedTime}
        />

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={loading}
          className={`flex-row items-center self-center justify-center px-20 py-4 mt-2 mb-16 rounded-md gap-x-1 ${
            loading ? "bg-lime-200" : "bg-lime-300"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="font-bold">Confirm</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CalendarPicker;
