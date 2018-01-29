import { Incident } from "incident";
import toughCookie from "tough-cookie";
import * as apiUri from "../api-uri";
import { UnexpectedHttpStatusError } from "../errors/http";
import { SkypeToken } from "../interfaces/api/context";
import * as io from "../interfaces/http-io";
import { JSON_READER } from "../json-reader";
import { $ApiProfile, ApiProfile } from "../types/api-profile";
import { Url } from "../types/url";

export async function getSelfProfile(
  httpIo: io.HttpIo,
  cookies: toughCookie.Store,
  skypeToken: SkypeToken,
): Promise<ApiProfile> {
  const url: Url = apiUri.userProfile(apiUri.DEFAULT_USER);
  const request: io.GetOptions = {
    uri: url,
    cookies,
    headers: {
      "X-Skypetoken": skypeToken.value,
    },
  };
  const response: io.Response = await httpIo.get(request);
  if (response.statusCode !== 200) {
    UnexpectedHttpStatusError.create(response, new Set([200]), request);
  }
  let result: ApiProfile;
  try {
    result = $ApiProfile.read(JSON_READER, response.body);
  } catch (err) {
    throw new Incident(err, "UnexpectedResponseBody", {body: response.body});
  }
  return result;
}
