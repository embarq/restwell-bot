import { Telegraf, Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

export const DB_ENTRIES_REF = 'entries'

export enum MetaCommand {
  AddEntryNotes = 'add_entry_notes',
  AddEntrySchedule = 'add_entry_schedule',
  DeleteEntry = 'delete_entry',
  DismissTrackingFlow = 'dismiss_tracking_flow',
  SaveTrackingFlow = 'save_tracking_flow',
  ShowLog = 'show_log',
  ShowStats = 'show_stats',
  ShowStatsMenu = 'show_stats_menu',
  TrackFeedack = 'track_feedack',
  TrackHours = 'track_hrs',
}

export const FeedbackRate: Record<number, string> = {
  1: '😞',
  2: '🙁',
  3: '😐',
  4: '🙂',
  5: '😊',
}

export const feedbackOptions = Object.entries(FeedbackRate).map(
  ([rating, text]) => ({
    text,
    callback_data: `${MetaCommand.TrackFeedack}:${rating}`,
  })
)

export function removeInlineKeyboard(bot: Telegraf, ctx: Context<Update>) {
  return bot.telegram.editMessageReplyMarkup(
    ctx.chat!.id,
    ctx.callbackQuery!.message!.message_id,
    ctx.callbackQuery!.inline_message_id,
    { inline_keyboard: [] }
  )
}
