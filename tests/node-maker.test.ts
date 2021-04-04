import { nodeMaker } from "../src/node-maker"

const mediaUrl = "http://example.com/s3-bucket/file.jpg"
const hashtag = 'phonetoroam'

test("trims the text and adds the tag", () => {
  const message = {
    attachments: [],
    body: ' foo   ',
    text: ' foo   '
  }

  const node = nodeMaker(message, hashtag)
  expect(node.text).toEqual('foo #phonetoroam');
  expect(node.children).toEqual([])
});

test("adds an extra tag for facebook", () => {
  const message = {
    attachments: [],
    body: ' foo   ',
    text: ' foo   ',
    sender_type: 'facebook'
  }

  const node = nodeMaker(message, hashtag)
  expect(node.text).toEqual('foo #phonetoroam #facebooktoroam');
  expect(node.children).toEqual([])
});

test("renders image attachments in the body", () => {
  const message = {
    attachments: [{media_type: 'image', url: mediaUrl}],
    body: '',
    text: null,
  }

  const node = nodeMaker(message, hashtag)
  expect(node.text).toEqual(`![](${mediaUrl}) #phonetoroam`);
  expect(node.children).toEqual([])
})

test("links to audio with a default link title", () => {
  const message = {
    attachments: [{media_type: 'audio', url: mediaUrl}],
    body: '  ',
    text: '  '
  }

  const node = nodeMaker(message, hashtag)
  expect(node.text).toEqual(`[Audio Recording](${mediaUrl}) #phonetoroam`);
  expect(node.children).toEqual([])
})

test("inserts link metadata as children", () =>{
  const message = {
    attachments: [
      {
        media_type: 'link', 
        url: mediaUrl,
        title: 'A Page',
        content_type: 'article',
        image_url: mediaUrl
      }
    ],
    body: 'a link',
    text: 'a link'
  }

  const node = nodeMaker(message, hashtag)

  expect(node.children[0].text).toEqual(`![](${mediaUrl})`)
  expect(node.children[node.children.length - 1].text).toEqual('content type:: article')
})
