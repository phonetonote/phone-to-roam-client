import axios from "axios";
import { SCRIPT_ID, SERVER_URL } from "./constants";
import { findOrCreateParentUid } from "./find-or-create-parent-uid";
import {
  createBlock,
  InputTextNode,
  getCreateTimeByBlockUid,
} from "roam-client";
import { Message, nodeMaker } from "./node-maker";
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
      const messages: Message[] = res.data;
      for (var i = 0; i < messages.length; i++) {
        const message: Message = messages[i];
        await axios.patch(
          `${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`,
          { status: "syncing" }
        );
      }

      const messageMap = messages.reduce(reduceMessages, {});

      for (const pageName in messageMap) {
        for (const senderType in messageMap[pageName]) {
          const messages: Message[] = messageMap[pageName][senderType];
          const date = new Date(messages[0]["created_at"]),
            parentUid = findOrCreateParentUid(
              date,
              parentBlockFromSenderType(senderType),
              window.roamAlphaAPI,
              createBlock
            );
          for (const [i, message] of messages.entries()) {
            const node: InputTextNode = nodeMaker(
              message,
              hashtagFromSenderType(senderType) || configValues.hashtag
            );

            const existingBlock = await getCreateTimeByBlockUid(
              `ptr-${message.id}`
            );

            if (!existingBlock) {
              await createBlock({
                node,
                parentUid,
                order: startingOrder(parentUid, window.roamAlphaAPI) + i,
              });
            }

            await axios.patch(
              `${SERVER_URL}/messages/${message.id}.json?roam_key=${roamKey}`,
              { status: "synced" }
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
