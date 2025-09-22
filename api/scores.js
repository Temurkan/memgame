import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("scores")
      .select("username, time")
      .order("time", { ascending: true })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { username, time } = req.body;

    if (!username || !time) {
      return res.status(400).json({ error: "Missing username or time" });
    }

    const { error } = await supabase
      .from("scores")
      .insert([{ username, time }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
