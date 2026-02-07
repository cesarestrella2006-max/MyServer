// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================= OPENAI =================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Asegúrate de tener esta variable de entorno en Render
});

// ================= ESTADO =================
let ultimaRespuesta = "";
let estadoEmocional = "neutro";

// ================= UTILIDADES =================
function normalizar(t) {
  return t.toLowerCase()
          .replace(/á/g,"a").replace(/é/g,"e")
          .replace(/í/g,"i").replace(/ó/g,"o")
          .replace(/ú/g,"u");
}

// Función para detectar emoción básica según palabras clave
function detectarEmocion(msg) {
  msg = normalizar(msg);
  const cansancio = ["cansada","agotada","estresada","fatiga","harta"];
  const ansiedad = ["no puedo respirar","ansiosa","me duele","pecho","nerviosa","ansiedad"];
  const saludo = ["hola","hey","buenos","buenas","que tal","holi"];
  const despedida = ["adios","hasta luego","buenas noches","descansa"];

  if (cansancio.some(w => msg.includes(w))) return "triste";
  if (ansiedad.some(w => msg.includes(w))) return "calma";
  if (saludo.some(w => msg.includes(w))) return "feliz";
  if (despedida.some(w => msg.includes(w))) return "dormido";
  return "neutro";
}

// ================= RUTAS =================

// Página principal
app.get("/", (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#0f0f0f;color:white;font-family:sans-serif}
#chat{height:70vh;overflow:auto;border:1px solid #333;padding:10px;margin-bottom:10px}
input{width:80%;padding:5px;font-size:16px}
button{width:18%;padding:5px;font-size:16px}
</style>
</head>
<body>
<h2>Nova 💙</h2>
<div id="chat"></div>
<input id="msg" placeholder="Escribe algo"><button onclick="enviar()">Enviar</button>

<script>
async function enviar(){
  let m=document.getElementById("msg").value;
  if(!m) return;
  document.getElementById("chat").innerHTML += "<p><b>Tu:</b> "+m+"</p>";
  document.getElementById("msg").value="";
  const res = await fetch("/msg",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mensaje:m})});
  const data = await res.json();
  document.getElementById("chat").innerHTML += "<p><b>Nova:</b> "+data.respuesta+"</p>";
  window.scrollTo(0,document.body.scrollHeight);
}
</script>
</body>
</html>
  `;
  res.send(html);
});

// Ruta para recibir mensaje y enviar respuesta
app.post("/msg", async (req, res) => {
  try {
    const msg = req.body.mensaje || req.body.mensajeTexto || "";
    estadoEmocional = detectarEmocion(msg);

    // Llamada a OpenAI para generar respuesta
    const respuestaAI = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role:"user", content: msg}],
      max_tokens: 150,
      temperature: 0.8
    });

    const respuesta = respuestaAI.choices[0].message.content.trim();
    ultimaRespuesta = respuesta;

    console.log("Usuario:", msg);
    console.log("Nova:", respuesta, "| Emoción:", estadoEmocional);

    // Se puede mandar la emoción al ESP32 también si quieres
    res.json({respuesta, emocion: estadoEmocional});
  } catch (e) {
    console.error(e);
    res.json({respuesta: "Ups, algo salió mal 😅"});
  }
});

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));