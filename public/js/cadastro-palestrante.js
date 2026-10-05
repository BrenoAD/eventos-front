/*
 * cadastro-palestrante.js — valida e grava o palestrante no banco
 */
const formPalestrante = document.getElementById("form-palestrante");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const botaoCadastrar = formPalestrante.querySelector("button[type=submit]");

// algo@algo.algo (a sua API e o CHECK do banco também conferem isso)
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

limparErroAoDigitar([campoNome, campoEmail]);

function validarFormulario() {
  const nome = campoNome.value.trim();
  const email = campoEmail.value.trim();
  let valido = true;

  if (nome === "") {
    mostrarErro(campoNome, "Preencha o nome do palestrante.");
    valido = false;
  } else {
    mostrarErro(campoNome, "");
  }

  if (email === "") {
    mostrarErro(campoEmail, "Preencha o e-mail.");
    valido = false;
  } else if (!REGEX_EMAIL.test(email)) {
    mostrarErro(campoEmail, "Digite um e-mail válido, como nome@exemplo.com.");
    valido = false;
  } else {
    mostrarErro(campoEmail, "");
  }

  return valido;
}

formPalestrante.addEventListener("submit", async (e) => {
  e.preventDefault(); // não deixa a página recarregar

  // Só envia se TODOS os campos estiverem preenchidos e o e-mail for válido
  if (!validarFormulario()) {
    focarPrimeiroErro(formPalestrante);
    return;
  }

  botaoCadastrar.disabled = true;
  try {
    // POST /palestrantes
    await API.cadastrarPalestrante({
      nome: campoNome.value.trim(),
      email: campoEmail.value.trim(),
    });
    alert("Cadastro concluído com sucesso");
    formPalestrante.reset();
    campoNome.focus();
  } catch (erro) {
    if (erro.status === 409) {
      // e-mail repetido (UNIQUE uq_palestrante_email)
      mostrarErro(campoEmail, "Este e-mail já pertence a outro palestrante.");
      campoEmail.focus();
    } else {
      alert(erro.message);
    }
  } finally {
    botaoCadastrar.disabled = false;
  }
});
