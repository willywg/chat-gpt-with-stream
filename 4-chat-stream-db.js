const express = require('express');
const openAI = require('openai');
const db = require('./db');
require('dotenv').config();


const app = express();
const port = 3000;

const openai = new openAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());  // Para aceptar JSON en el body de las peticiones

app.get('/', (req, res) => {
  res.send('¡Hola Humano :-)!');
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message; 

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un experto programador, conoces todos los lenguage de programacion existentes y debes ayudar a otros programadores a resolver sus dudas' }, 
        { role: 'user', content: userMessage }
      ],
    });

    const assistantReply = response.choices[0].message.content;
    const assistantMessage = {
      role: 'assistant',
      content: assistantReply,
    }

    res.json(assistantMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error en la solicitud de OpenAI' });
  }
});

app.get('/stream-chat/:room_id', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream'); // Para indicar que la respuesta es un stream de eventos
  const roomId = req.params.room_id;
  const systemMessage = { role: 'system', content: 'Eres un experto programador, conoces todos los lenguage de programacion existentes y debes ayudar a otros programadores a resolver sus dudas' }
  const userMessage = { role: 'user', content: req.query.message };

  // Obteniendo mensajes de la base de datos
  let messages = [systemMessage];
  const getMessages = new Promise((resolve, reject) => {
    db.all(`SELECT role, message as content FROM messages WHERE room_id = ?`, roomId, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
  messages = messages.concat(await getMessages);

  // Agregando el mensaje de usuario en la base de datos:
  messages.push(userMessage);
  db.run(`INSERT INTO messages (room_id, role, message) VALUES (?, ?, ?)`, [roomId, 'user', userMessage.content], (err) => {
    if (err) {
      console.log(err);
    }
  });
  // console.log(messages);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true, // Chat GPT en modo stream
      messages: messages,
    });

    let fullAssitantResponse = '';
    // Iteramos sobre la respuesta de OpenAI
    for await (const chunk of response) {
      if (chunk.choices[0].finish_reason === 'stop') { // Cuando Chat GPT termina de responder
        res.write('event: end-chat\n'); // Evento tipo end
        res.write('data: [CHAT-FINALIZADO]\n\n'); // Enviamos el mensaje al cliente
        res.end();

        // Agregando respuesta del asistente a la base de datos
        db.run(`INSERT INTO messages (room_id, role, message) VALUES (?, ?, ?)`, [roomId, 'assistant', fullAssitantResponse], (err) => {
          if (err) {
            console.log(err);
          }
        });

        console.log(fullAssitantResponse);
        return;
      }
      else {
        const assistantReply = encodeURIComponent(chunk.choices[0].delta.content);
        fullAssitantResponse += chunk.choices[0].delta.content;

        res.write('event: response-chat\n'); // Evento tipo token
        res.write(`data: ${assistantReply}\n\n`); // Enviamos el mensaje al cliente
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error en la solicitud de OpenAI' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
