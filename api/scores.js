import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, time, deviceId } = req.body;

    // Проверяем, есть ли пользователь с таким username
    const { data: existing, error } = await supabase
      .from("scores")
      .select("*")
      .eq("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = нет строки
      return res.status(500).json({ error: error.message });
    }

    // Если имя уже есть и deviceId другой — запрещаем
    if (existing && existing.device_id !== deviceId) {
      return res
        .status(400)
        .json({ error: "This username is already taken on another device" });
    }

    // Сохраняем или обновляем рекорд
    const { data, error: upsertError } = await supabase
      .from("scores")
      .upsert(
        { username, time, device_id: deviceId },
        { onConflict: ["username"] }
      );

    if (upsertError) {
      return res.status(500).json({ error: upsertError.message });
    }

    return res.status(200).json({ message: "Score saved", data });
  } else if (req.method === "GET") {
    // Получаем все рекорды для топ-10
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("time", { ascending: true })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
