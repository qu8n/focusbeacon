import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const { data: user, error } = await supabase.from("user").select("user_id");

  if (user) {
    const totalUsers = user.length;
    res.status(200).json({ totalUsers });
  } else {
    res.status(500).json({ error });
  }
}
