import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <SafeAreaView className="flex-1 bg-white ">
        <ScrollView className=''>
      <View className="flex flex-row items-center mt-10 ml-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center w-10 h-10 border-[0.5px] border-gray-500 rounded-full"
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-5 text-2xl font-bold text-slate-900">
          Top-Rated Tour Guide
        </Text>
      </View>
      <View className="flex flex-col pb-3 mx-4 mt-6 mb-20 bg-gray-50 rounded-xl gap-y-3">
        <View className="p-3 mx-3 mt-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/abebe.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Abebe Kebede
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.4</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                Amharic, French
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">200</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">140</Text>
            </View>
          </View>
        </View>

        <View className="p-3 mx-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/alan.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Alan Robert
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.2</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                Amharic, English
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">160</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">102</Text>
            </View>
          </View>
        </View>

        <View className="p-3 mx-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/abebe.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Ran Williams
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.8</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                English, French
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">45</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">33</Text>
            </View>
          </View>
        </View>

        <View className="p-3 mx-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/abebe.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Abebe Kebede
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.4</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                Amharic, French
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">200</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">140</Text>
            </View>
          </View>
        </View>

        <View className="p-3 mx-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/abebe.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Abebe Kebede
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.4</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                Amharic, French
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">200</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">140</Text>
            </View>
          </View>
        </View>

        <View className="p-3 mx-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/abebe.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Abebe Kebede
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.4</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                Amharic, French
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">200</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">140</Text>
            </View>
          </View>
        </View>

        <View className="p-3 mx-3 bg-gray-100 rounded-xl">
          <View className="flex flex-row items-center gap-x-4">
            <Image
              className="rounded-lg"
              source={require("../../assets/images/abebe.png")}
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800">
                Abebe Kebede
              </Text>
              <Text className="text-sm">Historical Sites Specialist</Text>
            </View>

            <View className="flex flex-row px-1 bg-white rounded-md">
              <Text className="text-sm">4.4</Text>
              <Ionicons name="star" size={16} color="#FAC22F" />
            </View>
          </View>

          <View className="flex flex-row mt-5 gap-x-8">
            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Language Spoken</Text>
              <Text className="text-sm font-bold text-slate-800">
                Amharic, French
              </Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Completed Calls</Text>
              <Text className="text-sm font-bold text-slate-800">200</Text>
            </View>

            <View className="gap-y-1">
              <Text className="text-sm text-gray-600">Reviews</Text>
              <Text className="text-sm font-bold text-slate-800">140</Text>
            </View>
          </View>
        </View>
      </View>
    
    </ScrollView>
    </SafeAreaView>
  );
};

export default index;
