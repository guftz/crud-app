const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// ================================
// ||                            ||
// ||   Informações do Projeto   ||
// ||                            ||
// ================================

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'crud_app'
})

// ================================
// ||                            ||
// || Ligar Banco de Dados e API ||
// ||                            ||
// ================================

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados:', erro);
        return;
    }
    console.log('Conectado ao Banco de Dados')
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})

// ================================
// ||                            ||
// ||           Rotas            ||
// ||                            ||
// ================================


// GET ---------------------------- READ
app.get('/clientes', (request, response) => {
    conexao.query('SELECT * FROM clientes', (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao buscar clientes', detalhes: erro }); // Retorna Erro em JSON
        } else {
            response.status(200).json(resultado); // Retorna o cliente em JSON
        }
    });
})

app.get('/clientes/:id', (request, response) => {
    const id = request.params.id;
    conexao.query('SELECT * FROM clientes WHERE id = ?', [id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao buscar cliente', detalhes: erro }); // Retorna Erro em JSON
        } else {
            response.status(200).json(resultado); // Retorna o cliente em JSON
        }
    });
})

// POST --------------------------- CREATE
app.post('/clientes', (request, response) => {
    const { nome, email, tel } = request.body; // Pega os dados do Request

    if (!nome || !email) { // Verifica se os campos NOME e EMAIL estão preenchidos
        return response.status(400).json({ error: 'Os campos nome e email são obrigatórios.' });
    }

    conexao.query('INSERT INTO clientes (`Nome`, `Email`, `Tel`) VALUES (?, ?, ?)', [nome, email, tel], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao adicionar cliente', detalhes: erro }); // Retorna Erro em JSON
        } else {
            response.status(201).json({ id: resultado.insertId, nome, email, tel }); // Retorna o cliente adicionado em JSON
        }
    });
})

// PUT ---------------------------- UPDATE
app.put('/clientes/:id', (request, response) => {
    const id = request.params.id;
    const { nome, email, tel } = request.body; // Pega os dados do Request

    conexao.query('UPDATE clientes SET Nome = ?, Email = ?, Tel = ? WHERE id = ?', [nome, email, tel, id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao atualizar cliente', detalhes: erro }); // Retorna Erro em JSON
        } else {
            response.status(200).json({ id, nome, email, tel }); // Retorna o cliente atualizado em JSON
        }
    });
})

// DELETE ------------------------- DELETE
app.delete('/clientes/:id', (request, response) => {
    const id = request.params.id;

    conexao.query('DELETE FROM clientes WHERE id = ?', [id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao deletar cliente', detalhes: erro }); // Retorna Erro em JSON
        } else {
            response.status(200).json({ message: `Cliente com id ${id} deletado com sucesso` }); // Retorna mensagem de sucesso em JSON
        }
    });
})