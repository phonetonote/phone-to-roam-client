import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";
import { findPage, createBlock, nodeMaker, configure } from "../entry-helpers";
import Bugsnag from '@bugsnag/js'

// #TODO this should change based off some netlify env variable
const SERVER_URL = 'https://phonetoroam.ngrok.io'
const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

Bugsnag.start({ apiKey: '0ca67498b27bd9e3fba038f7fb0cd0b4' })
if(roamKey) { Bugsnag.setUser(roamKey, undefined, undefined) }

const fetchNotes = () => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    let order = 0
    res.data.forEach(async (message, i) => {
      const node = nodeMaker(message)
      const date = new Date(message['created_at'])
      const title = toRoamDate(date)
      const oldParentId = toRoamDateUid(date)
      const parentUid = await findPage(title, oldParentId)
      const childrenQuery = window.roamAlphaAPI.q(`[ :find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${title}"]]`)
      console.log('ptr logging', [i, childrenQuery, order])
      if(i === 0) {
        order = childrenQuery ? (childrenQuery[0][0]?.children?.length || 0) : 0
      } else {
        order = order + 1
      }
      
      
      createBlock({ node, parentUid, order })
      axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {"status": "published"})
    })
  }).catch((e) => {
    console.log('phonetoroam error', e)
    Bugsnag.notify(e)
  })
}

configure()
fetchNotes()

document.addEventListener('click', (e: any) =>{
  if(e.target.innerText === 'DAILY NOTES') {
    fetchNotes()
  }
})

window.setInterval(fetchNotes, 20000)
