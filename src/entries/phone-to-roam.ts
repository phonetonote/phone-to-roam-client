import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key
const findPage: any = async (pageName, uid) => { 
  let queryResults = await window.roamAlphaAPI.q(
    `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageName}"]]`
  )
    
  if (queryResults.length === 0) {
    const basicPage: any = await window.roamAlphaAPI.createPage({
      page: { title: pageName, uid: uid }
    })

    queryResults = await window.roamAlphaAPI.q(
      `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageName}"]]`
    )      
  }
    
  return queryResults[0][0]["uid"];
}

const fetchNotes = () => {
  axios(`https://www.phonetoroam.com/messages.json?roam_key=${roamKey}`).then(async (res) => {
    res.data.forEach(async (item) => {
      console.log('mylog item', item)
      const date = new Date(item['created_at'])
      const title = toRoamDate(date)
      const parentUid = toRoamDateUid(date)
      const newParentUid = await findPage(title, parentUid)

      window.roamAlphaAPI.createBlock({
        location: {
          "parent-uid": newParentUid,
          order: 999999
        },
        block: {
          string: item['text'],
        }
      })

      axios.patch(`https://www.phonetoroam.com/messages/${item.id}.json?roam_key=${roamKey}`, {
        "status": "published"
      }).then(async (res) => {

      })
    })
  }).catch((e) => genericError(e))
}

fetchNotes()

document.addEventListener('click', (e: any) =>{
  if(e.target.innerText === 'DAILY NOTES') {
    fetchNotes()
  }
})

window.setInterval(fetchNotes, 20000)
