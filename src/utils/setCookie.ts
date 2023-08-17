import { serialize } from "cookie";

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  domain?: string;
  path: string;
  maxAge?: number;
};

export default function setCookie(
  environment: string,
  cookieName: string,
  cookieValue: string,
  expires = false
) {
  let cookieOptions: CookieOptions;
  if (environment === "production") {
    cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      domain: "focusbeacon.com",
      path: "/"
    };
  } else {
    cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/"
    };
  }

  if (expires) {
    cookieOptions.maxAge = -1;
  }

  return serialize(cookieName, cookieValue, cookieOptions);
}
