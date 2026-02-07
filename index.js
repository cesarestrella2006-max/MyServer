import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configura tu API de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint para recibir mensaje de la web
app.get("/msg", async (req, res) => {
  const mensaje = req.query.m || "";
  const respuesta = await procesarMensajeConChatGPT(mensaje);
  res.send(respuesta);
});

async function procesarMensajeConChatGPT(mensaje) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: mensaje }],
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return "Oops, algo salió mal 😅";
  }
}

// Página web
app.get("/", (req, res) => {
  res.sendFile(new URL("./index.html", import.meta.url));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});