// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

// Configuración de dotenv
dotenv.config();

// Configuración de ES Modules para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la app de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ruta para enviar mensajes y recibir respuesta de ChatGPT
app.get("/msg", async (req, res) => {
  const mensaje = req.query.m || "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres Nova, un asistente emocional comprensivo, amigable y empático. Responde siempre con calidez y emojis si es apropiado." },
        { role: "user", content: mensaje }
      ]
    });

    const respuesta = completion.choices[0].message.content;
    res.send(respuesta);
  } catch (error) {
    console.error("Error en OpenAI:", error);
    res.status(500).send("Error al procesar el mensaje");
  }
});

// Ruta principal para servir el HTML de Nova
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});