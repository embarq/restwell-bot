import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'

export function handleAddEntryNotes(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>,
  callbackQueryData: { entryId: number }
): Promise<Message.TextMessage> {
  ctx.answerCbQuery('Feature is not yet available. Stay in tune!')
  return null as any
}
