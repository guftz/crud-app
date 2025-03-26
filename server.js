require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// ################################
// ||     INFORMACOES DA API     ||
// ################################

const app = express();
const PORT = 3000
app.use(cors());
app.use(bodyParser.json()); // Implementação do Body-Parser para ser o Middleware que lida com os JSONs da Api

// ################################
// || CONECTAR AO BANCO DE DADOS ||
// ################################

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "", // Senha do arquivo .env, ou uma string vazia
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

connection.connect((erro) => {
    if (erro) {
        console.error("Erro ao conectar ao Banco de Dados:", erro);
        process.exit(1);
    }
    console.log("Sucesso ao conectar ao Banco de Dados");
});  

// ################################
// ||       INICIAR A API        ||
// ################################

app.listen(PORT, () => {
    console.log(`Api rodando na porta ${PORT}`);
});

// ################################
// ||        ROTAS DA API        ||
// ################################

app.get("/", (req, res) => {
    res.send("Rota Base da Api");
});

// Pegar Todos os Clientes
app.get("/clientes", (req, res) => {
    // Executa a Query SQL e retorna a resposta para o usuário
    const query = 'SELECT * FROM clientes'
    connection.query(query, (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message })
        return res.json(resultado)
    })
});

// Pegar apenas um Cliente
app.get("/clientes/:id", (req, res) => {
    // Executa a Query SQL e retorna a resposta para o usuário
    const { id } = req.params;
    const query = 'SELECT * FROM clientes WHERE id = ?'
    connection.query(query, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message })
        if (resultado.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        return res.json(resultado)
    })
});

// Criar Cliente
app.post("/clientes", (req, res) => {
    // Executa a Query SQL e retorna a resposta para o usuário
    const {sobrenome, nome, email, tel} = req.body;
    const query = 'INSERT INTO clientes (sobrenome, nome, email, tel) VALUES(?, ?, ?, ?)'
    connection.query(query, [sobrenome, nome, email, tel], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message })
        res.status(201).json({ id: resultado.insertId, sobrenome, nome, email, tel })
    })
});

// Deletar Cliente
app.delete("/clientes/:id", (req, res) => {
    // Executa a Query SQL e retorna a resposta para o usuário
    const { id } = req.params;
    const query = 'DELETE FROM clientes WHERE id = ?'
    connection.query(query, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message })
        if (resultado.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.status(200).json({ message: "Usuário deletado com sucesso" })
    })
});

// Atualizar Cliente
app.patch("/clientes/:id", (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    // Verifica se existe algum campo no Request do usuário utilizando o metódo nativo do JS para JSONs Object.keys
    if (Object.keys(fields).length === 0) {
        return res.status(400).json({ error: "Nenhum campo fornecido para atualização." });
    }

    // Extrai em variáveis, as chaves e valores do JSON de Request
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    // Usa as chaves e valores da Request e monta uma variável aSerMudado (Contendo chave1 = ?, chave2 = ?...)
    const aSerMudado = keys.map(key => `${key} = ?`).join(", ");
    const query = `UPDATE clientes SET ${aSerMudado} WHERE id = ?`;

    // Executa a Query SQL e retorna a resposta para o usuário
    connection.query(query, [...values, id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        if (resultado.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.status(200).json({ message: "Usuário atualizado com sucesso." });
    });
});