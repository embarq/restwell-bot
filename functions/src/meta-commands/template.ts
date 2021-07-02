import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'

export function handleMetaCommandTemplate(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>,
  callbackQueryData: any
): Promise<Message.TextMessage> {
  ctx.answerCbQuery('Feature is not yet available. Stay in tune!')
  return null as any
}
