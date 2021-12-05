import { nodeMaker } from "../src/node-maker";

const mediaUrl = "http://example.com/s3-bucket/file.jpg";
const hashtag = "phonetoroam";
export const baseMessage = {
  attachments: [],
  body: " foo   ",
  text: " foo   ",
  id: "123",
  message: "foo",
  sender_type: "sms",
  created_at: "2020-01-01T00:00:00.000Z",
};

const baseAttachment = {
  media_type: "link",
  url: mediaUrl,
  title: "foo",
  description: "bar",
  site_name: "baz",
  content_type: "link",
};
test("trims the text and adds the tag", () => {
  const message = {
    ...baseMessage,
  };

  const node = nodeMaker(message, hashtag);
  expect(node.text).toEqual("foo #phonetoroam");
  expect(node.children).toEqual([]);
});

test("creates a node with a ptr derived UUID", () => {
  const id = "123";
  const message = {
    ...baseMessage,
    id,
  };

  const node = nodeMaker(message, hashtag);
  expect(node.uid).toEqual(`ptr-${id}`);
});

test("renders image attachments in the body", () => {
  const message = {
    ...baseMessage,
    attachments: [{ ...baseAttachment, media_type: "image" }],
    body: "",
    text: "",
  };

  const node = nodeMaker(message, hashtag);
  expect(node.text).toEqual(`![](${mediaUrl}) #phonetoroam`);
  expect(node.children).toEqual([]);
});

test("links to audio with a default link title", () => {
  const message = {
    ...baseMessage,
    attachments: [{ ...baseAttachment, media_type: "audio", url: mediaUrl }],
    body: "  ",
    text: "  ",
  };

  const node = nodeMaker(message, hashtag);
  expect(node.text).toEqual(`[Audio Recording](${mediaUrl}) #phonetoroam`);
  expect(node.children).toEqual([]);
});

test("inserts link metadata as children", () => {
  const message = {
    ...baseMessage,
    attachments: [
      {
        ...baseAttachment,
        media_type: "link",
        url: mediaUrl,
        title: "A Page",
        content_type: "article",
        image_url: mediaUrl,
      },
    ],
    body: "a link",
    text: "a link",
  };

  const node = nodeMaker(message, hashtag);

  expect(node.children[0].text).toEqual(`![](${mediaUrl})`);
  expect(node.children[node.children.length - 1].text).toEqual(
    "content type:: article"
  );
});
