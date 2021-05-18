import { getTreeByPageName } from 'roam-client'
import { getSettingValueFromTree } from 'roamjs-components'
import { CONFIG, PARENT_BLOCK_KEY } from './constants'

export const parentBlock = getSettingValueFromTree({
  key: PARENT_BLOCK_KEY,
  tree: getTreeByPageName(CONFIG)
})
