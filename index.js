import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.static("public"));

app.get("/msg", async (req, res) => {
  try {
    const mensaje = req.query.m || "";
    if (!mensaje) return res.send("Por favor envía un mensaje.");

    // Llamada a DeepSeek
    const respuesta = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: mensaje }
        ],
        stream: false
      })
    });

    const datos = await respuesta.json();
    const mensajeDeNova = datos.choices[0]?.message?.content || datos.choices[0]?.text || "No pude generar respuesta.";
    res.send(mensajeDeNova);
  } catch (error) {
    console.error("Error procesando mensaje:", error);
    res.status(500).send("Error interno del servidor.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));