export default async function handler(req, res) {
  if (req.headers.cookie.includes("encrypted_access_token")) {
    res.status(200).json({ signedIn: true });
    return;
  } else {
    res.status(200).json({ signedIn: false });
    return;
  }
}
