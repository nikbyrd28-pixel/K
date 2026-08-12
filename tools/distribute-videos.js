#!/usr/bin/env node

/**
 * Standalone Video Distribution CLI Tool
 *
 * Usage:
 *   node distribute-videos.js --video video.mp4 --platforms tiktok,instagram,youtube
 *   node distribute-videos.js --batch videos.json --platforms tiktok,instagram
 *   node distribute-videos.js --configure tiktok --token YOUR_TOKEN
 */

const fs = require('fs')
const path = require('path')

class SimpleVideoDistributor {
  constructor() {
    this.config = this.loadConfig()
    this.results = []
  }

  loadConfig() {
    const configPath = path.join(process.cwd(), '.video-distributor-config.json')
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }
    return {
      platforms: {
        tiktok: { enabled: false, token: '' },
        instagram: { enabled: false, token: '' },
        youtube: { enabled: false, token: '' },
        twitter: { enabled: false, token: '' },
        threads: { enabled: false, token: '' },
        linkedin: { enabled: false, token: '' },
      },
    }
  }

  saveConfig() {
    const configPath = path.join(process.cwd(), '.video-distributor-config.json')
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2))
  }

  configurePlatform(platform, token) {
    if (!this.config.platforms[platform]) {
      console.error(`Unknown platform: ${platform}`)
      return
    }
    this.config.platforms[platform] = { enabled: true, token }
    this.saveConfig()
    console.log(`✓ ${platform} configured`)
  }

  async distributeToMultiplePlatforms(videoPath, platforms) {
    if (!fs.existsSync(videoPath)) {
      console.error(`Video file not found: ${videoPath}`)
      return
    }

    const videoStats = fs.statSync(videoPath)
    const videoName = path.basename(videoPath)

    console.log(`\n📹 Distributing: ${videoName} (${this.formatBytes(videoStats.size)})`)
    console.log(`🎯 Platforms: ${platforms.join(', ')}\n`)

    for (const platform of platforms) {
      const result = await this.uploadToPlatform(videoPath, platform)
      this.results.push(result)
      this.printResult(result)
    }

    return this.results
  }

  async uploadToPlatform(videoPath, platform) {
    const config = this.config.platforms[platform]

    if (!config || !config.enabled) {
      return {
        platform,
        success: false,
        error: `${platform} not configured. Run: distribute-videos --configure ${platform} --token YOUR_TOKEN`,
        timestamp: new Date().toISOString(),
      }
    }

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock post URLs for demo
    const mockUrls = {
      tiktok: `https://www.tiktok.com/@brand/video/${Date.now()}`,
      instagram: `https://www.instagram.com/p/${Math.random().toString(36).substring(7)}`,
      youtube: `https://youtu.be/${Math.random().toString(36).substring(7)}`,
      twitter: `https://twitter.com/brand/status/${Date.now()}`,
      threads: `https://www.threads.net/@brand/post/${Date.now()}`,
      linkedin: `https://www.linkedin.com/feed/update/${Date.now()}`,
    }

    return {
      platform,
      success: true,
      postUrl: mockUrls[platform],
      timestamp: new Date().toISOString(),
    }
  }

  async distributeBatch(batchFilePath, platforms) {
    if (!fs.existsSync(batchFilePath)) {
      console.error(`Batch file not found: ${batchFilePath}`)
      return
    }

    const batch = JSON.parse(fs.readFileSync(batchFilePath, 'utf8'))
    console.log(`\n📦 Batch Distribution: ${batch.videos.length} videos`)
    console.log(`🎯 Platforms: ${platforms.join(', ')}\n`)

    const allResults = []

    for (const video of batch.videos) {
      const videoPath = video.path || video.file
      if (!fs.existsSync(videoPath)) {
        console.warn(`⚠ Video not found: ${videoPath}`)
        continue
      }

      console.log(`\n📹 ${path.basename(videoPath)}`)
      const results = await this.distributeToMultiplePlatforms(videoPath, platforms)
      allResults.push(...results)
    }

    return allResults
  }

  generateReport() {
    if (this.results.length === 0) return

    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 DISTRIBUTION REPORT`)
    console.log(`${'='.repeat(60)}`)
    console.log(`Total Distributions: ${this.results.length}`)
    console.log(`✓ Successful: ${successful}`)
    console.log(`✗ Failed: ${failed}`)
    console.log(`Success Rate: ${Math.round((successful / this.results.length) * 100)}%`)
    console.log(`${'='.repeat(60)}\n`)

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      total: this.results.length,
      successful,
      failed,
      results: this.results,
    }

    const reportPath = path.join(process.cwd(), `distribution-report-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Report saved: ${reportPath}\n`)
  }

  printResult(result) {
    if (result.success) {
      console.log(`✓ ${result.platform.toUpperCase()}`)
      console.log(`  ${result.postUrl}`)
    } else {
      console.log(`✗ ${result.platform.toUpperCase()}`)
      console.log(`  Error: ${result.error}`)
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  printHelp() {
    console.log(`
📹 Video Distributor CLI
========================

USAGE:
  distribute-videos --video <path> --platforms <list>
  distribute-videos --batch <json> --platforms <list>
  distribute-videos --configure <platform> --token <token>
  distribute-videos --list-platforms

OPTIONS:
  --video <path>           Path to single video file
  --batch <path>           Path to batch JSON file
  --platforms <list>       Comma-separated platforms (tiktok,instagram,youtube,twitter,threads,linkedin)
  --configure <platform>   Configure API token for platform
  --token <token>          API token for configuration
  --list-platforms         Show all available platforms
  --help                   Show this help message

EXAMPLES:
  # Single video to multiple platforms
  distribute-videos --video video.mp4 --platforms tiktok,instagram,youtube

  # Batch distribution
  distribute-videos --batch videos.json --platforms tiktok,instagram

  # Configure platform
  distribute-videos --configure tiktok --token YOUR_TIKTOK_TOKEN

  # List available platforms
  distribute-videos --list-platforms

BATCH FILE FORMAT (JSON):
  {
    "videos": [
      { "path": "video1.mp4", "title": "First Video" },
      { "path": "video2.mp4", "title": "Second Video" }
    ]
  }

`)
  }

  listPlatforms() {
    console.log(`\n✅ Available Platforms:`)
    Object.keys(this.config.platforms).forEach(platform => {
      const status = this.config.platforms[platform].enabled ? '✓' : '✗'
      console.log(`  ${status} ${platform}`)
    })
    console.log()
  }
}

// CLI argument parsing
async function main() {
  const args = process.argv.slice(2)
  const distributor = new SimpleVideoDistributor()

  if (args.length === 0 || args.includes('--help')) {
    distributor.printHelp()
    return
  }

  if (args.includes('--list-platforms')) {
    distributor.listPlatforms()
    return
  }

  const videoIndex = args.indexOf('--video')
  const batchIndex = args.indexOf('--batch')
  const platformsIndex = args.indexOf('--platforms')
  const configIndex = args.indexOf('--configure')
  const tokenIndex = args.indexOf('--token')

  if (configIndex !== -1 && tokenIndex !== -1) {
    const platform = args[configIndex + 1]
    const token = args[tokenIndex + 1]
    distributor.configurePlatform(platform, token)
    return
  }

  if (platformsIndex === -1) {
    console.error('Error: --platforms is required')
    console.log('Run with --help for usage information\n')
    return
  }

  const platforms = args[platformsIndex + 1].split(',')

  if (videoIndex !== -1) {
    const videoPath = args[videoIndex + 1]
    await distributor.distributeToMultiplePlatforms(videoPath, platforms)
  } else if (batchIndex !== -1) {
    const batchPath = args[batchIndex + 1]
    await distributor.distributeBatch(batchPath, platforms)
  } else {
    console.error('Error: Either --video or --batch is required')
    console.log('Run with --help for usage information\n')
    return
  }

  distributor.generateReport()
}

main().catch(console.error)
