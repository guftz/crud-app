// Imports
const cors = require("cors");
const express = require("express");
const mysql = require("mysql2");

// Info
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

conexao.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar ao Banco de Dados:", erro);
  }
  console.log("Sucesso ao conectar ao Banco de Dados");
});

// Ligar API
app.listen(port, () => {
    console.log(`Api Rodando na Porta ${port}`)
})

// -------------------------------------------------------------------------------------- //

//Rotas da Api

// GET - Rota para listar todos os projetos

app.get("/projetos", (req, res) => {
  const query = "SELECT * FROM projetos";
  conexao.query(query, (erro, resultado) => {
    if (erro) {
      res.status(500).send("Erro! Não há projetos existentes.");
    } else {
      // Formata a data de todos os projetos
      resultado.forEach(projeto => {
        if (projeto.Data_projeto) {
          projeto.Data_projeto = projeto.Data_projeto.toISOString().split("T")[0];
        }
      });
      res.json(resultado);
    }
  });
});

// GET por IDP - Rota para obter um projeto pelo seu IDP

app.get("/projetos/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM projetos WHERE IDP = ?";
  conexao.query(query, [id], (erro, resultado) => {
    if (erro) {
      res.status(500).send("Erro! Não há projetos existentes.");
    } else {
      if (resultado.length === 0) {
        res.status(404).send("Erro! Não foi encontrado projeto algum.");
      } else {
        // Formata a data do projeto pelo IDP
        const projeto = resultado[0];
        if (projeto.Data_projeto) {
          projeto.Data_projeto = projeto.Data_projeto.toISOString().split("T")[0];
        }
        res.json(projeto);
      }
    }
  });
});

// POST - Rota para adicionar um novo projeto

app.post("/projetos", (req, res) => {
  const {Data_projeto, Status_projeto, Orcamento, ID} = req.body;
  const query = "INSERT INTO projetos (Data_projeto, Status_projeto, Orcamento, ID) VALUES (?, ?, ?, ?)";
  conexao.query(query, [Data_projeto,Status_projeto, Orcamento, ID], (erro, resultado) => {
    if (erro) {
      res.status(500).send("Erro! Não foi criado projeto algum.");
    } else {
      res.status(201).send({ message: "OK! Projeto criado com sucesso.", IDP: resultado.insertId });
    }
  });
});

// PUT by IDP - Rota para atualizar um projeto pré-existente por IDP

app.put("/projetos/:id", (req, res) => {
  const id = req.params.id;
  const {Data_projeto, Status_projeto, Orcamento, ID} = req.body;
  const dataFormatada = new Date(Data_projeto).toISOString().split("T")[0];
  const query = "UPDATE projetos SET Data_projeto = ?, Status_projeto = ?, Orcamento = ?, ID = ? WHERE IDP = ?";
  conexao.query(query, [dataFormatada, Status_projeto, Orcamento, ID, id], (erro) => {
    if (erro) {
      res.status(500).send("Erro! Seu projeto não foi atualizado.");
    } else {
      res.send("OK! Projeto atualizado com sucesso.");
    }
  });
});

// DELETE by IDP - Rota para remover um projeto conforme seu IDP

app.delete("/projetos/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM projetos WHERE IDP = ?";
  conexao.query(query, [id], (erro) => {
    if (erro) {
      res.status(500).send("Erro! O projeto não foi removido.");
    } else {
      res.send("OK! Projeto removido com sucesso.");
    }
  });
});