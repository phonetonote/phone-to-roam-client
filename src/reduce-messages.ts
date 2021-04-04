import { toRoamDate } from 'roam-client'

export const reduceMessages = (obj, message) => {
  const date = new Date(message['created_at']), 
        pageName = toRoamDate(date)
  
  if (!obj.hasOwnProperty(pageName)) { obj[pageName] = [] }
  obj[pageName].push(message)
  return obj
}