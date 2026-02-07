// index.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch"; // asegúrate de hacer 'npm install node-fetch'

dotenv.config();
const app = express();

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static("public"));

// Endpoint para recibir mensajes desde el front
app.get("/msg", async (req, res) => {
  try {
    const mensaje = req.query.m || "";

    if (!mensaje) {
      return res.send("Por favor envía un mensaje.");
    }

    const respuesta = await procesarMensaje(mensaje);
    res.send(respuesta);
  } catch (error) {
    console.error("Error procesando mensaje:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

// Función para procesar mensaje usando DeepSeek
async function procesarMensaje(mensaje) {
  const API_KEY = process.env.DEEPSEEK_API_KEY; // tu clave de DeepSeek
  const ENDPOINT = "https://api.deepseek.ai/v1/chat/completions";

  if (!API_KEY) {
    return "Error: no se ha configurado la API Key de DeepSeek.";
  }

  try {
    const body = {
      model: "deepseek-chat",
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

    if (datos.choices && datos.choices[0]?.message?.content) {
      return datos.choices[0].message.content;
    } else if (datos.choices && datos.choices[0]?.text) {
      return datos.choices[0].text;
    } else {
      return "No pude generar una respuesta, intenta de nuevo.";
    }
  } catch (error) {
    console.error("Error al llamar a la API de DeepSeek:", error);
    return "Hubo un error al comunicarse con DeepSeek.";
  }
}

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});