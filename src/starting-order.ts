export const startingOrder = (parentUid, roamAPI): number => {
  const childrenQuery = roamAPI.q(`[ :find (pull ?e [* {:block/children [*]}]) :where [?e :block/uid "${parentUid}"]]`)
  return (childrenQuery?.[0]?.[0]?.children?.length || 0)
}