/*
 * cadastro-evento.js — cadastro E edição de evento
 *
 * cadastro-evento.html        -> cria um evento novo
 * cadastro-evento.html?id=3   -> edita o evento 3 (atualiza, não cria outro)
 *
 * Na sua API o palestrante não é um campo do evento: ele fica na tabela
 * evento_palestrante. Por isso, depois de salvar o evento, este código
 * também cria (ou troca) o vínculo com o palestrante escolhido.
 */
const formEvento = document.getElementById("form-evento");
const tituloPagina = document.getElementById("titulo-pagina");
const avisoSemPalestrantes = document.getElementById("sem-palestrantes");
const botaoCadastrar = document.getElementById("botao-cadastrar");

const campoNome = document.getElementById("nome");
const campoDescricao = document.getElementById("descricao");
const campoLocal = document.getElementById("local");
const campoPalestrante = document.getElementById("palestrante");

const idEdicao = new URLSearchParams(window.location.search).get("id");
let eventoEmEdicao = null;
let palestranteOriginal = null; // palestrante que o evento tinha ao abrir a edição

limparErroAoDigitar([campoNome, campoDescricao, campoLocal, campoPalestrante]);

// 1) Preenche o <select> com os palestrantes do banco (GET /palestrantes)
async function carregarPalestrantes() {
  const palestrantes = await API.listarPalestrantes();

  campoPalestrante.innerHTML = '<option value="">Selecione um palestrante</option>';
  palestrantes.forEach((p) => {
    const opcao = document.createElement("option");
    opcao.value = p.id_palestrante;
    opcao.textContent = p.nome;
    campoPalestrante.appendChild(opcao);
  });

  if (palestrantes.length === 0) {
    avisoSemPalestrantes.hidden = false;
    botaoCadastrar.disabled = true;
  }
}

// 2) Se veio ?id= na URL, busca o evento (GET /eventos/:id) e preenche o formulário
async function prepararEdicao() {
  if (!idEdicao) return;

  eventoEmEdicao = await API.buscarEvento(idEdicao);

  tituloPagina.textContent = "Editar evento";
  document.title = "Editar evento | Gerenciador de eventos";
  campoNome.value = eventoEmEdicao.nome;
  campoDescricao.value = eventoEmEdicao.descricao;
  campoLocal.value = eventoEmEdicao.local;

  if (eventoEmEdicao.palestrantes.length > 0) {
    palestranteOriginal = eventoEmEdicao.palestrantes[0].id_palestrante;
    campoPalestrante.value = palestranteOriginal;
  }
}

// 3) Nenhum campo pode ficar vazio
function validarFormulario() {
  const regras = [
    { campo: campoNome, mensagem: "Preencha o nome do evento." },
    { campo: campoDescricao, mensagem: "Preencha a descrição do evento." },
    { campo: campoLocal, mensagem: "Preencha o local do evento." },
    { campo: campoPalestrante, mensagem: "Selecione o palestrante do evento." },
  ];

  let valido = true;
  regras.forEach(({ campo, mensagem }) => {
    if (campo.value.trim() === "") {
      mostrarErro(campo, mensagem);
      valido = false;
    } else {
      mostrarErro(campo, "");
    }
  });
  return valido;
}

// CADASTRO: cria o evento e depois vincula o palestrante
async function cadastrarEvento(dados, idPalestrante) {
  const novo = await API.cadastrarEvento(dados); // POST /eventos

  try {
    await API.vincularPalestrante(novo.id_evento, idPalestrante); // POST /eventos/:id/palestrantes/:idPalestrante
  } catch (erro) {
    // Se o vínculo falhar, desfaz o cadastro para não sobrar evento sem palestrante
    await API.excluirEvento(novo.id_evento).catch(() => {});
    throw erro;
  }
}

// EDIÇÃO: atualiza o mesmo evento e, se o palestrante mudou, troca o vínculo
async function atualizarEvento(dados, idPalestrante) {
  await API.atualizarEvento(idEdicao, dados); // PUT /eventos/:id

  if (idPalestrante === palestranteOriginal) return; // palestrante não mudou

  const jaVinculado = eventoEmEdicao.palestrantes.some((p) => p.id_palestrante === idPalestrante);
  if (!jaVinculado) {
    await API.vincularPalestrante(idEdicao, idPalestrante);
  }
  if (palestranteOriginal) {
    await API.desvincularPalestrante(idEdicao, palestranteOriginal); // DELETE /eventos/:id/palestrantes/:idPalestrante
  }
}

// 4) Ao clicar em Cadastrar: cria OU atualiza
formEvento.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    focarPrimeiroErro(formEvento);
    return;
  }

  const dados = {
    nome: campoNome.value.trim(),
    descricao: campoDescricao.value.trim(),
    local: campoLocal.value.trim(),
  };
  const idPalestrante = Number(campoPalestrante.value);

  botaoCadastrar.disabled = true;
  try {
    if (eventoEmEdicao) {
      await atualizarEvento(dados, idPalestrante);
      alert("Evento atualizado com sucesso");
      window.location.href = "index.html";
    } else {
      await cadastrarEvento(dados, idPalestrante);
      alert("Cadastro concluído com sucesso");
      formEvento.reset();
      campoNome.focus();
    }
  } catch (erro) {
    alert(erro.message);
  } finally {
    botaoCadastrar.disabled = false;
  }
});

// Ao abrir a página
async function iniciar() {
  try {
    await carregarPalestrantes();
    await prepararEdicao();
  } catch (erro) {
    alert(erro.message);
    if (idEdicao) window.location.href = "index.html";
  }
}

iniciar();
