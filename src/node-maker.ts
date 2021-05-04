import { TextNode } from 'roam-client'
import { LINK_KEYS } from './constants'

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