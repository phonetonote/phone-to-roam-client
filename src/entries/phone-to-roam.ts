import { fetchNotes, roamKey } from "../entry-helpers";
import { hashtagFromConfig, configure } from "../configure"
import Bugsnag from '@bugsnag/js'

Bugsnag.start({ apiKey: '0ca67498b27bd9e3fba038f7fb0cd0b4' })
if(roamKey) { Bugsnag.setUser(roamKey, undefined, undefined) }

configure()

const hashtag = hashtagFromConfig()

fetchNotes(hashtag)

document.addEventListener('click', (e: any) =>{
  if(e.target.innerText.toUpperCase() === 'DAILY NOTES') {
    fetchNotes(hashtag)
  }
})

window.setInterval(() => fetchNotes(hashtag), 20000)
