import axios from 'axios'
import { SCRIPT_ID, SERVER_URL } from './constants'
import { findOrCreateParentUid } from './find-or-create-parent-uid'
import { createBlock } from 'roam-client'
import { nodeMaker } from "./node-maker"
import Bugsnag from '@bugsnag/js'
import { parentBlock } from './entry-helpers'
import { reduceMessages } from './reduce-messages'
import { startingOrder } from './starting-order'

export const roamKey = document.getElementById(SCRIPT_ID)?.dataset.roam_key

export const fetchNotes = async (hashtag) => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    const messagesByPageName = res.data.reduce(reduceMessages, {})

    for(const pageName in Object.keys(messagesByPageName)) {
      const messages = messagesByPageName[pageName], 
            date = new Date(messages[0]['created_at']), 
            parentUid = findOrCreateParentUid(date, parentBlock, window.roamAlphaAPI, createBlock), // todo replace roam API with roamjs typed version,
            localStartingOrder = startingOrder(parentUid, window.roamAlphaAPI)

      for(const [i, message] of messages.entries()) {
        const node = nodeMaker(message, hashtag)
        await createBlock({ node, parentUid, order: (localStartingOrder + i) })
        await axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {"status": "published"})
      }
    }
  }).catch((e) => {
    console.log('phonetoroam error', e)
    Bugsnag.notify(e)
  })
}