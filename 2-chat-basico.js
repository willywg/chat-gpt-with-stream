const express = require('express');
const openAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

const openai = new openAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json()); // Para aceptar JSON en el body de las peticiones

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

app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
