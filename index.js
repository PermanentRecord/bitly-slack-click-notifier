'use strict'

require('dotenv').config()

const Bitly = require('bitly')
// Get your access token at https://bitly.com/a/oauth_apps
const bitly = new Bitly(process.env.BITLY_ACCESS_TOKEN)
const fs = require('fs-promise')

const STATE_FILE = 'state.js'

// Map of links / link counts.
let links

// Used when iterating through links checking for click count.
let pollIndex

fs.readFile(STATE_FILE)
  .then((data) => {
    console.log('Loading links from filesystem.')
    links = new Map(JSON.parse(data.toString()))
    poll()
  })

function poll () {
  bitly.history()
    .then((data) => {
      data.data.link_history.forEach((el, i) => {
        if (!links.has(el.link)) {
          console.log('adding')
          // This is a new link.
          links.set(el.link, 0)
        }
      })

      pollIndex = -1
      checkNextLink()
    })
}

function checkNextLink () {
  console.log('checkNextLink')
  if (++pollIndex < links.size) {
    let linkItem = links[pollIndex]
    let url = linkItem.url
    bitly.clicks(url)
      .then((data) => {
        let clickData = data.data.clicks[0]
        let clicks = clickData.global_clicks - clickData.user_clicks
        if (clicks > linkItem.count) {
          console.log(clicks + ' new click(s)')
        }
        linkItem.count = clicks
      // persistLinks()
      //   .then(() => {
      //     checkNextLink()
      //   })
      })
  } else {
    setTimeout(() => {
      console.log('Waiting 10 seconds')
      poll()
    }, 10000)
  }
}

function persistLinks () {
  return fs.writeFile(STATE_FILE, JSON.stringify(links))
}
