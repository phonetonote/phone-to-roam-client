import { createConfigObserver } from "roamjs-components";
import { CONFIG, DEFAULT_HASHTAG } from './constants'
import { getSettingValueFromTree } from 'roamjs-components'
import { getTreeByPageName, TreeNode } from 'roam-client'


const getHashtag = () => getSettingValueFromTree({
  key: "hashtag",
  defaultValue: DEFAULT_HASHTAG,
  tree: getTreeByPageName(CONFIG),
})

export const hashtagFromConfig = (): string => {
  let hashtag = getHashtag()

  if(hashtag.indexOf('#') === 0) {
    hashtag = hashtag.substring(1)
  }

  return (hashtag && (typeof(hashtag) === 'string') && (hashtag.length > 0)) ? hashtag : ""
}

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