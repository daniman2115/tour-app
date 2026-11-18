import { Picker } from "@react-native-picker/picker";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../components/Input";

const Index = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <View className="bg-white ">
          <Text className="self-center mt-12 text-2xl font-bold">
            Create Account
          </Text>
          <Text className="self-center mt-2 text-xl">
            Fill the following form to create account
          </Text>
          <Text className="mt-8 mb-6 ml-8 text-xl">Personal Information</Text>

           <View className='mx-6'>
          <Input placeholder={"First Name"} />
          <Input placeholder={"Last Name"} />
          <Picker
            style={{
              backgroundColor: "#f0f0f0",
              color: "blue",
              width: 340,
              alignSelf: "center",
              marginBottom: 12,
            }}
          >
            <Picker.Item label="Gender" />
            <Picker.Item label="M" value="M" />
            <Picker.Item label="F" value="F" />
          </Picker>
          <Input placeholder={"Location"} />

          <Text className="mt-8 mb-6 ml-8 text-xl">other Information</Text>

          <Input placeholder={"about your self"} />
          <Picker
            style={{
              backgroundColor: "#f0f0f0",
              color: "blue",
              width: 340,
              alignSelf: "center",
              marginBottom: 12,
            }}
          >
            <Picker.Item label="Language Spoken" />
            <Picker.Item label="Amharic" value="M" />
            <Picker.Item label="English" value="F" />
          </Picker>
          <Input placeholder={"area of experience"} />
          <Input placeholder={"experience"} />
          <Input placeholder={"experience"} />
          </View>

          <TouchableOpacity className="flex flex-row items-center justify-center py-4 mx-20 mt-12 mb-4 rounded-full bg-lime-300 gap-x-1">
            <Text className="font-bold text-black">Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
