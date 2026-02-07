import express from "express";
import fetch from "node-fetch"; // si usas ES Modules
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint para recibir mensajes
app.get("/msg", async (req, res) => {
  const mensaje = req.query.m || "";

  try {
    const respuesta = await fetch('https://api.deepseek.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: mensaje }]
      })
    });

    const datos = await respuesta.json();
    const mensajeDeNova = datos.choices[0].message.content;

    res.send(mensajeDeNova);
  } catch (error) {
    console.error("Error llamando a DeepSeek:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});