import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Save,
  Eye,
  Camera,
  X,
  Plus,
  Tag,
  Globe,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateArticleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    body_richtext: "",
    hero_image: "",
    author: "",
    tags: [],
    featured: false,
    seo_title: "",
    seo_description: "",
  });

  const [newTag, setNewTag] = useState("");
  const [showSEO, setShowSEO] = useState(false);
  const [publishNow, setPublishNow] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: async (articleData) => {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData),
      });
      if (!response.ok) throw new Error("Failed to create article");
      return response.json();
    },
    onSuccess: (newArticle) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      Alert.alert(
        "Success",
        `Article "${newArticle.title}" has been ${publishNow ? "published" : "saved as draft"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create article. Please try again.");
      console.error("Create article error:", error);
    },
  });

  const handleSave = () => {
    if (!formData.title.trim() || !formData.body_richtext.trim()) {
      Alert.alert("Error", "Title and content are required fields.");
      return;
    }

    const articleData = {
      ...formData,
      publish_now: publishNow,
    };

    createArticleMutation.mutate(articleData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
              Create Article
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={createArticleMutation.isPending}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: createArticleMutation.isPending
                ? "#374151"
                : "#C6A15B",
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              opacity: createArticleMutation.isPending ? 0.6 : 1,
            }}
          >
            <Save size={16} color="#111214" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
                marginLeft: 4,
              }}
            >
              {createArticleMutation.isPending ? "Saving..." : "Save"}
            </Text>
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
          Create a new magazine article
        </Text>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginTop: 20,
              marginBottom: 16,
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
              Basic Information
            </Text>

            {/* Title */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Title *
              </Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => {
                  setFormData((prev) => ({
                    ...prev,
                    title: text,
                    slug: prev.slug === "" ? generateSlug(text) : prev.slug,
                    seo_title: prev.seo_title === "" ? text : prev.seo_title,
                  }));
                }}
                placeholder="Enter article title..."
                placeholderTextColor="#6B7280"
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>

            {/* Slug */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                URL Slug
              </Text>
              <TextInput
                value={formData.slug}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, slug: text }))
                }
                placeholder="article-url-slug"
                placeholderTextColor="#6B7280"
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>

            {/* Author */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Author
              </Text>
              <TextInput
                value={formData.author}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, author: text }))
                }
                placeholder="Author name"
                placeholderTextColor="#6B7280"
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>

            {/* Featured Toggle */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                }}
              >
                Featured Article
              </Text>
              <Switch
                value={formData.featured}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, featured: value }))
                }
                trackColor={{ false: "#374151", true: "#C6A15B" }}
                thumbColor="#F7F7F5"
              />
            </View>

            {/* Publish Now Toggle */}
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
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                }}
              >
                Publish Immediately
              </Text>
              <Switch
                value={publishNow}
                onValueChange={setPublishNow}
                trackColor={{ false: "#374151", true: "#22C55E" }}
                thumbColor="#F7F7F5"
              />
            </View>
          </View>

          {/* Hero Image */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
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
              Hero Image
            </Text>

            {formData.hero_image ? (
              <View style={{ marginBottom: 16 }}>
                <Image
                  source={{ uri: formData.hero_image }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, hero_image: "" }))
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#EF444420",
                    borderRadius: 8,
                    paddingVertical: 8,
                  }}
                >
                  <X size={16} color="#EF4444" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#EF4444",
                      marginLeft: 4,
                    }}
                  >
                    Remove Image
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  borderWidth: 2,
                  borderColor: "#374151",
                  borderStyle: "dashed",
                  borderRadius: 8,
                  paddingVertical: 40,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Camera size={32} color="#6B7280" style={{ marginBottom: 8 }} />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Tap to add hero image
                </Text>
              </TouchableOpacity>
            )}

            <TextInput
              value={formData.hero_image}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, hero_image: text }))
              }
              placeholder="Or enter image URL..."
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "#374151",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
              }}
            />
          </View>

          {/* Content */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
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

            {/* Summary */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Summary
              </Text>
              <TextInput
                value={formData.summary}
                onChangeText={(text) => {
                  setFormData((prev) => ({
                    ...prev,
                    summary: text,
                    seo_description:
                      prev.seo_description === "" ? text : prev.seo_description,
                  }));
                }}
                placeholder="Brief summary of the article..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Body Content */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Content *
              </Text>
              <TextInput
                value={formData.body_richtext}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, body_richtext: text }))
                }
                placeholder="Write your article content here..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={10}
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  textAlignVertical: "top",
                  minHeight: 200,
                }}
              />
            </View>
          </View>

          {/* Tags */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
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
              Tags
            </Text>

            {/* Existing Tags */}
            {formData.tags.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {formData.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#C6A15B20",
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
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
                        marginHorizontal: 6,
                      }}
                    >
                      {tag}
                    </Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <X size={12} color="#C6A15B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add New Tag */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag..."
                placeholderTextColor="#6B7280"
                style={{
                  flex: 1,
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  marginRight: 8,
                }}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity
                onPress={handleAddTag}
                style={{
                  backgroundColor: "#C6A15B",
                  borderRadius: 8,
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Plus size={20} color="#111214" />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEO Settings */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 30,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowSEO(!showSEO)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: showSEO ? 16 : 0,
              }}
            >
              <Globe size={20} color="#C6A15B" />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginLeft: 8,
                  flex: 1,
                }}
              >
                SEO Settings
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: "#6B7280",
                }}
              >
                {showSEO ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>

            {showSEO && (
              <View>
                {/* SEO Title */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#F7F7F5",
                      marginBottom: 8,
                    }}
                  >
                    SEO Title
                  </Text>
                  <TextInput
                    value={formData.seo_title}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, seo_title: text }))
                    }
                    placeholder="SEO optimized title..."
                    placeholderTextColor="#6B7280"
                    style={{
                      backgroundColor: "#374151",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#F7F7F5",
                    }}
                  />
                </View>

                {/* SEO Description */}
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#F7F7F5",
                      marginBottom: 8,
                    }}
                  >
                    SEO Description
                  </Text>
                  <TextInput
                    value={formData.seo_description}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        seo_description: text,
                      }))
                    }
                    placeholder="Meta description for search engines..."
                    placeholderTextColor="#6B7280"
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: "#374151",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#F7F7F5",
                      textAlignVertical: "top",
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
