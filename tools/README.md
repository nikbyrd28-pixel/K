# Video Distribution Tools

Complete toolkit for distributing videos to multiple platforms simultaneously.

## What's Included

### 1. TypeScript Library (`lib/video-distributor.ts`)
- Reusable class for video distribution
- Multi-platform support (TikTok, Instagram, YouTube, Twitter, Threads, LinkedIn)
- Batch operations
- Status tracking and reporting
- Can be imported into any Node/Next.js application

### 2. CLI Tool (`tools/distribute-videos.js`)
- Standalone command-line interface
- Single video or batch distribution
- Platform configuration management
- Report generation
- No dependencies required

### 3. Admin Dashboard Integration
- Scripts Portal: Team writes scripts
- Videos Portal: Video editors upload finished videos
- Distribution Portal: Logs which videos went to which platforms
- All data stored locally in browser localStorage

---

## Quick Start

### Option A: Use the CLI Tool (Standalone)

```bash
# Make script executable
chmod +x tools/distribute-videos.js

# Configure a platform (do this once)
node tools/distribute-videos.js --configure tiktok --token YOUR_TIKTOK_API_TOKEN
node tools/distribute-videos.js --configure instagram --token YOUR_INSTAGRAM_TOKEN

# Distribute a single video
node tools/distribute-videos.js --video video.mp4 --platforms tiktok,instagram,youtube

# Distribute batch of videos
node tools/distribute-videos.js --batch videos.json --platforms tiktok,instagram

# List configured platforms
node tools/distribute-videos.js --list-platforms
```

### Option B: Use the TypeScript Library (In-App)

```typescript
import { videoDistributor, VideoAsset } from '@/lib/video-distributor'

// Configure platforms
videoDistributor.configurePlatform('tiktok', {
  enabled: true,
  accessToken: 'your_token_here'
})

// Distribute a video
const video: VideoAsset = {
  id: 'video_001',
  title: 'Product Launch',
  description: 'Check out our new product!',
  videoFile: myVideoFile,
  platforms: ['tiktok', 'instagram', 'youtube']
}

const results = await videoDistributor.distributeVideo(video)
console.log(results)
```

### Option C: Use Admin Dashboard Portals

1. Go to `/admin` dashboard
2. Click **"Distribute"** tab
3. Enter video ID
4. Select platforms to post to
5. Paste the post URLs after uploading
6. System tracks performance metrics

---

## CLI Commands Reference

### Single Video Distribution
```bash
node tools/distribute-videos.js --video video.mp4 --platforms tiktok,instagram,youtube
```

**Output:**
```
📹 Distributing: video.mp4 (125.5 MB)
🎯 Platforms: tiktok, instagram, youtube

✓ TIKTOK
  https://www.tiktok.com/@brand/video/123456789

✓ INSTAGRAM
  https://www.instagram.com/p/ABC123DEF456/

✓ YOUTUBE
  https://youtu.be/ABC123def456
```

### Batch Distribution
Create `videos.json`:
```json
{
  "videos": [
    { "path": "product-demo.mp4", "title": "Product Demo" },
    { "path": "tutorial.mp4", "title": "How To Use" },
    { "path": "testimonial.mp4", "title": "Customer Testimonial" }
  ]
}
```

Then run:
```bash
node tools/distribute-videos.js --batch videos.json --platforms tiktok,instagram
```

### Platform Configuration

```bash
# TikTok
node tools/distribute-videos.js --configure tiktok --token YOUR_TIKTOK_TOKEN

# Instagram
node tools/distribute-videos.js --configure instagram --token YOUR_INSTAGRAM_TOKEN

# YouTube
node tools/distribute-videos.js --configure youtube --token YOUR_YOUTUBE_TOKEN

# Twitter/X
node tools/distribute-videos.js --configure twitter --token YOUR_TWITTER_TOKEN

# Threads
node tools/distribute-videos.js --configure threads --token YOUR_THREADS_TOKEN

# LinkedIn
node tools/distribute-videos.js --configure linkedin --token YOUR_LINKEDIN_TOKEN
```

### List Platforms
```bash
node tools/distribute-videos.js --list-platforms
```

**Output:**
```
✅ Available Platforms:
  ✓ tiktok
  ✗ instagram
  ✓ youtube
  ✓ twitter
  ✗ threads
  ✗ linkedin
```

---

## Workflow Examples

### Team Workflow: Script → Video → Distribute

**Person 1 (Script Writer):**
1. Open `/admin` → **Scripts** tab
2. Generate scripts using Studio tab AI
3. Save scripts with "Ready" status

**Person 2 (Video Editor):**
1. Open `/admin` → **Videos** tab
2. Create videos from approved scripts
3. Upload finished videos
4. Mark as "Ready to Ship"

**Person 3 (Distribution Lead):**
1. Open `/admin` → **Distribute** tab
2. Log which videos went to which platforms
3. Paste the post URLs
4. Track engagement metrics

### Solo Workflow: Use CLI for Bulk Distribution

```bash
# Day 1: Record 3 videos
# ...

# Day 2: Create batch file
cat > weekly-videos.json << EOF
{
  "videos": [
    { "path": "video_1.mp4", "title": "Monday Tips" },
    { "path": "video_2.mp4", "title": "Wednesday Deep Dive" },
    { "path": "video_3.mp4", "title": "Friday Fun" }
  ]
}
EOF

# Day 2: Distribute all at once
node tools/distribute-videos.js \
  --batch weekly-videos.json \
  --platforms tiktok,instagram,youtube,twitter

# Check report
cat distribution-report-1723456789.json
```

---

## Configuration File

The tool creates `.video-distributor-config.json` in your project:

```json
{
  "platforms": {
    "tiktok": {
      "enabled": true,
      "token": "your_token_here"
    },
    "instagram": {
      "enabled": false,
      "token": ""
    },
    "youtube": {
      "enabled": true,
      "token": "your_token_here"
    },
    "twitter": {
      "enabled": false,
      "token": ""
    },
    "threads": {
      "enabled": false,
      "token": ""
    },
    "linkedin": {
      "enabled": false,
      "token": ""
    }
  }
}
```

---

## Getting API Tokens

### TikTok
1. Go to https://developer.tiktok.com/
2. Create Developer Account
3. Get Access Token from OAuth flow
4. Token expires every 24 hours (refresh token needed)

### Instagram
1. Go to https://developers.facebook.com/
2. Create App → Select "Business"
3. Get Instagram Access Token from App Roles
4. Token can last 60+ days

### YouTube
1. Go to https://console.cloud.google.com/
2. Create Project → Enable YouTube API
3. Create OAuth 2.0 credentials
4. Get Access Token via OAuth flow

### Twitter
1. Go to https://developer.twitter.com/
2. Create App → Approve access
3. Generate Bearer Token or OAuth tokens
4. Use v2 API endpoints

### Threads
1. Go to https://developers.facebook.com/
2. Same as Instagram (Meta ecosystem)
3. Use Threads API endpoints

### LinkedIn
1. Go to https://www.linkedin.com/developers/
2. Create App
3. Generate Access Token
4. Partner program access may be required

---

## Reports

After each distribution, a report is generated:

**File:** `distribution-report-{timestamp}.json`

**Contents:**
```json
{
  "timestamp": "2024-08-12T10:30:00.000Z",
  "total": 9,
  "successful": 8,
  "failed": 1,
  "results": [
    {
      "platform": "tiktok",
      "success": true,
      "postUrl": "https://www.tiktok.com/@brand/video/123456789",
      "timestamp": "2024-08-12T10:30:05.123Z"
    },
    {
      "platform": "instagram",
      "success": true,
      "postUrl": "https://www.instagram.com/p/ABC123DEF456/",
      "timestamp": "2024-08-12T10:30:06.456Z"
    },
    {
      "platform": "youtube",
      "success": false,
      "error": "Invalid OAuth token",
      "timestamp": "2024-08-12T10:30:07.789Z"
    }
  ]
}
```

Use these reports to:
- Track which videos performed best
- Identify platform issues
- Plan future distribution strategy
- Audit posting activity

---

## Troubleshooting

### "Platform not configured"
Run: `node tools/distribute-videos.js --configure tiktok --token YOUR_TOKEN`

### Token expired error
Platforms like TikTok require token refresh:
- Store refresh tokens securely
- Implement token refresh before upload
- Or manually refresh and update config

### Video format errors
Supported formats (check platform requirements):
- **MP4** (H.264 codec, AAC audio)
- **MOV** (for iOS)
- **WebM** (for web)

Max file sizes:
- TikTok: 287.6 MB
- Instagram: 4 GB
- YouTube: No limit
- Twitter: 512 MB

### Network/Proxy errors
If behind corporate proxy:
- Configure in `.video-distributor-config.json`
- Use `https_proxy` environment variable
- Check firewall rules

---

## Advanced Usage

### Custom Platform Integration

Add a new platform to the TypeScript library:

```typescript
// In video-distributor.ts
private async uploadToCustomPlatform(
  video: VideoAsset,
  config: PlatformConfig
): Promise<DistributionResult> {
  const res = await fetch(config.apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.accessToken}` },
    body: FormData with video file
  })
  
  const data = await res.json()
  return {
    platform: 'custom-platform',
    success: true,
    postUrl: data.post_url
  }
}
```

### Scheduled Distribution

Use with a cron job or scheduler:

```bash
# Run daily at 9am
0 9 * * * node /path/to/tools/distribute-videos.js --batch videos.json --platforms tiktok,instagram

# Or with Node.js node-cron:
const cron = require('node-cron')
cron.schedule('0 9 * * *', () => {
  // Run distribution
})
```

---

## Support

For issues or feature requests:
1. Check configuration: `node tools/distribute-videos.js --list-platforms`
2. Test with single platform first
3. Check API token expiry
4. Review error messages in distribution report

---

**Last Updated:** August 2024  
**Version:** 1.0.0  
**Status:** Production Ready
