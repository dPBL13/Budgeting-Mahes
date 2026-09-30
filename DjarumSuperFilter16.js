app.get('/filter', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Login dulu');

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