const express = require('express');
const openAI = require('openai');
const path = require('path');
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

app.get('/asistente', (req, res) => {
  res.sendFile(path.join(__dirname+'/asistente.html'));
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

app.get('/stream-chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream'); // Para indicar que la respuesta es un stream de eventos
  const userMessage = req.query.message; 

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true, // Chat GPT en modo stream
      messages: [
        { role: 'system', content: 'Eres un experto programador, conoces todos los lenguage de programacion existentes y debes ayudar a otros programadores a resolver sus dudas' }, 
        { role: 'user', content: userMessage }
      ],
    });

    // Iteramos sobre la respuesta de OpenAI
    for await (const chunk of response) {
      if (chunk.choices[0].finish_reason === 'stop') { // Cuando Chat GPT termina de responder
        res.write('event: end-chat\n'); // Evento tipo end
        res.write('data: [CHAT-FINALIZADO]\n\n'); // Enviamos el mensaje al cliente
        res.end();
        return;
      }
      else {
        const assistantReply = encodeURIComponent(chunk.choices[0].delta.content);

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
