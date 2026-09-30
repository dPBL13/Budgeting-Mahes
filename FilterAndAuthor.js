function wajibLogin(req, res, next){
    if (!req.session.user) 
        return res.status(401).send('Login dulu');
    next();
}

app.get('/filter',wajibLogin, async (req, res) => {
    
    const { tipe } = req.query; 
    const tipeValid = ['pemasukan', 'pengeluaran'];

    let sql = 'SELECT * FROM transaksi WHERE user_id = ?';
    const params = [req.session.user.id];

    if (tipe) {
        if (!tipeValid.includes(tipe)) {
            return res.status(400).send('Tipe tidak valid.');
        }
        sql += ' AND tipe = ?';
        params.push(tipe);
    }

    const hasil = await db.query(sql, params);
    res.json(hasil);
});

app.post('/transaksi', wajibLogin, async(req, res) => {

    const { tipe, jumlah, keterangan } = req.body;
    const [result] = await db.execute(
        'INSERT INTO transaksi (user_id, tipe, jumlah, keterangan) VALUES (?, ?, ?, ?)',
        [req.session.user.id, tipe, jumlah, keterangan]
    );
    res.status(201).json({ id: result.insertId });
});


app.put('/transaksi', wajibLogin, async(req, res) => {

    const { tipe, jumlah, keterangan } = req.body;
    const [result] = await db.execute(
        'UPDATE transaksi SET tipe = ?, jumlah = ?, keterangan = ? WHERE id = ? AND user_id = ?',
        [tipe, jumlah, keterangan, req.params.id, req.session.user.id]
    );
    res.status(201).json({ id: result.insertId });
});

app.delete('/transaksi/:id', wajibLogin, async (req, res) => {
    const [result] = await db.execute(
        'DELETE FROM transaksi WHERE id = ? AND user_id = ?',
        [req.params.id, req.session.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ pesan: 'Transaksi tidak ditemukan.' });
    res.json({ pesan: 'Berhasil dihapus.' });
});