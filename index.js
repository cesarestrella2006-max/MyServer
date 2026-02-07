import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/nova", async (req, res) => {
  const userText = req.body.text || "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Tu nombre es Nova.
Eres una compañera emocional empática.
Entiendes frases incompletas y emocionales.
Ayudas a calmar ansiedad y acompañar emociones.
`
        },
        {
          role: "user",
          content: userText
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    let emotion = "neutro";
    if (/respirar|ansiedad|pecho|nerviosa/i.test(userText)) emotion = "calma";
    else if (/cansad|agotad|estresad|triste/i.test(userText)) emotion = "triste";
    else if (/hola|buenos|hey/i.test(userText)) emotion = "feliz";
    else if (/noche|dormir|descans/i.test(userText)) emotion = "dormido";

    res.json({ reply, emotion });

  } catch (e) {
    res.status(500).json({ error: "Nova tuvo un problema" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});