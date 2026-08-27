
From your Cloudinary Dashboard, copy these values:

- **Cloud Name** (e.g., `raahat-emergency`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Configure Environment Variables

Update your `/server/.env` file:

```properties
# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

### 4. Folder Structure in Cloudinary

The system automatically creates these folders:

- `raahat/government-ids/` - For volunteer ID documents
- `raahat/uploads/` - For general file uploads

## 🧪 Testing the Upload System

### Backend Health Check

```bash
curl http://localhost:5000/api/upload/health
```

Expected response:

```json
{
  "success": true,
  "message": "Upload service is running",
  "services": {
    "cloudinary": true,
    "multer": true
  },
  "limits": {
    "governmentId": "5MB",
    "generalFile": "10MB"
  }
}
```

### Test File Upload (with authentication)

```bash
# First login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.data.token')

# Upload government ID
curl -X POST http://localhost:5000/api/upload/government-id \
  -H "Authorization: Bearer $TOKEN" \
  -F "governmentId=@/path/to/your/test-image.jpg"
```

## 📁 File Upload Features

### Supported Formats

- **Government IDs**: JPG, JPEG, PNG, PDF
- **General Files**: JPG, JPEG, PNG, PDF, DOC, DOCX

### File Size Limits

- **Government IDs**: 5MB maximum
- **General Files**: 10MB maximum

### Automatic Optimizations

- Images are automatically optimized for web delivery
- Maximum dimensions: 1000x1000px
- Quality: Auto (Cloudinary optimizes based on content)

### Security Features

- Authentication required for all uploads
- File type validation
- File size validation
- Automatic virus scanning (Cloudinary feature)

## 🔧 Frontend Integration

### Import the Service

```typescript
import { fileUploadService } from "@/services";
```

### Upload Government ID

```typescript
try {
  const result = await fileUploadService.uploadGovernmentId(file);
  console.log("Upload successful:", result.url);
} catch (error) {
  console.error("Upload failed:", error);
}
```

### File Validation

```typescript
const validation = fileUploadService.validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
});

if (!validation.isValid) {
  console.error("Validation failed:", validation.error);
}
```

## 📊 Monitoring & Management

### Cloudinary Dashboard

- View all uploaded files
- Monitor storage usage
- Access transformation logs
- Manage file access permissions

### File URLs

Uploaded files get permanent URLs like:

```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/raahat/government-ids/sample.jpg
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit real Cloudinary credentials to version control
2. **File Validation**: Always validate files on both frontend and backend
3. **Authentication**: Require authentication for all uploads
4. **Folder Structure**: Use organized folder structure for different file types
5. **URL Security**: Consider using signed URLs for sensitive documents

## 🚨 Troubleshooting

### Common Issues

1. **Upload fails with 401**: Check if Cloudinary credentials are correct
2. **File too large**: Ensure file is under size limits
3. **Invalid file type**: Check if file format is supported
4. **Network timeout**: Increase timeout for large files

### Debug Mode

Enable debug logging in your `.env`:

```properties
NODE_ENV=development
```

This will show detailed error messages in the console.

## 📈 Scaling Considerations

### Free Tier Limits

- Storage: 25GB
- Bandwidth: 25GB/month
- Transformations: 25,000/month

### Upgrade Path

Consider upgrading when you approach limits:

- More storage and bandwidth
- Advanced transformation features
- Video upload support
- Custom domain support
