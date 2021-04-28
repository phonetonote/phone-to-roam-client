import { TextNode, TreeNode, getTreeByPageName } from "roam-client";
import { createConfigObserver } from "roamjs-components";

const LINK_KEYS = ['title', 'description', 'site_name', 'content_type']

const ID = "ptr";
const CONFIG = `roam/js/${ID}`;
const DEFAULT_HASHTAG = "phonetoroam"

const toFlexRegex = (key: string): RegExp => new RegExp(`^\\s*${key}\\s*$`, "i");
const getSettingValueFromTree = ({
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

const configTree = () => getTreeByPageName(CONFIG)
const hashtagFromConfig =  getSettingValueFromTree({
  key: "hashtag",
  defaultValue: DEFAULT_HASHTAG,
  tree: configTree(),
})

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

export const nodeMaker = (message) => {
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

  text = `${text.trim()} #${hashtagFromConfig}`

  if(message?.sender_type === 'facebook') {
    text += ' #facebooktoroam'
  } else if (message?.sender_type === 'alfred') {
    text += ' #alfredtoroam'
  } else if (message?.sender_type === 'telegram') {
    text += ' #telegramtoroam'
  }

  return { text: `${text}`, children: children }
}

export const findPage: any = async (pageName, uid) => { 
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
