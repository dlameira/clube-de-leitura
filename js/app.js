/* ------------------------------------------------------------------
   lendo em companhia — navegação, comentários e feed sem spoiler
------------------------------------------------------------------- */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const STORE = 'clubecia:comentarios';
  const MAX_CAP = CONFIG.livro.capitulos;

  const semMovimento = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- comentários salvos (localStorage) ---------- */
  const meus = {
    todos() {
      try { return JSON.parse(localStorage.getItem(STORE)) || []; }
      catch { return []; }
    },
    salvar(c) {
      const lista = meus.todos();
      lista.push(c);
      localStorage.setItem(STORE, JSON.stringify(lista));
    },
    doCapitulo(cap) {
      return meus.todos().filter((c) => c.cap === cap);
    }
  };

  const clampCap = (n) => Math.min(MAX_CAP, Math.max(1, parseInt(n, 10) || 1));

  // hash estável do id — mesma pessoa, mesmo papel, mesma inclinação
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  /** Todos os comentários de um capítulo (fakes + meus), mais novos em cima. */
  function comentariosDoCapitulo(cap) {
    const fakes = Seed.comentariosDoCapitulo(cap).map((c) => ({
      ...c,
      ts: Date.now() - c.dias * 86400000
    }));
    return [...fakes, ...meus.doCapitulo(cap)].sort((a, b) => b.ts - a.ts);
  }

  /* ---------- navegação ---------- */
  function irPara(view) {
    document.querySelectorAll('.view').forEach((v) => {
      v.classList.toggle('is-active', v.dataset.view === view);
    });
    window.scrollTo({ top: 0 });
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* ---------- feed ---------- */
  function renderFeed(capAte, animar = false) {
    const feed = $('#feed');

    // FLIP: guarda onde cada balão estava antes de tudo se rearranjar
    const antes = new Map();
    if (animar && !semMovimento()) {
      feed.querySelectorAll('.item').forEach((el) => {
        antes.set(el.dataset.id, el.getBoundingClientRect());
      });
    }

    const frag = document.createDocumentFragment();
    let total = 0;

    // regressivo: do capítulo escolhido até o primeiro
    for (let cap = capAte; cap >= 1; cap--) {
      const lista = comentariosDoCapitulo(cap);
      if (!lista.length) continue;
      total += lista.length;

      const bloco = document.createElement('section');
      bloco.className = 'bloco';

      const tag = document.createElement('span');
      tag.className = 'bloco__tag';
      tag.textContent = `cap ${cap}`;

      const colunas = document.createElement('div');
      colunas.className = 'colunas';
      lista.forEach((c) => colunas.appendChild(balao(c)));

      bloco.append(tag, colunas);
      frag.appendChild(bloco);
    }

    feed.replaceChildren(frag);
    $('#feedEnd').textContent = total
      ? `${total} comentário${total === 1 ? '' : 's'} de quem leu até o cap ${capAte}`
      : 'ninguém comentou por aqui ainda';

    if (animar && !semMovimento()) assentar(feed, antes);
  }

  function balao(c) {
    const item = document.createElement('div');
    item.className = 'item' + (c.meu ? ' item--meu' : '');
    item.dataset.id = c.id;

    // inclinação de recorte colado: sempre a mesma pra cada comentário.
    // Passou de ~1.5° o texto começa a borrar na rotação — não vale a pena.
    const h = hash(c.id);
    const rot = (((h % 90) / 90) * 2.8 - 1.4).toFixed(2);
    item.dataset.rot = rot;
    item.style.transform = `rotate(${rot}deg)`;

    // grupo encolhe até o texto: comentário curto vira balão curto
    const grupo = document.createElement('div');
    grupo.className = 'grupo';

    const box = document.createElement('div');
    box.className = 'balao';

    c.texto.split(/\n{2,}/).forEach((par) => {
      const p = document.createElement('p');
      p.textContent = par;
      box.appendChild(p);
    });

    const assin = document.createElement('p');
    assin.className = 'assin' + (c.meu ? ' eu' : '');
    const l1 = document.createElement('span');
    l1.textContent = `${c.nome} /`;
    const l2 = document.createElement('span');
    l2.textContent = c.cidade;
    assin.append(l1, l2);

    grupo.append(box, assin);
    item.appendChild(grupo);
    return item;
  }

  /**
   * Faz os balões se acomodarem no lugar novo em vez de saltarem de corte:
   * quem já existia desliza da posição antiga com um quique no fim,
   * quem chegou agora cai de cima em cascata.
   */
  function assentar(feed, antes) {
    const itens = [...feed.querySelectorAll('.item')];
    const acoes = [];
    let novos = 0;

    itens.forEach((el) => {
      const r = el.getBoundingClientRect();
      // fora da tela não precisa animar — economiza o engasgo em capítulo cheio
      if (r.bottom < -260 || r.top > window.innerHeight + 260) return;

      const rot = el.dataset.rot;
      const repouso = `rotate(${rot}deg)`;
      const velho = antes.get(el.dataset.id);

      // Só desliza quem se moveu pouco. Quem vinha de longe (ou de fora da
      // tela) atravessaria a página inteira voando — esse aparece de novo,
      // caindo em cascata, que fica bem mais gostoso de ver.
      const perto = velho &&
        Math.abs(velho.top - r.top) < window.innerHeight * .75 &&
        velho.bottom > -120 && velho.top < window.innerHeight + 120;

      if (perto) {
        const dx = velho.left - r.left;
        const dy = velho.top - r.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px) ${repouso}`;
        acoes.push({ el, trans: 'transform .7s var(--mola)', final: repouso, op: null });
      } else {
        const atraso = Math.min(novos++ * 24, 360);
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = `translateY(-22px) scale(.82) rotate(${rot * 3}deg)`;
        acoes.push({
          el,
          trans: `transform .62s var(--mola) ${atraso}ms, opacity .34s ease ${atraso}ms`,
          final: repouso,
          op: '1'
        });
      }
    });

    if (!acoes.length) return;
    void feed.offsetWidth;              // um reflow só, pro navegador registrar o ponto de partida

    acoes.forEach((a) => {
      a.el.style.willChange = 'transform';
      a.el.style.transition = a.trans;
      a.el.style.transform = a.final;
      if (a.op) a.el.style.opacity = a.op;
    });

    // solta a camada depois que tudo assentou: com will-change fixo o texto
    // fica rasterizado antes da rotação e sai borrado.
    clearTimeout(assentar._limpa);
    assentar._limpa = setTimeout(() => {
      acoes.forEach((a) => { a.el.style.willChange = ''; a.el.style.transition = ''; });
    }, 1200);
  }

  /**
   * Física no hover: o balão cede pro lado do cursor, como se estivesse
   * pendurado pelo rabinho, e volta quicando quando o mouse sai.
   */
  function ligarFisica(feed) {
    let alvo = null;
    let pendente = false;
    let ultimo = null;

    feed.addEventListener('mousemove', (e) => {
      if (semMovimento()) return;
      const box = e.target.closest('.balao');
      if (box !== alvo) {
        if (alvo) soltar(alvo);
        alvo = box;
      }
      if (!alvo) return;
      ultimo = e;
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => {
        pendente = false;
        if (!alvo || !ultimo) return;
        const r = alvo.getBoundingClientRect();
        const px = (ultimo.clientX - r.left) / r.width - .5;    // -0.5 .. 0.5
        const py = (ultimo.clientY - r.top) / r.height - .5;
        alvo.style.transition = 'transform .16s ease-out, box-shadow .3s ease';
        alvo.style.transform =
          `translate(${(px * 7).toFixed(1)}px, ${(py * 4 - 3).toFixed(1)}px) rotate(${(px * 2.4).toFixed(2)}deg)`;
      });
    });

    feed.addEventListener('mouseleave', () => { if (alvo) { soltar(alvo); alvo = null; } });

    function soltar(el) {
      el.style.transition = 'transform .8s var(--mola), box-shadow .3s ease';
      el.style.transform = '';
      setTimeout(() => { if (el !== alvo) el.style.transition = ''; }, 900);
    }
  }

  /* ---------- slider ---------- */
  function ligarSlider(input, label, aoMudar) {
    input.max = MAX_CAP;
    let ultimo = null;
    const sync = () => {
      const v = clampCap(input.value);
      label.textContent = `cap ${v}`;
      if (v !== ultimo) {
        ultimo = v;
        if (aoMudar) aoMudar(v);
      }
    };
    input.addEventListener('input', sync);
    sync();
  }

  /* ---------- boot ---------- */
  function montarTitulo() {
    const h1 = $('#clubName');
    const nome = CONFIG.clube;
    const alvo = CONFIG.clubeDestaque;
    h1.textContent = '';

    if (alvo && nome.includes(alvo)) {
      const [antes, depois] = nome.split(alvo);
      const span = document.createElement('span');
      span.className = 'serif';
      span.textContent = alvo;
      h1.append(document.createTextNode(antes), span, document.createTextNode(depois));
    } else {
      h1.textContent = nome;
    }
  }

  function init() {
    montarTitulo();
    $('#subtitulo').textContent = `${CONFIG.livro.titulo}, de ${CONFIG.livro.autor}`;
    $('#coverTitle').textContent = CONFIG.livro.titulo;
    $('#coverAuthor').textContent = CONFIG.livro.autor;
    document.title = CONFIG.clube;

    // capa real, se existir; senão fica a desenhada
    const img = $('#cover');
    img.alt = `capa de ${CONFIG.livro.titulo}`;
    img.addEventListener('load', () => {
      img.hidden = false;
      $('#coverFallback').hidden = true;
    });
    if (CONFIG.livro.capa) img.src = CONFIG.livro.capa;

    const writeCap = $('#writeCap');
    const readCap = $('#readCap');

    // arrastar o slider dispara muito evento — um render por frame dá conta
    let pendente = null;
    const pedirRender = (v) => {
      if (pendente) cancelAnimationFrame(pendente);
      pendente = requestAnimationFrame(() => {
        pendente = null;
        renderFeed(v, true);
      });
    };

    ligarSlider(writeCap, $('#writeCapLabel'));
    ligarSlider(readCap, $('#readCapLabel'), (v) => {
      if (document.querySelector('[data-view="read"]').classList.contains('is-active')) {
        pedirRender(v);
      }
    });

    // navegação
    document.querySelectorAll('[data-go]').forEach((b) => {
      b.addEventListener('click', () => {
        const alvo = b.dataset.go;
        if (alvo === 'read') renderFeed(clampCap(readCap.value), true);
        irPara(alvo);
      });
    });

    // contador de caracteres
    const ta = $('#writeText');
    ta.maxLength = CONFIG.maxCaracteres;
    ta.addEventListener('input', () => {
      $('#counter').textContent = `${ta.value.length}/${CONFIG.maxCaracteres}`;
      $('#counter').classList.toggle('is-full', ta.value.length >= CONFIG.maxCaracteres - 20);
    });
    $('#counter').textContent = `0/${CONFIG.maxCaracteres}`;

    ligarFisica($('#feed'));

    // enviar
    $('#submitBtn').addEventListener('click', () => {
      const texto = ta.value.trim();
      if (!texto) { toast('escreve alguma coisinha primeiro'); ta.focus(); return; }

      const cap = clampCap(writeCap.value);
      meus.salvar({
        id: `meu-${Date.now()}`,
        cap,
        nome: ($('#writeName').value.trim() || 'anônimo').toLowerCase(),
        cidade: ($('#writeCity').value.trim() || 'brasil').toLowerCase(),
        texto,
        ts: Date.now(),
        meu: true
      });

      ta.value = '';
      $('#counter').textContent = `0/${CONFIG.maxCaracteres}`;
      $('#counter').classList.remove('is-full');
      toast('comentário publicado');

      readCap.value = cap;
      $('#readCapLabel').textContent = `cap ${cap}`;
      renderFeed(cap, true);
      irPara('read');
    });
  }

  init();
})();
