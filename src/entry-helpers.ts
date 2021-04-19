import { TextNode } from "roam-client";

const LINK_KEYS = ['title', 'description', 'site_name', 'content_type']

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

  text = `${text.trim()} #phonetoroam`

  if(message?.sender_type === 'facebook') {
    text += ' #facebooktoroam'
  } else if (message?.sender_type === 'alfred') {
    text += ' #alfredtoroam'
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
