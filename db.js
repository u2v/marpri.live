function dedup(arr) {
  const ret = []
  for (const i of arr) {
    if (!ret.includes(i)) ret.push(i)
  }
  return ret
}

async function addVideo(chg) {
  if (!chg.videoId || !chg.channelId)
    throw Error('Change should contain a videoId & channelId')
  const _video_key = chg.channelId + '__' + chg.videoId
  const _channel_key = '__' + chg.channelId
  await KV.put(_video_key, JSON.stringify(chg))
  const list = JSON.parse((await KV.get(_channel_key)) || '[]')
  list.push(chg.videoId)
  await KV.put(_channel_key, JSON.stringify(dedup(list)))
}

async function getVideosOfChannel(channelId) {
  const _channel_key = '__' + channelId
  const list = JSON.parse((await KV.get(_channel_key)) || '[]')
  const ret = []
  for (const videoId of list) {
    const _video_key = channelId + '__' + videoId
    const one = JSON.parse(await KV.get(_video_key))
    ret.push(one)
  }
  return ret
}

module.exports = {
  addVideo,
  getVideosOfChannel,
}
