export default function handler(req, res) {
  // if (req.method === "POST") {
  //   const { authorizationCode } = JSON.parse(req.body);
  //   const authorizationCodeCap = authorizationCode.toUpperCase();
  //   res.status(200).json({ authorizationCodeCap });
  // } else {
  //   res.status(405).json({ message: "Method not allowed" });
  // }
  res.status(200).json({ name: "John Doe" });
}
// Next step: try to get the authorization code from the body and send it back, capitalized, to the client
