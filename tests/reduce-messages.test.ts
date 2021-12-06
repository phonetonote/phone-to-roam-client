import { reduceFeedItems } from "../src/reduce-messages";
import { baseFeedItem } from "./node-maker.test";

test("reduces by date", () => {
  const data = [
    { ...baseFeedItem, date_published: "2020-06-10" },
    { ...baseFeedItem, date_published: "2020-06-10" },
    { ...baseFeedItem, date_published: "2020-07-20" },
  ];

  const results = data.reduce(reduceFeedItems, {});
  expect(Object.keys(results).length).toEqual(2);
});
