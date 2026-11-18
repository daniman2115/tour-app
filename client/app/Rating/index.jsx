import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  return (
    <SafeAreaView className='flex-1'>
      <View className='bg-[#1F2327] flex-1'>
        <View className="py-20 mx-6 mt-20 rounded-3xl bg-[#262C36]">
          <Image
            source={require("../../assets/images/rating.png")}
            className="self-center w-32 h-32 rounded-full"
          />
          <Text className='self-center mt-1 text-lg text-white'>Jonathan David</Text>
          <Text className="self-center mt-16 text-xl font-semibold text-white ">Wow! A 5 star!</Text>
          <Text className="self-center mt-2 text-xl font-semibold text-center text-white">Wanna add tip for Anura?</Text>
           
           <View className='flex flex-row justify-center mt-16 gap-x-2'>
          <View className='px-3 py-4 bg-[#262C36]  shadow-xl rounded-xl shadow-gray-300/40'>
            <Text className='text-base font-bold text-white'>Rs.50</Text>
          </View>

           <View className='px-3 py-4 bg-[#262C36]  shadow-xl rounded-xl shadow-gray-300/40'>
            <Text className='text-base font-bold text-white'>Rs.50</Text>
          </View>

           <View className='px-3 py-4 bg-[#262C36]  shadow-xl rounded-xl shadow-gray-300/40'>
            <Text className='text-base font-bold text-white'>Rs.50</Text>
          </View>
          
           <View className='px-3 py-4 bg-[#262C36]  shadow-xl rounded-xl shadow-gray-300/40'>
            <Text className='text-base font-bold text-white'>Rs.50</Text>
          </View>
          </View>

          <TouchableOpacity className="items-center self-center justify-center py-5 mt-16 mb-4 rounded-lg px-28 bg-lime-300 ">
            <Text className="font-bold text-black">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Index;
