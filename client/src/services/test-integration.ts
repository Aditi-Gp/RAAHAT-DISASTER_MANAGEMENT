/**
 * Example integration test for the API client
 * This file demonstrates how to use the API client in practice
 */

import { api, authExamples, sosExamples, tokenUtils } from "./index";
import type { CreateSOSRequest, LoginRequest } from "./types";

// Example 1: Authentication flow
export const testAuthFlow = async () => {
  try {
    // 1. Login
    const loginData: LoginRequest = {
      email: "test@example.com",
      password: "password123",
    };

    const authResponse = await authExamples.login(loginData);
    console.log("✅ Login successful:", authResponse.user.fullName);

    // 2. Token is automatically stored and will be used in subsequent requests
    console.log("✅ Token stored:", tokenUtils.isAuthenticated());

    // 3. Get user profile (requires authentication)
    const userProfile = await authExamples.getProfile();
    console.log("✅ Profile fetched:", userProfile.email);

    return true;
  } catch (error) {
    console.error("❌ Auth flow failed:", error);
    return false;
  }
};

// Example 2: SOS operations
export const testSOSFlow = async () => {
  try {
    // Must be authenticated first
    if (!tokenUtils.isAuthenticated()) {
      throw new Error("Must be logged in to create SOS alerts");
    }

    // 1. Create SOS alert
    const sosData: CreateSOSRequest = {
      location: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      address: "New York, NY",
      emergencyType: "medical",
      description: "Medical emergency - chest pain",
      priority: "high",
    };

    const sosAlert = await sosExamples.createSOS(sosData);
    console.log("✅ SOS created:", sosAlert._id);

    // 2. Get user's SOS alerts
    const userAlerts = await sosExamples.getUserSOS();
    console.log("✅ User alerts fetched:", userAlerts.length);

    return true;
  } catch (error) {
    console.error("❌ SOS flow failed:", error);
    return false;
  }
};

// Example 3: Direct API calls
export const testDirectAPI = async () => {
  try {
    // Example of making direct API calls

    // GET request
    const response = await api.get("/disasters", {
      params: { page: 1, limit: 10 },
    });
    console.log("✅ Disasters fetched:", response.data);

    // POST request (if authenticated)
    if (tokenUtils.isAuthenticated()) {
      const newPost = await api.post("/posts", {
        title: "Test Post",
        content: "This is a test post",
      });
      console.log("✅ Post created:", newPost.data);
    }

    return true;
  } catch (error) {
    console.error("❌ Direct API test failed:", error);
    return false;
  }
};

// Example 4: Error handling
export const testErrorHandling = async () => {
  try {
    // This should fail with 401 if not authenticated
    await api.get("/auth/profile");
    console.log("✅ Profile request succeeded");
  } catch (error) {
    // The interceptor should handle 401 and redirect/logout
    console.log("✅ Error handling worked:", error);
  }
};

// Complete integration test
export const runAllTests = async () => {
  console.log("🚀 Starting API Client Integration Tests...\n");

  // Test 1: Authentication
  console.log("📝 Test 1: Authentication Flow");
  const authSuccess = await testAuthFlow();

  if (authSuccess) {
    // Test 2: SOS (requires auth)
    console.log("\n📝 Test 2: SOS Operations");
    await testSOSFlow();

    // Test 3: Direct API calls
    console.log("\n📝 Test 3: Direct API Calls");
    await testDirectAPI();
  }

  // Test 4: Error handling
  console.log("\n📝 Test 4: Error Handling");
  await testErrorHandling();

  console.log("\n✅ All tests completed!");
};

/**
 * Usage in a React component or development console:
 *
 * import { runAllTests } from '../services/test-integration';
 *
 * // Run tests
 * runAllTests();
 *
 * // Or test individual flows
 * testAuthFlow().then(success => {
 *   if (success) {
 *     testSOSFlow();
 *   }
 * });
 */
