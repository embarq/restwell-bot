import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { removeInlineKeyboard, feedbackOptions } from '../common'

export async function handleTrackHoursResponse(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>,
  callbackQueryData: { hoursTracked: number; messageId: number }
): Promise<Message.TextMessage> {
  const { hoursTracked, messageId } = callbackQueryData

  if (!(hoursTracked && messageId)) throw new Error('Inalid input')

  await removeInlineKeyboard(bot, ctx)

  return bot.telegram.sendMessage(ctx.chat!.id, 'How do you feel about it?', {
    reply_markup: {
      inline_keyboard: [
        feedbackOptions.map((option) => ({
          ...option,
          callback_data: `${option.callback_data}:${hoursTracked}:${messageId}`,
        })),
      ],
    },
  })
}
