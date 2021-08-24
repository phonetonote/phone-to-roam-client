import { fetchNotes, roamKey } from "../fetch-notes";
import { indexPages } from "../index-pages";
import { configure, configValues } from "../configure";
import Bugsnag from "@bugsnag/js";
import { parseRoamDate } from "roam-client";

Bugsnag.start({ apiKey: "0ca67498b27bd9e3fba038f7fb0cd0b4" });
if (roamKey) {
  Bugsnag.setUser(roamKey, undefined, undefined);
}

configure();

const { hashtag, indexingEnabled } = configValues;
fetchNotes(hashtag);

if (indexingEnabled) {
  indexPages();
  window.setInterval(() => indexPages(), 1000 * 60 * 20);
}

document.addEventListener("click", (e: any) => {
  if (e?.target?.innerText?.toUpperCase() === "DAILY NOTES") {
    fetchNotes(hashtag);
  }
});

window.setInterval(() => fetchNotes(hashtag), 1000 * 20);
