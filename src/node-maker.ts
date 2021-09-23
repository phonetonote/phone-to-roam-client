import { TextNode } from "roam-client";
import { LINK_KEYS } from "./constants";

type LinkKey = typeof LINK_KEYS[number];

type Attachment = {
  [linkKey in LinkKey]: string;
} & {
  media_type: string;
  image_url: string;
  url: string;
};

export type Message = {
  type: string;
  body: string;
  message: string;
  text: string;
  attachments: Attachment[];
  sender_type: string;
  created_at: string;
};
export const nodeMaker = (message: Message, hashtag: string) => {
  const children: TextNode[] = [];
  const attachment = message?.attachments[0];
  let text = message["text"];

  if (attachment?.media_type === "link") {
    if (attachment.image_url && attachment.image_url.length > 0) {
      children.push({
        text: `![](${attachment["image_url"]})`,
        children: [],
      });
    }

    LINK_KEYS.forEach((k: LinkKey) => {
      const v = attachment[k];
      if (v?.length > 0) {
        children.push({
          text: `${k.replace(/_/g, " ")}:: ${v.trim()}`,
          children: [],
        });
      }
    });
  } else if (attachment?.media_type === "image") {
    text = `![](${attachment.url})`;
  } else if (attachment?.media_type === "audio") {
    const title =
      message.body?.trim()?.length > 0 ? message.body : "Audio Recording";
    text = `[${title}](${attachment.url})`;
  }

  text = `${text.trim()}`;
  const validHashtag =
    hashtag && typeof hashtag === "string" && hashtag.length > 0;
  const existingTags = /#\w+toroam/;
  const needsNewTag = !!!text.match(existingTags)?.length;

  if (validHashtag && needsNewTag) {
    text = `${text} #${hashtag}`;
  }

  return { text: `${text}`, children: children };
};
