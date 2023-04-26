export default async function handler(req, res) {
  if (req.headers.cookie) {
    res.status(200).json({ signedIn: true });
    return;
  } else {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
}
