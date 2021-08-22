import axios from "axios";
import { SCRIPT_ID, SERVER_URL } from "./constants";
import { parseRoamDate } from "roam-client";
import Bugsnag from "@bugsnag/js";

export const roamKey = document.getElementById(SCRIPT_ID)?.dataset.roam_key;

export const indexPages = async () => {
  // collect the page titles
  const titles = window.roamAlphaAPI
    .q(`[:find (pull ?e [:node/title]) :where [?e :node/title]]`)
    .filter(
      (page) => parseRoamDate(page[0].title).toString() === "Invalid Date"
    )
    .map((page) => page[0].title);

  // send them to backend
  await axios
    .post(`${SERVER_URL}/titles.json`, {
      titles,
      roam_key: roamKey,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((e) => {
      Bugsnag.notify(e);
    });
};
