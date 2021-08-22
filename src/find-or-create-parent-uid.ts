import { toRoamDate, toRoamDateUid, parseRoamDate } from "roam-client";

export const findOrCreateParentUid = (
  date: Date,
  parentBlock: String | undefined,
  roamAPI: any,
  createBlock: (Object) => string
): string => {
  const pageName = toRoamDate(date),
    roamUid = toRoamDateUid(date),
    results = () =>
      roamAPI.q(
        `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`
      );

  // if daily page doesn't exist, create it
  if (results().length === 0) {
    roamAPI.createPage({ page: { title: pageName, uid: roamUid } });
  }

  // if no parentBlock, return the daily page
  if (
    !parentBlock ||
    typeof parentBlock !== "string" ||
    parentBlock.length === 0
  ) {
    return results()[0][0]["uid"];
  }

  // search for the matching parent block
  const children = results()[0][0]["children"] || [];
  const potentialParentBlock = children.filter(
    (item) => item["string"] === parentBlock
  );

  // if the matching parent block exists, return it
  if (potentialParentBlock.length > 0) {
    return potentialParentBlock[0]["uid"];
  }

  // if not, create it
  const node = { text: parentBlock, children: [] };
  return createBlock({
    node,
    parentUid: results()[0][0]["uid"],
    order: children.length,
  });
};

export const testableToRoamDate = toRoamDate;
export const testableToRoamDateUid = toRoamDateUid;
