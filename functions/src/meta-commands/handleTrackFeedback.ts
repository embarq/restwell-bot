import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { FeedbackRate, MetaCommand } from '../common'

export function handleTrackFeedback(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>,
  callbackQueryData: {
    hoursTracked: number
    feedback: number
    messageId: number
  }
): Promise<Message.TextMessage> {
  const { feedback, hoursTracked, messageId } = callbackQueryData

  return bot.telegram.sendMessage(
    ctx.chat!.id,
    `Please check if the data is correct:\n` +
    `You got ${hoursTracked} hours of sleep and it feels like ${
      FeedbackRate[Number(feedback)]
    }`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Dismiss',
              callback_data: MetaCommand.DismissTrackingFlow,
            },
            {
              text: 'Ok',
              callback_data: `${MetaCommand.SaveTrackingFlow}:${[
                feedback,
                hoursTracked,
                messageId,
              ].join(':')}`,
            },
          ],
        ],
      },
    }
  )
}
