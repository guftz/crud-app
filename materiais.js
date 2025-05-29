document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:3000/materiais";
  
    // SELETORES
    const inputIDM = document.getElementById("inputIDM");
    const inputNome = document.getElementById("inputNome");
    const inputPeso = document.getElementById("inputPeso");
    const inputValorU = document.getElementById("inputValorU");
  
    const botaoAdicionar = document.getElementById("btnAdicionar");
    const botaoAtualizar = document.getElementById("btnAtualizar");
    const botaoLimpar = document.getElementById("btnLimpar");
  
    const corpoTabela = document.getElementById("tabelaMateriaisBody");
    const toastContainer = document.querySelector(".toast-container");
  
    // Função para exibir toasts
    const showToast = (message, type = "info", title = "Notificação") => {
      const toastId = "toast-" + Math.random().toString(36).substr(2, 9);
      const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="4000">
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
      const el = document.getElementById(toastId);
      const toast = new bootstrap.Toast(el);
      el.addEventListener("hidden.bs.toast", () => el.remove());
      toast.show();
    };
  
    // Limpa e reseta o formulário
    const limparFormulario = () => {
      inputIDM.value = "—";
      inputNome.value = "";
      inputPeso.value = "";
      inputValorU.value = "";
      botaoAdicionar.disabled = false;
      botaoAtualizar.disabled = true;
      inputNome.focus();
    };
  
    if (botaoLimpar) {
      botaoLimpar.onclick = limparFormulario;
    }
  
    // Fetch GET todos os materiais
    const obterTodosMateriais = () => {
      fetch(apiUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .then(materiais => renderizarTabela(materiais))
        .catch(err => {
          corpoTabela.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar materiais: ${err.message}</td></tr>`;
          showToast(`Erro ao carregar materiais: ${err.message}`, "danger", "Erro de Conexão");
        });
    };
  
    // POST novo material
    const criarMaterial = ({ Nome, Peso, Valor_U }) => {
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Nome, Peso, Valor_U })
      })
        .then(res => {
          if (!res.ok) return res.json().then(e => { throw new Error(e.error || `Erro ${res.status}`); });
          return res.json();
        })
        .then(rt => {
          limparFormulario();
          obterTodosMateriais();
          showToast(`Material "${rt.Nome}" (ID: ${rt.IDM}) adicionado com sucesso!`, "success", "Material Adicionado");
        })
        .catch(err => showToast(err.message, "danger", "Erro ao Adicionar"));
    };
  
    // PUT atualizar material
    const atualizarMaterial = (id, { Nome, Peso, Valor_U }) => {
      fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Nome, Peso, Valor_U })
      })
        .then(res => {
          if (!res.ok) return res.json().then(e => { throw new Error(e.error || `Erro ${res.status}`); });
          return res.json();
        })
        .then(rt => {
          limparFormulario();
          obterTodosMateriais();
          showToast(`Material "${rt.Nome}" (ID: ${rt.IDM}) atualizado!`, "success", "Material Atualizado");
        })
        .catch(err => showToast(err.message, "danger", "Erro ao Atualizar"));
    };
  
    // DELETE material
    const excluirMaterial = (id, nome) => {
      fetch(`${apiUrl}/${id}`, { method: "DELETE" })
        .then(res => {
          if (!res.ok) return res.json().then(e => { throw new Error(e.error || `Erro ${res.status}`); });
          return res.status === 204 ? {} : res.json();
        })
        .then(() => {
          obterTodosMateriais();
          showToast(`Material "${nome}" excluído.`, "info", "Material Excluído");
        })
        .catch(err => showToast(err.message, "danger", "Erro ao Excluir"));
    };
  
    // Preenche o form para edição
    const preencherFormulario = material => {
      inputIDM.value = material.IDM;
      inputNome.value = material.Nome;
      inputPeso.value = material.Peso;
      inputValorU.value = material.Valor_U;
      botaoAdicionar.disabled = true;
      botaoAtualizar.disabled = false;
      inputNome.focus();
    };
  
    // Renderiza tabela com ações
    const renderizarTabela = materiais => {
      if (!materiais || materiais.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum material cadastrado.</td></tr>';
        return;
      }
  
      corpoTabela.innerHTML = "";
      materiais.forEach(m => {
        const row = document.createElement("tr");
  
        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = m.IDM;
        row.appendChild(th);
  
        const tdNome = document.createElement("td");
        tdNome.textContent = m.Nome;
        row.appendChild(tdNome);
  
        const tdPeso = document.createElement("td");
        tdPeso.textContent = m.Peso;
        row.appendChild(tdPeso);
  
        const tdValor = document.createElement("td");
        tdValor.textContent = Number(m.Valor_U).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        row.appendChild(tdValor);
  
        const tdAcoes = document.createElement("td");
        tdAcoes.className = "text-end";
  
        const btnEdit = document.createElement("button");
        btnEdit.className = "btn btn-outline-secondary btn-sm me-2";
        btnEdit.innerHTML = 'Editar';
        btnEdit.onclick = () => preencherFormulario(m);
  
        const btnDel = document.createElement("button");
        btnDel.className = "btn btn-outline-danger btn-sm";
        btnDel.innerHTML = 'Excluir';
        btnDel.onclick = () => {
          if (confirm(`Excluir material "${m.Nome}" (ID: ${m.IDM})?`)) {
            excluirMaterial(m.IDM, m.Nome);
          }
        };
  
        tdAcoes.append(btnEdit, btnDel);
        row.appendChild(tdAcoes);
  
        corpoTabela.appendChild(row);
      });
    };
  
    // Handlers de botão
    botaoAdicionar.onclick = () => {
      const Nome = inputNome.value.trim();
      const Peso = parseFloat(inputPeso.value);
      const Valor_U = parseFloat(inputValorU.value);
  
      if (!Nome) return showToast("Nome é obrigatório.", "warning", "Validação");
      if (isNaN(Peso)) return showToast("Peso inválido.", "warning", "Validação");
      if (isNaN(Valor_U)) return showToast("Valor Unitário inválido.", "warning", "Validação");
  
      criarMaterial({ Nome, Peso, Valor_U });
    };
  
    botaoAtualizar.onclick = () => {
      const id = inputIDM.value;
      const Nome = inputNome.value.trim();
      const Peso = parseFloat(inputPeso.value);
      const Valor_U = parseFloat(inputValorU.value);
  
      if (id === "—") return showToast("Selecione um material para atualizar.", "warning", "Validação");
      if (!Nome) return showToast("Nome é obrigatório.", "warning", "Validação");
      if (isNaN(Peso)) return showToast("Peso inválido.", "warning", "Validação");
      if (isNaN(Valor_U)) return showToast("Valor Unitário inválido.", "warning", "Validação");
  
      atualizarMaterial(id, { Nome, Peso, Valor_U });
    };
  
    // Inicialização
    limparFormulario();
    obterTodosMateriais();
  });
  