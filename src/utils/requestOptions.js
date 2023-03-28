export default function requestOptions() {
  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", process.env.NEXT_PUBLIC_FOCUSMATE_API_KEY);
  return {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
}
