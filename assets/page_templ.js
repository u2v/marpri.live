;`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="Marpri.live" />
    <meta name="description" content="Fansite for Marpril." />
    <meta property="og:url" content="https://marpri.live" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="Fansite for Marpril." />
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
    <title>Marpri.live</title>
    <style>
        #app { text-align: center; }
        h1 { display: flex;
             justify-content: center;
             align-items: center; }
        h1 img { margin-left: 10px; }
        h3 { margin: 12px 0; }
        hr { max-width: min(550px, 100vw); }
        iframe { max-width: 95vw; }
        .mpr { color: #8e33ff; }
        #liveLog { background-color: #8e33ff55; padding: 3px; text-align: center; }
        .notice { background-color: #004cff54; }
        .notice:not(:first-child) { border-top: 2px solid #c72bff54; }
        body { margin: 0; }
    </style>
</head>
<body>
    <div id="app">
        ${this.generateLiveBanner(latest)}
        ${this.generateMessages()}
        <h1><span><span class="mpr">Marpri</span>.<span class="mpr">l</span>ive</span> <img
                src="/favicon.png"
                alt="marpril icon"></h1>
        <div style="display: flex;justify-content: center;">
            <iframe id="frame" src="https://www.youtube-nocookie.com/embed/${this.randVideo()}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen width="560" height="315" frameborder="0"></iframe>
            <button id="frameBtn" style="margin-left: 10px;">&gt;</button>
            <noscript>
                <style> #frameBtn {display: none;} </style>
            </noscript>
        </div>
        <h3>Twitter <small>(link order shuffles!)</small></h3>
        ${this.randomEntries()}<br>
        <a href='https://t.marpri.live'>t.marpri.live</a> - @Marprilofficial<br>
        <a href='https://hashtag.marpri.live'>hashtag.marpri.live</a> - #Marpril
        <h3>Video / Music</h3>
        <a href='https://ch.marpri.live'>ch.marpri.live</a> = <a href='https://channel.marpri.live'>channel.marpri.live</a><br>
        <a href="https://sc.marpri.live">sc.marpri.live</a> = <a
      href="https://soundcloud.marpri.live">soundcloud.marpri.live</a> <br>
        <a href='https://live.marpri.live'>live.marpri.live</a><br>
        <h3>Sites</h3>
        <a href='https://booth.marpri.live'>booth.marpri.live</a> - Merch & Goods<br>
        <a href='https://com.marpri.live'>com.marpri.live</a> = <a href="https://marpril.com">marpril.com</a>
        <hr>
        <p>Fansite / Not affiliated with Marpril / Contact: hi [at] marpri.live / <a href='/_src' target='_blank'>Source Code</a></p>
    </div>
    <script>
        const entries = ${JSON.stringify(this.entries)}
        const frame = document.querySelector("#frame")
        document.querySelector("#frameBtn").addEventListener(
            "click", () => {
                if (!frame.src) return
                const curr = entries.indexOf(frame.src.split("/").reverse()[0])
                const next = curr === -1 ? 0 : (
                    curr + 1 === entries.length ? 0 : curr + 1
                )
                frame.src = \`https://www.youtube-nocookie.com/embed/\${entries[next]}\` 
            }
        )
    </script>
</body>
</html>`
