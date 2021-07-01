const { Telegraf } = require('telegraf')
const admin = require('firebase-admin')
const rtdb = admin.database

admin.initializeApp()

const removeInlineKeyboard = (bot, ctx) => {
  return bot.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    ctx.callbackQuery.message.message_id,
    ctx.callbackQuery.inline_message_id,
    { inline_keyboard: [] }
  )
}

module.exports = function initBot(token) {
  const bot = new Telegraf(token, {
    telegram: { webhookReply: true }
  })
  
  const predefinedHours = [
    ...Array.from(new Array(14), (_, i) => String(i + 1)),
    '15+'
  ]
  
  const FeedbackRate = {
    5: '😊',
    4: '🙂',
    3: '😐',
    2: '🙁',
    1: '😞',
  }
  
  const feedbackOptions = Object.entries(FeedbackRate).map(
    ([rating, text]) => ({ text, callback_data: `track_feedack:${rating}` })
  )
  
  bot.start(ctx => {
    const hoursKeyboard = predefinedHours.map(hr => ({ text: hr, callback_data: `track_hrs:${hr}:${ctx.message.message_id}` }))
    bot.telegram.sendMessage(ctx.chat.id, 'How much hours did you sleep today?', {
      reply_markup: {
        inline_keyboard: [
          hoursKeyboard.slice(0, (hoursKeyboard.length / 2)),
          hoursKeyboard.slice((hoursKeyboard.length / 2), hoursKeyboard.length),
        ],
      }
    })
  })
  
  bot.on('callback_query', async (ctx) => {
    /** @type {string} */
    // @ts-ignore
    const callbackQueryData = ctx.callbackQuery.data
  
    if (callbackQueryData.startsWith('track_hrs:')) {
      // TODO: validate input
      const [_, hoursTracked, messageId] = callbackQueryData.split(':')

      await removeInlineKeyboard(bot, ctx)

      return bot.telegram.sendMessage(ctx.chat.id, 'How do you feel about it?', {
        reply_markup: {
          inline_keyboard: [
            feedbackOptions.map(option => ({
              ...option,
              callback_data: `${option.callback_data}:${hoursTracked}:${messageId}`
            })),
          ],
        }
      })
    }
  
    if (callbackQueryData.startsWith('track_feedack:')) {
      const [_, feedback, hoursTracked] = callbackQueryData.split(':')

      await removeInlineKeyboard(bot, ctx)
  
      return bot.telegram.sendMessage(
        ctx.chat.id,
        [
          'Please check if data is correct:',
          `You got ${hoursTracked} hours of sleep and it feels like ${FeedbackRate[Number(feedback)]}`
        ].join('\n'),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Dismiss',
                  callback_data: 'dismiss_tracking_flow'
                },
                {
                  text: 'Ok',
                  callback_data: 'save_tracking_flow:' + callbackQueryData.replace('track_feedack:', '')
                }
              ]
            ],
          }
        }
      )
    }
  
    if (callbackQueryData.startsWith('save_tracking_flow')) {
      // TODO: add 2 buttons: "Add schedule" and "Add notes"
      const [_, feedback, hours_tracked, message_id] = callbackQueryData.split(':')
      await rtdb().ref('entries').push({
        feedback: Number(feedback),
        hours_tracked: Number(hours_tracked),
        message_id,
        uid: ctx.from.id,
        chat_id: ctx.chat.id
      })
      ctx.answerCbQuery('Info is saved. Have a good day/night!')
      bot.telegram.sendMessage(ctx.chat.id, 'Everything is stored!', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🗄 Show Your Log',
                callback_data: 'show_log'
              },
              {
                text: '📊 Show Stats',
                callback_data: 'show_stats_menu'
              }
            ]
          ]
        }
      })
      await removeInlineKeyboard(bot, ctx)
      return
    }
  
    if (callbackQueryData === 'dismiss_tracking_flow') {
      return ctx.answerCbQuery('You can start over anytime!');
    }

    if (callbackQueryData === 'show_log') {
      return ctx.answerCbQuery('Feature is not yet available. Stay in tune!')
    }

    if (callbackQueryData === 'show_stats_menu') {
      await removeInlineKeyboard(bot, ctx)
      return bot.telegram.sendMessage(ctx.chat.id, 'Select period', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Past week',
                callback_data: 'show_stats:past_week'
              },
              {
                text: 'Current week',
                callback_data: 'show_stats:current_week'
              },
            ],
            [
              {
                text: 'Past month',
                callback_data: 'show_stats:past_month'
              },
              {
                text: 'Current month',
                callback_data: 'show_stats:current_month'
              },
            ]
          ]
        }
      })
    }

    if (callbackQueryData.startsWith('show_stats:')) {
      // TODO: get data from db and populate into a html template.
      //       Then return a pic and link to the user.
      await removeInlineKeyboard(bot, ctx)
      return ctx.answerCbQuery('Feature is not yet available. Stay in tune!')
    }
  
    ctx.answerCbQuery()
  })

  return bot
}
