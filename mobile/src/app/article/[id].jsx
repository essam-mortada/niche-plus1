import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Share2, Calendar, User, Tag } from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const { width } = Dimensions.get("window");

export default function ArticleDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [imageHeight, setImageHeight] = useState(250);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch article details
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) throw new Error("Failed to fetch article");
      return response.json();
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article?.title}\n\n${article?.summary}`,
        title: article?.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onImageLoad = (event) => {
    const { width: imgWidth, height: imgHeight } = event.source;
    const aspectRatio = imgHeight / imgWidth;
    setImageHeight(width * aspectRatio);
  };

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111214",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          Loading article...
        </Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111214",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Article Not Found
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          The article you're looking for doesn't exist or has been removed.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111214" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(17, 18, 20, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} color="#F7F7F5" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(17, 18, 20, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Share2 size={18} color="#F7F7F5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {article.hero_image && (
          <Image
            source={{ uri: article.hero_image }}
            style={{
              width: "100%",
              height: Math.min(imageHeight, 350),
            }}
            contentFit="cover"
            transition={300}
            onLoad={onImageLoad}
          />
        )}

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 16,
                gap: 8,
              }}
            >
              {article.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#2A2D34",
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Tag size={12} color="#C6A15B" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#C6A15B",
                      marginLeft: 4,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              lineHeight: 36,
              marginBottom: 16,
            }}
          >
            {article.title}
          </Text>

          {/* Meta Information */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {article.author && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <User size={14} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_500Medium",
                    color: "#9CA3AF",
                    marginLeft: 6,
                  }}
                >
                  {article.author}
                </Text>
              </View>
            )}

            {article.published_at && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Calendar size={14} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                    marginLeft: 6,
                  }}
                >
                  {formatDate(article.published_at)}
                </Text>
              </View>
            )}
          </View>

          {/* Summary */}
          {article.summary && (
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_400Regular",
                color: "#C6A15B",
                lineHeight: 26,
                marginBottom: 24,
                fontStyle: "italic",
              }}
            >
              {article.summary}
            </Text>
          )}

          {/* Body Content */}
          {article.body_richtext && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  lineHeight: 26,
                }}
              >
                {article.body_richtext.replace(/<[^>]*>/g, "")}
              </Text>
            </View>
          )}

          {/* Publication Info */}
          {article.issue && (
            <View
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                  marginBottom: 4,
                }}
              >
                Featured in Magazine Issue
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                {article.issue.title}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
