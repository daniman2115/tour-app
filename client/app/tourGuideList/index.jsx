import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchGuides } from "../../services/apiService";

const GUIDE_AVATAR = require("../../assets/images/profile.jpg");

const GuideCard = ({ guide, onPress }) => {
  const name = guide.userId?.name ?? guide.name ?? "Guide";
  const image = guide.userId?.profileImage ?? guide.profileImage ?? null;
  const languages = (guide.languages || []).join(", ") || "—";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="p-3 mx-4 mb-3 bg-white rounded-2xl"
      style={{ elevation: 2, shadowColor: "#172B4D", shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
    >
      <View className="flex-row items-center gap-x-4">
        <Image
          className="w-16 h-16 rounded-xl"
          source={image ? { uri: image } : GUIDE_AVATAR}
        />

        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {guide.title || "Local Guide"}
          </Text>
        </View>

        <View className="flex-row items-center px-2 py-1 bg-[#FFF4D6] rounded-lg">
          <Text className="text-sm font-semibold text-[#9A6B00]">{guide.rating ?? "—"}</Text>
          <Ionicons name="star" size={14} color="#FAC22F" style={{ marginLeft: 3 }} />
        </View>
      </View>

      <View className="flex-row mt-4 gap-x-6">
        <View>
          <Text className="text-xs text-gray-500">Languages</Text>
          <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>
            {languages}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">Completed</Text>
          <Text className="text-sm font-semibold text-slate-800">
            {guide.completedCalls ?? 0} calls
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">Reviews</Text>
          <Text className="text-sm font-semibold text-slate-800">
            {guide.totalReviews ?? 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Index = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchGuides();
      setGuides(data);
    } catch (err) {
      console.warn("Failed to fetch guides:", err.message);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = guides.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (g.userId?.name ?? g.name ?? "").toLowerCase();
    return (
      name.includes(q) ||
      (g.location || "").toLowerCase().includes(q) ||
      (g.languages || []).some((l) => l.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-[#F7F9FC]">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="items-center justify-center w-10 h-10 bg-white rounded-full"
        >
          <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-2xl font-bold text-[#172B4D]">Tour Guides</Text>
          <Text className="mt-0.5 text-sm text-gray-500">{filtered.length} guides available</Text>
        </View>
      </View>

      {/* Search */}
      <View className="flex-row items-center px-4 mx-5 mb-4 bg-white rounded-2xl h-[52px]">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, location or language"
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-[15px] text-[#172B4D]"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id ?? item.id}
        renderItem={({ item }) => (
          <GuideCard
            guide={item}
            onPress={() => router.push(`/guide/${item._id ?? item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />
        }
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        ListEmptyComponent={
          <View className="items-center px-10 mt-14">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-[#F0F7E8]">
              <Ionicons name="people-outline" size={36} color="#578A2B" />
            </View>
            <Text className="mt-5 text-lg font-bold text-[#172B4D]">No guides found</Text>
            <Text className="mt-1 text-sm text-center text-gray-500">Try a different search term.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Index;
