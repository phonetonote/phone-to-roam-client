import { reduceMessages } from "../src/reduce-messages";
import { baseMessage } from "./node-maker.test";

test("reduces by date", () => {
  const data = [
    { ...baseMessage, created_at: "2020-06-10" },
    { ...baseMessage, created_at: "2020-06-10" },
    { ...baseMessage, created_at: "2020-07-20" },
  ];

  const results = data.reduce(reduceMessages, {});
  expect(Object.keys(results).length).toEqual(2);
});
