import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, time } = req.body;

    // ищем игрока
    const { data: existing, error: fetchError } = await supabase
      .from("scores")
      .select("time")
      .eq("username", username)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error(fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    if (!existing) {
      // игрока нет → создаём
      const { error } = await supabase
        .from("scores")
        .insert([{ username, time }]);

      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true, message: "Score added" });
    } else if (time < existing.time) {
      // игрок есть и время лучше → обновляем
      const { error } = await supabase
        .from("scores")
        .update({ time })
        .eq("username", username);

      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true, message: "Score updated" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Existing score is better" });
    }
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("scores")
      .select("username, time")
      .order("time", { ascending: true })
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
