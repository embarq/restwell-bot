import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { MetaCommand } from '../common'

export function handleShowStatsMenu(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>
): Promise<Message.TextMessage> {
  return bot.telegram.sendMessage(ctx.chat!.id, 'Select a period', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Past week',
            callback_data: `${MetaCommand.ShowStats}:past_week`,
          },
          {
            text: 'Current week',
            callback_data: `${MetaCommand.ShowStats}:current_week`,
          },
        ],
        [
          {
            text: 'Past month',
            callback_data: `${MetaCommand.ShowStats}:past_month`,
          },
          {
            text: 'Current month',
            callback_data: `${MetaCommand.ShowStats}:current_month`,
          },
        ],
      ],
    },
  })
}
