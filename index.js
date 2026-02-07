import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

// ================= CONFIGURACIÓN =================
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// ================= OPENAI =================
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY // asegúrate de poner tu API Key en Render
});
const openai = new OpenAIApi(configuration);

// ================= ESTADO =================
let ultimaRespuesta = "";
let estadoEmocional = "neutro";

// ================= FUNCIONES =================
async function obtenerRespuestaNova(mensajeUsuario) {
  try {
    const prompt = `
Eres Nova, una asistente emocional con ojos animados en pantalla OLED.
Responde de manera comprensiva, empática y cálida.
Usuario dice: "${mensajeUsuario}"
Nova responde:
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.8
    });

    let respuesta = completion.data.choices[0].message.content.trim();

    // Ajusta estado emocional según palabras clave simples
    const m = mensajeUsuario.toLowerCase();
    if (m.includes("hola") || m.includes("hey") || m.includes("buenas")) estadoEmocional = "feliz";
    else if (m.includes("cansada") || m.includes("agotada") || m.includes("estresada")) estadoEmocional = "triste";
    else if (m.includes("ansiedad") || m.includes("nerviosa") || m.includes("no puedo respirar")) estadoEmocional = "calma";
    else if (m.includes("adios") || m.includes("descansa") || m.includes("hasta luego")) estadoEmocional = "dormido";
    else estadoEmocional = "neutro";

    ultimaRespuesta = respuesta;
    return respuesta;

  } catch (err) {
    console.error("Error OpenAI:", err);
    return "Lo siento, tuve un error al procesar tu mensaje.";
  }
}

// ================= RUTAS =================
app.get("/", (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#0f0f0f;color:white;font-family:sans-serif}
#chat{height:70vh;overflow:auto;border:1px solid #333;padding:10px}
input{width:80%}
button{width:18%}
</style>
</head>
<body>
<h2>Nova 💙</h2>
<div id="chat"></div>
<input id="msg"><button onclick="enviar()">Enviar</button>

<script>
async function enviar(){
 let m=document.getElementById("msg").value;
 const r = await fetch("/msg?m="+encodeURIComponent(m));
 const t = await r.text();
 document.getElementById("chat").innerHTML += "<p><b>Tu:</b> "+m+"</p>";
 document.getElementById("chat").innerHTML += "<p><b>Nova:</b> "+t+"</p>";
 document.getElementById("msg").value="";
 document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
}
</script>
</body>
</html>
  `;
  res.send(html);
});

app.get("/msg", async (req, res) => {
  const mensaje = req.query.m || "";
  const respuesta = await obtenerRespuestaNova(mensaje);
  console.log("Usuario:", mensaje);
  console.log("Nova:", respuesta);
  res.send(respuesta);
});

// ================= INICIO SERVIDOR =================
app.listen(PORT, () => {
  console.log(`Servidor Nova corriendo en puerto ${PORT}`);
});