import { toRoamDate } from "roam-client";
import { Message } from "./node-maker";

export const reduceMessages = (
  obj: Record<string, Record<string, Message[]>>,
  message: Message
) => {
  const date = new Date(message["created_at"]),
    pageName = toRoamDate(date),
    senderType = message["sender_type"];

  if (!obj.hasOwnProperty(pageName)) {
    obj[pageName] = {};
  }

  if (!obj[pageName][senderType]) {
    obj[pageName][senderType] = [];
  }

  obj[pageName][senderType].push(message);
  return obj;
};
