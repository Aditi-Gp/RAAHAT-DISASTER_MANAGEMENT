# API Client Service

This directory contains the central API service layer for connecting the React client to the Express server.

## Files Overview

- `apiClient.ts` - Main axios configuration with JWT token handling
- `types.ts` - TypeScript interfaces for API requests and responses
- `examples.ts` - Usage examples for common API operations
- `index.ts` - Central export file for clean imports

## Quick Start

### 1. Import the API client

```typescript
import { api, tokenUtils } from "../services";
```

### 2. Make API calls

```typescript
// GET request
const response = await api.get<ApiResponse<User>>("/auth/profile");

// POST request
const loginResponse = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
  email: "user@example.com",
  password: "password",
});
```

### 3. Token management

```typescript
// Set token after login
tokenUtils.setToken("your-jwt-token");

// Check if user is authenticated
if (tokenUtils.isAuthenticated()) {
  // User is logged in
}

// Remove token on logout
tokenUtils.removeToken();
```

## Features

### Automatic JWT Token Injection

- Automatically adds `Authorization: Bearer <token>` header to all requests
- Retrieves token from localStorage
- No need to manually add authorization headers

### Error Handling

- Automatic logout on 401 (Unauthorized) responses
- Centralized error handling with proper TypeScript types
- Helper function for extracting error messages

### Environment Configuration

- Uses `VITE_API_BASE_URL` environment variable
- Falls back to `http://localhost:5000/api` if not set
- 10-second timeout for all requests

### Type Safety

- Full TypeScript support with proper interfaces
- Strongly typed API responses
- IntelliSense support for all API operations

## Usage Examples

### Authentication

```typescript
import { authExamples } from "../services";

// Login
try {
  const authData = await authExamples.login({
    email: "user@example.com",
    password: "password",
  });
  console.log("Login successful:", authData);
} catch (error) {
  console.error("Login failed:", error);
}

// Get user profile
const user = await authExamples.getProfile();
```

### SOS Operations

```typescript
import { sosExamples } from "../services";

// Create SOS alert
const sos = await sosExamples.createSOS({
  location: { latitude: 40.7128, longitude: -74.006 },
  emergencyType: "medical",
  description: "Medical emergency",
  priority: "high",
});

// Get user's SOS alerts
const userAlerts = await sosExamples.getUserSOS();
```

### Disaster Events

```typescript
import { disasterExamples } from "../services";

// Get all disaster events
const disasters = await disasterExamples.getDisasterEvents(1, 10);

// Get nearby disasters
const nearbyDisasters = await disasterExamples.getDisasterEventsByLocation(
  40.7128, // latitude
  -74.006, // longitude
  50 // radius in km
);
```

## Error Handling

```typescript
import { handleApiError } from "../services";

try {
  const response = await api.get("/some-endpoint");
} catch (error) {
  const errorMessage = handleApiError(error);
  console.error("API Error:", errorMessage);
  // Display error to user
}
```

## Environment Setup

Make sure your `.env` file contains:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Integration with React Components

```typescript
import React, { useState } from "react";
import { authExamples, handleApiError } from "../services";

const LoginComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const authData = await authExamples.login({ email, password });
      // Handle successful login
      console.log("Login successful:", authData);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

## Next Steps

You can now use this API client throughout your React application to communicate with the backend. Consider creating specific service files for different domains (e.g., `authService.ts`, `sosService.ts`) as your application grows.
