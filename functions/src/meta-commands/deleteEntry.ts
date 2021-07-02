import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { DB_ENTRIES_REF } from '../common'

export async function deleteEntry(
  ctx: Context<Update>,
  refKey: string
): Promise<void> {
  try {
    await admin.database().ref(`${DB_ENTRIES_REF}/${ctx.from!.id}/${refKey}`).remove()
    ctx.answerCbQuery('🗑 Sucessfully removed!')
  } catch (error) {
    functions.logger.error(JSON.stringify({ error }))
  }
}
