import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const { count, error } = await supabase
    .from("user")
    .select("*", { count: "exact", head: true });

  if (count) {
    res.status(200).json({ count });
  } else {
    res.status(500).json({ error });
  }
}
