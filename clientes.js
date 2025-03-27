const modalScreen = document.getElementById("screen-wrapper");
const refreshButton = document.getElementById("btn-refresh");
const openModalButton = document.getElementById("openModalButton");
const addClientButton = document.getElementById("addClientButton");
const apiBaseUrl = "http://localhost:3000/";
const tableContent = document.querySelector(".table-wrapper tbody");
const modalForm = document.querySelector(".form-wrapper form");

modalScreen.addEventListener("click", (event) => {
  if (event.target === modalScreen) {
    modalScreen.classList.remove("active");
  }
});

openModalButton.addEventListener("click", (event) => {
  modalScreen.classList.add("active");
});

addClientButton.addEventListener("click", (event) => {
  event.preventDefault();
  addCliente();
});

refreshButton.addEventListener("click", () => {
  fetchClientes();
});

tableContent.addEventListener("click", (event) => {
    const deleteButtonEspecifico = event.target.closest('.btn-delete');

    //Se o botão existir realmente
    if (deleteButtonEspecifico) {
        const cpfEspecifico = deleteButtonEspecifico.getAttribute('data-id');
        deleteCliente(cpfEspecifico)
    }
  });

function addCliente() {
  // Variaveis para os Inputs do Formulario
  const cpfInput = modalForm.querySelector('input[name="cpf"]');
  const nameInput = modalForm.querySelector('input[name="name"]');
  const emailInput = modalForm.querySelector('input[name="email"]');
  const telInput = modalForm.querySelector('input[name="tel"]');

  // Valores dentro de cada input do Formulario
  const cpf = cpfInput.value.trim();
  const nome = nameInput.value.trim();
  const email = emailInput.value.trim();
  const tel = telInput.value.trim();

  // Verifica se todos os input nao estao vazios
  if (!cpf || !nome || !email || !tel) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // Coloca todos os inputs do usuario em um Json
  const clientData = {
    cpf: cpf,
    nome: nome,
    email: email,
    tel: tel,
  };

  // Faz um requisicao POST para a API para criar um Cliente
  fetch(apiBaseUrl + "clientes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao adicionar cliente");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Cliente adicionado com sucesso");
      // Fecha o Modal
      modalScreen.classList.remove("active");
      // Atualiza a Tabela
      fetchClientes();
    })
    .catch((error) => {
      console.error("Erro ao adicionar cliente:", error);
      alert("Erro ao adicionar cliente. Tente novamente.");
    });
}

function fetchClientes() {
  fetch(apiBaseUrl + "clientes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao conectar na API");
      }
      return response.json();
    })
    .then((data) => {
      //Limpa o conteúdo que a tabela possa ter
      tableContent.innerHTML = "";

      //Para cada cliente que voltar na resposta da API
      data.forEach((client) => {
        console.log("Processing client:", client);
        const novaLinha = document.createElement("tr");

        novaLinha.innerHTML = `
                    <td>${client.CPF || ""}</td>
                    <td>${client.Nome || ""}</td>
                    <td>${client.Email || ""}</td>
                    <td>${client.Tel || ""}</td>
                    <td class="centered-cell">
                        <button class="btn-edit" data-id="${client.CPF}">
                        <i class="fa-solid fa-pen" style="color: #fafafa;"></i>
                        </button>
                        <button class="btn-delete" data-id="${client.CPF}">
                        <i class="fa-solid fa-trash-can" style="color: #fafafa;"></i>
                        </button>
                    </td>
                    `;

        //Adiciona um novo cliente na tabela
        tableContent.appendChild(novaLinha);
      });
    })
    .catch((error) => console.error("Erro ao atualizar Clientes:", error));
}

function deleteCliente(cpf) {
  // Confirmação de Delete do Cliente
  if (!confirm("Deseja realmente excluir este cliente?")) {
    return;
  }

  fetch(apiBaseUrl + "clientes/" + cpf, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao deletar cliente");
      }
      return response.json();
    })
    .then((data) => {
      fetchClientes(); // Atualiza a Tabela
    })
    .catch((error) => {
      alert("Erro ao deletar cliente. Tente novamente.");
    });
}
