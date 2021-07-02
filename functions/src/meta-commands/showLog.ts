import * as admin from 'firebase-admin'
import { Telegraf, Context } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { format } from 'date-fns'
import { DB_ENTRIES_REF, Entry, FeedbackRate, MetaCommand } from '../common'

export async function handleShowLog(
  bot: Telegraf<Context<Update>>,
  ctx: Context<Update>,
): Promise<Message.TextMessage> {
  const snap = await admin.database()
    .ref(`${DB_ENTRIES_REF}/${ctx.from!.id}`)
    .orderByChild('date')
    .limitToFirst(10)
    .get()
  const userEntries: Record<string, Entry> | null = snap.exportVal()
  const entries = userEntries == null ? [] : Object.values(userEntries)
  
  if (Array.isArray(entries) && entries.length > 0) {
    const entriesList = entries
      .map(entry =>
        // TODO: place emoji of a "trach can" near each entry so that user
        //  could delete entry easily.
        //  use { entities: [] } in message extra to handle the action
        `— ${format(new Date(entry.date * 1e3), 'E do MMM')}: ${entry.hours_tracked} hours\. Felt like ${ FeedbackRate[entry.feedback] }`
      )
      .join('\n')
    return bot.telegram.sendMessage(
      ctx.chat!.id,
      `Here's what I found for you:\n${entriesList}\n`,
      {
        // parse_mode: 'MarkdownV2',
        // entities: []
      }
    )
  }

  return bot.telegram.sendMessage(
    ctx.chat!.id,
    `You don't have any entries yet.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📝 Add new entry',
              callback_data: MetaCommand.InvokeStart
            }
          ]
        ]
      }
    }
  )
}
