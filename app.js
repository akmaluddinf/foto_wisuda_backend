const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getCurrentTimestamp = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return timestamp;
};

app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', (req, res) => {
    const { filename } = req.body;
    const filePath = path.join(__dirname, 'public', 'files', `${filename}.zip`);

    if (filename) {
        // Cek apakah file ada
        if (fs.existsSync(filePath)) {
            res.download(filePath);
            const infoLog = `${getCurrentTimestamp()} - Download Success for NIM: ${filename}\n`;
            fs.appendFileSync('logDownloadSuccess.log', infoLog);
        } else {
            res.status(404).json({ error: 'File tidak ditemukan.' });
            const warnLog = `${getCurrentTimestamp()} - File ${filename}.zip tidak ditemukan.\n`;
            fs.appendFileSync('server.log', warnLog);
        }
    } else {
        res.status(400).json({ error: 'Parameter filename tidak ditemukan.' });
        const warnLog = `${getCurrentTimestamp()} - Parameter filename tidak ditemukan dalam permintaan unduh.\n`;
        fs.appendFileSync('server.log', warnLog);
    }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
