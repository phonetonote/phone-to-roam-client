import { TextNode } from "roam-client";

export const findPage: any = async (pageName, uid) => { 
  let queryResults = await window.roamAlphaAPI.q(
    `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageName}"]]`
  )
    
  if (queryResults.length === 0) {
    const basicPage: any = await window.roamAlphaAPI.createPage({
      page: { title: pageName, uid: uid }
    })

    queryResults = await window.roamAlphaAPI.q(
      `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageName}"]]`
    )      
  }
    
  return queryResults[0][0]["uid"];
}

export const createBlock = ({
  node,
  parentUid,
  order,
}: {
  node: TextNode;
  parentUid: string;
  order: number;
}) => {
  const uid = window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: { uid, string: node.text },
  });
  node.children.forEach((n, o) =>
    createBlock({ node: n, parentUid: uid, order: o })
  );
  return uid;
};
