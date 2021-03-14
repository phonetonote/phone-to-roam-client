import { APIGatewayProxyEvent } from "aws-lambda";
import axios from "axios";
import { wrapAxios, userError, serverError } from "../lambda-helpers";
import { buildParams } from "../type-helpers"

export const handler = async (event: APIGatewayProxyEvent) => {
  return wrapAxios(
    axios.post(
      `some-endpoint`,
      buildParams(JSON.parse(event?.queryStringParameters?.inputParams || "{}")),
      {
        params : {},
        headers : { 'Authorization' : `Bearer ${process.env.someSecretKey}` },
      }
    )
  )
};
