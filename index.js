// index.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch"; // npm install node-fetch

dotenv.config();
const app = express();

// Carpeta pública
app.use(express.static("public"));

// Endpoint para mensajes
app.get("/msg", async (req, res) => {
  try {
    const mensaje = req.query.m || "";

    if (!mensaje) {
      return res.send("Por favor envía un mensaje.");
    }

    // Llama a la API de DeepSeek o OpenAI
    const respuesta = await procesarMensaje(mensaje);

    res.send(respuesta);
  } catch (error) {
    console.error("Error procesando mensaje:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

// Función para procesar mensaje con la API
async function procesarMensaje(mensaje) {
  // Cambia TU_API_KEY y ENDPOINT según la IA que uses
  const API_KEY = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  const ENDPOINT = process.env.OPENAI_API_KEY
    ? "https://api.openai.com/v1/chat/completions"
    : "https://api.deepseek.ai/v1/chat/completions";

  const body = {
    model: process.env.OPENAI_API_KEY ? "gpt-3.5-turbo" : "deepseek-chat",
    messages: [{ role: "user", content: mensaje }],
  };

  const respuesta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const datos = await respuesta.json();

  // Diferentes estructuras según la API
  if (datos.choices && datos.choices[0]?.message?.content) {
    return datos.choices[0].message.content;
  } else if (datos.choices && datos.choices[0]?.text) {
    return datos.choices[0].text;
  } else {
    return "No pude generar una respuesta, intenta de nuevo.";
  }
}

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});