import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

axios(`https://www.phonetoroam.com/messages.json?roam_key=${roamKey}`).then(async (res) => {
  console.log('mylog 1', res)
  console.log('mylog 2', res.data)
  res.data.forEach((item) => {
    const date = item['created_at']
    const title = toRoamDate(date)
    const parentUid = toRoamDateUid(date)
    console.log('mylog 3', parentUid)
    // const  queryResults = () => { async(
    //     await 
    //   )

    // } 
      

    // console.log('mylog 3', item)
    // const parentUid = toRoamDateUid(item['created_at'])
    // client.appendBlock({
    //   text: item['body'],
    //   parentUid: parentUid
    // })
  })
}).catch((e) => genericError(e))
