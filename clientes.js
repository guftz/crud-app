document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000/clientes";

  // SELETORES
  const inputId = document.getElementById("inputId");
  const inputNome = document.getElementById("inputNome");
  const inputEmail = document.getElementById("inputEmail");
  const inputTelefone = document.getElementById("inputTelefone");

  const botaoAdicionar = document.getElementById("btnAdicionar");
  const botaoAtualizar = document.getElementById("btnAtualizarCliente");
  const botaoLimpar = document.getElementById("btnLimparFormulario"); // Assuming you have a clear button

  const corpoTabela = document.getElementById("tabelaClientesBody");
  const toastContainer = document.querySelector(".toast-container");

  // Função para exibir toasts
  const showToast = (message, type = "info", title = "Notificação") => {
    const toastId = "toast-" + Math.random().toString(36).substr(2, 9);
    const toastHTML = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
        <div class="toast-header">
          <strong class="me-auto text-${type}">${title}</strong>
          <small>Agora</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML("beforeend", toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);

    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });

    toast.show();
  };

  const limparFormulario = () => {
    inputId.value = "—";
    inputNome.value = "";
    inputEmail.value = "";
    inputTelefone.value = "";
    botaoAdicionar.disabled = false;
    botaoAtualizar.disabled = true;
    inputNome.focus();
  };

  if (botaoLimpar) {
    botaoLimpar.onclick = limparFormulario;
  }

  const obterTodosClientes = () => {
    fetch(apiUrl)
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (erro) {
            throw new Error(
              erro.error || `Erro ${response.status}: ${response.statusText}`
            );
          });
        }
        return response.json();
      })
      .then(function (clientes) {
        renderizarTabela(clientes);
      })
      .catch(function (erro) {
        corpoTabela.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar clientes: ${erro.message}</td></tr>`;
        showToast(
          `Erro ao carregar clientes: ${erro.message}`,
          "danger",
          "Erro de Conexão"
        );
      });
  };

  const criarCliente = (dadosCliente) => {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCliente),
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (erro) {
            throw new Error(
              erro.error || `Erro ${response.status} ao criar cliente.`
            );
          });
        }
        return response.json();
      })
      .then(function (clienteCriado) {
        limparFormulario();
        obterTodosClientes();
        showToast(
          `Cliente "${clienteCriado.nome}" (ID: ${clienteCriado.id}) adicionado com sucesso!`,
          "success",
          "Cliente Adicionado"
        );
      })
      .catch(function (erro) {
        showToast(erro.message, "danger", "Erro ao Adicionar");
      });
  };

  const atualizarCliente = (id, dadosCliente) => {
    fetch(apiUrl + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCliente),
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (erro) {
            throw new Error(
              erro.error || `Erro ${response.status} ao atualizar cliente.`
            );
          });
        }
        return response.json();
      })
      .then(function (clienteAtualizado) {
        limparFormulario();
        obterTodosClientes();
        showToast(
          `Cliente "${clienteAtualizado.nome}" (ID: ${clienteAtualizado.id}) atualizado com sucesso!`,
          "success",
          "Cliente Atualizado"
        );
      })
      .catch(function (erro) {
        showToast(erro.message, "danger", "Erro ao Atualizar");
      });
  };

  const excluirCliente = (id, nomeCliente) => {
    fetch(apiUrl + "/" + id, {
      method: "DELETE",
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (erro) {
            throw new Error(
              erro.error || `Erro ${response.status} ao excluir cliente.`
            );
          });
        }
        if (response.status === 204) {
          return { message: `Cliente "${nomeCliente}" excluído com sucesso!` };
        }
        return response.json();
      })
      .then(function (resposta) {
        obterTodosClientes();
        showToast(
          resposta.message || `Cliente "${nomeCliente}" excluído com sucesso!`,
          "info",
          "Cliente Excluído"
        );
      })
      .catch(function (erro) {
        showToast(erro.message, "danger", "Erro ao Excluir");
      });
  };

  const preencherFormulario = (cliente) => {
    inputId.value = cliente.ID || cliente.id; 
    inputNome.value = cliente.Nome || cliente.nome;
    inputEmail.value = cliente.Email || cliente.email;
    inputTelefone.value = cliente.Tel || cliente.tel;

    botaoAdicionar.disabled = true; 
    botaoAtualizar.disabled = false;
    inputNome.focus();
  };

  const renderizarTabela = (clientes) => {
    if (!clientes || !clientes.length) {
      corpoTabela.innerHTML =
        '<tr><td colspan="5" class="text-center">Nenhum cliente cadastrado.</td></tr>';
      return;
    }

    corpoTabela.innerHTML = "";

    clientes.forEach(function (cliente) {
      const linha = document.createElement("tr");

      const colunaId = document.createElement("th");
      colunaId.scope = "row";
      colunaId.textContent = cliente.ID || cliente.id; 
      linha.appendChild(colunaId);

      const colunaNome = document.createElement("td");
      colunaNome.textContent = cliente.Nome || cliente.nome;
      linha.appendChild(colunaNome);

      const colunaEmail = document.createElement("td");
      colunaEmail.textContent = cliente.Email || cliente.email;
      linha.appendChild(colunaEmail);

      const colunaTelefone = document.createElement("td");
      colunaTelefone.textContent = cliente.Tel || cliente.tel;
      linha.appendChild(colunaTelefone);

      const colunaAcoes = document.createElement("td");
      colunaAcoes.className = "text-end";

      const botaoPreencher = document.createElement("button");
      botaoPreencher.className = "btn btn-outline-secondary btn-sm me-2";
         'Editar';
      botaoPreencher.onclick = () => preencherFormulario(cliente);

      const botaoExcluir = document.createElement("button");
      botaoExcluir.className = "btn btn-outline-danger btn-sm"; 
      botaoExcluir.innerHTML =
        'Excluir';
      botaoExcluir.onclick = () => {
        const clientName = cliente.Nome || cliente.nome || "este cliente";
        if (confirm(`Excluir cliente "${clientName}"?`)) {
          excluirCliente(cliente.ID || cliente.id, clientName);
        }
      };

      colunaAcoes.appendChild(botaoPreencher);
      colunaAcoes.appendChild(botaoExcluir);
      linha.appendChild(colunaAcoes);

      corpoTabela.appendChild(linha);
    });
  };

  botaoAdicionar.onclick = () => {
    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const telefone = inputTelefone.value.trim();

    if (!nome) {
      showToast("O campo Nome é obrigatório.", "warning", "Validação");
      inputNome.focus();
      return;
    }
    if (!email) {
      showToast("O campo Email é obrigatório.", "warning", "Validação");
      inputEmail.focus();
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      showToast("Por favor, insira um Email válido.", "warning", "Validação");
      inputEmail.focus();
      return;
    }

    if (!telefone) {
      criarCliente({ nome: nome, email: email, tel: "Não Informado" });
    } else {
      criarCliente({ nome: nome, email: email, tel: telefone });
    }
  };

  botaoAtualizar.onclick = () => {
    const id = inputId.value;
    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const telefone = inputTelefone.value.trim();

    if (id === "—" || !id) {
      showToast(
        "Nenhum cliente selecionado para atualização.",
        "warning",
        "Validação"
      );
      return;
    }
    if (!nome) {
      showToast("O campo Nome é obrigatório.", "warning", "Validação");
      inputNome.focus();
      return;
    }
    if (!email) {
      showToast("O campo Email é obrigatório.", "warning", "Validação");
      inputEmail.focus();
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      showToast("Por favor, insira um Email válido.", "warning", "Validação");
      inputEmail.focus();
      return;
    }

    atualizarCliente(id, { nome: nome, email: email, tel: telefone });
  };

  limparFormulario();
  obterTodosClientes();
});
