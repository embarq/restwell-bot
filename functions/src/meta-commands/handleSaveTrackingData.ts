import * as admin from 'firebase-admin'
import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { DB_ENTRIES_REF, Entry, MetaCommand } from '../common'

export async function handleSaveTrackingData(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>,
  callbackQueryData: {
    feedback: number
    hoursTracked: number
    messageId: number
  }
): Promise<Message.TextMessage> {
  const { feedback, hoursTracked, messageId } = callbackQueryData
  const payload: Entry = {
    feedback: feedback,
    hours_tracked: hoursTracked,
    message_id: messageId,
    uid: ctx.from!.id,
    chat_id: ctx.chat!.id,
    date: ctx.callbackQuery!.message!.date,
    created_at: ctx.callbackQuery!.message!.date,
  }
  const ref = await admin.database()
    .ref(`${DB_ENTRIES_REF}/${ctx.from!.id}`)
    .push(payload)

  ctx.answerCbQuery('Info is saved. Have a good day/night!')

  return bot.telegram.sendMessage(
    ctx.chat!.id,
    'New entry created. Good Job!',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '⏰ Add schedule',
              callback_data: `${MetaCommand.AddEntrySchedule}:${ref.key}:${messageId}`,
            },
            {
              text: '📝 Add notes',
              callback_data: `${MetaCommand.AddEntryNotes}:${ref.key}:${messageId}`,
            },
          ],
          [
            {
              text: '🗄 Show Your Log',
              callback_data: MetaCommand.ShowLog,
            },
            {
              text: '📊 Show Stats',
              callback_data: MetaCommand.ShowStatsMenu,
            },
          ],
          [
            {
              text: '🗑 Delete last entry',
              callback_data: `${MetaCommand.DeleteEntry}:${ref.key}`,
            },
          ],
        ],
      },
    }
  )
}
