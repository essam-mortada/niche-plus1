import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Sparkles, Send } from "lucide-react-native";
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
import { useState } from "react";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { apiPost } from "@/utils/api";

export default function ConciergeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    service_type: "",
    description: "",
    budget_range: "",
    contact_preference: "email",
    phone_number: "",
  });

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const serviceTypes = [
    "Interior Design",
    "Architecture Consultation",
    "Art Curation",
    "Event Planning",
    "Property Styling",
    "Custom Design",
    "Other",
  ];

  const budgetRanges = [
    "Under $10,000",
    "$10,000 - $50,000",
    "$50,000 - $100,000",
    "$100,000 - $500,000",
    "Over $500,000",
    "To be discussed",
  ];

  const handleSubmit = async () => {
    if (!formData.service_type || !formData.description) {
      Alert.alert(
        "Missing Information",
        "Please select a service type and provide a description.",
      );
      return;
    }

    if (formData.contact_preference === "phone" && !formData.phone_number) {
      Alert.alert(
        "Missing Information",
        "Please provide your phone number for phone contact preference.",
      );
      return;
    }

    try {
      setLoading(true);

      await apiPost("/api/requests", formData);

      Alert.alert(
        "Request Submitted",
        "Your concierge request has been submitted successfully. Our team will contact you within 24 hours.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Error submitting request:", error);
      Alert.alert("Error", "Failed to submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
                Concierge Service
              </Text>
            </View>

            <Sparkles size={24} color="#C6A15B" />
          </View>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
              lineHeight: 22,
            }}
          >
            Tell us about your luxury design project and we'll connect you with
            the perfect professionals.
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Type */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Service Type *
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {serviceTypes.map((service) => (
                <TouchableOpacity
                  key={service}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, service_type: service }))
                  }
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor:
                      formData.service_type === service ? "#C6A15B" : "#2A2D34",
                    borderWidth: 1,
                    borderColor:
                      formData.service_type === service ? "#C6A15B" : "#2A2D34",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color:
                        formData.service_type === service
                          ? "#111214"
                          : "#F7F7F5",
                    }}
                  >
                    {service}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Project Description *
            </Text>

            <TextInput
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Describe your project, requirements, timeline, and any specific preferences..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                textAlignVertical: "top",
                minHeight: 120,
              }}
            />
          </View>

          {/* Budget Range */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Budget Range
            </Text>

            <View style={{ gap: 8 }}>
              {budgetRanges.map((budget) => (
                <TouchableOpacity
                  key={budget}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, budget_range: budget }))
                  }
                  style={{
                    backgroundColor: "#2A2D34",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor:
                      formData.budget_range === budget ? "#C6A15B" : "#2A2D34",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color:
                        formData.budget_range === budget
                          ? "#C6A15B"
                          : "#F7F7F5",
                    }}
                  >
                    {budget}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Preference */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Preferred Contact Method
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    contact_preference: "email",
                  }))
                }
                style={{
                  flex: 1,
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor:
                    formData.contact_preference === "email"
                      ? "#C6A15B"
                      : "#2A2D34",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color:
                      formData.contact_preference === "email"
                        ? "#C6A15B"
                        : "#F7F7F5",
                    textAlign: "center",
                  }}
                >
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    contact_preference: "phone",
                  }))
                }
                style={{
                  flex: 1,
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor:
                    formData.contact_preference === "phone"
                      ? "#C6A15B"
                      : "#2A2D34",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color:
                      formData.contact_preference === "phone"
                        ? "#C6A15B"
                        : "#F7F7F5",
                    textAlign: "center",
                  }}
                >
                  Phone
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number (if phone preference selected) */}
          {formData.contact_preference === "phone" && (
            <View style={{ marginTop: 16 }}>
              <TextInput
                value={formData.phone_number}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone_number: text }))
                }
                placeholder="Your phone number"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
            paddingTop: 20,
            backgroundColor: "#111214",
            borderTopWidth: 1,
            borderTopColor: "#2A2D34",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#6B7280" : "#C6A15B",
              borderRadius: 12,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send size={20} color="#111214" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
              }}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
