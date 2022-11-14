const { analyzeFeed } = require('./parser')
const { addVideo, getVideosOfChannel } = require('./db')
const dayjs = require('dayjs')
const { Buffer } = require('buffer')

const codeHead = STATIC.HEADER

class MarpriLive {
  page(url) {
    return `<a href='${url}'>Here</a>`
  }

  shuffle() {
    const entries = [
      // alphabetic order
      "<a href='https://rin.marpri.live'>rin.marpri.live</a> - @Rin04ple",
      "<a href='https://tachibana.marpri.live'>tachibana.marpri.live</a> - @Rin04ple",
      "<a href='https://touka.marpri.live'>touka.marpri.live</a> - @Touka03mar",
      "<a href='https://yata.marpri.live'>yata.marpri.live</a> - @Touka03mar",
    ]
    const results = []
    for (let i = entries.length - 1; i >= 0; i--) {
      const rnd = Math.floor(Math.random() * i)
      results.push(entries[rnd])
      entries.splice(rnd, 1)
    }
    return results.join('<br>\n')
  }

  // https://www.youtube.com/playlist?list=PLhsacdGeCk3vH2WyvGFRkbjh-7Cr0WYel
  entries = [
    'dGaHse6nlHQ', // Faker
    'msTVW_w9l5k', // ナミダ・アーカイブ
    '5dqixBi8TPU', // Throwback
    'YtOgtgq5_Wk', // City Hop
    'QhNE4Ky5Je4', // シンフォニア
    '8gAN3hUiVAQ', // Girly Cupid
    'HAPTpgKkjr4', // ブレーカーシティ
    'H2V_eME2aT8', // sheep in the light
    'iomkSVO4j3k', // キミエモーション
    'KHKX6dvhJuw', // Spiral Fortune
    'w7VKyA0HO0M', // Fantasy Signal
  ]

  randVideo() {
    return this.entries[Math.floor(Math.random() * this.entries.length)]
  }

  randomEntries() {
    return this.shuffle()
  }

  #icon = STATIC.ICON
  #image = STATIC.IMAGE

  #channelId = 'UCWhv732tk4DAQ7X32qHKrfA'

  escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  async checkLivestream() {
    const show = await getVideosOfChannel(this.#channelId)
    let showParsed = show
      .filter((x) => !x.finished && x.scheduledStartTime)
      .map((x) => {
        const y = Object.assign({}, x)
        y.scheduledStartTime = new Date(y.scheduledStartTime)
        return y
      })
      .sort((a, b) => {
        a.scheduledStartTime - b.scheduledStartTime
      })
    if (showParsed.length === 0) return null
    return showParsed[0]
  }

  generateLiveBanner(latest) {
    if (!latest) return ''
    return `<header id="liveLog">
      Livestream - <b>${this.escape(latest.title)}</b> at ${this.escape(
      dayjs(latest.scheduledStartTime)
        .add(9, 'hour')
        .format('YYYY-MM-DD HH:mm (JST)')
    )} - <a
          href="https://live.marpri.live">live.marpri.live
          →</a>
  </header>`
  }

  #messages = [
    {
      url: 'https://gist.github.com/outloudvi/d2ed6c650aa7dbb8118ea527e2c1f814',
      title:
        'Marpri.live is sunsetting on early October - read the gist for details',
    },
  ]

  generateMessages() {
    return this.#messages
      .map(
        (x) =>
          `<div class="notice">${
            (x.url ? `<a href="${x.url}">` : '') +
            x.title +
            (x.url ? '</a>' : '')
          }</div>`
      )
      .join('')
  }

  pageResp = (latest) => STATIC.PAGE_TEMPLATE

  #defaultLocation =
    'https://www.youtube.com/channel/UCWhv732tk4DAQ7X32qHKrfA/live'
  #channel = 'https://www.youtube.com/channel/UCWhv732tk4DAQ7X32qHKrfA'
  #soundcloud = 'https://soundcloud.com/marpril'
  // ^ It's official! See description on https://youtu.be/HAPTpgKkjr4
  #touka = 'https://twitter.com/Touka03mar'
  #rin = 'https://twitter.com/Rin04ple'

  #utm = {
    utm_source: 'marpri.live',
    utm_medium: 'website',
    utm_campaign: 'marpri.live',
  }

  #defaultHeaders = {
    'X-Contact': 'hi@marpri.live',
    'X-Official-Site': 'false',
    'Content-Type': 'text/html; charset=UTF-8',
  }

  wrapUTM(location) {
    const loc = new URL(location)
    for (const [k, v] of Object.entries(this.#utm)) {
      loc.searchParams.set(k, v)
    }
    return String(loc)
  }

  getLocation(url) {
    const host = url.host
    switch (host.split('.')[0]) {
      case 'yata':
      case 'touka':
        return this.#touka
      case 'tachibana':
      case 'rin':
        return this.#rin
      case 'channel':
      case 'ch':
        return this.#channel
      case 'soundcloud':
      case 'sc':
        return this.#soundcloud
      case 't':
        return 'https://twitter.com/Marprilofficial'
      case 'booth':
        return 'https://marpril.booth.pm'
      case 'hashtag':
        return 'https://twitter.com/hashtag/Marpril'
      case 'a3':
        return 'https://kyaragoods.shop-pro.jp/?pid=156038268'
      case 'com':
        return 'https://www.marpril.com'
      case 'live':
        return this.#defaultLocation
    }
    return undefined
  }

  async handleRequest(request) {
    const source = new URL(request.url)
    if (source.pathname == '/robots.txt') {
      return new Response(STATIC.ROBOTS_TXT, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
    if (source.pathname == '/pshb') {
      return await handlePshb(request)
    }
    const location = this.getLocation(source)
    if (location) {
      const finalURL = this.wrapUTM(location)
      return new Response(this.page(finalURL), {
        status: 307,
        headers: {
          ...this.#defaultHeaders,
          Location: finalURL,
        },
      })
    }

    if (source.pathname == '/_src') {
      return new Response(codeHead + '\n\n' + String(MarpriLive), {
        status: 200,
        headers: {
          ...this.#defaultHeaders,
          'Content-Type': 'text/plain; charset=UTF-8',
        },
      })
    } else if (source.pathname === '/favicon.ico') {
      return new Response(Buffer.from(this.#icon, 'base64'), {
        status: 200,
        headers: {
          ...this.#defaultHeaders,
          'Content-Type': 'image/vnd.microsoft.icon',
        },
      })
    } else if (source.pathname === '/favicon.png') {
      return new Response(Buffer.from(this.#image, 'base64'), {
        status: 200,
        headers: {
          ...this.#defaultHeaders,
          'Content-Type': 'image/png',
        },
      })
    } else if (source.pathname === '/_stats') {
      const videos = await getVideosOfChannel(source.searchParams.get('ch'))
      return new Response(JSON.stringify(videos), {
        status: 200,
        headers: {
          ...this.#defaultHeaders,
          'Content-Type': 'application/json',
        },
      })
    } else if (source.pathname === '/') {
      const latest = await this.checkLivestream()
      const page = this.pageResp(latest)
      return new Response(page, {
        status: 200,
        headers: this.#defaultHeaders,
      })
    }

    return new Response(STATIC.PAGE_404, {
      status: 404,
      headers: this.#defaultHeaders,
    })
  }
}

const m = new MarpriLive()

addEventListener('fetch', (event) => {
  event.respondWith(m.handleRequest(event.request))
})

addEventListener('scheduled', (event) => {
  event.waitUntil(handleScheduled(event))
})

const PSHB_TOPIC = [
  'https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCWhv732tk4DAQ7X32qHKrfA',
]

const PSHB_HEADERS = {
  'X-Served-By': 'live.marpri.pshbhandler',
}

const PSHB_HMAC_DIGEST = 'marprilive'

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
  } else if (request.method === 'POST') {
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
    params.set('hub.callback', 'https://marpri.live/pshb')
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
