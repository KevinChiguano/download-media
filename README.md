# 🎬 YouTube Downloader - Frontend + Backend

Este proyecto permite descargar videos de YouTube en formato **MP3** o **MP4** a través de una interfaz sencilla y moderna creada con **Vue 3**. El backend está desarrollado en **Node.js** utilizando binarios de `yt-dlp` y `fluent-ffmpeg` para una mayor estabilidad local.

## ✨ Características

- ✅ Interfaz diseñada con TailwindCSS
- ✅ Descarga en formato MP3 o MP4
- ✅ Visualización previa con miniatura y título del video
- ✅ Barra de progreso durante la descarga
- ✅ Manejo de errores

## 📁 Estructura del Proyecto

```text
youtube-downloader/
├── backend/     # Servidor Express para procesar las descargas
│   ├── bin/     # Binarios locales (yt-dlp, ffmpeg)
│   ├── index.js
│   └── package.json
├── frontend/    # Aplicación Vue 3 con Vite + TailwindCSS
│   ├── src/
│   ├── App.vue
│   └── package.json
└── README.md
```

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/KevinChiguano/download-media.git
cd download-media
```

### 2. Configurar y ejecutar el backend

```bash
cd backend
npm install
npm start
```

> **Nota:** Asegúrate de que los binarios `yt-dlp.exe` y `ffmpeg.exe` estén presentes en la carpeta `backend/bin`.
> El backend corre por defecto en http://localhost:3001

### 3. Configurar y ejecutar el frontend

```bash
cd ../frontend
npm install
npm run dev
```

> El frontend corre por defecto en http://localhost:5173

## ⚙️ Endpoints del Backend

- **POST /api/download** – Descarga el video desde YouTube (vía streaming).
- **POST /api/thumbnail** – Devuelve la miniatura y el título del video (vía oEmbed).
- **POST /api/title** – Devuelve el nombre sugerido del archivo para la descarga.

## 🛠️ Tecnologías Utilizadas

### Frontend

- Vue 3 (Composition API)
- Vite
- TailwindCSS
- Axios
- Lodash
- Heroicons

### Backend

- Node.js & Express
- yt-dlp (Motor de descarga)
- FFmpeg (Procesamiento de audio/video)
- Axios

---

## Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
