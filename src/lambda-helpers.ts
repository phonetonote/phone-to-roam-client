import { AxiosPromise } from "axios";
import axios from "axios";

export const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

export const wrapAxios = (req: AxiosPromise<any>) =>
  req
    .then((r) => ({
      statusCode: 200,
      body: JSON.stringify(r.data),
      headers,
    }))
    .catch((e) => ({
      statusCode: e.response?.status || 500,
      body: e.response?.data ? JSON.stringify(e.response.data) : e.message,
      headers,
    }));

export const userError = (body: string) => ({
  statusCode: 400,
  body,
  headers,
});

export const serverError = (body: string) => ({
  statusCode: 500,
  body,
  headers,
});
