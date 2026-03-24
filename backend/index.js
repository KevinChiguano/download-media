const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3001;

const isWindows = process.platform === 'win32';
const binDir = path.join(__dirname, "bin");

// En Windows usa los ejecutables locales, en Linux y otros asume que están instalados globalmente
const ytDlpPath = isWindows ? path.join(binDir, "yt-dlp.exe") : "yt-dlp";
const ffmpegDir = binDir;

// Configuración de argumentos base
const getBaseArgs = () => {
    // Usamos suplantación de clientes móviles (android/ios) para saltar el bloqueo de bots
    const args = [
        "--js-runtimes", "node",
        "--extractor-args", "youtube:player_client=android,ios,mweb"
    ];
    if (fs.existsSync(cookiesPath)) {
        args.push("--cookies", cookiesPath);
    }
    return args;
};

// Crear directorio de descargas si no existe
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://download-media-frontend.vercel.app',
        'http://download-media.kpccdev.com',
        'https://download-media.kpccdev.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false, // o true si usas cookies o Authorization
};



app.use(cors(corsOptions));


app.options(/^\/.*$/, (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
});



app.use(express.json());

// Obtener miniatura y título usando yt-dlp
app.post("/api/thumbnail", (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL requerida" });

    console.log("Obteniendo miniatura para:", url);

    const args = [...getBaseArgs(), "--dump-json", url];
    execFile(ytDlpPath, args, (err, stdout, stderr) => {
        if (err) {
            console.error("yt-dlp error:", err);
            console.error("stderr:", stderr);
            return res.status(500).json({ error: "No se pudo obtener la miniatura" });
        }
        try {
            const info = JSON.parse(stdout);
            const title = info.title;
            const thumbnail = info.thumbnail;
            res.json({ title, thumbnail });
        } catch (e) {
            console.error("Error parseando JSON de yt-dlp:", e);
            return res.status(500).json({ error: "Error al analizar información del video" });
        }
    });
});


// Descargar video/audio con yt-dlp
app.post("/api/download", async (req, res) => {
    const { url, format } = req.body;
    if (!url || !format) return res.status(400).json({ error: "Faltan parámetros" });

    // Paso 1: obtener información del video (incluye el título)
    const dumpArgs = [...getBaseArgs(), "--dump-json", url];
    execFile(ytDlpPath, dumpArgs, (err, stdout) => {
        if (err) {
            console.error("yt-dlp error:", err);
            return res.status(500).json({ error: "Error al obtener información del video" });
        }

        let info;
        try {
            info = JSON.parse(stdout);
        } catch (e) {
            console.error("Error parseando JSON:", e);
            return res.status(500).json({ error: "Error al leer los datos del video" });
        }

        let title = info.title || "video";
        title = title.replace(/[^\w\s-]/g, ""); // sanitizar

        const ext = format === "mp3" ? "mp3" : "mp4";
        const outputName = `${title}.${ext}`;
        const outputPath = path.join(downloadsDir, outputName);

        const ytdlpArgs = [
            ...getBaseArgs(),
            url,
            "-o", outputPath
        ];

        if (isWindows) {
            ytdlpArgs.push("--ffmpeg-location", ffmpegDir);
        }

        if (format === "mp3") {
            ytdlpArgs.push("-x", "--audio-format", "mp3", "--embed-thumbnail", "--add-metadata");
        } else if (format === "mp4") {
            ytdlpArgs.push("-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4");
        } else {
            return res.status(400).json({ error: "Formato no soportado" });
        }

        // Ejecutar yt-dlp
        execFile(ytDlpPath, ytdlpArgs, (err) => {
            if (err) {
                console.error("Error descargando con yt-dlp:", err);
                return res.status(500).json({ error: "Error al descargar el video" });
            }

            // Asegurar que el archivo exista antes de enviarlo
            fs.access(outputPath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error("Archivo no encontrado:", outputPath);
                    return res.status(404).json({ error: "Archivo no encontrado tras descarga" });
                }

                // Descargar el archivo
                fs.stat(outputPath, (err, stats) => {
                    if (err) {
                        console.error("Error obteniendo tamaño del archivo:", err);
                        return res.status(500).json({ error: "No se pudo obtener tamaño del archivo" });
                    }

                    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
                    res.setHeader('Content-Disposition', `attachment; filename="${outputName}"`);
                    res.setHeader('Content-Length', stats.size);

                    const stream = fs.createReadStream(outputPath);
                    stream.pipe(res);

                    res.on('finish', () => {
                        setTimeout(() => {
                            fs.unlink(outputPath, () => {
                                console.log(`Archivo eliminado: ${outputPath}`);
                            });
                        }, 5000);
                    });
                });

            });
        });
    });
});



app.post("/api/title", (req, res) => {
    const { url, format } = req.body;
    if (!url || !format) return res.status(400).json({ error: "Faltan parámetros" });

    const args = [...getBaseArgs(), "--dump-json", url];
    execFile(ytDlpPath, args, (err, stdout) => {
        if (err) {
            return res.status(500).json({ error: "No se pudo obtener el título" });
        }

        try {
            const info = JSON.parse(stdout);
            let title = info.title || "video";
            title = title.replace(/[^\w\s-]/g, "").replace(/\s+/g, " "); // sanitizar
            const ext = format === "mp3" ? "mp3" : "mp4";
            res.json({ filename: `${title}.${ext}` });
        } catch (e) {
            return res.status(500).json({ error: "Error al procesar JSON" });
        }
    });
});




app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
