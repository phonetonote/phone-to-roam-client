import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key
const findPage: any = async (pageName, uid) => { 
   const queryResults = await window.roamAlphaAPI.q(
      `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageName}"]]`
    );

   console.log('mylog queryResults', queryResults)
    
    if (queryResults.length === 0) {
      const basicPage: any = await window.roamAlphaAPI.createPage({
        page: {
          title: pageName,
          uid: uid
        }
      });
      return basicPage.uid;
    }
    return queryResults[0]["uid"];
}

axios(`https://www.phonetoroam.com/messages.json?roam_key=${roamKey}`).then(async (res) => {
  
  console.log('mylog 1', res)
  console.log('mylog 2', res.data)
  res.data.forEach(async (item) => {
    const date = new Date(item['created_at'])
    const title = toRoamDate(date)
    const parentUid = toRoamDateUid(date)
    const newParentUid = await findPage(title, parentUid)

    console.log('mylog parentUid', parentUid)
    console.log('mylog newParentUid', newParentUid)
    // window.roamAlphaAPI.createBlock({
    //   location: {
    //     "parent-uid": parentUid,
    //     order: 999999
    //   },
    //   block: {
    //     string: item['body'],
    //   }
    // })
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
