# Free Routing API Alternatives

## 1. OpenRouteService (Recommended Free Alternative)
- **Free Tier**: 2,000 requests per day
- **Sign up**: https://openrouteservice.org/
- **No credit card required**
- **Implementation**: See `src/utils/openRouteService.ts`

## 2. Mapbox Directions API
- **Free Tier**: 100,000 requests per month
- **Sign up**: https://account.mapbox.com/
- **No credit card required for free tier**
- **API**: https://docs.mapbox.com/api/navigation/directions/

## 3. OSRM (Open Source Routing Machine)
- **Completely Free**: Self-hosted or public demo
- **Public Demo**: http://router.project-osrm.org/
- **No API key required**
- **Limited to demo usage**

## 4. GraphHopper
- **Free Tier**: 1,000 requests per day
- **Sign up**: https://www.graphhopper.com/
- **No credit card required**

## Quick Implementation Guide

### Option A: Enable Google Billing (Recommended)
1. Go to Google Cloud Billing console
2. Add credit card (you get $200 free monthly)
3. Your app will work immediately with full routing

### Option B: Use OpenRouteService (Free)
1. Sign up at openrouteservice.org
2. Get free API key
3. Add to .env: `VITE_OPENROUTE_API_KEY=your_key`
4. Modify DisasterMap to use OpenRouteService

### Option C: Use Straight-line Distance (Current Fallback)
- Already implemented in your code
- No API required
- Shows nearest shelter by distance
- User uses their own navigation app

## Current Status
Your DisasterMap now has:
✅ **Fallback system**: If Directions API fails, uses straight-line distance
✅ **Error handling**: Graceful degradation when billing not enabled
✅ **User guidance**: Clear messages about route availability

## Recommendation
For development and testing:
1. **Enable Google billing** (easiest, $200 free monthly)
2. **Or use OpenRouteService** (2000 free requests daily)
3. **Fallback works** for basic shelter finding
