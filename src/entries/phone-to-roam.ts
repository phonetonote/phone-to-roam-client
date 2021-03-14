import { pushBullets, addButtonListener, getConfigFromPage, genericError, getParentUidByBlockUid } from 'roam-client'
import axios from "axios";
import { formatRFC3339, startOfDay, endOfDay } from "date-fns";

const roamKey = document.getElementById('phone-to-roam-script')?.dataset.roam_key

axios(`https://phonetoroam.com/messages?roamKey=${roamKey}`).then(async (res: any) => {
  console.log('res', res)
}).catch((e: any) => genericError(e))



