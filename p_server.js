const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // altere se necessário
  database: 'crud_app' // seu banco de dados
});

// Testar conexão
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar no banco:', err);
    process.exit();
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Buscar todos os materiais
app.get('/materiais', (req, res) => {
  db.query('SELECT * FROM materiais', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar materiais' });
    res.json(results);
  });
});

// Buscar material por ID
app.get('/materiais/:id', (req, res) => {
  db.query('SELECT * FROM materiais WHERE IDM = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar material' });
    if (results.length === 0) return res.status(404).json({ erro: 'Material não encontrado' });
    res.json(results[0]);
  });
});

// Inserir novo material
app.post('/materiais', (req, res) => {
  const { Nome, Peso, Valor_U } = req.body;
  db.query('INSERT INTO materiais (Nome, Peso, Valor_U) VALUES (?, ?, ?)', [Nome, Peso, Valor_U], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao inserir material' });
    res.status(201).json({ IDM: result.insertId, Nome, Peso, Valor_U });
  });
});

// Atualizar material
app.put('/materiais/:id', (req, res) => {
  const { Nome, Peso, Valor_U } = req.body;
  db.query('UPDATE materiais SET Nome = ?, Peso = ?, Valor_U = ? WHERE IDM = ?', [Nome, Peso, Valor_U, req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar material' });
    res.json({ IDM: parseInt(req.params.id), Nome, Peso, Valor_U });
  });
});

// Deletar material
app.delete('/materiais/:id', (req, res) => {
  db.query('DELETE FROM materiais WHERE IDM = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao deletar material' });
    res.sendStatus(204); // No Content
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
