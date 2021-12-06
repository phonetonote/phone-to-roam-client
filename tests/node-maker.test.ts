import { nodeMaker } from "../src/node-maker";

const mediaUrl = "http://example.com/s3-bucket/file.jpg";
const hashtag = "phonetoroam";

export const baseFeedItem = {
  id: "ptr-1",
  date_published: "2020-01-01T00:00:00.000Z",
  url: "http://example.com/",
  content_text: "  foo  ",
  attachments: [],
  _ptr_sender_type: "sms",
};

const baseFeedAttachment = {
  title: "foo dot com's site",
  _ptr_open_graph_description: "foos on the internet",
  _ptr_open_graph_site_name: "foo dot com",
  _ptr_open_graph_type: "article",
  _ptr_media_type: "link",
  url: "http://example.com/",
};
test("trims the text and adds the tag", () => {
  const feedItem = {
    ...baseFeedItem,
  };

  const node = nodeMaker(feedItem, hashtag);
  expect(node.text).toEqual("foo #phonetoroam");
  expect(node.children).toEqual([]);
});

test("creates a node with a ptr derived UUID", () => {
  const id = "123";
  const feedItem = {
    ...baseFeedItem,
    id,
  };

  const node = nodeMaker(feedItem, hashtag);
  expect(node.uid).toEqual(`ptr-${id}`);
});

test("renders image attachments in the body", () => {
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "image",
        url: mediaUrl,
      },
    ],
    body: "",
    text: "",
  };

  const node = nodeMaker(feedItem, hashtag);
  expect(node.text).toEqual(`![](${mediaUrl}) #phonetoroam`);
  expect(node.children).toEqual([]);
});

test("links to audio with a default link title", () => {
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      { ...baseFeedAttachment, _ptr_media_type: "audio", url: mediaUrl },
    ],
    content_text: "  ",
  };

  const node = nodeMaker(feedItem, hashtag);
  expect(node.text).toEqual(`[Audio Recording](${mediaUrl}) #phonetoroam`);
  expect(node.children).toEqual([]);
});

test("inserts link metadata as children", () => {
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "link",
        _ptr_open_graph_image_url: mediaUrl,
      },
    ],
  };

  const node = nodeMaker(feedItem, hashtag);

  expect(node.children?.[0].text).toEqual(`![](${mediaUrl})`);
  expect(node.children?.[node.children?.length - 1].text).toEqual(
    "open graph type:: article"
  );
});
