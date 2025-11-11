import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  User,
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
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminArticlesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch articles
  const { data: articlesData, refetch } = useQuery({
    queryKey: ["admin-articles", currentPage, searchQuery, selectedFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedFilter && {
          [selectedFilter.split(":")[0]]: selectedFilter.split(":")[1],
        }),
      });

      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async ({ articleId, hardDelete = false }) => {
      const url = hardDelete
        ? `/api/articles/${articleId}?hard=true`
        : `/api/articles/${articleId}`;
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });

  // Restore article mutation
  const restoreArticleMutation = useMutation({
    mutationFn: async (articleId) => {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      if (!response.ok) throw new Error("Failed to restore article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteArticle = (article) => {
    Alert.alert(
      "Delete Article",
      `Are you sure you want to delete "${article.title}"? This will move it to trash.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteArticleMutation.mutate({ articleId: article.id }),
        },
      ],
    );
  };

  const handlePermanentDelete = (article) => {
    Alert.alert(
      "Permanently Delete Article",
      `Are you sure you want to permanently delete "${article.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () =>
            deleteArticleMutation.mutate({
              articleId: article.id,
              hardDelete: true,
            }),
        },
      ],
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Draft";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const filterOptions = [
    { value: "", label: "All Articles" },
    { value: "published:true", label: "Published" },
    { value: "published:false", label: "Drafts" },
    { value: "featured:true", label: "Featured" },
  ];

  const articles = articlesData?.articles || [];
  const pagination = articlesData?.pagination || {};

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
              Article Management
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/admin/articles/create")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#C6A15B",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={20} color="#111214" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Create and manage magazine articles
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search articles..."
            placeholderTextColor="#6B7280"
            style={{
              flex: 1,
              marginLeft: 12,
              paddingVertical: 12,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#F7F7F5",
            }}
          />
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedFilter(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor:
                  selectedFilter === option.value ? "#C6A15B" : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color:
                    selectedFilter === option.value ? "#111214" : "#F7F7F5",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#F7F7F5",
            }}
          >
            {pagination.total || 0}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Total Articles
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 16,
            marginLeft: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#F7F7F5",
            }}
          >
            {articles.filter((a) => a.published_at).length}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Published
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
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
        {/* Article List */}
        {articles.map((article) => (
          <View
            key={article.id}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              {/* Featured Image */}
              {article.hero_image && (
                <Image
                  source={{ uri: article.hero_image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  contentFit="cover"
                  transition={200}
                />
              )}

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      flex: 1,
                      marginRight: 8,
                    }}
                    numberOfLines={2}
                  >
                    {article.title}
                  </Text>

                  {article.featured && (
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  )}
                </View>

                {article.summary && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      marginBottom: 8,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {article.summary}
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {article.author && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <User size={12} color="#6B7280" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "Inter_400Regular",
                            color: "#6B7280",
                            marginLeft: 4,
                          }}
                        >
                          {article.author}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Calendar size={12} color="#6B7280" />
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

                  <View
                    style={{
                      backgroundColor: article.published_at
                        ? "#22C55E20"
                        : "#6B728020",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_600SemiBold",
                        color: article.published_at ? "#22C55E" : "#6B7280",
                      }}
                    >
                      {article.published_at ? "Published" : "Draft"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#374151",
              }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/articles/${article.id}`)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: "#374151",
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Eye size={14} color="#9CA3AF" />
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_600SemiBold",
                      color: "#9CA3AF",
                      marginLeft: 4,
                    }}
                  >
                    View
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    router.push(`/admin/articles/edit/${article.id}`)
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: "#C6A15B20",
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Edit size={14} color="#C6A15B" />
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_600SemiBold",
                      color: "#C6A15B",
                      marginLeft: 4,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteArticle(article)}
                disabled={deleteArticleMutation.isPending}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#EF444420",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: deleteArticleMutation.isPending ? 0.6 : 1,
                }}
              >
                <Trash2 size={14} color="#EF4444" />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                    color: "#EF4444",
                    marginLeft: 4,
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: currentPage === 1 ? "#374151" : "#C6A15B",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: currentPage === 1 ? "#6B7280" : "#111214",
                }}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
              }}
            >
              Page {currentPage} of {pagination.pages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              disabled={currentPage === pagination.pages}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  currentPage === pagination.pages ? "#374151" : "#C6A15B",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color:
                    currentPage === pagination.pages ? "#6B7280" : "#111214",
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <FileText size={48} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No articles found
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
              Create your first article to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
