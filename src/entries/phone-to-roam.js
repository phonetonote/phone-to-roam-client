import { toRoamDateUid, genericError, WindowClient } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key
const client = new WindowClient()

axios(`https://www.phonetoroam.com/messages.json?roam_key=${roamKey}`).then(async (res) => {
  res.data.each((item) => {
    const parentUid = toRoamDateUid(item['created_at'])
    client.appendBlock({
      text: item['body'],
      parentUid: parentUid
    })
  })
}).catch((e) => genericError(e))
