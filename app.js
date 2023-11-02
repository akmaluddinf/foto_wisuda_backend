const express = require('express');
const path = require('path');
const app = express();
const port = 3001;
const cors = require('cors');
const winston = require('winston');

// Membuat logger Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' }) // Catat log ke berkas
    ]
});

// Izinkan hanya alamat URL frontend yang benar untuk mengakses server backend
const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Izinkan kredensial (cookies, auth headers, dll.)
};

app.use(cors(corsOptions));

// Middleware untuk mengarahkan URL sembarangan
app.use((req, res, next) => {
    const validRoutes = ['/download', '/']; // Daftar URL yang valid
    const requestedRoute = req.path;

    if (!validRoutes.includes(requestedRoute)) {
        logger.info(`URL: ${requestedRoute} tidak tersedia.`);
        return res.redirect('/'); // Mengarahkan ke URL root jika URL tidak valid
    }

    next();
});


// Mengatur folder untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk mengunduh file .zip
app.get('/download', (req, res) => {
    const { filename } = req.query;
    const filePath = path.join(__dirname, 'public', 'files', `${filename}.zip`);

    if (filename) {
        const fs = require('fs');

        // Cek apakah file ada
        if (fs.existsSync(filePath)) {
            res.download(filePath);
            logger.info(`File ${filename}.zip berhasil diunduh.`);
        } else {
            res.status(404).json({ error: 'File tidak ditemukan.' });
            logger.warn(`File ${filename}.zip tidak ditemukan.`);
        }
    } else {
        res.status(400).json({ error: 'Parameter filename tidak ditemukan.' });
        logger.warn('Parameter filename tidak ditemukan dalam permintaan unduh.');
    }
});

app.listen(port, () => {
    console.log(`Aplikasi backend berjalan di http://localhost:${port}`);
});