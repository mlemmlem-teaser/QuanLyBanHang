const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DB CONFIG (Windows Authentication) ───────────────────
const dbConfig = {
  user: 'MlemMlem',
  password: '24478392mlem###', 
  server: 'localhost\\SQLEXPRESS',
  database: 'QuanLyBanHang',
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true
  }
};
let pool;
(async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server - QuanLyBanHang');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', JSON.stringify(err, null, 2));
  }
})();

// ── TABLE METADATA ────────────────────────────────────────
const tables = {
  LoaiMatHang:     { primaryKey: ['MaLoai'],                       columns: ['MaLoai','TenLoai'] },
  NhaCungCap:      { primaryKey: ['MaNhaCungCap'],                  columns: ['MaNhaCungCap','TenNhaCungCap','SoDienThoai','DiaChi'] },
  KhachHang:       { primaryKey: ['MaKhachHang'],                   columns: ['MaKhachHang','TenKhachHang','SoDienThoai'] },
  NhanVien:        { primaryKey: ['MaNhanVien'],                    columns: ['MaNhanVien','TenNhanVien','ChucVu','PhongBan'] },
  MatHang:         { primaryKey: ['MaMatHang'],                     columns: ['MaMatHang','MaLoai','TenMatHang','GiaBan'] },
  DonHang:         { primaryKey: ['MaDonHang'],                     columns: ['MaDonHang','MaKhachHang','MaNhanVien','ThoiGian','TongTienThanhToan'] },
  CungCap:         { primaryKey: ['MaNhaCungCap','MaMatHang'],      columns: ['MaNhaCungCap','MaMatHang'] },
  ChiTietDonHang:  { primaryKey: ['MaDonHang','MaMatHang'],         columns: ['MaDonHang','MaMatHang','SoLuong','GiaMua'] },
};

// ── HELPERS ───────────────────────────────────────────────
function buildWhere(meta, params) {
  return meta.primaryKey.map(k => `[${k}] = @${k}`).join(' AND ');
}
function addPkInputs(request, meta, params) {
  meta.primaryKey.forEach(k => request.input(k, params[k]));
}

// ── ROUTES ────────────────────────────────────────────────
app.get('/api/tables', (req, res) => {
  res.json(Object.entries(tables).map(([name, meta]) => ({ name, ...meta })));
});

app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!tables[table]) return res.status(404).json({ error: 'Table not found' });
  try {
    const result = await pool.request().query(`SELECT * FROM [${table}]`);
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/:table/search', async (req, res) => {
  const { table } = req.params;
  const meta = tables[table];
  if (!meta) return res.status(404).json({ error: 'Table not found' });
  const { q } = req.query;
  if (!q) { const r = await pool.request().query(`SELECT * FROM [${table}]`); return res.json(r.recordset); }
  const conditions = meta.columns.map(c => `CAST([${c}] AS NVARCHAR(MAX)) LIKE @q`).join(' OR ');
  try {
    const request = pool.request();
    request.input('q', `%${q}%`);
    const result = await request.query(`SELECT * FROM [${table}] WHERE ${conditions}`);
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/:table/row', async (req, res) => {
  const { table } = req.params;
  const meta = tables[table];
  if (!meta) return res.status(404).json({ error: 'Table not found' });
  try {
    const request = pool.request();
    addPkInputs(request, meta, req.query);
    const result = await request.query(`SELECT * FROM [${table}] WHERE ${buildWhere(meta, req.query)}`);
    res.json(result.recordset[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  const meta = tables[table];
  if (!meta) return res.status(404).json({ error: 'Table not found' });
  const data = req.body;
  const cols   = Object.keys(data).map(c => `[${c}]`).join(', ');
  const params = Object.keys(data).map(c => `@${c}`).join(', ');
  try {
    const request = pool.request();
    Object.entries(data).forEach(([k, v]) => request.input(k, v));
    await request.query(`INSERT INTO [${table}] (${cols}) VALUES (${params})`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/:table/row', async (req, res) => {
  const { table } = req.params;
  const meta = tables[table];
  if (!meta) return res.status(404).json({ error: 'Table not found' });
  const pkKeys = meta.primaryKey;
  const body = req.body;
  const updateFields = Object.keys(body).filter(k => !pkKeys.includes(k));
  if (!updateFields.length) return res.status(400).json({ error: 'No fields to update' });
  const setClause = updateFields.map(k => `[${k}] = @set_${k}`).join(', ');
  try {
    const request = pool.request();
    updateFields.forEach(k => request.input(`set_${k}`, body[k]));
    addPkInputs(request, meta, req.query);
    await request.query(`UPDATE [${table}] SET ${setClause} WHERE ${buildWhere(meta, req.query)}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/:table/row', async (req, res) => {
  const { table } = req.params;
  const meta = tables[table];
  if (!meta) return res.status(404).json({ error: 'Table not found' });
  try {
    const request = pool.request();
    addPkInputs(request, meta, req.query);
    await request.query(`DELETE FROM [${table}] WHERE ${buildWhere(meta, req.query)}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));