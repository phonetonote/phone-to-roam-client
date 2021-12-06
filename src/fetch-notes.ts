import axios from "axios";
import { SCRIPT_ID, SERVER_URL } from "./constants";
import { findOrCreateParentUid } from "./find-or-create-parent-uid";
import {
  createBlock,
  InputTextNode,
  getCreateTimeByBlockUid,
} from "roam-client";
import { FeedItem, nodeMaker } from "./node-maker";
import Bugsnag from "@bugsnag/js";
import {
  parentBlockFromSenderType,
  hashtagFromSenderType,
} from "./entry-helpers";
import { reduceFeedItems } from "./reduce-messages";
import { startingOrder } from "./starting-order";
import { configValues } from "./configure";

export const roamKey = document.getElementById(SCRIPT_ID)?.dataset.roam_key;

export const fetchNotes = async () => {
  axios(`${SERVER_URL}/feed.json?roam_key=${roamKey}`)
    .then(async (res) => {
      const feedItems: FeedItem[] = res.data["items"];
      for (var i = 0; i < feedItems.length; i++) {
        const feedItem: FeedItem = feedItems[i];
        await axios.patch(
          `${SERVER_URL}/feed/${feedItem.id}.json?roam_key=${roamKey}`,
          { status: "syncing" }
        );
      }

      const messageMap = feedItems.reduce(reduceFeedItems, {});

      for (const pageName in messageMap) {
        for (const senderType in messageMap[pageName]) {
          const feedItems: FeedItem[] = messageMap[pageName][senderType];
          const date = new Date(feedItems[0].date_published),
            parentUid = findOrCreateParentUid(
              date,
              parentBlockFromSenderType(senderType),
              window.roamAlphaAPI,
              createBlock
            );
          for (const [i, feedItem] of feedItems.entries()) {
            const node: InputTextNode = nodeMaker(
              feedItem,
              hashtagFromSenderType(senderType) || configValues.hashtag
            );

            const existingBlock = await getCreateTimeByBlockUid(
              `ptr-${feedItem.id}`
            );

            if (!existingBlock) {
              await createBlock({
                node,
                parentUid,
                order: startingOrder(parentUid, window.roamAlphaAPI) + i,
              });
            }

            await axios.patch(
              `${SERVER_URL}/feed/${feedItem.id}.json?roam_key=${roamKey}`,
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
