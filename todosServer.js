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
});

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
    console.log('Conectado ao Banco de Dados');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// ================================
// ||                            ||
// ||          Rotas             ||
// ||                            ||
// ================================

// --- Clientes Routes ---

// GET ---------------------------- READ
app.get('/clientes', (request, response) => {
    conexao.query('SELECT * FROM clientes', (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao buscar clientes', detalhes: erro });
        } else {
            response.status(200).json(resultado);
        }
    });
});

app.get('/clientes/:id', (request, response) => {
    const id = request.params.id;
    conexao.query('SELECT * FROM clientes WHERE id = ?', [id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao buscar cliente', detalhes: erro });
        } else {
            if (resultado.length === 0) {
                response.status(404).json({ error: `Cliente com ID ${id} não encontrado` });
            } else {
                response.status(200).json(resultado[0]); // Send single object if found
            }
        }
    });
});

// POST --------------------------- CREATE
app.post('/clientes', (request, response) => {
    const { nome, email, tel } = request.body;

    if (!nome || !email) {
        return response.status(400).json({ error: 'Os campos nome e email são obrigatórios.' });
    }

    conexao.query('INSERT INTO clientes (`Nome`, `Email`, `Tel`) VALUES (?, ?, ?)', [nome, email, tel], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao adicionar cliente', detalhes: erro });
        } else {
            response.status(201).json({ message: 'Cliente adicionado com sucesso!', id: resultado.insertId, nome, email, tel });
        }
    });
});

// PUT ---------------------------- UPDATE
app.put('/clientes/:id', (request, response) => {
    const id = request.params.id;
    const { nome, email, tel } = request.body;

    if (!nome || !email) { // Basic validation
        return response.status(400).json({ error: 'Os campos nome e email são obrigatórios para atualização.' });
    }

    conexao.query('UPDATE clientes SET Nome = ?, Email = ?, Tel = ? WHERE id = ?', [nome, email, tel, id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ error: 'Erro ao atualizar cliente', detalhes: erro });
        } else {
            if (resultado.affectedRows === 0) {
                response.status(404).json({ error: `Cliente com ID ${id} não encontrado para atualização` });
            } else {
                response.status(200).json({ message: 'Cliente atualizado com sucesso!', id, nome, email, tel });
            }
        }
    });
});

// DELETE ------------------------- DELETE
app.delete('/clientes/:id', (request, response) => {
    const id = request.params.id;

    conexao.query('DELETE FROM clientes WHERE id = ?', [id], (erro, resultado) => {
        if (erro) {
            // Check for foreign key constraint error (MySQL error code 1451)
            if (erro.errno === 1451) {
                response.status(409).json({ error: 'Erro ao deletar cliente: Este cliente está associado a um ou mais projetos.', detalhes: erro.sqlMessage });
            } else {
                response.status(500).json({ error: 'Erro ao deletar cliente', detalhes: erro });
            }
        } else {
            if (resultado.affectedRows === 0) {
                response.status(404).json({ error: `Cliente com ID ${id} não encontrado para deletar` });
            } else {
                response.status(200).json({ message: `Cliente com ID ${id} deletado com sucesso` });
            }
        }
    });
});


// --- Projetos Routes ---

// GET ---------------------------- READ
app.get("/projetos", (req, res) => {
    const query = "SELECT * FROM projetos";
    conexao.query(query, (erro, resultado) => {
        if (erro) {
            res.status(500).json({ error: "Erro ao buscar projetos.", detalhes: erro });
        } else {
            // Ensure Data_projeto is formatted if it exists and is a Date object
            // MySQL driver usually returns dates as strings in 'YYYY-MM-DD HH:MM:SS' or Date objects
            // If they are Date objects, toISOString().split('T')[0] is fine.
            // If already strings, this step might not be needed or could be adapted.
            const projetosFormatados = resultado.map(projeto => {
                if (projeto.Data_projeto && typeof projeto.Data_projeto.toISOString === 'function') { // Check if it's a Date object
                    return { ...projeto, Data_projeto: projeto.Data_projeto.toISOString().split("T")[0] };
                }
                return projeto;
            });
            res.status(200).json(projetosFormatados);
        }
    });
});

app.get("/projetos/:idp", (req, res) => { // Changed :id to :idp for clarity if IDP is the actual param name
    const idp = req.params.idp;
    const query = "SELECT * FROM projetos WHERE IDP = ?";
    conexao.query(query, [idp], (erro, resultado) => {
        if (erro) {
            res.status(500).json({ error: "Erro ao buscar projeto.", detalhes: erro });
        } else {
            if (resultado.length === 0) {
                res.status(404).json({ error: `Projeto com IDP ${idp} não encontrado.` });
            } else {
                const projeto = resultado[0];
                if (projeto.Data_projeto && typeof projeto.Data_projeto.toISOString === 'function') {
                    projeto.Data_projeto = projeto.Data_projeto.toISOString().split("T")[0];
                }
                res.status(200).json(projeto);
            }
        }
    });
});

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
app.post("/projetos", (req, res) => {
    const { Data_projeto, Status_projeto, Orcamento, ID } = req.body;

    if (!Data_projeto || !Status_projeto || Orcamento === undefined || ID === undefined) {
        return res.status(400).json({ error: "Campos Data_projeto, Status_projeto, Orcamento e ID (Cliente) são obrigatórios." });
    }

    const query = "INSERT INTO projetos (Data_projeto, Status_projeto, Orcamento, ID) VALUES (?, ?, ?, ?)";
    conexao.query(query, [Data_projeto, Status_projeto, Orcamento, ID], (erro, resultado) => {
        if (erro) {
            // Check for foreign key constraint error (MySQL error code 1452) - e.g. Client ID does not exist
             if (erro.errno === 1452) {
                res.status(400).json({ error: 'Erro ao criar projeto: Cliente ID fornecido não existe.', detalhes: erro.sqlMessage });
            } else {
                res.status(500).json({ error: "Erro ao criar projeto.", detalhes: erro });
            }
        } else {
            res.status(201).json({ message: "Projeto criado com sucesso!", IDP: resultado.insertId, Data_projeto, Status_projeto, Orcamento, ID });
        }
    });
});

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
app.put("/projetos/:idp", (req, res) => { // Changed :id to :idp
    const idp = req.params.idp;
    const { Data_projeto, Status_projeto, Orcamento, ID } = req.body;

     if (!Data_projeto || !Status_projeto || Orcamento === undefined || ID === undefined) {
        return res.status(400).json({ error: "Campos Data_projeto, Status_projeto, Orcamento e ID (Cliente) são obrigatórios para atualização." });
    }
    
    // Assuming Data_projeto from request body is a string like "YYYY-MM-DD"
    // If it's already a Date object from a JSON parser, this might not be strictly necessary
    // but ensuring the format for DB is good.
    const dataFormatada = new Date(Data_projeto).toISOString().split("T")[0]; 

    const query = "UPDATE projetos SET Data_projeto = ?, Status_projeto = ?, Orcamento = ?, ID = ? WHERE IDP = ?";
    conexao.query(query, [dataFormatada, Status_projeto, Orcamento, ID, idp], (erro, resultado) => {
        if (erro) {
             if (erro.errno === 1452) { // Client ID does not exist
                res.status(400).json({ error: 'Erro ao atualizar projeto: Cliente ID fornecido não existe.', detalhes: erro.sqlMessage });
            } else {
                res.status(500).json({ error: "Erro ao atualizar projeto.", detalhes: erro });
            }
        } else {
            if (resultado.affectedRows === 0) {
                res.status(404).json({ error: `Projeto com IDP ${idp} não encontrado para atualização.` });
            } else {
                res.status(200).json({ message: "Projeto atualizado com sucesso!", IDP: idp, Data_projeto: dataFormatada, Status_projeto, Orcamento, ID });
            }
        }
    });
});

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

app.delete("/projetos/:idp", (req, res) => {
    const idp = req.params.idp;
    const query = "DELETE FROM projetos WHERE IDP = ?";

    conexao.query(query, [idp], (erro, resultado) => {
        if (erro) {
            res.status(500).json({ error: "Erro ao remover o projeto.", detalhes: erro.message });
        } else {
            if (resultado.affectedRows === 0) {
                res.status(404).json({ error: `Projeto com IDP ${idp} não encontrado para remover.` });
            } else {
                // THIS IS THE CRITICAL PATH
                const successMessage = `Projeto com IDP ${idp} removido com sucesso.`;
                res.status(200).json({ message: successMessage });
            }
        }
    });
});