# bitly-slack-click-notifier
Receive Slack notifications when your [bit.ly] links are clicked.  You know, like a creep.

## Setup
* Create a .env file with the following variables:
  * BITLY_ACCESS_TOKEN='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  * SLACK_WEBHOOK_URL='https://hooks.slack.com/services/XXXXXX/XXXXXX/XXXXXXXXXXXXXXX'
* Create a file called _state.js_ with the following content:
  * _[]_
* Run script in a persistant fashion on your server using something like [PM2] or [forever].

   [bit.ly]: <https://bit.ly>
   [PM2]: <http://pm2.keymetrics.io/>
   [forever]: <https://github.com/foreverjs/forever>
