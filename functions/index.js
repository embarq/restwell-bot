const functions = require('firebase-functions')
const admin = require('firebase-admin')

// admin.initializeApp(functions.config().admin.config)

const initBot = require('./src/index')

const bot = initBot(functions.config().telegram.token)
const botWebhookUrl = process.env.TEST_DOMAIN != null
  ? `${TEST_DOMAIN}/restwell-bot/europe-west1/botHook`
  : functions.config().telegram.bot_hook_url

bot.telegram.deleteWebhook({ drop_pending_updates: true })
  .then(() => functions.logger.log('Delete webhook success'))
  .then(() => {
    functions.logger.log('Attempt to register bot\'s hook on', botWebhookUrl)
    return bot.telegram.setWebhook(botWebhookUrl, { allowed_updates: true })
  })
  .then(() => functions.logger.log('TG bot has been sucessfully installed.'))
  .then(() => bot.telegram.getWebhookInfo())
  .then((res) => functions.logger.log('TG Webhook', JSON.stringify(res)))
  .catch((error) => {
    functions.logger.error(`TG bot hasn't been installed.`);
    functions.logger.error(JSON.stringify(error))
  });

exports.botHook = functions.region('europe-west1').https.onRequest(async (req, res) => {
  try {
    return await bot.handleUpdate(req.body, res).then(
      /* 
        Sometimes Google can send the data to check whether your function is alive or not. This data is not an entity of Telegram update, but we need to respond to requests anyway. For this purpose, we can handle this case within .then block ( bot.handleUpdate returns a Promise). If the Telegram update was handled successfully, rv variable should be true and we will do nothing. Otherwise, rv will be undefined and we will respond with Status Code: 🟢200
        Source: https://medium.com/firebase-developers/building-a-telegram-bot-with-firebase-cloud-functions-and-telegraf-js-5e5323068894
        */
      _res => !_res && res.status(200)
    )
  } catch(err) {
    res.status(200)
  }
})
