import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";
import { findPage, createBlock, nodeMaker } from "../entry-helpers";
import Bugsnag from '@bugsnag/js'

const SERVER_URL = 'https://www.phonetoroam.com'
const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

Bugsnag.start({ apiKey: '0ca67498b27bd9e3fba038f7fb0cd0b4' })
if(roamKey) { Bugsnag.setUser(roamKey, undefined, undefined) }

const fetchNotes = () => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    res.data.forEach(async (message) => {
      const node = nodeMaker(message)
      const date = new Date(message['created_at'])
      const title = toRoamDate(date)
      const oldParentId = toRoamDateUid(date)
      const parentUid = await findPage(title, oldParentId)
      const childrenQuery = window.roamAlphaAPI.q(`[ :find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${title}"]]`)
      console.log('childrenQuery', childrenQuery)
      const order = childrenQuery ? (childrenQuery[0][0]?.children?.length || 0) : 0
      
      createBlock({ node, parentUid, order })
      axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {"status": "published"})
    })
  }).catch((e) => {
    console.log('phonetoroam error', e)
    Bugsnag.notify(e)
  })
}

fetchNotes()

document.addEventListener('click', (e: any) =>{
  if(e.target.innerText === 'DAILY NOTES') {
    fetchNotes()
  }
})

window.setInterval(fetchNotes, 20000)
