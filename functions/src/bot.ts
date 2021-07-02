import { Context, Telegraf } from 'telegraf'
import { CallbackQuery, Update } from 'typegram'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { MetaCommand, removeInlineKeyboard } from './common'
import { handleStartCommand } from './commands/start'
import { handleDebugCommand } from './commands/debug'
import { deleteEntry } from './meta-commands/deleteEntry'
import { handleAddEntryNotes } from './meta-commands/handleAddEntryNotes'
import { handleAddEntrySchedule } from './meta-commands/handleAddEntrySchedule'
import { handleSaveTrackingData } from './meta-commands/handleSaveTrackingData'
import { handleShowStatsMenu } from './meta-commands/handleShowStatsMenu'
import { handleTrackFeedback } from './meta-commands/handleTrackFeedback'
import { handleTrackHoursResponse } from './meta-commands/handleTrackHoursResponse'
import { handleShowLog } from './meta-commands/showLog'

admin.initializeApp()

export default function initBot(token: string): Telegraf {
  const bot = new Telegraf(token, {
    telegram: { webhookReply: true },
  })

  bot.start(handleStartCommand(bot))
  bot.command('log', ctx => handleShowLog(bot, ctx))
  bot.command('debug', handleDebugCommand(bot))

  bot.on('callback_query', handleMetaCommand(bot))

  return bot
}

function handleMetaCommand(bot: Telegraf) {
  return async (ctx: Context<Update>): Promise<unknown> => {
    const { data } = ctx.callbackQuery as CallbackQuery & { data: string }
    const callbackQueryData: string = data

    if (callbackQueryData === MetaCommand.InvokeStart) {
      try {
        return await handleStartCommand(bot)(ctx)
      } catch (error) {
        await ctx.answerCbQuery('An error occured.')
        return functions.logger.error(error)
      }
    }

    if (callbackQueryData.startsWith(MetaCommand.TrackHours)) {
      const [_, hoursTracked, messageId] = callbackQueryData
        .split(':')
        .map(Number)
      return handleTrackHoursResponse(bot, ctx, { hoursTracked, messageId })
    }

    if (callbackQueryData.startsWith(MetaCommand.TrackFeedack)) {
      const [_, feedback, hoursTracked, messageId] = callbackQueryData
        .split(':')
        .map(Number)

      await removeInlineKeyboard(bot, ctx)
      try {
        return await handleTrackFeedback(bot, ctx, {
          hoursTracked,
          feedback,
          messageId,
        })
      } catch (error) {
        await ctx.answerCbQuery('An error occured.')
        return functions.logger.error(error)
      }
    }

    if (callbackQueryData.startsWith(MetaCommand.SaveTrackingFlow)) {
      const [_, feedback, hoursTracked, messageId] = callbackQueryData
        .split(':')
        .map(Number)

      await removeInlineKeyboard(bot, ctx)

      try {
        return await handleSaveTrackingData(bot, ctx, {
          hoursTracked,
          feedback,
          messageId,
        })
      } catch (error) {
        await ctx.answerCbQuery('An error occured.')
        return functions.logger.error(error);
      }
    }

    if (callbackQueryData.startsWith(MetaCommand.AddEntryNotes)) {
      const [_, entryId /* messageId */] = callbackQueryData
        .split(':')
        .map(Number)
      return handleAddEntryNotes(bot, ctx, { entryId })
    }

    if (callbackQueryData.startsWith(MetaCommand.AddEntrySchedule)) {
      const [_, entryId /* messageId */] = callbackQueryData
        .split(':')
        .map(Number)
      return handleAddEntrySchedule(bot, ctx, { entryId })
    }

    if (callbackQueryData.startsWith(MetaCommand.DeleteEntry)) {
      const [_, refKey] = callbackQueryData.split(':')
      return deleteEntry(ctx, refKey)
    }

    if (callbackQueryData === MetaCommand.DismissTrackingFlow) {
      return ctx.answerCbQuery('You can start over anytime!')
    }

    if (callbackQueryData === MetaCommand.ShowLog) {
      try {
        return await handleShowLog(bot, ctx)
      } catch (error) {
        await ctx.answerCbQuery('An error occured.')
        return functions.logger.error(error)
      }
    }

    if (callbackQueryData === MetaCommand.ShowStatsMenu) {
      await removeInlineKeyboard(bot, ctx)
      return handleShowStatsMenu(bot, ctx)
    }

    if (callbackQueryData.startsWith(MetaCommand.ShowStats)) {
      // TODO: get data from db and populate into a html template.
      //       Then return a pic and link to the user.
      await removeInlineKeyboard(bot, ctx)
      return ctx.answerCbQuery('Feature is not yet available. Stay in tune!')
    }

    return ctx.answerCbQuery()
  }
}
