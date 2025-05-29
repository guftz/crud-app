document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000/projetos";

  // SELETORES CORRIGIDOS para o formulário de Projetos
  const inputIdP = document.getElementById("inputId"); // ID do Projeto (IDP)
  const inputData = document.getElementById("inputData");
  const inputStatus = document.getElementById("inputStatus");
  const inputOrcamento = document.getElementById("inputOrcamento");
  const inputClienteId = document.getElementById("inputClienteId"); // ID do Cliente (FK)

  const botaoAdicionar = document.getElementById("btnAdicionar");
  const botaoAtualizar = document.getElementById("btnAtualizarProjeto");
  const botaoLimpar = document.getElementById("btnLimparFormulario");

  const corpoTabela = document.getElementById("tabelaProjetosBody");
  const toastContainer = document.querySelector(".toast-container");

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
    inputIdP.value = "—"; // Placeholder for disabled IDP field
    inputData.value = "";
    inputStatus.value = "";
    inputOrcamento.value = "";
    inputClienteId.value = "";
    botaoAdicionar.disabled = false;
    botaoAtualizar.disabled = true;
    inputData.focus(); // Focus on the first editable field
  };

  if (botaoLimpar) {
    botaoLimpar.onclick = limparFormulario;
  }

  const obterTodosProjetos = () => {
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((erro) => {
            throw new Error(
              erro.error || `Erro ${response.status}: ${response.statusText}`
            );
          });
        }
        return response.json();
      })
      .then((projetos) => {
        renderizarTabela(projetos);
      })
      .catch((erro) => {
        corpoTabela.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar projetos: ${erro.message}</td></tr>`; // Colspan updated to 6
        showToast(
          `Erro ao carregar projetos: ${erro.message}`,
          "danger",
          "Erro de Conexão"
        );
      });
  };

  const criarProjeto = (dadosProjeto) => {
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosProjeto),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((erro) => {
            throw new Error(
              erro.error || `Erro ${response.status} ao criar projeto.`
            );
          });
        }
        return response.json();
      })
      .then((projetoCriado) => {
        limparFormulario();
        obterTodosProjetos();
        showToast(
          `Projeto (IDP: ${projetoCriado.IDP || projetoCriado.idp}) adicionado com sucesso!`, // Assuming API returns IDP
          "success",
          "Projeto Adicionado"
        );
      })
      .catch((erro) => {
        showToast(erro.message, "danger", "Erro ao Adicionar");
      });
  };

  const atualizarProjeto = (idp, dadosProjeto) => {
    fetch(`${apiUrl}/${idp}`, { // Corrected URL for specific project
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosProjeto),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((erro) => {
            throw new Error(
              erro.error || `Erro ${response.status} ao atualizar projeto.`
            );
          });
        }
        return response.json();
      })
      .then((projetoAtualizado) => {
        limparFormulario();
        obterTodosProjetos();
        showToast(
          `Projeto (IDP: ${projetoAtualizado.IDP || projetoAtualizado.idp}) atualizado com sucesso!`,
          "success",
          "Projeto Atualizado"
        );
      })
      .catch((erro) => {
        showToast(erro.message, "danger", "Erro ao Atualizar");
      });
  };

  const excluirProjeto = (idp) => { // nomeProjeto removed as it's not a direct field
    fetch(`${apiUrl}/${idp}`, { method: "DELETE" }) // Corrected URL
      .then((response) => {
        if (!response.ok && response.status !== 204) { // Handle 204 No Content
          return response.json().then((erro) => {
            throw new Error(
              erro.error || `Erro ${response.status} ao excluir projeto.`
            );
          });
        }
        if (response.status === 204) {
            return { message: `Projeto (IDP: ${idp}) excluído com sucesso!` };
        }
        return response.json();
      })
      .then((resposta) => {
        obterTodosProjetos();
        showToast(
          resposta.message || `Projeto (IDP: ${idp}) excluído com sucesso!`,
          "info",
          "Projeto Excluído"
        );
      })
      .catch((erro) => {
        showToast(erro.message, "danger", "Erro ao Excluir");
      });
  };

  // Renamed and refactored for projects
  const preencherFormularioProjeto = (projeto) => {
    // Assuming 'projeto' object from the table has properties matching the database schema
    // e.g., projeto.IDP, projeto.Data_projeto, projeto.Status_projeto, projeto.Orcamento, projeto.ID (Cliente ID)
    // Adjust property names if your API returns them differently (e.g., idp, data_projeto)
    inputIdP.value = projeto.IDP || projeto.idp;
    inputData.value = projeto.Data_projeto ? new Date(projeto.Data_projeto).toISOString().split('T')[0] : ""; // Format date for input
    inputStatus.value = projeto.Status_projeto || "";
    inputOrcamento.value = projeto.Orcamento || "";
    inputClienteId.value = projeto.ID || projeto.id; // Client's ID

    botaoAdicionar.disabled = true;
    botaoAtualizar.disabled = false;
    inputData.focus();

    showToast(
      `Dados do Projeto (IDP: ${projeto.IDP || projeto.idp}) carregados para edição.`,
      "info",
      "Projeto Carregado"
    );
  };

  const renderizarTabela = (projetos) => {
    if (!projetos || !projetos.length) {
      corpoTabela.innerHTML =
        '<tr><td colspan="6" class="text-center">Nenhum projeto cadastrado.</td></tr>'; // Colspan updated
      return;
    }

    corpoTabela.innerHTML = "";

    projetos.forEach((projeto) => {
      const linha = document.createElement("tr");

      // Corresponds to: IDP, Data, Status, Orçamento, Cliente ID, Ações

      const colunaIdP = document.createElement("th");
      colunaIdP.scope = "row";
      colunaIdP.textContent = projeto.IDP || projeto.idp; // Use IDP from schema
      linha.appendChild(colunaIdP);

      const colunaData = document.createElement("td");
      colunaData.textContent = projeto.Data_projeto ? new Date(projeto.Data_projeto).toLocaleDateString() : 'N/A'; // Format date for display
      linha.appendChild(colunaData);

      const colunaStatus = document.createElement("td");
      colunaStatus.textContent = projeto.Status_projeto || 'N/A';
      linha.appendChild(colunaStatus);

      const colunaOrcamento = document.createElement("td");
      colunaOrcamento.textContent = projeto.Orcamento !== null && projeto.Orcamento !== undefined ? `R$ ${parseFloat(projeto.Orcamento).toFixed(2)}` : 'N/A';
      linha.appendChild(colunaOrcamento);

      const colunaClienteId = document.createElement("td");
      colunaClienteId.textContent = projeto.ID || projeto.id || 'N/A'; // Client's ID
      linha.appendChild(colunaClienteId);

      const colunaAcoes = document.createElement("td");
      colunaAcoes.className = "text-end";

      const botaoEditar = document.createElement("button"); // Renamed for clarity
      botaoEditar.className = "btn btn-outline-secondary btn-sm me-2";
      botaoEditar.textContent = "Editar";
      botaoEditar.onclick = () => preencherFormularioProjeto(projeto);

      const botaoExcluir = document.createElement("button");
      botaoExcluir.className = "btn btn-outline-danger btn-sm";
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.onclick = () => {
        const projetoIdentifier = `IDP: ${projeto.IDP || projeto.idp}`; // Use a clear identifier
        if (confirm(`Excluir projeto "${projetoIdentifier}"?`)) {
          excluirProjeto(projeto.IDP || projeto.idp);
        }
      };

      colunaAcoes.appendChild(botaoEditar);
      colunaAcoes.appendChild(botaoExcluir);
      linha.appendChild(colunaAcoes);

      corpoTabela.appendChild(linha);
    });
  };

  botaoAdicionar.onclick = () => {
    const data = inputData.value;
    const status = inputStatus.value.trim();
    const orcamento = inputOrcamento.value;
    const clienteId = inputClienteId.value;

    // Basic Validations (adapt as needed)
    if (!data) {
      showToast("O campo Data é obrigatório.", "warning", "Validação");
      inputData.focus();
      return;
    }
    if (!status) {
      showToast("O campo Status é obrigatório.", "warning", "Validação");
      inputStatus.focus();
      return;
    }
    if (!orcamento) {
        showToast("O campo Orçamento é obrigatório.", "warning", "Validação");
        inputOrcamento.focus();
        return;
    }
    if (!clienteId) {
        showToast("O campo Cliente ID é obrigatório.", "warning", "Validação");
        inputClienteId.focus();
        return;
    }

    // Use field names matching the database schema for the request body
    criarProjeto({
        Data_projeto: data,
        Status_projeto: status,
        Orcamento: parseFloat(orcamento),
        ID: parseInt(clienteId) // Assuming ID (Cliente ID) is an integer
    });
  };

  botaoAtualizar.onclick = () => {
    const idp = inputIdP.value;
    const data = inputData.value;
    const status = inputStatus.value.trim();
    const orcamento = inputOrcamento.value;
    const clienteId = inputClienteId.value;

    if (idp === "—" || !idp) {
      showToast(
        "Nenhum projeto selecionado para atualização.",
        "warning",
        "Validação"
      );
      return;
    }
     if (!data) {
      showToast("O campo Data é obrigatório.", "warning", "Validação");
      inputData.focus();
      return;
    }
    if (!status) {
      showToast("O campo Status é obrigatório.", "warning", "Validação");
      inputStatus.focus();
      return;
    }
     if (!orcamento) {
        showToast("O campo Orçamento é obrigatório.", "warning", "Validação");
        inputOrcamento.focus();
        return;
    }
    if (!clienteId) {
        showToast("O campo Cliente ID é obrigatório.", "warning", "Validação");
        inputClienteId.focus();
        return;
    }

    atualizarProjeto(idp, {
        Data_projeto: data,
        Status_projeto: status,
        Orcamento: parseFloat(orcamento),
        ID: parseInt(clienteId)
    });
  };

  // Initial setup
  limparFormulario();
  obterTodosProjetos();
});