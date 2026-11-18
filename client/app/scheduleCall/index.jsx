import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Messages } from "../../components/ModalData";
import { useState } from "react";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import TimeSlotPicker from "../../components/TimePicker";

function CalendarPicker() {
  const [selectedDate, setSelectedDate] = useState("");

  const [open, setOpen] = useState(false);
  const [num, setNum] = useState(0);
   
  const handleConfirm = () => {
    setOpen(true);
  };

  const handleDone = () => {
    if(num < Messages.length - 1){
      setNum(num => num+1)
    } else{
      setOpen(false)
    }
  };

  return (
    <SafeAreaView className="bg-white ">
      <ScrollView>
        <View className="flex flex-row items-center mt-2 mb-6 ml-6">
         <Modal
          visible={open}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setOpen(false)}
          >
            <View className='flex-1  bg-[#B3B3B3] opacity-90'>
            <View className='py-6 mx-4 mt-32 bg-white rounded-3xl'>
              <Image
              className='self-center h-28 w-28'
              source={Messages[num].image}
              />
            <Text className='self-center mt-10 text-2xl font-bold text-slate-800'>{Messages[num].title}</Text>
            <Text className='self-center mt-2 text-lg text-center text-slate-800'>{Messages[num].content}</Text>
            
            <TouchableOpacity
          onPress={handleDone}
          className="flex flex-row items-center self-center justify-center py-4 mt-12 mb-4 rounded-md px-28 bg-lime-300 gap-x-1"
        >
          <Text className="font-bold text-white">{Messages[num].button}</Text>
        </TouchableOpacity>
        <Text className='self-center mt-2'>{Messages[num]?.bottom }</Text>
            </View>
            </View>
          </Modal>
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

        <Text className="mb-2 ml-5 text-2xl font-bold text-slate-900">
          Select Date
        </Text>

        <View className="mx-6 overflow-hidden rounded-xl">
          <Calendar
            current={"2023-06-01"}
            minDate={"2023-01-01"}
            maxDate={"2023-12-31"}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            monthFormat={"MMMM yyyy"}
            hideArrows={false}
            markingType={"custom"}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#A5ED47",
                customStyles: {
                  container: {
                    borderRadius: 4,
                    width: 36,
                    height: 36,
                    justifyContent: "center",
                  },
                  text: {
                    color: "#000",
                    fontWeight: "bold",
                  },
                },
              },
            }}
            theme={{
              calendarBackground: "#f7f7f7",
              monthTextColor: "#000",
              dayTextColor: "#000",
              todayTextColor: "#FF0000",
              arrowColor: "#4285F4",
              "stylesheet.calendar.main": {
                container: {
                  borderRadius: 12,
                  overflow: "hidden",
                },
              },
              "stylesheet.day.basic": {
                base: {
                  borderRadius: 4,
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                },
              },
            }}
            renderArrow={(direction) => (
              <Text>{direction === "left" ? "<" : ">"}</Text>
            )}
          />
        </View>

        <Text className="mt-8 ml-6 text-2xl font-bold text-slate-900">
          Select Hour
        </Text>

        <TimeSlotPicker />

        <TouchableOpacity
          onPress={handleConfirm}
          className="flex flex-row items-center self-center justify-center px-20 py-4 mt-2 mb-16 rounded-md bg-lime-300 gap-x-1"
        >
          <Text className="font-bold">Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CalendarPicker;
