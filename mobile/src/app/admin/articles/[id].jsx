import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Calendar,
  User,
  Tag,
  Globe,
  Eye,
  Loader,
  Share,
} from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ViewArticleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch article data
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) throw new Error("Failed to fetch article");
      return response.json();
    },
    enabled: !!id,
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async ({ hardDelete = false }) => {
      const url = hardDelete
        ? `/api/articles/${id}?hard=true`
        : `/api/articles/${id}`;
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      Alert.alert("Success", "Article deleted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to delete article. Please try again.");
      console.error("Delete article error:", error);
    },
  });

  const handleDeleteArticle = () => {
    Alert.alert(
      "Delete Article",
      `Are you sure you want to delete "${article.title}"? This will move it to trash.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteArticleMutation.mutate({}),
        },
      ],
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Draft";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <StatusBar style="light" />
        <Loader size={32} color="#C6A15B" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_500Medium",
            color: "#9CA3AF",
            marginTop: 16,
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
        }}
      >
        <StatusBar style="light" />
        <Text
          style={{
            fontSize: 18,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
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
          The article you're looking for doesn't exist.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#C6A15B",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#111214",
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tags = Array.isArray(article.tags) ? article.tags : [];

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#2A2D34",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <ArrowLeft size={20} color="#F7F7F5" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
              }}
            >
              Article Details
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push(`/admin/articles/edit/${article.id}`)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#C6A15B",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Edit size={20} color="#111214" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteArticle}
              disabled={deleteArticleMutation.isPending}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#EF4444",
                justifyContent: "center",
                alignItems: "center",
                opacity: deleteArticleMutation.isPending ? 0.6 : 1,
              }}
            >
              <Trash2 size={20} color="#F7F7F5" />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Article ID: {article.id}
          </Text>

          <View
            style={{
              backgroundColor: article.published_at ? "#22C55E20" : "#6B728020",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                color: article.published_at ? "#22C55E" : "#6B7280",
              }}
            >
              {article.published_at ? "Published" : "Draft"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {article.hero_image && (
          <View style={{ marginTop: 20, marginBottom: 24 }}>
            <Image
              source={{ uri: article.hero_image }}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
              }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}

        {/* Article Header */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                flex: 1,
                lineHeight: 36,
              }}
            >
              {article.title}
            </Text>
            {article.featured && (
              <Star
                size={24}
                color="#F59E0B"
                fill="#F59E0B"
                style={{ marginLeft: 12 }}
              />
            )}
          </View>

          {article.summary && (
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              {article.summary}
            </Text>
          )}

          {/* Meta Information */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {article.author && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <User size={16} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                    marginLeft: 6,
                  }}
                >
                  {article.author}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar size={16} color="#6B7280" />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#6B7280",
                  marginLeft: 6,
                }}
              >
                {formatDate(article.published_at || article.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Tags
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#C6A15B20",
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Tag size={12} color="#C6A15B" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#C6A15B",
                      marginLeft: 6,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Article Content */}
        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Content
          </Text>

          {article.body_richtext ? (
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                lineHeight: 24,
              }}
            >
              {article.body_richtext}
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                fontStyle: "italic",
              }}
            >
              No content available
            </Text>
          )}
        </View>

        {/* Technical Details */}
        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Technical Details
          </Text>

          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                }}
              >
                Slug
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  maxWidth: "60%",
                }}
                numberOfLines={1}
              >
                {article.slug || "No slug"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                }}
              >
                Status
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              >
                {article.status || "draft"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                }}
              >
                Created
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              >
                {formatDate(article.created_at)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                }}
              >
                Last Updated
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              >
                {formatDate(article.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* SEO Information */}
        {(article.seo_title || article.seo_description) && (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Globe size={20} color="#C6A15B" />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginLeft: 8,
                }}
              >
                SEO Information
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {article.seo_title && (
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#9CA3AF",
                      marginBottom: 4,
                    }}
                  >
                    SEO Title
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#F7F7F5",
                      lineHeight: 20,
                    }}
                  >
                    {article.seo_title}
                  </Text>
                </View>
              )}

              {article.seo_description && (
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#9CA3AF",
                      marginBottom: 4,
                    }}
                  >
                    SEO Description
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#F7F7F5",
                      lineHeight: 20,
                    }}
                  >
                    {article.seo_description}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push(`/admin/articles/edit/${article.id}`)}
            style={{
              flex: 1,
              backgroundColor: "#C6A15B",
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Edit size={18} color="#111214" />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
                marginLeft: 8,
              }}
            >
              Edit Article
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteArticle}
            disabled={deleteArticleMutation.isPending}
            style={{
              backgroundColor: "#EF444420",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              opacity: deleteArticleMutation.isPending ? 0.6 : 1,
            }}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
