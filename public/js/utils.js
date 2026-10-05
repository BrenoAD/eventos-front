/*
 * utils.js — funções usadas por mais de uma tela
 */

// Evita que um texto digitado pelo usuário seja interpretado como HTML
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Mostra (ou limpa, se mensagem = "") o erro logo abaixo de um campo.
// O <span> de erro precisa ter o id "erro-" + id do campo.
function mostrarErro(campo, mensagem) {
  const span = document.getElementById("erro-" + campo.id);
  span.textContent = mensagem;
  campo.classList.toggle("invalido", mensagem !== "");
  campo.setAttribute("aria-invalid", mensagem !== "" ? "true" : "false");
}

// Apaga a mensagem de erro assim que o usuário volta a mexer no campo
function limparErroAoDigitar(campos) {
  campos.forEach((campo) => {
    campo.addEventListener("input", () => mostrarErro(campo, ""));
  });
}

// Coloca o cursor no primeiro campo com erro
function focarPrimeiroErro(form) {
  const primeiro = form.querySelector(".invalido");
  if (primeiro) primeiro.focus();
}
