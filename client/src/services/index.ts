// Export the main API client
export { api, default as apiClient, tokenUtils } from "./apiClient";

// Export API types
export * from "./types";

// Export usage examples
export * from "./examples";

// Export file upload service
export { default as fileUploadService } from "./fileUpload";

// Re-export specific services (to be created later)
// export * from './authService';
// export * from './sosService';
// export * from './disasterService';
// export * from './adminService';
