interface Profile {
  "service": string;
  "url": string;
}

interface Params {
  "profiles"?: Profile[],
  "emails"?: string[]
}

export function buildParams(input: {[key: string]: any}): Params{
  let output: Params = {}

  const hasProfile = !!input['linkedin'] || !!input['twitter']
  if(hasProfile) {
    output['profiles'] = []
  }

  if(!!input['email']) {
    output['emails'] = [`${input['email']}`]
  }

  if(!!input['twitter']) {
    const twitterProfile: Profile = { 'service': 'twitter', 'url': input['twitter'] }
    output?.profiles?.push(twitterProfile)
  }

  if(!!input['linkedin']) {
    const linkedinProfile: Profile = { 'service': 'linkedin', 'url': input['linkedin'] }
    output?.profiles?.push(linkedinProfile)
  }

  return output
}