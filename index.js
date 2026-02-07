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

    // Llama a la API de DeepSeek
    const respuesta = await procesarMensaje(mensaje);

    res.send(respuesta);
  } catch (error) {
    console.error("Error procesando mensaje:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

// Función para procesar mensaje con DeepSeek
async function procesarMensaje(mensaje) {
  const API_KEY = process.env.DEEPSEEK_API_KEY;
  const ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

  const body = {
    model: "deepseek-chat", // modo básico de DeepSeek V3.2
    messages: [
      { role: "system", content: "Eres Nova, un asistente amistoso que ayuda al usuario." },
      { role: "user", content: mensaje }
    ],
    stream: false
  };

  try {
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const datos = await respuesta.json();

    console.log("Respuesta de la API:", datos); // Para debug

    // Validación segura de la respuesta
    if (datos.choices && datos.choices.length > 0) {
      return datos.choices[0].text || "No pude generar una respuesta, intenta de nuevo.";
    } else {
      return "No pude generar una respuesta, intenta de nuevo.";
    }

  } catch (error) {
    console.error("Error llamando a DeepSeek:", error);
    return "Ocurrió un error al conectarse a la inteligencia artificial.";
  }
}

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});