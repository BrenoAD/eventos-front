/*
 * gerenciador.js — tela inicial: lista, edita e exclui eventos do banco
 */
const listaEventos = document.getElementById("lista-eventos");
const listaVazia = document.getElementById("lista-vazia");
let eventosCarregados = [];

async function renderizarEventos() {
  try {
    eventosCarregados = await API.listarEventos(); // GET /eventos
  } catch (erro) {
    alert(erro.message);
    return;
  }

  listaEventos.innerHTML = "";
  listaVazia.hidden = eventosCarregados.length > 0;

  eventosCarregados.forEach((evento) => {
    // A API devolve "palestrantes" como lista (tabela evento_palestrante)
    const nomes = evento.palestrantes.map((p) => p.nome).join(", ") || "nenhum";

    const card = document.createElement("article");
    card.className = "card-evento";
    card.innerHTML = `
      <p><strong>nome:</strong> ${escaparHTML(evento.nome)}</p>
      <p><strong>descrição:</strong> ${escaparHTML(evento.descricao)}</p>
      <p><strong>local:</strong> ${escaparHTML(evento.local)}</p>
      <p><strong>palestrante:</strong> ${escaparHTML(nomes)}</p>
      <div class="card-acoes">
        <button type="button" class="botao botao-card" data-acao="editar" data-id="${evento.id_evento}">Editar</button>
        <button type="button" class="botao botao-card botao-excluir" data-acao="excluir" data-id="${evento.id_evento}">Excluir</button>
      </div>
    `;
    listaEventos.appendChild(card);
  });
}

listaEventos.addEventListener("click", async (e) => {
  const botao = e.target.closest("button[data-acao]");
  if (!botao) return;

  const id = Number(botao.dataset.id);

  // EDITAR: abre o cadastro de evento levando o id na URL
  if (botao.dataset.acao === "editar") {
    window.location.href = `cadastro-evento.html?id=${id}`;
    return;
  }

  // EXCLUIR: pede confirmação antes de apagar do banco
  if (botao.dataset.acao === "excluir") {
    const evento = eventosCarregados.find((ev) => ev.id_evento === id);
    const confirmou = confirm(`Deseja realmente excluir o evento "${evento.nome}"?`);
    if (!confirmou) return;

    try {
      await API.excluirEvento(id); // DELETE /eventos/:id (os vínculos saem junto, CASCADE)
      alert("Evento excluído com sucesso");
      renderizarEventos();
    } catch (erro) {
      alert(erro.message);
    }
  }
});

renderizarEventos();
