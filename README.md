# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


from pathlib import Path

readme_content = """# 🎬 YouTube Downloader - Frontend + Backend

Este proyecto permite descargar videos de YouTube en formato **MP3** o **MP4** a través de una interfaz sencilla y moderna creada con **Vue 3**. El backend está desarrollado en **Node.js** usando `ytdl-core` y `fluent-ffmpeg`.

## ✨ Características

- ✅ Interfaz moderna y responsiva con TailwindCSS  
- ✅ Descarga de videos en formato MP3 o MP4  
- ✅ Visualización previa con miniatura y título del video  
- ✅ Barra de progreso durante la descarga  
- ✅ Manejo de errores con mensajes amigables  

## 📁 Estructura del Proyecto

youtube-downloader/  
├── backend/     # Servidor Express para procesar las descargas  
│   ├── index.js  
│   └── package.json  
├── frontend/    # Aplicación Vue 3 con Vite + TailwindCSS  
│   ├── src/  
│   ├── App.vue  
│   └── package.json  
└── README.md  

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

git clone https://github.com/KevinChiguano/download-media.git  
cd tu-repo

### 2. Configurar y ejecutar el backend

cd backend  
npm install  
npm start

> El backend corre por defecto en http://localhost:3001

### 3. Configurar y ejecutar el frontend

cd frontend  
npm install  
npm run dev

> El frontend corre por defecto en http://localhost:5173

## ⚙️ Endpoints del Backend

- POST /api/download – Descarga el video desde YouTube  
- POST /api/thumbnail – Devuelve la miniatura y el título del video  
- POST /api/title – Devuelve el nombre sugerido del archivo para descarga  

## 🛠️ Tecnologías Utilizadas

### Frontend

- Vue 3  
- Vite  
- TailwindCSS  
- Axios  
- Lodash  
- Heroicons  

### Backend

- Node.js  
- Express  
- ytdl-core  
- fluent-ffmpeg  
- uuid  
- cors  
- body-parser  

