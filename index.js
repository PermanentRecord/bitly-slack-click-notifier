'use strict'

const Bitly = require('bitly')
const bitly = new Bitly(process.env.BITLY_ACCESS_TOKEN)
const fs = require('fs-promise')
const rp = require('request-promise')

const STATE_FILE = 'state.js'

let links
let pollIndex

fs.readFile(STATE_FILE).then(data => {
  console.log('Loading links from filesystem.')
  links = JSON.parse(data.toString())
  poll()
})

function hasLink(url) {
  var ll = links.length
  while (ll--) {
    if (links[ll].url === url) {
      return true
    }
  }
  return false
}

function messageSlack(url, longUrl, title) {
  let webhookOpts = {
    method: 'POST',
    uri: process.env.SLACK_WEBHOOK_URL,
    form: {
      payload: JSON.stringify({
        username: 'Bit.ly',
        icon_emoji: ':eyes:',

        fallback: 'Link clicked',
        text: 'Link clicked: ' + title,
        attachments: [
          {
            title: longUrl,
            title_link: longUrl,
          },
        ],
      }),
    },
  }

  rp(webhookOpts)
    .then(body => {})
    .catch(e => {
      console.log('Error in posting to Slack channel.', e)
    })
}

function poll() {
  bitly.history().then(data => {
    // console.log(data.data.link_history)
    data.data.link_history.forEach((el, i) => {
      let url = el.link
      if (!hasLink(url)) {
        // This is a new link.
        links.push({ url: el.link, longURL: el.long_url, title: el.title, count: 0 })
      }
    })

    pollIndex = -1
    checkNextLink()
  })
}

function checkNextLink() {
  if (++pollIndex < links.length) {
    let linkItem = links[pollIndex]
    let url = linkItem.url
    bitly.clicks(url).then(data => {
      let clickData = data.data.clicks[0]
      let clicks = clickData.user_clicks

      if (clicks > linkItem.count) {
        messageSlack(url, linkItem.longURL, linkItem.title)
      }

      linkItem.count = clicks
      persistLinks().then(() => {
        checkNextLink()
      })
    })
  } else {
    setTimeout(() => {
      // console.log('Waiting 60 seconds')
      poll()
    }, 60000)
  }
}

function persistLinks() {
  return fs.writeFile(STATE_FILE, JSON.stringify(links, null, 2))
}
