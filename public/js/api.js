/*
 * api.js — as telas falam com a SUA API (pasta eventos-api) por aqui.
 * A API precisa estar rodando (npm run dev) para as telas funcionarem.
 */
const API_URL = "http://localhost:3000";

const API = {
  async requisitar(metodo, caminho, dados) {
    const opcoes = { method: metodo, headers: {} };
    if (dados) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.body = JSON.stringify(dados);
    }

    let resposta;
    try {
      resposta = await fetch(API_URL + caminho, opcoes);
    } catch (erro) {
      throw new Error(`Não foi possível conectar à API em ${API_URL}. Confira se ela está rodando (npm run dev).`);
    }

    // DELETE /eventos/:id responde 204 (sem corpo)
    const corpo = resposta.status === 204 ? null : await resposta.json().catch(() => null);

    if (!resposta.ok) {
      const erro = new Error((corpo && corpo.erro) || `A API respondeu com erro ${resposta.status}.`);
      erro.status = resposta.status;
      throw erro;
    }
    return corpo;
  },

  // ---------- Palestrantes ----------
  listarPalestrantes() {
    return this.requisitar("GET", "/palestrantes");
  },
  cadastrarPalestrante(dados) {
    return this.requisitar("POST", "/palestrantes", dados);
  },

  // ---------- Eventos ----------
  listarEventos() {
    return this.requisitar("GET", "/eventos");
  },
  buscarEvento(id) {
    return this.requisitar("GET", `/eventos/${id}`);
  },
  cadastrarEvento(dados) {
    return this.requisitar("POST", "/eventos", dados);
  },
  atualizarEvento(id, dados) {
    return this.requisitar("PUT", `/eventos/${id}`, dados);
  },
  excluirEvento(id) {
    return this.requisitar("DELETE", `/eventos/${id}`);
  },

  // ---------- Vínculo evento ↔ palestrante (tabela evento_palestrante) ----------
  vincularPalestrante(idEvento, idPalestrante) {
    return this.requisitar("POST", `/eventos/${idEvento}/palestrantes/${idPalestrante}`);
  },
  desvincularPalestrante(idEvento, idPalestrante) {
    return this.requisitar("DELETE", `/eventos/${idEvento}/palestrantes/${idPalestrante}`);
  },
};
