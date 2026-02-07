// ================= LIBRERÍAS =================
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

// ================= CONFIG =================
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// ================= OPENAI =================
if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: Debes configurar la variable de entorno OPENAI_API_KEY en Render.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ================= ESTADO =================
let estadoEmocional = "neutro";

// ================= UTILIDADES =================
function normalizar(t) {
  t = t.toLowerCase();
  t = t.replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i");
  t = t.replace(/ó/g, "o").replace(/ú/g, "u");
  return t;
}

function respuestaAleatoria(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ================= INTELIGENCIA =================
async function procesarMensaje(msg) {
  msg = normalizar(msg);

  const saludo = ["hola", "hey", "buenos", "buenas", "que tal", "holi"];
  const cansancio = ["cansada","agotada","estresada","no puedo","harta","fatiga"];
  const ansiedad = ["no puedo respirar","ansiosa","me duele","pecho","nerviosa","ansiedad"];
  const despedida = ["adios","hasta luego","buenas noches","descansa"];

  let respuesta = "Estoy aqui, cuentame un poco mas";

  if (saludo.some(w => msg.includes(w))) {
    estadoEmocional = "feliz";
    respuesta = respuestaAleatoria([
      "Hola, estoy aqui contigo 💙 cuentame como te sientes",
      "Hey, me alegra verte, no estas sola",
      "Hola, dime, que pasa por tu mente ahora mismo"
    ]);
  } else if (cansancio.some(w => msg.includes(w))) {
    estadoEmocional = "triste";
    respuesta = respuestaAleatoria([
      "Siento que estes asi, a veces el cansancio pesa mucho, pero aqui estoy contigo",
      "Respira, no tienes que cargar con todo sola",
      "Es valido sentirse agotada, podemos ir poco a poco"
    ]);
  } else if (ansiedad.some(w => msg.includes(w))) {
    estadoEmocional = "calma";
    respuesta = respuestaAleatoria([
      "Estoy aqui, vamos a respirar juntos, lento, no pasa nada",
      "Tranquila, enfocate en mi voz, inhala despacio",
      "No estas en peligro, vamos a calmarnos paso a paso"
    ]);
  } else if (despedida.some(w => msg.includes(w))) {
    estadoEmocional = "dormido";
    respuesta = respuestaAleatoria([
      "Descansa, aqui estare cuando vuelvas",
      "Buenas noches, cuidate mucho",
      "Duerme tranquila, no estas sola"
    ]);
  }

  // ================= OPCIONAL: OPENAI =================
  // Si quieres que Nova use GPT-4 para respuestas más inteligentes:
  /*
  try {
    const gpt = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: msg }],
      max_tokens: 150,
    });
    respuesta = gpt.choices[0].message.content;
  } catch (err) {
    console.error("Error OpenAI:", err.message);
  }
  */

  return respuesta;
}

// ================= PÁGINA WEB =================
app.get("/", (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#0f0f0f;color:white;font-family:sans-serif;}
#chat{height:70vh;overflow:auto;border:1px solid #333;padding:10px;}
input{width:80%;}
button{width:18%;}
</style>
</head>
<body>
<h2>Nova 💙</h2>
<div id="chat"></div>
<input id="msg"><button onclick="enviar()">Enviar</button>

<script>
function enviar(){
  let m=document.getElementById("msg").value;
  fetch("/msg?m="+encodeURIComponent(m))
  .then(r=>r.text())
  .then(t=>{
    document.getElementById("chat").innerHTML += "<p><b>Tu:</b> "+m+"</p>";
    document.getElementById("chat").innerHTML += "<p><b>Nova:</b> "+t+"</p>";
    document.getElementById("msg").value="";
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
  });
}
</script>
</body>
</html>`;
  res.send(html);
});

// ================= RUTA MENSAJE =================
app.get("/msg", async (req, res) => {
  const msg = req.query.m || "";
  console.log("Usuario:", msg);
  const respuesta = await procesarMensaje(msg);
  console.log("Nova:", respuesta);
  res.send(respuesta);
});

// ================= INICIAR SERVIDOR =================
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});