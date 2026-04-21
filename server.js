const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

// Ana sayfa isteği
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// JMeter yük testi için hedef nokta
app.post('/api/kaydet', (req, res) => {
    console.log("API çağrıldı");
    // Bulutun tepkisini ölçmek için 200ms yapay gecikme
    setTimeout(() => {
        res.json({ success: true, message: "İşlem Tamamlandı" });
    }, 200);
});

app.listen(port, () => {
    console.log(`OBS Sistemi http://localhost:${port} adresinde calisti uuuu`);
});