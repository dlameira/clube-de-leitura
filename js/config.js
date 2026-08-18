/* ------------------------------------------------------------------
   Config do clube — mexa só aqui
------------------------------------------------------------------- */
const CONFIG = {
  // Aparece grandão no topo, em duas linhas se couber
  clube: 'lendo em companhia',

  // Essa palavra do título sai em serif itálico (deixa o topo menos duro).
  // Deixe '' pra desligar.
  clubeDestaque: 'companhia',

  livro: {
    titulo: 'Corpos Vis',
    autor: 'Evelyn Waugh',
    capitulos: 12,

    // Coloque a capa em assets/capa.jpg que ela entra sozinha.
    // Se o arquivo não existir, aparece uma capinha desenhada.
    capa: 'assets/capa.jpg'
  },

  // Quantos comentários fake por capítulo (só pra visualizar o site cheio)
  comentariosFakePorCapitulo: 30,

  // Limite do comentário
  maxCaracteres: 400
};
