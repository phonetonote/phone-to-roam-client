import axios from "axios";
import { SCRIPT_ID, SERVER_URL } from "./constants";
import { findOrCreateParentUid } from "./find-or-create-parent-uid";
import { createBlock } from "roam-client";
import { nodeMaker } from "./node-maker";
import Bugsnag from "@bugsnag/js";
import {
  parentBlockFromSenderType,
  hashtagFromSenderType,
} from "./entry-helpers";
import { reduceMessages } from "./reduce-messages";
import { startingOrder } from "./starting-order";
import { configValues } from "./configure";

export const roamKey = document.getElementById(SCRIPT_ID)?.dataset.roam_key;

export const fetchNotes = async () => {
  axios(`${SERVER_URL}/messages.json?roam_key=${roamKey}`)
    .then(async (res) => {
      const messageMap = res.data.reduce(reduceMessages, {});

      for (const pageName in messageMap) {
        for (const senderType in messageMap[pageName]) {
          const messages = messageMap[pageName][senderType];
          const date = new Date(messages[0]["created_at"]),
            parentUid = findOrCreateParentUid(
              date,
              parentBlockFromSenderType(senderType),
              window.roamAlphaAPI,
              createBlock
            ), // todo replace roam API with roamjs typed version,
            hashtagToUse =
              hashtagFromSenderType(senderType) || configValues.hashtag,
            localStartingOrder = startingOrder(parentUid, window.roamAlphaAPI);
          for (const [i, message] of messages.entries()) {
            const node = nodeMaker(message, hashtagToUse);
            await createBlock({
              node,
              parentUid,
              order: localStartingOrder + i,
            });
            await axios.patch(
              `${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`,
              { status: "published" }
            );
          }
        }
      }
    })
    .catch((e) => {
      console.log("phonetoroam error", e);
      Bugsnag.notify(e);
    });
};
