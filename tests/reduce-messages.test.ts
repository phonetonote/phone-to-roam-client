import { reduceMessages } from "../src/reduce-messages"

test("reduces by date", () => {
  const data = [
    {'created_at': '2020-06-10'},
    {'created_at': '2020-06-10'},
    {'created_at': '2020-07-20'},
  ]

  const results = data.reduce(reduceMessages, {})
  expect(Object.keys(results).length).toEqual(2)  
});