import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";
import { TextNode } from "roam-client";

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

const createBlock = ({
  node,
  parentUid,
  order,
}: {
  node: TextNode;
  parentUid: string;
  order: number;
}) => {
  const uid = window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: { uid, string: node.text },
  });
  node.children.forEach((n, o) =>
    createBlock({ node: n, parentUid: uid, order: o })
  );
  return uid;
};


const fetchNotes = () => {
  axios(`https://www.phonetoroam.com/messages.json?roam_key=${roamKey}`).then(async (res) => {
    res.data.forEach(async (item) => {
      const date = new Date(item['created_at'])
      const title = toRoamDate(date)
      const parentUid = toRoamDateUid(date)
      const newParentUid = await findPage(title, parentUid)
      const children: TextNode[] = []

      if(item.attachments.length === 1) {
        const attachment = item.attachments[0];
        if(attachment['image_url'].length > 0) {
          children.push({
            text: `![](${attachment['image_url']})`,
            children: []
          })
        }

        const keys = ['title', 'description', 'site_name', 'content_type']
        keys.forEach((k) => {
          const v = attachment[k]
          if(v.length > 0) {
            children.push({
              text: `${k.replaceAll("_", " ")}:: ${v.trim()}`,
              children: []
            })
          }
        })

      }

      createBlock({
        node: {
          text: item['text'].toString().trim(), 
          children: children
        },
        parentUid: newParentUid,
        order: 999999  
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
