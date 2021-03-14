// const enrich = async (
//   _: { [key: string]: string; },
//   blockUid: string
// ) => {
//   const parentId = getParentUidByBlockUid(blockUid)
//   const params = (({ ...paramKeys }) => ({ ...paramKeys }))(getConfigFromPage(document.title))
  
//   analytics.track('contactEnrichmentRequest', {...params})

//   axios(
//     `https://roam-crm.netlify.app/.netlify/functions/fc_get?inputParams=${encodeURI(JSON.stringify(params))}`
//   )
//     .then(async (res: any) => {
//       const { data } = res

//       if (Object.keys(data).length === 0) {
//         await pushBullets(["No data found"], blockUid, parentId)
//         return;
//       }

//       analytics.track('contactEnrichmentResponse', {response: data})

//       const bullets = []
//       const fields = ['ageRange', 'bio', 'linkedin', 'location', 'organization', 'title', 'twitter', 'website']
//       for (var i = 0; i < fields.length; i++) {
//         const field = fields[i];
//         if (data[field]) {
//           bullets.push(`${field}:: ${data[field]}`)
//         }
//       }

//       if (data.details.education && data.details.education.length > 0) {
//         bullets.push(
//           `degree:: ${data.details.education[0].degree}`,
//           `school:: ${data.details.education[0].name}`
//         )
//       }


//       if (data.avatar) { bullets.push(`![](${data.avatar})`) }

//       await pushBullets(bullets, blockUid, parentId)
//     })
//     .catch((e: any) =>
//       e.message === "Request failed with status code 404"
//         ? pushBullets(["No data found"], blockUid, parentId)
//         : genericError(e)
//     );
// };

// addButtonListener(ENRICH_COMMAND, enrich)