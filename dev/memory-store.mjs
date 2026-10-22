// MemoryStore — mesma interface do store do Netlify Blobs, mas só na memória.
// Usado pelo servidor local (dev/server.mjs) e pelos testes.
// Guarda JSON em texto, como o Blobs faz: quem lê recebe sempre uma cópia nova.

export class MemoryStore {
  #dados = new Map();

  async get(key) {
    const texto = this.#dados.get(key);
    return texto === undefined ? null : JSON.parse(texto);
  }

  async set(key, obj, { onlyIfNew = false } = {}) {
    if (onlyIfNew && this.#dados.has(key)) return { modified: false };
    this.#dados.set(key, JSON.stringify(obj));
    return { modified: true };
  }

  async del(key) {
    this.#dados.delete(key);
  }

  async list(prefix = "") {
    return [...this.#dados.keys()].filter((k) => k.startsWith(prefix)).sort();
  }

  /** Só para testes/depuração: todas as chaves guardadas. */
  keys() {
    return [...this.#dados.keys()].sort();
  }
}
