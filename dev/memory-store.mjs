// MemoryStore — mesma interface do store do Netlify Blobs, mas só na memória.
// Usado pelo servidor local (dev/server.mjs) e pelos testes.
// Guarda JSON em texto, como o Blobs faz: quem lê recebe sempre uma cópia nova.
// Cada gravação gera um etag novo, para as escritas condicionais (onlyIfMatch)
// funcionarem como no Blobs. Também guarda os metadados de cada chave.

export class MemoryStore {
  #dados = new Map(); // chave -> {texto, etag, meta}
  #seq = 0;

  async get(key) {
    const e = this.#dados.get(key);
    return e === undefined ? null : JSON.parse(e.texto);
  }

  /** {data, etag} ou null. */
  async getWithEtag(key) {
    const e = this.#dados.get(key);
    return e === undefined ? null : { data: JSON.parse(e.texto), etag: e.etag };
  }

  /** Só os metadados (sem o conteúdo): {metadata, etag} ou null. */
  async getMeta(key) {
    const e = this.#dados.get(key);
    return e === undefined ? null : { metadata: e.meta ? JSON.parse(e.meta) : {}, etag: e.etag };
  }

  async set(key, obj, { onlyIfNew = false, onlyIfMatch, metadata } = {}) {
    const atual = this.#dados.get(key);
    if (onlyIfNew && atual) return { modified: false };
    if (onlyIfMatch && (!atual || atual.etag !== onlyIfMatch)) return { modified: false };
    const etag = `"m${++this.#seq}"`;
    this.#dados.set(key, { texto: JSON.stringify(obj), etag, meta: metadata ? JSON.stringify(metadata) : null });
    return { modified: true, etag };
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
