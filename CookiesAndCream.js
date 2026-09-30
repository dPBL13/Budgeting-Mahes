const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

app.use(cookieParser());

app.use(session({
    secret: 'TesCookie',
    resave: false,
    saveUninitialized: false, 
        cookie: {
        secure: true, 
        httpOnly: true, 
        sameSite: 'strict', 
        maxAge: 1000 * 60 * 60 * 2
    }
}));

app.get('/set-cookie', (req, res) => {
    
    res.cookie('preferensi_tema', 'gelap', { httpOnly: true, maxAge: 3600000 });
    res.send('Cookie preferensi_tema berhasil disimpan.');
});

app.get('/get-cookie', (req, res) => {
    const tema = req.cookies.preferensi_tema;
    res.send(`Tema pilihan Anda adalah: ${tema || 'Tidak ada cookie ditemukan'}`);
});

app.get('/clear-cookie', (req, res) => {
    res.clearCookie('preferensi_tema');
    res.send('Cookie preferensi_tema dihapus.');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.send('Anda sudah login.');
    }
    
    req.session.user = {
        id: 1,
        username: 'Rajib',
        role: 'admin'
    };
    res.send('Login berhasil. Session telah dibuat.');
});

app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.send(`Selamat datang, ${req.session.user.username}! Akses: ${req.session.user.role}`);
    } else {
        res.status(401).send('Akses ditolak. Silakan login terlebih dahulu.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Gagal menghapus session.');
        }
        res.clearCookie('connect.sid'); 
        res.send('Logout berhasil.');
    });
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});