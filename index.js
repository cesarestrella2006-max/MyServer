const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const app = express();

// ================= OPENAI =================
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// ================= FUNCION PARA CHATGPT =================
async function procesarMensajeConChatGPT(mensaje) {
  if (!mensaje) return "No entendí tu mensaje 😅";
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres Nova, un asistente emocional con ojos animados." },
        { role: "user", content: mensaje }
      ],
      max_tokens: 150
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return "Ups, algo salió mal al procesar tu mensaje 😢";
  }
}

// ================= ENDPOINT PARA FRONTEND =================
app.get("/msg", async (req, res) => {
  const mensaje = req.query.m || "";
  const respuesta = await procesarMensajeConChatGPT(mensaje);
  res.send(respuesta);
});

// ================= FRONTEND =================
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // tu HTML de Nova
});

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));