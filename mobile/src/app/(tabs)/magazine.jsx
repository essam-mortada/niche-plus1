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
import { Clock, BookOpen, ArrowRight } from "lucide-react-native";
import {
  useFonts,
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

export default function MagazineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch articles for magazine view
  const { data: articles = [], refetch } = useQuery({
    queryKey: ["magazine-articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReadArticle = (article) => {
    router.push(`/article/${article.id}`);
  };

  if (!fontsLoaded) {
    return null;
  }

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
          borderBottomWidth: 1,
          borderBottomColor: "#2A2D34",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 4,
          }}
        >
          Magazine
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          The Ultimate Design & Architecture Journal
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
        {articles.length > 0 ? (
          <>
            {/* Latest Issue Hero */}
            {articles[0] && (
              <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "PlayfairDisplay_700Bold",
                    color: "#F7F7F5",
                    marginTop: 20,
                    marginBottom: 16,
                  }}
                >
                  Latest Issue
                </Text>

                <TouchableOpacity
                  onPress={() => handleReadArticle(articles[0])}
                  style={{
                    backgroundColor: "#2A2D34",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: articles[0].featured_image }}
                    style={{
                      width: "100%",
                      height: 240,
                    }}
                    contentFit="cover"
                    transition={300}
                  />

                  <View style={{ padding: 20 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_600SemiBold",
                          color: "#C6A15B",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Featured Article
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
                          {formatDate(articles[0].published_at)}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        fontSize: 22,
                        fontFamily: "PlayfairDisplay_700Bold",
                        color: "#F7F7F5",
                        lineHeight: 28,
                        marginBottom: 12,
                      }}
                    >
                      {articles[0].title}
                    </Text>

                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                        lineHeight: 22,
                        marginBottom: 16,
                      }}
                    >
                      {articles[0].excerpt}
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
                          fontSize: 13,
                          fontFamily: "Inter_500Medium",
                          color: "#C6A15B",
                        }}
                      >
                        By {articles[0].author}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_600SemiBold",
                            color: "#C6A15B",
                            marginRight: 6,
                          }}
                        >
                          Read More
                        </Text>
                        <ArrowRight size={14} color="#C6A15B" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* All Articles */}
            <View style={{ paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 16,
                }}
              >
                All Articles
              </Text>

              {articles.map((article, index) => (
                <TouchableOpacity
                  key={article.id}
                  onPress={() => handleReadArticle(article)}
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
                    source={{ uri: article.featured_image }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      marginRight: 16,
                    }}
                    contentFit="cover"
                    transition={300}
                  />

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      {article.featured && (
                        <View
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                            backgroundColor: "#C6A15B20",
                            marginRight: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              fontFamily: "Inter_600SemiBold",
                              color: "#C6A15B",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Featured
                          </Text>
                        </View>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Clock size={11} color="#6B7280" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "Inter_400Regular",
                            color: "#6B7280",
                            marginLeft: 4,
                          }}
                        >
                          {formatDate(article.published_at)}
                        </Text>
                      </View>
                    </View>

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

                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_500Medium",
                        color: "#C6A15B",
                      }}
                    >
                      {article.author}
                    </Text>
                  </View>

                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: 8,
                    }}
                  >
                    <BookOpen size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginHorizontal: 20,
              marginTop: 40,
            }}
          >
            <BookOpen size={48} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Coming Soon
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
              The latest issue of Niche+ Magazine is being prepared for you
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
