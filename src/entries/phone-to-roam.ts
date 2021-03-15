import { toRoamDate, toRoamDateUid, genericError, pushBullets } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

axios(`https://www.phonetoroam.com/messages.json?roam_key=${roamKey}`).then(async (res) => {
  console.log('mylog 1', res)
  console.log('mylog 2', res.data)
  res.data.forEach((item) => {
    try {
      const date = item['created_at']
      const title = toRoamDate(date)
      const parentUid = toRoamDateUid(date)

      pushBullets([item['body']], parentUid, parentUid)
    } catch(e) {
      console.error(e.response.data.error)
    }
    

    console.log('mylog 3', item)
  })
}).catch((e) => genericError(e))
