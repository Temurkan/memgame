import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, time } = req.body;

    const { error } = await supabase
      .from("scores")
      .insert([{ username, time }]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("scores")
      .select("username, time")
      .order("time", { ascending: true }) // чем меньше время — тем лучше
      .limit(10);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
