require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// INFORMACOES DA API E INICIALIZACAO DO EXPRESS ----------------------------------------------------------------------

const app = express();
const PORT = 3000
app.use(bodyParser.json()); // Implementacao do Body-Parser para ser o Middleware que lida com os JSONs da Api

// CONECTAR AO BANCO DE DADOS ----------------------------------------------------------------------

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "", // Senha do arquivo .env ou uma string vazia
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

// INICIAR A API ----------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Api rodando na porta ${PORT}`);
});

// ROTAS ----------------------------------------------------------------------

app.get("/", (req, res) => {
    res.send("Rota Base da Api");
});