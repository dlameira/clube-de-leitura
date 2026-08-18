/* ------------------------------------------------------------------
   Comentários fake — determinísticos.
   O mesmo capítulo sempre devolve os mesmos comentários (nada é salvo:
   é tudo gerado na hora a partir de uma semente), então dá pra navegar
   com o livro inteiro "cheio" sem guardar milhares de registros.
------------------------------------------------------------------- */
const Seed = (() => {

  // PRNG pequeno e estável (mulberry32)
  function rngFrom(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  // Fisher-Yates — pra consumir cada frase uma vez por capítulo,
  // em vez de sortear e acabar repetindo o mesmo comentário na tela.
  function embaralha(rng, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const NOMES = [
    'dani', 'bia', 'léo', 'marina', 'rafa', 'dandara', 'tiago', 'nina',
    'caio', 'ju', 'vitor', 'cecília', 'gabi', 'murilo', 'aline', 'pedro',
    'lari', 'bruno', 'camila', 'iago', 'sofia', 'renan', 'tarsila',
    'matheus', 'lívia', 'fê', 'otávio', 'manu', 'diego', 'clara', 'jorge',
    'isa', 'vini', 'helena', 'samuel', 'yasmin', 'kau', 'rebeca', 'théo',
    'milena', 'arthur', 'duda', 'elis', 'nando', 'pri', 'zé', 'antônia'
  ];

  const CIDADES = [
    'são paulo sp', 'rio de janeiro rj', 'belo horizonte mg', 'recife pe',
    'salvador ba', 'porto alegre rs', 'curitiba pr', 'fortaleza ce',
    'brasília df', 'belém pa', 'são luís ma', 'manaus am', 'goiânia go',
    'natal rn', 'campinas sp', 'niterói rj', 'santo andré sp', 'olinda pe',
    'florianópolis sc', 'juiz de fora mg', 'maceió al', 'vitória es',
    'sorocaba sp', 'diadema sp', 'contagem mg', 'joão pessoa pb'
  ];

  /* --- curtinhos: dão o respiro visual entre os balões grandes --- */
  const CURTOS = [
    'chorei.',
    'que trecho, meu deus.',
    'reli três vezes seguidas.',
    'esse capítulo me quebrou 🥲',
    'anotei tudo no caderninho.',
    'ai, meu coração.',
    'melhor parte até agora, disparado.',
    'precisei parar e respirar aqui.',
    'que soco no estômago...',
    'voltei duas páginas só pra sentir de novo.',
    'sublinhei a página inteira, sem exagero.',
    'não tô bem depois disso.',
    'gente. GENTE.',
    'li chorando no busão kkkk',
    'esse pedaço é sobre esperança e ninguém me tira isso.',
    'que delícia de capítulo.',
    'parei aqui hoje. amanhã eu continuo, hoje não dá.',
    'mandei print pra três pessoas.',
    'tô sorrindo sozinha na sala.',
    'alguém me abraça?'
  ];

  /* --- o corpo: combinadas de duas em duas viram os comentários longos --- */
  const FRASES = [
    'afe, que trecho lindo esse quando ela encontra o pai, quando ela fala a frase que ele se lembrava, comecei a chorar.',
    'a forma como ele constrói a cena aqui é de doer, parece que a gente tá junto na sala esperando alguém falar alguma coisa.',
    'demorei uma semana pra passar desse capítulo, precisei de pausa mesmo, e olha que eu tava lendo rápido até então.',
    'reparem no jeito que ele repete as palavras nesse trecho, não é descuido não, é batida, dá pra bater o pé lendo em voz alta.',
    'esse capítulo mudou minha leitura do livro inteiro, tô voltando no começo com outros olhos agora.',
    'que capacidade de falar de dor sem transformar tudo em tragédia, ele solta uma verdade sem levantar a voz e é justamente por isso que dói.',
    'mandei foto dessa página pra três pessoas diferentes e uma delas comprou o livro no mesmo dia.',
    'a descrição do bairro aqui é tão viva que eu senti cheiro de rua molhada, cresci num lugar parecido e bateu forte.',
    'eu não esperava rir nessa altura do livro e ri alto, sozinha, no meio do busão.',
    'a construção dos silêncios nesse capítulo é tão importante quanto o que tá escrito, o que ele não conta diz mais.',
    'confesso que me perdi um pouco no meio, achei que tinha pulado alguma coisa, mas depois encaixou tudo e fez sentido.',
    'engraçado como uma memória pequena consegue carregar um mundo inteiro, é só uma cena de cozinha e é sobre tudo.',
    'li de madrugada e não consegui dormir depois, fiquei rodando esse capítulo na cabeça até o sol nascer.',
    'esse trecho conversa demais com o que ele plantou lá no primeiro capítulo, tudo fecha, nada ali é por acaso.',
    'que jeito bonito de falar de origem sem romantizar nada, não tem nostalgia boba aqui, tem memória de verdade.',
    'tô lendo devagar de propósito porque não quero que acabe, alguém mais fazendo isso?',
    'me identifiquei tanto com essa parte que fiquei meio exposta, parece que alguém leu meu diário e escreveu melhor.',
    'esse pedaço merecia ser lido em voz alta em toda sala de aula do país, sem exagero nenhum.',
    'a virada aqui foi tão bem armada que eu bati palma sozinha em casa, não vi vindo de jeito nenhum.',
    'achei esse capítulo mais duro do que eu tava preparada pra ler, necessário, mas duro.',
    'a partir daqui o livro deixou de ser leitura e virou conversa, é como se ele tivesse sentado do meu lado.',
    'esse trecho me deu vontade de escrever também, e faz uns dois anos que eu não escrevia nada.',
    'a delicadeza com que ele fala da família aqui é uma coisa linda, sem julgamento nenhum, só olhar.',
    'juro que ouvi a batida enquanto lia, tem trecho que é letra, não tem jeito.',
    'peguei o livro achando que sabia o que ia encontrar e tô sendo desmentida capítulo por capítulo.',
    'sublinhei, dobrei a ponta da folha e ainda voltei nela hoje de manhã antes do trabalho.',
    'que aula de história embrulhada em memória afetiva, aprendi mais aqui do que em ano de escola.',
    'esse capítulo é sobre perder e sobre continuar, as duas coisas ao mesmo tempo, sem escolher uma.',
    'tem uma frase no meio desse trecho que eu vou levar pro resto da vida, não vou nem citar pra não estragar.',
    'reli hoje e entendi coisa que tinha passado batido, esse livro melhora na segunda leitura.',
    'a cena do almoço é tão banal e tão gigante ao mesmo tempo, fiquei pensando nas minhas.',
    'quem escreveu isso claramente já esperou alguém que não voltou, dá pra sentir na escolha das palavras.',
    'engraçado que eu comecei esse capítulo com pressa e terminei com vontade de ficar mais um pouco.',
    'a mudança de ritmo aqui é proposital, ele acelera quando a gente quer que ele pare, e isso me deixou ansiosa do jeito certo.',
    'tem uma generosidade nesse texto que é rara, ele não quer provar nada pra ninguém, só quer contar direito.',
    'chorei no meio do capítulo e depois ri na última linha, quem consegue fazer isso?',
    'esse trecho me lembrou da minha vó e de como a gente gostava de falar sobre pássaros, saudade dela.',
    'lendo isso entendi por que esse livro é tão comentado, não é hype não, é bom mesmo.',
    'a repetição da mesma imagem em três capítulos diferentes finalmente fez sentido aqui, muito bem costurado.',
    'sabe quando um livro te pega no susto? é isso, eu tava tranquila e do nada não tava mais.',
    'que capítulo generoso, ele podia ter escondido e escolheu contar tudo.',
    'a escrita fica mais crua quando o assunto aperta e isso não é acaso, reparem no tamanho das frases aqui.',
    'terminei o capítulo e fiquei um tempão com o livro fechado no colo, sem conseguir ir pro próximo.',
    'esse é o tipo de trecho que eu queria ter lido aos dezessete, teria me poupado uns anos.'
  ];

  /* --- fechos, pra quebrar o ritmo no fim --- */
  const EXTRAS = [
    'alguém mais sentiu isso ou fui só eu?',
    'quero muito discutir isso no encontro.',
    'vou reler amanhã com calma.',
    'quem tá lendo junto, corre que daqui pra frente melhora ainda mais.',
    'desculpa o textão, mas precisava falar.',
    'e olha que eu nem sou de chorar com livro.',
    'enfim, tô destruída, obrigada.',
    'me digam que não fui só eu 🥹',
    'tô contando os dias pro próximo encontro.',
    'se alguém quiser trocar ideia, tô aqui.'
  ];

  /** Comentários fake do capítulo `cap`. Sempre os mesmos, para o mesmo cap. */
  function comentariosDoCapitulo(cap, quantos) {
    const total = quantos ?? CONFIG.comentariosFakePorCapitulo;
    const rng = rngFrom(cap * 7919 + 13);
    const out = [];

    const frases = embaralha(rng, FRASES);
    const curtos = embaralha(rng, CURTOS);
    const nomes = embaralha(rng, NOMES);
    const cidades = embaralha(rng, CIDADES);
    let iF = 0, iC = 0;

    const proxima = () => frases[iF++ % frases.length];

    for (let i = 0; i < total; i++) {
      let texto;
      const dado = rng();

      if (dado < 0.20) {
        // curtinho
        texto = curtos[iC++ % curtos.length];
      } else if (dado < 0.52) {
        // médio: uma frase
        texto = proxima();
      } else if (dado < 0.80) {
        // longo: duas frases emendadas
        texto = `${proxima()} ${proxima()}`;
      } else {
        // textão: dois parágrafos, às vezes com fecho
        const p1 = rng() < 0.5 ? `${proxima()} ${proxima()}` : proxima();
        const p2 = rng() < 0.55 ? proxima() : pick(rng, EXTRAS);
        texto = `${p1}\n\n${p2}`;
      }

      if (texto.length > CONFIG.maxCaracteres) {
        texto = texto.slice(0, CONFIG.maxCaracteres - 3).replace(/[\s,;]+$/, '') + '...';
      }

      // Quem leu mais longe comentou mais recentemente — assim a ordem por
      // capítulo (regressiva) bate com a sensação de "os mais novos em cima".
      const progresso = cap / Math.max(1, CONFIG.livro.capitulos);
      const diasAtras = Math.round((1 - progresso) * 100 + rng() * 14);

      out.push({
        id: `fake-${cap}-${i}`,
        cap,
        nome: nomes[i % nomes.length],
        cidade: cidades[i % cidades.length],
        texto,
        dias: diasAtras,
        meu: false
      });
    }
    return out;
  }

  return { comentariosDoCapitulo };
})();
