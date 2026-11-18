import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  return (
    <SafeAreaView className='flex-1'>
        <View className='relative flex-1 px-2 pt-20 mx-4 mt-20 mb-20 bg-gray-200 rounded-3xl'>
            <View className='absolute items-center justify-center w-28 h-24 bg-gray-200 rounded-full top-[-35] self-center'>
                <MaterialCommunityIcons name="checkbox-marked-circle" size={90} color="#A5ED47" />
            </View>
      <View className=''>
        <Text className='self-center text-3xl font-semibold'>Thank you!</Text>
        <Text className='self-center text-2xl text-slate-700'>Your transaction was successful</Text>
      </View>

      <View className="flex flex-row items-center justify-between mx-6 mt-12">
        <Text className="text-xl">Date</Text>
        <Text className="text-lg font-bold">01/24/2023</Text>
      </View>

      <View className="flex flex-row items-center justify-between mx-6 mt-4">
        <Text className="text-xl">Time</Text>
        <Text className="text-lg font-bold">10:15 AM</Text>
      </View>

      <View className="flex flex-row items-center justify-between mx-6 mt-4">
        <Text className="text-xl">To</Text>
        <Text className="text-lg font-bold">Sam Louis</Text>
      </View>

      <View className="border-gray-400 border-[0.5px] mt-4 mx-6" />

      <View className="flex flex-row items-center justify-between mx-6 mt-6">
        <Text className="text-2xl font-semibold">Total</Text>
        <Text className="text-2xl font-bold">$50.97</Text>
      </View>

      <View className="flex flex-row items-center px-4 py-3 mx-8 mt-8 bg-white gap-x-6 rounded-xl" >
        <Image 

        className='w-10 h-6'
        source={require('../../assets/images/master.png')}
        />
        <View>
          <Text className="text-xl font-semibold">Credit Card</Text>
          <Text className="text-lg ">Mastercard **78</Text>
        </View>
      </View>

      <View className="mx-6 mt-10 mb-10 border border-gray-400 border-dashed" />

      <View className="flex flex-row items-center justify-between mx-10 mt-10 gap-x-6" >
        <Image 

        className='w-40 h-20'
        source={require('../../assets/images/barcode.png')}
        />
        <View className='items-center justify-center h-16 border border-green-600 w-28 rounded-xl'>
          <Text className="text-2xl font-semibold">PAID</Text>
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default Index;
