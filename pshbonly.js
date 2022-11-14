const { analyzeFeed } = require('./parser')

const SUBPATH = '/pshb'

const DEPLOY_URL = `https://marpri.live${SUBPATH}`

const PSHB_TOPIC = [
  'https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCWhv732tk4DAQ7X32qHKrfA',
]

const PSHB_HMAC_DIGEST = 'marpril'

async function handleRequest(request) {
  const source = new URL(request.url)
  if (source.pathname == SUBPATH) {
    return await handlePshb(request)
  }
  return new Response('nothing')
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

addEventListener('scheduled', (event) => {
  event.waitUntil(handleScheduled(event))
})

/**
 * @param request {Request}
 */
async function handlePshb(request) {
  const source = new URL(request.url)
  const query = source.searchParams
  const body = await request
    .clone()
    .text()
    .catch(() => {
      return ''
    })

  if (request.method === 'GET') {
    // Validation
    if (
      query.get('hub.mode') === 'subscribe' &&
      PSHB_TOPIC.includes(query.get('hub.topic'))
    ) {
      return new Response(query.get('hub.challenge'), {
        status: 200,
        headers: PSHB_HEADERS,
      })
    }
    if (
      query.get('hub.mode') === 'unsubscribe' &&
      !PSHB_TOPIC.includes(query.get('hub.topic'))
    ) {
      return new Response(query.get('hub.challenge'), {
        status: 200,
        headers: PSHB_HEADERS,
      })
    }
    return new Response('bad topic / mode', {
      status: 403,
      headers: PSHB_HEADERS,
    })
  } else if (request.method == 'POST') {
    // Distribution
    const feedInfo = await analyzeFeed(body)
    if (feedInfo.err) {
      return new Response('', {
        status: 304,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    await addVideo(feedInfo)
    return new Response(
      JSON.stringify({
        ok: true,
        info: feedInfo,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
  return new Response('bad item', {
    status: 400,
    headers: PSHB_HEADERS,
  })
}

async function handleScheduled() {
  for (const i of PSHB_TOPIC) {
    const params = new URLSearchParams()
    params.set('hub.callback', DEPLOY_URL)
    params.set('hub.mode', 'subscribe')
    params.set('hub.topic', i)
    params.set('hub.secret', PSHB_HMAC_DIGEST)
    await fetch('https://pubsubhubbub.appspot.com/subscribe?', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: String(params),
    })
  }
}
