# Chatbot GDG

Este es un proyecto de chatbot para GDG.

## Requisitos

- Node.js (ideal v18.18.2)
- Sqlite v3


## Instalación

1. Clona este repositorio en tu máquina local usando `git clone git@github.com:willywg/chat-gpt-with-stream.git`.

2. Navega a la carpeta del proyecto usando `cd chat-gpt-with-stream`.

3. Instala las dependencias del proyecto usando `npm install`.

4. Instala el paquete de nodemon usando `npm install -g nodemon`.

5. Crea un archivo `.env` en la carpeta raíz del proyecto y copia el contenido del archivo `.env.example` en él. Luego, reemplaza OPEN_AI_KEY con tu clave de API de OpenAI. Puedes obtener una clave de API de OpenAI en https://platform.openai.com/api-keys

6. Crea una base de datos sqlite en la carpeta raíz del proyecto usando `nodemon create-db.js`. Esto creará un archivo `chat.db` en la carpeta raíz del proyecto.

7. Inicia el servidor usando `nodemon app.js`.

8. Abre http://localhost:3000/asistente en tu navegador.