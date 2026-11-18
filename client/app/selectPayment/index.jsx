import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  return (
    <SafeAreaView>
        <ScrollView>
            <View className='pb-8'>
      <View className="flex flex-row items-center mt-8 ml-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center w-12 h-12 border-[0.3px] border-gray-500 rounded-full"
        >
          <MaterialIcons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text className="ml-5 text-2xl font-bold text-slate-900">
          Select payment
        </Text>
      </View>

      <View className="flex flex-row items-center justify-between mx-4 mt-6">
        <View className="items-center justify-center h-16 border border-gray-600 w-28 rounded-2xl">
          <Image
            className="w-12 h-8"
            source={require("../../assets/images/creditcard.png")}
          />
        </View>

        <View className="items-center justify-center h-16 border border-gray-600 w-28 rounded-2xl">
          <Image
            className="h-5 w-29"
            source={require("../../assets/images/paypal.png")}
          />
        </View>

        <View className="items-center justify-center h-16 border border-gray-600 w-28 rounded-2xl">
          <Image
            className="w-16 h-6"
            source={require("../../assets/images/applepay.png")}
          />
        </View>
      </View>

      <View className="self-center mt-6">
        <Image
          className="w-auto h-52 rounded-xl"
          source={require("../../assets/images/bigcard.png")}
        />
      </View>

      <Image
        className="self-center w-48 h-auto mt-2 rounded-xl"
        source={require("../../assets/images/next.png")}
      />

      <Text className="mt-8 ml-6 text-xl text-slate-600">Card Number</Text>
      <TextInput
        style={{
          borderBottomColor: "#64748b",
          borderBottomWidth: 1,
        }}
        className="py-4 pl-2 mx-6 text-xl rounded-lg "
        placeholder="1234 5678 1234 5678"
      ></TextInput>

      <View className="flex flex-row items-center mx-8 mt-8 ">
        <View className="flex-1">
          <Text className="text-xl text-slate-600">Name</Text>
          <TextInput
            style={{
              borderBottomColor: "#64748b",
              borderBottomWidth: 1,
              width: 130,
            }}
            className="text-xl rounded-lg "
          ></TextInput>
        </View>

        <View className="">
          <Text className="text-xl text-slate-600">Card ID</Text>
          <TextInput
            style={{
              borderBottomColor: "#64748b",
              borderBottomWidth: 1,
              width: 130,
            }}
            className="text-xl rounded-lg "
          ></TextInput>
        </View>
      </View>

      <View className="flex flex-row items-center mx-8 mt-8 ">
        <View className="flex-1">
          <Text className="text-xl text-slate-600">Expiration Date</Text>
          <TextInput
            style={{
              borderBottomColor: "#64748b",
              borderBottomWidth: 1,
              width: 130,
            }}
            className="text-xl rounded-lg "
          ></TextInput>
        </View>

        <View className="">
          <Text className="text-xl text-slate-600">CVV</Text>
          <TextInput
            style={{
              borderBottomColor: "#64748b",
              borderBottomWidth: 1,
              width: 130,
            }}
            className="text-xl rounded-lg "
          ></TextInput>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("../paymentSuccess")}
        className="flex flex-row items-center mx-8 justify-center py-[16px] rounded-lg  mt-14 gap-x-1 bg-[#B0E946]"
      >
        <Text className="text-xl font-bold text-black">Pay</Text>
      </TouchableOpacity>

      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
