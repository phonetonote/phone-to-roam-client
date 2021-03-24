import { toRoamDate, toRoamDateUid, genericError, pushBullets, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";
import { TextNode } from "roam-client";
import { findPage, createBlock } from "../entry-helpers";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

const LINK_KEYS = ['title', 'description', 'site_name', 'content_type']
const SERVER_URL = 'http://phonetoroam.ngrok.io'

export const nodeMaker = (message) => {
  const children: TextNode[] = []

  const attachment = message?.attachments[0]
  let text = message['body']

  if(attachment?.media_type === 'link') {
    if(attachment['image_url'].length > 0) {
      children.push({
        text: `![](${attachment['image_url']})`,
        children: []
      })
    }

    LINK_KEYS.forEach((k) => {
      const v = attachment[k]
      if(v?.length > 0) {
        children.push({
          text: `${k.replace(/_/g, ' ')}:: ${v.trim()}`,
          children: []
        })
      }
    })

  // get a branch to a url and install that locally
  } else if (attachment?.media_type === 'image') {
    text = `![](${attachment.url})`
  } else if (attachment?.media_type === 'audio') {
    const title = message.body?.trim()?.length > 0 ? message.body : 'Audio Recording' 
    text = `[${title}](${attachment.url})`
  }
  //figure out how to mock axios request to test this? maybe separate the biz logic out

  return { text: text.trim(), children: children }
}

const fetchNotes = () => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    res.data.forEach(async (message) => {
      const node = nodeMaker(message)
      const date = new Date(message['created_at'])
      const title = toRoamDate(date)
      const parentUid = toRoamDateUid(date)
      const newParentUid = await findPage(title, parentUid)

      createBlock({
        node: node,
        parentUid: newParentUid,
        order: 999999  
      })

      axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {
        "status": "published"
      })
    })
  }).catch((e) => console.log('phonetoroam error', e))
}

fetchNotes()

document.addEventListener('click', (e: any) =>{
  if(e.target.innerText === 'DAILY NOTES') {
    fetchNotes()
  }
})

window.setInterval(fetchNotes, 20000)
