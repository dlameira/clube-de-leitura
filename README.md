# lendo em companhia

Site de clube de leitura, sem spoiler: você diz até que capítulo leu e só vê
comentários de quem parou até ali.

## Como rodar

Abrir o `index.html` direto no navegador funciona, mas o ideal é servir a pasta:

```bash
python -m http.server 8123
```

Depois acesse http://localhost:8123

## Como mexer

- **Livro, autor, nº de capítulos e capa:** `js/config.js`
- **Capa:** jogue a imagem em `assets/capa.jpg` — se não existir, aparece a capinha vermelha desenhada
- **Comentários fake:** `js/seed.js` (frases, nomes, cidades e quantidade por capítulo)
- **Cores e fontes:** `css/style.css`, tudo no `:root` lá em cima
- **Fonte serif:** Instrument Serif por padrão. Se tiver a PP Editorial New,
  ponha os `.woff2` em `assets/fonts/` que ela assume — veja o LEIA-ME de lá

## Como funciona

- Os 30 comentários por capítulo são **gerados na hora**, de forma determinística:
  o mesmo capítulo devolve sempre os mesmos comentários, sem repetir frase dentro
  do capítulo e sem guardar nada. É só preenchimento pra visualizar o site cheio.
- Os comentários que **você** escreve ficam no `localStorage` do navegador,
  entram no meio dos outros e aparecem em amarelo.
- O feed é regressivo: o capítulo escolhido no slider vem primeiro, depois o
  anterior, e assim por diante até o cap 1. Dentro de cada capítulo, os mais
  recentes primeiro.
- Mexer no slider da tela de leitura re-renderiza na hora — não precisa voltar.
- O rearranjo usa FLIP: quem se moveu pouco desliza da posição antiga com um
  quique no fim; quem vinha de fora da tela aparece caindo em cascata. Quem
  tem "reduzir movimento" ligado no sistema vê tudo sem animação nenhuma.
- No hover o balão cede pro lado do cursor (como se pendurado pelo rabinho) e
  volta quicando quando o mouse sai.
- Cada balão encolhe até o texto — comentário de uma linha não vira balão de
  coluna inteira. A inclinação fica em ±1,4°: acima disso o texto borra na
  rotação, e `will-change` só entra durante a animação pelo mesmo motivo.

## E se virar site de verdade?

Hoje é tudo no navegador — cada pessoa vê só os próprios comentários reais.
Pra virar clube com gente de verdade é preciso um backend (ou algo tipo Supabase /
Firebase) guardando os comentários. A estrutura já está pronta:
`{ cap, nome, cidade, texto, ts }`.
