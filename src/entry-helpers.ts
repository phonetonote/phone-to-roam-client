import { toRoamDate, toRoamDateUid, TextNode, TreeNode } from 'roam-client'
import { CONFIG, DEFAULT_HASHTAG, LINK_KEYS, SERVER_URL } from './constants'
import axios from "axios";
import Bugsnag from '@bugsnag/js'
import { parentBlock } from "./configure"
import {nodeMaker} from "./node-maker"

export const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key
export const createBlock = ({
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

const findOrCreateParentUid: any = (date) => {
  const pageName = toRoamDate(date)
  const roamUid = toRoamDateUid(date)
  let queryResults = window.roamAlphaAPI.q(
    `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`
  )
    
  if (queryResults.length === 0) {
    const basicPage: any = window.roamAlphaAPI.createPage({
      page: { title: pageName, uid: roamUid }
    })

    queryResults = window.roamAlphaAPI.q(
      `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`
    )      
  }

  if(parentBlock && typeof(parentBlock) === 'string' && parentBlock.length > 0) {
    const children = window.roamAlphaAPI.q(
      `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`)[0][0]['children'] || []
    const potentialParentBlock = children.filter((item) => item['string'] === parentBlock)
    if(potentialParentBlock.length > 0) {
      return potentialParentBlock[0]['uid']
    } else {
      const node = { text: parentBlock, children: []}
      return createBlock({ node, parentUid: queryResults[0][0]['uid'], order: children.length})
    }

  } else {
    return queryResults[0][0]["uid"]
  }
}

export const fetchNotes = async (hashtag) => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    let order = 0
    const messagesByPageName = res.data.reduce(function(obj, message) {
      const date = new Date(message['created_at'])
      const pageName = toRoamDate(date)
      if (!obj.hasOwnProperty(pageName)) { obj[pageName] = [] }
      obj[pageName].push(message);
      return obj;
    }, {})

    console.log('ptr messagesByPageName', messagesByPageName)

    const pageNames = Object.keys(messagesByPageName)

    for(var i = 0; i < pageNames.length; i++) {
      const pageName = pageNames[i]
      const messages = messagesByPageName[pageName]
      console.log('ptr messages', messages)
      const date = new Date(messages[0]['created_at'])
      const parentUid = findOrCreateParentUid(date)
      console.log('ptr parentUid', parentUid)
      for(var j = 0; j < messages.length; j++) {
        const message = messages[j]
        const node = nodeMaker(message, hashtag)

        const childrenQuery = window.roamAlphaAPI.q(`[ :find (pull ?e [* {:block/children [*]}]) :where [?e :block/uid "${parentUid}"]]`)

        if(i === 0) {
          order = (childrenQuery && childrenQuery[0] && childrenQuery[0][0]) ? (childrenQuery[0][0]?.children?.length || 0) : 0
        } else {
          order = order + 1
        }
        
        await createBlock({ node, parentUid, order })
        await axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {"status": "published"})
      }
    }
  }).catch((e) => {
    console.log('phonetoroam error', e)
    Bugsnag.notify(e)
  })
}
