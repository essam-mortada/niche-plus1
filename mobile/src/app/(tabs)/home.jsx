import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Clock, ArrowRight } from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch featured articles
  const { data: articlesData, refetch } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles?published=true");
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      return response.json();
    },
  });

  const articles = articlesData?.articles || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleArticlePress = (articleId) => {
    router.push(`/article/${articleId}`);
  };

  if (!fontsLoaded) {
    return null;
  }

  const featuredArticles = articles.filter((article) => article.featured);
  const regularArticles = articles.filter((article) => !article.featured);

  return (
    <View style={{ flex: 1, backgroundColor: "#111214" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "#111214",
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 4,
          }}
        >
          Niche<Text style={{ color: "#C6A15B" }}>+</Text>
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          Luxury lifestyle platform
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C6A15B"
            colors={["#C6A15B"]}
          />
        }
      >
        {featuredArticles.length > 0 && (
          <>
            {/* Featured Stories Section */}
            <View style={{ paddingLeft: 20, marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 16,
                }}
              >
                Featured Stories
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 40 }}
              >
                {featuredArticles.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    onPress={() => handleArticlePress(article.id)}
                    style={{
                      width: screenWidth * 0.8,
                      marginRight: 16,
                      backgroundColor: "#2A2D34",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: article.hero_image }}
                      style={{
                        width: "100%",
                        height: 200,
                      }}
                      contentFit="cover"
                      transition={300}
                    />
                    <View style={{ padding: 16 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "PlayfairDisplay_700Bold",
                          color: "#F7F7F5",
                          marginBottom: 8,
                          lineHeight: 24,
                        }}
                        numberOfLines={2}
                      >
                        {article.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                          lineHeight: 20,
                          marginBottom: 12,
                        }}
                        numberOfLines={2}
                      >
                        {article.excerpt}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Inter_500Medium",
                            color: "#C6A15B",
                          }}
                        >
                          {article.author}
                        </Text>
                        <ArrowRight size={16} color="#C6A15B" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Latest News Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Latest News
          </Text>

          {regularArticles.length > 0 ? (
            regularArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => handleArticlePress(article.id)}
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  flexDirection: "row",
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: article.hero_image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  contentFit="cover"
                  transition={300}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "PlayfairDisplay_700Bold",
                      color: "#F7F7F5",
                      marginBottom: 6,
                      lineHeight: 20,
                    }}
                    numberOfLines={2}
                  >
                    {article.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      lineHeight: 18,
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                  >
                    {article.excerpt}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Clock size={12} color="#6B7280" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Inter_400Regular",
                        color: "#6B7280",
                        marginLeft: 4,
                      }}
                    >
                      {new Date(article.published_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 40,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Welcome to Niche+
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Your luxury lifestyle magazine
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
