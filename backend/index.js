const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = 3001;

// Configuración de CORS
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://download-media-frontend.vercel.app',
        'http://download-media.kpccdev.com',
        'https://download-media.kpccdev.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas a los binarios locales
const BIN_DIR = path.join(__dirname, "bin");
const YT_DLP = path.join(BIN_DIR, "yt-dlp.exe");
const FFMPEG = path.join(BIN_DIR, "ffmpeg.exe");

// Log de depuración
app.use((req, res, next) => {
    if (req.url === '/favicon.ico') return res.status(204).end();
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Helper para obtener metadatos con oEmbed (más fiable y rápido)
const getYoutubeInfo = async (url) => {
    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const { data } = await axios.get(oembedUrl);
        return {
            title: data.title || "video",
            thumbnail: data.thumbnail_url || ""
        };
    } catch (e) {
        console.error("Error oembed:", e.message);
        return { title: "video", thumbnail: "" };
    }
};

app.get("/", (req, res) => {
    res.send("Backend funcional (Versión Local con Binarios)");
});

app.post("/api/thumbnail", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL requerida" });
    const info = await getYoutubeInfo(url);
    res.json(info);
});

app.post("/api/title", async (req, res) => {
    const { url, format } = req.body;
    if (!url || !format) return res.status(400).json({ error: "Faltan parámetros" });
    const info = await getYoutubeInfo(url);
    let title = info.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim() || "video";
    const ext = format === "mp3" ? "mp3" : "mp4";
    res.json({ filename: `${title}.${ext}` });
});

app.post("/api/download", async (req, res) => {
    const { url, format } = req.body;
    if (!url || !format) return res.status(400).json({ error: "Faltan parámetros" });

    try {
        const info = await getYoutubeInfo(url);
        let title = info.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim() || "video";
        const ext = format === "mp3" ? "mp3" : "mp4";
        const filename = `${title}.${ext}`;

        console.log(`Iniciando descarga local: ${filename}`);

        // Configuración de argumentos para yt-dlp
        let args = [
            "--no-playlist",
            "--ffmpeg-location", FFMPEG,
            "-o", "-", // Salida a stdout para streaming
            url
        ];

        if (format === "mp3") {
            args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
            res.setHeader("Content-Type", "audio/mpeg");
        } else {
            args.push("-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best");
            res.setHeader("Content-Type", "video/mp4");
        }

        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);

        const process = spawn(YT_DLP, args);

        process.stdout.pipe(res);

        process.stderr.on("data", (data) => {
            // Log de progreso o errores de yt-dlp (opcional)
            // console.log(`stderr: ${data}`);
        });

        process.on("close", (code) => {
            console.log(`Proceso finalizado con código: ${code}`);
            if (code !== 0 && !res.headersSent) {
                res.status(500).json({ error: "Error en el proceso de descarga" });
            }
        });

        req.on("close", () => {
            process.kill();
        });

    } catch (err) {
        console.error("Error en descarga:", err.message);
        if (!res.headersSent) res.status(500).json({ error: "Error interno" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor local escuchando en http://localhost:${PORT}`);
});
