import { Telegraf, Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { MetaCommand } from '../common'

export function handleStartCommand(bot: Telegraf<Context<Update>>) {
  const predefinedHours = [
    ...Array.from(new Array(14), (_, i) => String(i + 1)),
    '15+',
  ]

  return (ctx: Context) => {
    const hoursKeyboard = predefinedHours.map((hr) => ({
      text: hr,
      callback_data: `${MetaCommand.TrackHours}:${hr}:${
        ctx.message!.message_id
      }`,
    }))
    bot.telegram.sendMessage(ctx.chat!.id, 'How much did you sleep today?', {
      reply_markup: {
        inline_keyboard: [
          hoursKeyboard.slice(0, hoursKeyboard.length / 2),
          hoursKeyboard.slice(hoursKeyboard.length / 2, hoursKeyboard.length),
        ],
      },
    })
  }
}
