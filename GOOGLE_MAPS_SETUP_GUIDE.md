# Google Maps API Setup Guide

## The Error: DIRECTIONS_ROUTE_REQUEST_DENIED

This error occurs when the Google Maps API key doesn't have proper permissions to use the Directions service. Here's how to fix it:

## Step 1: Enable Directions API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services > Library**
4. Search for "Directions API"
5. Click on **Directions API** and click **ENABLE**

## Step 2: Check Your API Key

1. Go to **APIs & Services > Credentials**
2. Find your API key
3. Click the pencil icon to edit it

## Step 3: Configure API Key Restrictions

### Option A: No Restrictions (for development)

-   Under **Application restrictions**, select **None**
-   Under **API restrictions**, select **Don't restrict key**
-   Click **Save**

### Option B: HTTP Referrers (recommended for production)

-   Under **Application restrictions**, select **HTTP referrers (web sites)**
-   Add these referrers:
    -   `http://localhost:5174/*` (for Vite dev server)
    -   `http://localhost:3000/*` (for other dev servers)
    -   `https://yourdomain.com/*` (for production)
-   Under **API restrictions**, select **Restrict key**
-   Select these APIs:
    -   Maps JavaScript API
    -   Directions API
    -   Places API
    -   Geocoding API
-   Click **Save**

## Step 4: Enable Billing

⚠️ **Important**: The Directions API requires billing to be enabled, even for free tier usage.

1. Go to **Billing** in the Google Cloud Console
2. Link a billing account to your project
3. You get $200 free credits monthly for Google Maps

## Step 5: Check Quotas

1. Go to **APIs & Services > Quotas**
2. Search for "Directions API"
3. Ensure you have quota available:
    - Directions API: 2,500 requests per day (free)
    - Can be increased with billing

## Step 6: Test Your Setup

After making these changes:

1. Wait 5-10 minutes for changes to propagate
2. Refresh your application
3. Click the "Test API" button in the DisasterMap component
4. Check the browser console for detailed error messages

## Common Issues & Solutions

### Issue: "API key not valid"

-   Check if the API key is correct in your `.env` file
-   Ensure there are no extra spaces or quotes

### Issue: "This API project is not authorized"

-   Enable billing for your project
-   Wait a few minutes after enabling billing

### Issue: "REQUEST_DENIED"

-   Check API key restrictions
-   Ensure Directions API is enabled
-   Verify billing is active

### Issue: "OVER_QUERY_LIMIT"

-   You've exceeded your daily quota
-   Enable billing to increase limits
-   Wait until the next day for quota reset

## Testing API Key

You can test your API key directly:

```
https://maps.googleapis.com/maps/api/directions/json?origin=Delhi&destination=Mumbai&key=YOUR_API_KEY
```

Replace `YOUR_API_KEY` with your actual key. This should return JSON data, not an error.

## Environment Variables

Make sure your `.env` file contains:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

⚠️ Never commit your API key to version control!

## Debugging Tips

1. Check browser console for detailed error messages
2. Use the "Test API" button in the DisasterMap component
3. Monitor your API usage in Google Cloud Console
4. Check the Network tab in browser dev tools for failed requests

## Support

If you continue having issues:

1. Check [Google Maps Platform Status](https://status.cloud.google.com/)
2. Review [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
3. Contact Google Cloud Support if you have a paid plan
