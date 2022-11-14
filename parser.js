const Parser = require('rss-parser')
const parser = new Parser({
  customFields: {
    item: [
      ['yt:videoId', 'videoId'],
      ['yt:channelId', 'channelId'],
      ['media:group', 'media'],
    ],
  },
})

const YT_API_KEY = 'AIzaSyDyjtwJTzudu-GoFJmzT9BsBpW3gx3mdko'

async function getVideoStreamInfo(videoId) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'id,liveStreamingDetails')
  url.searchParams.set('id', videoId)
  url.searchParams.set('key', YT_API_KEY)
  return await fetch(String(url))
    .then((x) => x.json())
    .then(async (x) => {
      if (x.items.length) return x.items[0]
      return null
    })
}
async function analyzeFeed(text) {
  let feed = await parser.parseString(text).catch(() => {
    return { items: [] }
  })
  if (feed.items.length === 0)
    return {
      err: 'ph',
      text,
    }
  const entry = ((item) => {
    return {
      title: item.title,
      url: item.link,
      videoId: item.videoId,
      channelId: item.channelId,
      pubDate: item.pubDate,
      finished: false,
      description: item?.media?.['media:description']?.[0] || '',
    }
  })(feed.items[0])
  const info = await getVideoStreamInfo(entry.videoId)
  if (info?.liveStreamingDetails?.actualEndTime || !info) {
    entry.finished = true
  }
  return Object.assign({}, entry, info?.liveStreamingDetails || {})
}

module.exports = { analyzeFeed }
