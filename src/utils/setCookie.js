import { serialize } from "cookie";

export default function setCookie(
  environment,
  cookieName,
  cookieValue,
  expires = false
) {
  let cookieOptions;
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
    cookieOptions = {
      path: "/",
      expires: new Date(0)
    };
  }

  return serialize(cookieName, cookieValue, cookieOptions);
}
