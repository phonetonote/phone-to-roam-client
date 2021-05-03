import { createConfigObserver } from "roamjs-components";
import { getTreeByPageName, toRoamDate, toRoamDateUid, TextNode, TreeNode } from 'roam-client'
import { CONFIG, DEFAULT_HASHTAG, LINK_KEYS, SERVER_URL } from './constants'
import axios from "axios";
import Bugsnag from '@bugsnag/js'

const toFlexRegex = (key: string): RegExp => new RegExp(`^\\s*${key}\\s*$`, "i");
const configTree = () => { return getTreeByPageName(CONFIG) }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

export const configure = () => {
  createConfigObserver({
    title: CONFIG,
    config: {
      tabs: [
        {
          id: "home",
          fields: [
            {
              type: "text",
              title: "hashtag",
              description: "if you want  #hashtag at the end of each phonetoroam note, put what you want that hashtag to be here. if you do not want a hashtag, make this blank.",
              defaultValue: DEFAULT_HASHTAG
            },            
            {
              type: "text",
              title: "parent block title",
              description: "if you want your phonetoroam notes nested under a block, give that block a name here. if you do not want them nested under anything, leave this blank.",
              defaultValue: "phonetoroam notes"
            },
          ],
        },
      ],
    },
  });
}

const getHashtag = () => getSettingValueFromTree({
  key: "hashtag",
  defaultValue: DEFAULT_HASHTAG,
  tree: configTree(),
})

export const hashtagFromConfig = () => {
  let hashtag = getHashtag()

  if(hashtag.indexOf('#') === 0) {
    hashtag = hashtag.substring(1)
  }

  return (hashtag && (typeof(hashtag) === 'string') && (hashtag.length > 0)) ? hashtag : ""
} 



export const nodeMaker = (message, hashtag) => {
  const children: TextNode[] = []

  const attachment = message?.attachments[0]
  let text = message['text']

  if(attachment?.media_type === 'link') {
    if(attachment.image_url && attachment.image_url.length > 0) {
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

  } else if (attachment?.media_type === 'image') {
    text = `![](${attachment.url})`
  } else if (attachment?.media_type === 'audio') {
    const title = message.body?.trim()?.length > 0 ? message.body : 'Audio Recording' 
    text = `[${title}](${attachment.url})`
  }

  text = `${text.trim()}`
  if(hashtag && (typeof(hashtag) === 'string') && (hashtag.length > 0)) {
    text = `${text} #${hashtag}`
  }

  if(message?.sender_type === 'facebook') {
    text += ' #facebooktoroam'
  } else if (message?.sender_type === 'alfred') {
    text += ' #alfredtoroam'
  } else if (message?.sender_type === 'telegram') {
    text += ' #telegramtoroam'
  }

  return { text: `${text}`, children: children }
}

export const getSettingValueFromTree = ({
  tree,
  key,
  defaultValue = "",
}: {
  tree: TreeNode[];
  key: string;
  defaultValue?: string;
}): string => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node ? node.children[0].text.trim() : defaultValue;
  return value;
};

const parentBlock = getSettingValueFromTree({
  key: "parent block title",
  tree: configTree(),
})

export const findParentUid: any = async (pageName, uid) => { 
  console.log('ptr log findParentUid', pageName, uid)
  let queryResults = await window.roamAlphaAPI.q(
    `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`
  )
    
  if (queryResults.length === 0) {
    const basicPage: any = await window.roamAlphaAPI.createPage({
      page: { title: pageName, uid: uid }
    })

    queryResults = await window.roamAlphaAPI.q(
      `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`
    )      
  }

  if(parentBlock && typeof(parentBlock) === 'string' && parentBlock.length > 0) {
    const children = await window.roamAlphaAPI.q(
      `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`)[0][0]['children'] || []
    console.log('ptr children', children)
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

export const fetchNotes = (hashtag) => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`).then(async (res) => {
    let order = 0
    res.data.forEach(async (message, i) => {
      const node = nodeMaker(message, hashtag)
      const date = new Date(message['created_at'])
      const title = toRoamDate(date)
      const oldParentId = toRoamDateUid(date)
      const parentUid = await findParentUid(title, oldParentId)
      const childrenQuery = window.roamAlphaAPI.q(`[ :find (pull ?e [* {:block/children [*]}]) :where [?e :block/uid "${parentUid}"]]`)

      if(i === 0) {
        order = (childrenQuery && childrenQuery[0] && childrenQuery[0][0]) ? (childrenQuery[0][0]?.children?.length || 0) : 0
      } else {
        order = order + 1
      }
      
      await createBlock({ node, parentUid, order })
      await axios.patch(`${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`, {"status": "published"})
      await sleep(500)
    })
  }).catch((e) => {
    console.log('phonetoroam error', e)
    Bugsnag.notify(e)
  })
}
