import requestOptions from "./requestOptions";

export default async function fetchProfileData() {
    const response = await fetch(
      `https://api.focusmate.com/v1/me`,
      requestOptions()
    );
    return response.json();
}