import { toRoamDate, toRoamDateUid, TextNode, TreeNode, getTreeByPageName } from 'roam-client'
import { CONFIG, DEFAULT_HASHTAG, LINK_KEYS, SERVER_URL } from './constants'
import axios from "axios";
import Bugsnag from '@bugsnag/js'
import {nodeMaker} from "./node-maker"

const roamAPI = window.roamAlphaAPI

export const getSettingValueFromTree = ({tree, key, defaultValue = ""}: {
  tree: TreeNode[];
  key: string;
  defaultValue?: string;
}): string => {
  const node = tree.find((s) => RegExp(`^\\s*${key}\\s*$`, "i").test(s.text.trim()))
  const value = node ? node.children[0].text.trim() : defaultValue
  return value
}

const parentBlock = getSettingValueFromTree({
  key: "parent block title", 
  tree: getTreeByPageName(CONFIG)
})

export const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key
export const createBlock = ({node, parentUid, order}: { node: TextNode; parentUid: string; order: number }) => {
  const uid = roamAPI.util.generateUID()
  roamAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: { uid, string: node.text }
  })

  node.children.forEach((n, o) => createBlock({ node: n, parentUid: uid, order: o }))
  return uid
}

const findOrCreateParentUid: any = (date) => {
  const pageName = toRoamDate(date),
        roamUid = toRoamDateUid(date),
        results = () => roamAPI.q(`[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`)
  
  // if daily page doesn't exist, create it
  if (results().length === 0) { roamAPI.createPage({page: { title: pageName, uid: roamUid }}) }

  // if no parentBlock, return the daily page
  if(!parentBlock || typeof(parentBlock) !== 'string' || parentBlock.length === 0) { return results[0][0]["uid"] }

  // search for the matching parent block
  const children = results()[0][0]['children'] || []
  const potentialParentBlock = children.filter((item) => item['string'] === parentBlock)
  
  // if the matching parent block exists, return it
  if(potentialParentBlock.length > 0) { return potentialParentBlock[0]['uid'] } 
  
  // if not, create it    
  const node = { text: parentBlock, children: []} 
  return createBlock({ node, parentUid: results[0][0]['uid'], order: children.length})
}

export const fetchNotes = async (hashtag) => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    const messagesByPageName = res.data.reduce(function(obj, message) {
      const date = new Date(message['created_at']), 
            pageName = toRoamDate(date)
      
      if (!obj.hasOwnProperty(pageName)) { obj[pageName] = [] }
      obj[pageName].push(message)
      return obj
    }, {})

    for(const pageName in Object.keys(messagesByPageName)) {
      const messages = messagesByPageName[pageName], 
            date = new Date(messages[0]['created_at']), 
            parentUid = findOrCreateParentUid(date)

      let order = 0
      for(const [i, message] of messages.entries()) {
        const node = nodeMaker(message, hashtag),
              childrenQuery = roamAPI.q(`[ :find (pull ?e [* {:block/children [*]}]) :where [?e :block/uid "${parentUid}"]]`)

        order = (i > 0) ? (order + 1) : (childrenQuery?.[0]?.[0]?.children?.length || 0)

        await createBlock({ node, parentUid, order })
        await axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {"status": "published"})
      }
    }
  }).catch((e) => {
    console.log('phonetoroam error', e)
    Bugsnag.notify(e)
  })
}
