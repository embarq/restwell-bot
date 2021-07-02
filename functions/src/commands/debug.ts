import { Telegraf, Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

export function handleDebugCommand(bot: Telegraf<Context<Update>>) {
  return async (ctx: Context): Promise<void> => {
    const webhookInfo = await bot.telegram.getWebhookInfo()
    try {
      const { version } = require('../../package.json')
      const payload = { version, webhookInfo }
      await bot.telegram.sendMessage(
        ctx.chat!.id,
        `<pre><code class="language-json">${JSON.stringify(
          payload,
          null,
          2
        )}</code></pre>`,
        {
          disable_notification: true,
          parse_mode: 'HTML',
        }
      )
    } catch (error) {
      console.error(error)
      ctx.answerCbQuery('An error occured 👀')
    }
  }
}
