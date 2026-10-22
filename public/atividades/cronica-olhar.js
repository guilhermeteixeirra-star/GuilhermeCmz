/* Missão Redação · atividade da 2ª Série, Texto 2 (crônica lírica).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';

/* A frase obrigatória do começo (do professor). Não mude nem uma letra. */
const FRASE = 'Você sai todo dia, por exemplo, pela mesma porta. Se alguém lhe perguntar o que é que você vê no seu caminho, você não sabe. De tanto ver, você não vê...';

/* ---------- As cenas do dia a dia ----------
   Cada cena tem as opções de todos os blocos que dependem dela.
   Regras usadas na escrita (para toda combinação dar um texto bom):
   - 1ª pessoa sem adjetivo que mude com o gênero de quem escreve (nada de “cansado/cansada”);
   - o 2º parágrafo (sentidos) nunca cita o detalhe que o aluno “descobre” no 3º;
   - cada bloco tem a sua função, para nenhuma ideia se repetir em dois lugares;
   - depois de uma palavra de ligação (cons), a frase começa com letra minúscula. */
const CENAS = {
  ponto: {
    card: {id:'ponto', tag:'Manhã', nome:'O caminho até o ponto do ônibus', desc:'Bem cedo, a estrada de casa até o ponto do ônibus escolar.'},
    quando: 'Mas, certa manhã,',
    p1_eu: [
      'comigo também é assim: todo dia, bem cedo, eu sigo pela mesma estrada de chão até o ponto do ônibus escolar',
      'isso também acontece comigo no caminho até o ponto do ônibus escolar, que eu faço todas as manhãs',
      'eu também sou assim, porque faço o mesmo caminho até o ponto do ônibus há muitos anos'
    ],
    p1_auto: [
      'meus pés andam sozinhos, e a minha cabeça fica longe dali',
      'vou de cabeça baixa, com os olhos ainda cheios de sono',
      'vou com pressa, pensando só em não perder o horário'
    ],
    p2_vejo: [
      'vejo sempre a mesma cerca de arame, o mesmo pasto e as mesmas casas de madeira',
      'passo sempre pela porteira velha, pela fila de eucaliptos e pela plantação do vizinho',
      'lá estão, como sempre, os postes de luz, o mato alto e a igrejinha da comunidade'
    ],
    p2_ouco: [
      'ouço o canto dos galos e o latido de algum cachorro',
      'escuto as pedrinhas estalando debaixo dos meus pés',
      'ouço o ronco de um trator que já começou a trabalhar'
    ],
    p2_sinto: [
      'sinto o cheiro de capim e o vento frio no rosto',
      'sinto o cheiro da fumaça que sai das chaminés dos fogões a lenha',
      'sinto o ar gelado entrando pela blusa'
    ],
    p3_virada: [
      'o ônibus atrasou, e eu fiquei esperando no ponto',
      'eu saí de casa mais cedo e resolvi andar devagar',
      'eu parei no meio da estrada para amarrar o cadarço do tênis'
    ],
    p3_notei: [
      {k:'teia', t:'eu reparei, pela primeira vez, numa teia de aranha presa na cerca, toda molhada de orvalho'},
      {k:'sol', t:'eu vi o sol nascer atrás do morro e deixar o céu cor-de-rosa'},
      {k:'flor', t:'eu percebi uma florzinha amarela que nascia no barranco, sozinha'}
    ],
    p3_senti: {
      teia: [
        {t:'as gotinhas brilhavam como um colar de vidro, e eu senti uma alegria tranquila', tag:'Comparação'},
        {t:'cada fio era uma joia que a noite tinha deixado para mim, e eu sorri', tag:'Metáfora'},
        {t:'senti uma paz enorme, como se o tempo tivesse parado para eu olhar', tag:'Comparação'}
      ],
      sol: [
        {t:'tudo parecia um quadro pintado só para mim, e meu coração ficou quentinho', tag:'Comparação'},
        {t:'a luz foi um abraço quentinho, e eu me senti em paz', tag:'Metáfora'},
        {t:'senti o peito se encher de luz, como se o sol tivesse nascido dentro de mim', tag:'Comparação'}
      ],
      flor: [
        {t:'ela parecia uma pequena estrela caída no chão, e eu senti um carinho enorme', tag:'Comparação'},
        {t:'a flor era um pedacinho de sol caído na terra, e eu fiquei feliz', tag:'Metáfora'},
        {t:'senti que ela era forte como uma guerreira, e eu quis ser assim também', tag:'Comparação'}
      ]
    },
    p4_agora: [
      'quando vou para o ponto, observo tudo com calma e com curiosidade',
      'eu caminho até o ponto à procura de uma surpresa',
      'a cada manhã, eu procuro um detalhe que ainda não vi'
    ],
    fecho: 'a estrada continua a mesma, mas o meu olhar mudou'
  },

  onibus: {
    card: {id:'onibus', tag:'Estrada', nome:'A viagem no ônibus escolar', desc:'O ônibus pela estrada de chão, da sua casa até a escola.'},
    quando: 'Mas, certa manhã,',
    p1_eu: [
      'comigo também é assim: todo dia, eu viajo no ônibus escolar pela mesma estrada de chão',
      'isso também acontece comigo na viagem de ônibus até a escola, que eu faço todas as manhãs',
      'eu também sou assim, porque vou de ônibus para a escola, pela mesma estrada, há muitos anos'
    ],
    p1_auto: [
      'sento no meu banco de costume e fico mexendo no celular',
      'encosto a cabeça no vidro e fico esperando a hora de chegar',
      'converso com os colegas, e o tempo passa sem eu perceber'
    ],
    p2_vejo: [
      'lá fora, estão sempre as mesmas plantações de soja e de milho',
      'vejo sempre as mesmas cercas, as mesmas porteiras e os mesmos postes',
      'vejo sempre os mesmos sítios, com suas casinhas e seus galpões'
    ],
    p2_ouco: [
      'ouço o motor roncando e as pedras batendo lá embaixo',
      'escuto o barulho das janelas tremendo a cada buraco',
      'ouço o motorista buzinar para chamar quem ainda não chegou ao ponto'
    ],
    p2_sinto: [
      'sinto na boca o gosto da poeira vermelha',
      'sinto o corpo balançar nas curvas',
      'sinto o cheiro de mato molhado logo cedo'
    ],
    p3_virada: [
      'o ônibus quebrou na estrada, e todos tiveram que descer',
      'eu esqueci o celular em casa e não tive nada para fazer na viagem',
      'o meu banco de sempre estava ocupado, e eu me sentei do outro lado'
    ],
    p3_notei: [
      {k:'ipe', t:'eu reparei, pela primeira vez, num ipê amarelo todo florido, sozinho no pasto'},
      {k:'neblina', t:'eu vi a neblina deitada em cima do rio, lá no fundo do vale'},
      {k:'aceno', t:'eu percebi que um senhor acenava para nós, da porteira do sítio'}
    ],
    p3_senti: {
      ipe: [
        {t:'ele parecia um sol plantado no chão, e eu fiquei feliz', tag:'Comparação'},
        {t:'a árvore era uma festa no meio do verde, e meu coração dançou junto', tag:'Metáfora'},
        {t:'senti uma alegria igual à de quem encontra um tesouro', tag:'Comparação'}
      ],
      neblina: [
        {t:'ela parecia um lençol branco cobrindo a água, e eu senti uma paz enorme', tag:'Comparação'},
        {t:'tudo ali era um sonho acordando devagar, e eu nem quis piscar', tag:'Metáfora'},
        {t:'senti meu coração calmo como a água daquele rio', tag:'Comparação'}
      ],
      aceno: [
        {t:'esse gesto foi como o bom-dia de um velho amigo, e eu me senti feliz', tag:'Comparação'},
        {t:'a mão dele no ar era uma bandeira de amizade, e eu acenei de volta, sorrindo', tag:'Metáfora'},
        {t:'senti uma alegria simples, como a de quem recebe um abraço', tag:'Comparação'}
      ]
    },
    p4_agora: [
      'eu deixo o celular na mochila e olho pela janela',
      'eu escolho um banco perto da janela e vou descobrindo a paisagem',
      'a cada viagem, eu descubro um detalhe diferente na paisagem'
    ],
    fecho: 'a estrada continua a mesma, mas o meu olhar mudou'
  },

  cozinha: {
    card: {id:'cozinha', tag:'Casa', nome:'O café da manhã em casa', desc:'A cozinha, a mesa e a família, antes de sair para a escola.'},
    quando: 'Mas, certa manhã,',
    p1_eu: [
      'comigo também é assim: todo dia, antes da escola, eu tomo café na mesma cozinha',
      'isso também acontece comigo na cozinha de casa, onde tomo café todas as manhãs',
      'eu também sou assim, porque tomo café na mesma cozinha desde que eu era criança'
    ],
    p1_auto: [
      'engulo tudo depressa, de olho no relógio, para não perder o ônibus',
      'pego um pedaço de pão, ainda com sono, e saio correndo',
      'fico olhando o celular o tempo todo'
    ],
    p2_vejo: [
      'vejo sempre a mesma mesa, a mesma toalha de flores e as mesmas canecas',
      'na prateleira, estão sempre as panelas, a chaleira e o pote de açúcar',
      'na parede, estão sempre o mesmo calendário e as mesmas fotos da família'
    ],
    p2_ouco: [
      'ouço a água fervendo e o rádio ligado bem baixinho',
      'escuto o barulho da colher batendo no copo',
      'ouço as galinhas lá fora e o cachorro pedindo comida'
    ],
    p2_sinto: [
      'sinto o cheiro bom de pão quentinho',
      'sinto o calor do fogão esquentando as minhas mãos',
      'sinto o gosto doce do leite quente'
    ],
    p3_virada: [
      'faltou energia, e tudo ficou em silêncio',
      'eu acordei mais cedo, e tudo ainda estava em silêncio',
      'o celular ficou sem bateria, e eu não tive com o que me distrair'
    ],
    p3_notei: [
      {k:'maos', t:'eu reparei, pela primeira vez, nas mãos de quem cozinha para mim, cheias de marcas do trabalho'},
      {k:'vapor', t:'eu vi a fumacinha do café subindo devagar e fazendo curvas'},
      {k:'raio', t:'eu percebi um raio de sol entrando pela janela e pousando em cima da mesa'}
    ],
    p3_senti: {
      maos: [
        {t:'elas pareciam raízes fortes que seguram a nossa casa, e eu senti um orgulho enorme', tag:'Comparação'},
        {t:'cada ruga era uma página da história da minha família, e eu senti vontade de agradecer', tag:'Metáfora'},
        {t:'senti um amor que aquecia o peito, como um cobertor em dia de frio', tag:'Comparação'}
      ],
      vapor: [
        {t:'ela parecia uma bailarina dançando, e eu sorri sem perceber', tag:'Comparação'},
        {t:'o vapor era um bilhete de bom-dia escrito no ar, e eu me senti em paz', tag:'Metáfora'},
        {t:'senti uma calma tão grande, como se o mundo tivesse diminuído o passo', tag:'Comparação'}
      ],
      raio: [
        {t:'a cozinha parecia um palco, e eu senti uma alegria tranquila', tag:'Comparação'},
        {t:'a luz era um convite para começar o dia com calma, e eu aceitei', tag:'Metáfora'},
        {t:'senti o coração aquecido, como se o sol estivesse tomando café com a gente', tag:'Comparação'}
      ]
    },
    p4_agora: [
      'eu me sento à mesa sem pressa e presto atenção em cada detalhe',
      'antes de sair, eu olho a cozinha com carinho, como quem se despede de um amigo',
      'eu guardo na memória cada pequeno momento da manhã'
    ],
    fecho: 'a casa continua a mesma, mas o meu olhar mudou'
  },

  recreio: {
    card: {id:'recreio', tag:'Escola', nome:'O recreio na escola', desc:'O pátio, a merenda, as turmas e o sinal tocando.'},
    quando: 'Mas, numa segunda-feira,',
    p1_eu: [
      'comigo também é assim: todo dia, na hora do recreio, eu atravesso o mesmo pátio da escola',
      'isso também acontece comigo no pátio da escola, onde passo o recreio todos os dias',
      'eu também sou assim, porque passo o recreio no mesmo pátio há muitos anos'
    ],
    p1_auto: [
      'saio correndo da sala, sem reparar em nada',
      'fico no meu canto de costume, com os colegas de sempre',
      'ando de um lado para o outro, com a cabeça na próxima aula'
    ],
    p2_vejo: [
      'vejo sempre o mesmo muro, a mesma quadra e as mesmas árvores',
      'lá estão, como sempre, os bancos de cimento, o bebedouro e a bandeira no mastro',
      'em volta, estão sempre as mesmas turmas, cada uma no seu lugar'
    ],
    p2_ouco: [
      'ouço gritos e risadas por todos os lados',
      'escuto o sinal, que toca cedo demais',
      'ouço o barulho dos pratos e das colheres da merenda'
    ],
    p2_sinto: [
      'sinto o cheiro de arroz e feijão que vem da cozinha',
      'sinto o sol quente na nuca',
      'sinto o vento balançando o meu cabelo'
    ],
    p3_virada: [
      'a bola furou, e o futebol acabou antes da hora',
      'eu não quis conversar e fui me sentar longe de todo mundo',
      'eu saí da sala antes de todo mundo'
    ],
    p3_notei: [
      {k:'ninho', t:'eu reparei, pela primeira vez, num ninho de joão-de-barro no alto do poste'},
      {k:'merendeira', t:'eu percebi que a merendeira sorria para cada aluno da fila'},
      {k:'sombras', t:'eu vi as sombras das folhas dançando no pátio'}
    ],
    p3_senti: {
      ninho: [
        {t:'a casinha de barro parecia um forno de pão, e eu senti uma alegria de criança', tag:'Comparação'},
        {t:'o passarinho era um pedreiro paciente, e eu senti uma grande admiração por ele', tag:'Metáfora'},
        {t:'senti uma paz tão grande, como se o barulho do recreio tivesse sumido', tag:'Comparação'}
      ],
      merendeira: [
        {t:'o sorriso dela parecia um tempero a mais na comida, e meu coração ficou quentinho', tag:'Comparação'},
        {t:'o sorriso dela era um abraço servido junto com a merenda, e eu senti vontade de agradecer', tag:'Metáfora'},
        {t:'senti uma gratidão enorme, como quem descobre um presente escondido', tag:'Comparação'}
      ],
      sombras: [
        {t:'elas pareciam peixinhos brincando na água, e eu senti vontade de rir', tag:'Comparação'},
        {t:'o chão virou um rio de luz, e eu fiquei em silêncio, só olhando', tag:'Metáfora'},
        {t:'senti uma calma igual à de um domingo à tarde', tag:'Comparação'}
      ]
    },
    p4_agora: [
      'no recreio, eu tiro um tempo para observar tudo ao meu redor',
      'eu caminho com calma e presto atenção nas pessoas',
      'a cada intervalo, eu descubro um detalhe diferente'
    ],
    fecho: 'a escola continua a mesma, mas o meu olhar mudou'
  },

  volta: {
    card: {id:'volta', tag:'Fim da tarde', nome:'A volta para casa', desc:'O fim da tarde, o caminho de casa e o céu mudando de cor.'},
    quando: 'Mas, certa tarde,',
    p1_eu: [
      'comigo também é assim: todo dia, no fim da tarde, eu faço o mesmo caminho de volta para casa',
      'isso também acontece comigo na volta da escola, que eu faço todas as tardes',
      'eu também sou assim, porque volto para casa pelo mesmo caminho há muitos anos'
    ],
    p1_auto: [
      'ando depressa, pensando no banho, no jantar e no sofá',
      'vou ouvindo música no fone, com os olhos no chão',
      'arrasto os pés, com a mochila pesada nas costas'
    ],
    p2_vejo: [
      'vejo sempre as mesmas cercas, o mesmo pasto e as mesmas vacas perto do curral',
      'lá estão, como sempre, o bananal, o paiol e o galinheiro do vizinho',
      'passo sempre pelo mesmo mata-burro, pela mesma ponte e pela mesma laranjeira'
    ],
    p2_ouco: [
      'ouço os cachorros latindo nos quintais',
      'escuto as maritacas fazendo festa nas árvores',
      'ouço o barulho de um trator lá na lavoura'
    ],
    p2_sinto: [
      'sinto o cheiro de capim cortado',
      'sinto o vento fresco que chega com o fim do dia',
      'sinto o cheiro da fumaça de algum fogão a lenha'
    ],
    p3_virada: [
      'meu colega faltou, e eu voltei sem companhia',
      'eu me sentei um pouco na beira da estrada para descansar',
      'eu tirei os fones de ouvido e resolvi andar devagar'
    ],
    p3_notei: [
      {k:'ceu', t:'eu reparei, pela primeira vez, no céu ficando laranja e roxo atrás dos morros'},
      {k:'lua', t:'eu vi a lua aparecendo, branquinha, quando o sol ainda nem tinha ido embora'},
      {k:'vagalume', t:'eu percebi os primeiros vaga-lumes acendendo no meio do pasto'}
    ],
    p3_senti: {
      ceu: [
        {t:'tudo parecia uma pintura feita só para mim, e eu senti uma alegria enorme', tag:'Comparação'},
        {t:'o pôr do sol era um tchau bonito do dia, e meu coração ficou em paz', tag:'Metáfora'},
        {t:'senti uma calma tão grande, como se o dia estivesse me dando boa-noite', tag:'Comparação'}
      ],
      lua: [
        {t:'ela parecia uma moeda esquecida no céu, e eu sorri', tag:'Comparação'},
        {t:'ela era uma lanterna acesa para me guiar até a minha casa, e eu senti que não estava só', tag:'Metáfora'},
        {t:'senti uma alegria calma, como a de quem encontra um velho amigo', tag:'Comparação'}
      ],
      vagalume: [
        {t:'eles pareciam estrelinhas que desceram do céu para brincar, e eu senti uma alegria de criança', tag:'Comparação'},
        {t:'o campo virou um céu pequeno, cheio de luzinhas, e eu nem quis ir embora', tag:'Metáfora'},
        {t:'senti meu coração acender junto com eles, como uma lanterna', tag:'Comparação'}
      ]
    },
    p4_agora: [
      'eu volto sem pressa, olhando para o céu',
      'eu deixo o fim do dia conversar comigo',
      'eu descubro alguma surpresa a cada tarde'
    ],
    fecho: 'a paisagem continua a mesma, mas o meu olhar mudou'
  }
};
const CENA_ORDEM = ['ponto','onibus','cozinha','recreio','volta'];
const cenaDe = H => { const c = H.escolha('cena'); return CENAS[(c && c.id) || 'ponto'] || CENAS.ponto; };

/* se o aluno escreveu o detalhe do jeito dele, o sentimento não pode citar um detalhe específico */
const SENTI_GERAL = [
  {t:'meu coração ficou leve como uma pena', tag:'Comparação'},
  {t:'o detalhe foi um presente escondido na minha rotina, e eu sorri', tag:'Metáfora'},
  {t:'senti uma alegria calma, como a de quem encontra um tesouro', tag:'Comparação'}
];
const APRENDI = [
  'eu sei que, de tanto ver, a gente deixa de enxergar',
  'eu entendo que a pressa e o costume deixam a vista cansada',
  'eu sei que as coisas bonitas nunca se esconderam de mim: era eu que não olhava para elas'
];
const FECHO_GERAL = [
  'afinal, eu não preciso de lugares novos: preciso só de olhos novos',
  'e você, já olhou de verdade para o seu caminho hoje?'
];

/* palavras de ligação: as certas (ok) e as pegadinhas, com a dica de cada uma */
const CON = {
  virada: q => [
    {t:'Por isso,', d:'“Por isso” mostra uma consequência. Aqui a rotina muda: use uma palavra de oposição, como “Mas” ou “Porém”.'},
    {t:q, ok:1},
    {t:'Porém, um dia,', ok:1},
    {t:'Além disso,', d:'“Além disso” junta mais uma coisa parecida. Aqui você vai contar algo diferente do costume.'}
  ],
  notei: [
    {t:'Por exemplo,', d:'“Por exemplo” apresenta um exemplo. Aqui você continua a história e conta o que viu.'},
    {t:'Antes disso,', d:'“Antes disso” volta no tempo. Mas o detalhe apareceu depois da mudança, e não antes.'},
    {t:'Foi então que', ok:1}
  ],
  senti: [
    {t:'Antigamente,', d:'“Antigamente” fala de um tempo bem distante. Aqui você conta o que sentiu naquela mesma hora.'},
    {t:'Naquele instante,', ok:1},
    {t:'Nessa hora,', ok:1},
    {t:'Em primeiro lugar,', d:'“Em primeiro lugar” serve para enumerar argumentos, como na redação do ENEM. Aqui você conta um sentimento.'}
  ],
  aprendi: [
    {t:'Em seguida,', d:'“Em seguida” conta o próximo fato da história. A história já acabou: agora é hora de dizer o que ficou com você.'},
    {t:'Desde aquele dia,', ok:1},
    {t:'Por exemplo,', d:'“Por exemplo” apresenta um exemplo. Aqui você vai dizer o que aprendeu.'},
    {t:'Agora,', ok:1}
  ]
};

function blockDef(id, H){
  const c = cenaDe(H), nome = `A sua cena: “${c.card.nome}”.`;
  switch(id){
    case 'p1_eu': return {n:'Frase 2 de 3 · Comigo também', q:'Diga que com você também é assim',
      tip:`A frase do professor já está no começo. Agora, conte que você também passa pela sua cena todo dia. ${nome}`, opts:c.p1_eu};
    case 'p1_auto': return {n:'Frase 3 de 3 · No automático', q:'Como você passa por ali todo dia?',
      tip:'Mostre que você faz tudo no automático, sem olhar de verdade.', opts:c.p1_auto};
    case 'p2_vejo': return {n:'Frase 1 de 3 · O que eu vejo', q:'O que está sempre lá?',
      tip:`Conte as coisas que estão sempre no mesmo lugar. ${nome}`, opts:c.p2_vejo};
    case 'p2_ouco': return {n:'Frase 2 de 3 · O que eu ouço', q:'Que sons você ouve?',
      tip:'Os sons ajudam o leitor a entrar na cena com você.', opts:c.p2_ouco};
    case 'p2_sinto': return {n:'Frase 3 de 3 · O que eu sinto', q:'Que cheiro, gosto ou sensação a cena tem?',
      tip:'Um cheiro, um gosto, o frio ou o calor deixam a cena mais viva.', opts:c.p2_sinto};
    case 'p3_virada': return {n:'Frase 1 de 3 · A mudança', q:'O que aconteceu de diferente naquele dia?',
      tip:'Primeiro, escolha a palavra que mostra que a rotina mudou. Depois, conte o que aconteceu.',
      consQ:'Qual destas mostra que a rotina mudou?', cons:CON.virada(c.quando), opts:c.p3_virada};
    case 'p3_notei': return {n:'Frase 2 de 3 · O detalhe', q:'O que você viu pela primeira vez?',
      tip:'Escolha um detalhe que sempre esteve ali, mas que você nunca tinha notado.',
      consQ:'Qual destas continua a história?', cons:CON.notei, opts:c.p3_notei};
    case 'p3_senti': {
      const o = H.opcao('p3_notei'), k = o && typeof o === 'object' ? o.k : null;
      return {n:'Frase 3 de 3 · O sentimento', q:'O que você sentiu?',
        tip:'Cada frase tem uma figura de linguagem. Comparação: liga duas coisas com “como” ou “parecia”. Metáfora: diz que uma coisa É outra.',
        consQ:'Qual destas mostra a hora em que você sentiu?', cons:CON.senti, opts:(k && c.p3_senti[k]) || SENTI_GERAL};
    }
    case 'p4_aprendi': return {n:'Frase 1 de 3 · A reflexão', q:'O que você aprendeu?',
      tip:'Lembre a frase do começo: “De tanto ver, você não vê...”. O que mudou no seu olhar?',
      consQ:'Qual destas mostra o que ficou depois daquele dia?', cons:CON.aprendi, opts:APRENDI};
    case 'p4_agora': return {n:'Frase 2 de 3 · O que mudou', q:'O que você faz agora?',
      tip:'Conte o que mudou na sua rotina depois daquele dia.', opts:c.p4_agora};
    case 'p4_fecho': return {n:'Frase 3 de 3 · O fim', q:'Feche a sua crônica',
      tip:'Uma frase curta e bonita para o leitor guardar. Pode até ser uma pergunta para ele.', opts:[c.fecho].concat(FECHO_GERAL)};
  }
  return null;
}

/* ---------- conferência da folha ---------- */
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
/* tira a frase obrigatória do começo (aceita “…” no lugar de “...” e espaços diferentes) */
const tira = s => {
  s = String(s || ''); const alvo = norm(FRASE);
  if(!norm(s).startsWith(alvo)) return s;
  let n = 0, i = 0;
  while(i < s.length && n < alvo.length){ n += norm(s[i]).length; i++; }
  return s.slice(i).replace(/^[\s.…!?]+/, '');
};
const tem = (re, s) => re.test(' ' + String(s || '').toLowerCase() + ' ');
const L = '[^a-zà-ÿ]';
const EU = new RegExp(L + '(eu|meu|minha|meus|minhas|me|mim|comigo|vejo|olho|ouço|sinto|senti|percebi|reparei|aprendi)' + L);
const SENTE = /senti|sinto|percebi|aprendi|descobri|entend|compreend|sei que|olhar|alegria|paz|coração|carinho|feliz|calma|saudade|amor|gratidão|orgulho|admiração|sorri/;
const FIGURA = new RegExp(L + '(como|parecia|parecem|parece|pareciam|igual|virou|feito um|feito uma)' + L);
const ABREV = /\b(vc|vcs|pq|tb|tbm|blz|mt|mto|mta|msm|hj|kk+|q)\b/i;
const GIRIA = /\b(tipo assim|mano|véi|top demais)\b/i;

function checks(ctx){
  const ps = (ctx.paras || []).map(p => String(p || '').trim());
  const meu = [tira(ps[0])].concat(ps.slice(1)).join(' ');
  const comeca = !!ps[0] && norm(ps[0]).startsWith(norm(FRASE));
  const quatro = ps.length >= 4 && ps.slice(0, 4).every(Boolean) && !!norm(tira(ps[0]));
  const o = ctx.opcao ? ctx.opcao('p3_senti') : null;
  // a figura escolhida conta só se a frase ainda está no 3º parágrafo (o aluno pode ter mudado a folha)
  const fig = !!(o && typeof o === 'object' && o.tag && norm(ps[2]).includes(norm(o.t))) || tem(FIGURA, ps[2]);
  const abrev = ABREV.test(meu), giria = GIRIA.test(meu);
  return [
    {id:'abertura', ok:comeca, t:'Começa com a frase do professor', d:comeca ? 'A crônica começa com “Você sai todo dia, por exemplo, pela mesma porta...”.' : 'A crônica precisa começar com: “Você sai todo dia, por exemplo, pela mesma porta...”. Confira se você não apagou nada.'},
    {id:'paras', ok:quatro, t:'Tem 4 parágrafos', d:'O caminho de todo dia, o que eu vejo, o dia em que eu olhei de verdade e o que eu aprendi.'},
    {id:'pessoa', ok:tem(EU, meu), t:'Escrita em 1ª pessoa', d:'Quem conta é você: “eu vejo”, “eu senti”, “comigo”.'},
    {id:'sentimento', ok:SENTE.test([ps[2], ps[3]].join(' ').toLowerCase()), t:'Tem sentimento e reflexão', d:'Conte o que você sentiu e o que aprendeu ao olhar de verdade.'},
    {id:'figura', ok:fig, t:'Usa comparação ou metáfora', d:'No 3º parágrafo: “parecia um quadro”, “era uma joia”.'},
    {id:'formal', ok:!abrev && !giria, t:'Sem abreviações nem gírias', d:abrev ? 'Troque as abreviações de internet pela palavra inteira.' : giria ? 'Troque as gírias por palavras comuns.' : 'A crônica pode ser leve, mas sem “vc”, “pq” ou gírias.'}
  ];
}

/* ---------- perguntas ---------- */
const QUIZ = {
  pessoa:{p:'Quem conta a sua crônica?',ops:['Você, em 1ª pessoa: “eu vi”, “eu senti”','Um narrador de fora: “ele viu”, “ela sentiu”','Um jornalista dando uma notícia','Ninguém: é só uma lista de coisas'],c:0,
    ok:'Isso! Na crônica lírica, quem fala é você, com o seu olhar e os seus sentimentos.',
    dicas:{1:'A proposta pede: “Escreva em 1ª pessoa”. Use “eu”.',2:'Notícia não é crônica lírica. Aqui você conta o que sente.',3:'A crônica é um texto com parágrafos, e quem conta é você.'}},
  assunto:{p:'Qual destes assuntos combina com a proposta?',ops:['Uma viagem para a Lua','Uma cena comum do seu dia a dia, vista de um jeito novo','As aventuras de um super-herói de filme','A vida de uma pessoa famosa'],c:1,
    ok:'Isso! O tema é “O olhar pessoal sobre situações do cotidiano”: o dia a dia, visto com os seus olhos.',
    dicas:{0:'Viagem para a Lua não é dia a dia. A crônica fala de uma cena comum.',2:'Super-herói de filme não é o seu dia a dia. A crônica fala de uma cena comum.',3:'A crônica fala da sua vida, e não da vida de um famoso.'}},
  comeco:{p:'Como a sua crônica precisa começar?',ops:['Com “Era uma vez…”','Com a frase “Você sai todo dia, por exemplo, pela mesma porta…”','Com o seu nome e a sua turma','Com uma pergunta qualquer'],c:1,
    ok:'Isso! Essa frase é obrigatória. No jogo, ela já vem pronta no começo do 1º parágrafo.',
    dicas:{0:'“Era uma vez” é começo de conto de fadas. Releia o comando.',2:'O nome não vai dentro do texto. Releia o comando: ele dá a frase do começo.',3:'O comando dá uma frase certa para o começo. Releia.'}},
  fazia:{p:'O que a mulher do texto estava fazendo?',ops:['Arrumando a árvore de Natal','Fazendo compras com as amigas','Escrevendo uma carta','Preparando a ceia de Natal'],c:0,
    ok:'Isso! Ela pendurou a última bola na árvore de Natal.',dica:'Releia a primeira frase do texto.'},
  bolas:{p:'O que ela viu nas bolas vermelhas?',ops:['O rosto das amigas','O próprio rosto, sorrindo','As luzes da rua','Um presente escondido'],c:1,
    ok:'Isso! O rosto dela aparecia em todas as bolas, um pouco torto, mas sorrindo.',dica:'Releia o fim do texto: “Em todas elas, lá estava seu rosto…”.'},
  so:{p:'Por que ela diz “Eu não estou só”?',ops:['Porque as amigas chegaram para a festa','Porque ela se viu sorrindo em todas as bolas, e o sorriso fez companhia para ela','Porque a árvore era de verdade','Porque ela tinha um cachorro'],c:1,
    ok:'Isso! Ela olhou uma coisa comum de um jeito novo, e o próprio sorriso virou companhia.',
    dicas:{0:'As amigas não estavam lá: ela só falaria com elas “se estivessem por perto”.',2:'A árvore era artificial, e isso não explica a frase.',3:'O texto não fala de cachorro. Releia o fim.'}},
  figura:{p:'Qual destas frases tem uma metáfora?',ops:['O sol nasceu às seis horas.','O sol era uma bola de fogo no céu.','O sol brilhava como ouro.'],c:1,
    ok:'Isso! A frase diz que o sol ERA uma bola de fogo, sem usar “como”. Isso é metáfora.',
    dicas:{0:'Essa frase só informa a hora. Não tem figura de linguagem.',2:'Quase! Essa frase usa “como”: é uma comparação. A metáfora diz que uma coisa É outra, sem “como”.'}},
  final:{p:'O que combina com o último parágrafo da sua crônica?',ops:['Uma solução para um problema do Brasil','O que você aprendeu ao olhar a cena de um jeito novo','Uma notícia com datas e números','Uma história nova, com outros personagens'],c:1,
    ok:'Isso! A crônica lírica termina com uma reflexão: o que mudou no seu olhar.',
    dicas:{0:'Solução para um problema é coisa da redação do ENEM. Aqui é crônica: você fecha com uma reflexão.',2:'Notícia não é crônica lírica. Aqui você fala do que sentiu e aprendeu.',3:'Não comece outra história no final. Feche a história que você contou.'}}
};

const GLOSS = {
  artificial:['Artificial','feito pelas pessoas, e não pela natureza. Aqui, a árvore não é de verdade.'],
  armar:['Armar','montar.'],
  embora:['Embora','mesmo que; apesar de.'],
  bobagem:['Bobagem','coisa sem importância; besteira.'],
  vagar:['Vagar','calma. “Olhar com mais vagar” é olhar com mais calma, sem pressa.'],
  espelhava:['Espelhava','aparecia, como num espelho.'],
  distorcido:['Distorcido','torto, com a forma um pouco mudada.'],
  so:['Só','aqui quer dizer “sozinha”, sem companhia.']
};

const INFO = {
  cronica:{titulo:'Traduzindo a proposta', html:`
    <div class="cards three">
      <div class="card"><p class="eyebrow">O que escrever</p><h3>Crônica lírica</h3><p>Crônica é um texto curto sobre o <b>dia a dia</b>, publicado em jornal, revista ou site. Na crônica <b>lírica</b>, você mostra os seus <b>sentimentos</b> e olha a cena de um jeito <b>poético</b>.</p></div>
      <div class="card"><p class="eyebrow">Quem conta</p><h3>Você, em 1ª pessoa</h3><p>Use “eu”: <i>eu vejo, eu ouço, eu senti, eu percebi</i>.</p></div>
      <div class="card"><p class="eyebrow">Sobre o quê</p><h3>O tema</h3><p><b>Cotidiano</b> = o dia a dia. Escolha uma cena comum e olhe para ela como se fosse a primeira vez.</p></div>
    </div>
    <h3>A planta da sua crônica: título + 4 parágrafos</h3>
    <ol class="planta">
      <li class="hl0"><b>Título</b><div><strong>“O olhar”</strong><span>Já vem pronto.</span></div></li>
      <li class="hl4"><b>1º</b><div><strong>O caminho de todo dia</strong><span>Começa com a frase do professor.</span></div></li>
      <li class="hl1"><b>2º</b><div><strong>O que eu vejo</strong><span>A cena: o que você vê, ouve e sente.</span></div></li>
      <li class="hl3"><b>3º</b><div><strong>O dia em que eu olhei de verdade</strong><span>Um detalhe novo e o que você sentiu.</span></div></li>
      <li class="hl2"><b>4º</b><div><strong>O que eu aprendi</strong><span>A sua reflexão final.</span></div></li>
    </ol>
    <div class="exmini"><b>A frase obrigatória do começo:</b><br>“${FRASE}”<br><span class="fine">Ela é do escritor Otto Lara Resende, da crônica “Vista cansada”.</span></div>`},
  olhar:{titulo:'O olhar da autora', html:`
    <div class="card"><p>Heloísa Seixas escreveu sobre uma coisa <b>comum</b>: as bolas de uma árvore de Natal.</p>
      <p>Mas a mulher do texto olhou <b>com calma</b> e viu uma coisa <b>nova</b>: o próprio sorriso, repetido em todas as bolas.</p></div>
    <div class="exmini"><b>Olhar de todo dia:</b> “É só uma árvore de Natal.”<br><b>Olhar com calma:</b> “Em todas elas, lá estava seu rosto […] sorrindo.”</div>
    <p>É isso que você vai fazer: escolher uma cena do seu dia a dia e <span class="mark">olhar de verdade</span> para ela.</p>`},
  p1:{titulo:'O 1º parágrafo: o caminho de todo dia', html: H => {
    const c = H.escolha('cena');
    return `
    <p class="tip">A frase do professor já está pronta no começo. Você só continua o parágrafo com mais 2 frases.</p>
    <ol class="planta">
      <li class="hl4"><b>1</b><div><strong>A frase do professor</strong><span>“Você sai todo dia… De tanto ver, você não vê...”</span></div></li>
      <li class="hl1"><b>2</b><div><strong>Comigo também</strong><span>Diga que com você também é assim.</span></div></li>
      <li class="hl3"><b>3</b><div><strong>No automático</strong><span>Mostre que você passa por ali sem olhar de verdade.</span></div></li>
    </ol>
    ${c ? `<p>A sua cena: <span class="mark">${H.esc(c.nome)}</span></p>` : ''}`;
  }},
  sentidos:{titulo:'O 2º parágrafo: use os sentidos', html: H => {
    const c = H.escolha('cena');
    return `
    <p class="tip">Para o leitor ver a cena junto com você, conte o que está sempre lá.</p>
    <ol class="planta">
      <li class="hl1"><b>1</b><div><strong>O que eu vejo</strong><span>As coisas que estão sempre no mesmo lugar.</span></div></li>
      <li class="hl3"><b>2</b><div><strong>O que eu ouço</strong><span>Os sons da cena.</span></div></li>
      <li class="hl4"><b>3</b><div><strong>O que eu sinto</strong><span>Um cheiro, um gosto, o frio ou o calor.</span></div></li>
    </ol>
    <div class="exmini"><b>Exemplo:</b> Vejo sempre a mesma rua. Ouço o barulho dos carros. Sinto o cheiro de pão da padaria.</div>
    ${c ? `<p>A sua cena: <span class="mark">${H.esc(c.nome)}</span></p>` : ''}`;
  }},
  virada:{titulo:'O 3º parágrafo: o dia em que eu olhei de verdade', html:`
    <p class="tip">Este é o coração da crônica. Um dia, algo muda, e você vê um detalhe que nunca tinha notado.</p>
    <ol class="planta">
      <li class="hl2"><b>1</b><div><strong>A mudança</strong><span>Ex.: “Mas, certa manhã, …”</span></div></li>
      <li class="hl1"><b>2</b><div><strong>O detalhe</strong><span>Ex.: “Foi então que eu reparei…”</span></div></li>
      <li class="hl3"><b>3</b><div><strong>O sentimento</strong><span>O que você sentiu, com uma figura de linguagem.</span></div></li>
    </ol>
    <div class="cards">
      <div class="card"><p class="eyebrow">Comparação</p><p>Liga duas coisas com <b>“como”</b> ou <b>“parecia”</b>.</p><p class="exmini">A estrada parecia uma fita vermelha.</p></div>
      <div class="card"><p class="eyebrow">Metáfora</p><p>Diz que uma coisa <b>É</b> outra, sem “como”.</p><p class="exmini">A estrada era uma fita vermelha.</p></div>
    </div>`},
  fim:{titulo:'O 4º parágrafo: o que eu aprendi', html:`
    <p class="tip">Volte à frase do começo: “De tanto ver, você não vê...”. Agora, conte o que mudou no seu olhar.</p>
    <ol class="planta">
      <li class="hl0"><b>1</b><div><strong>A reflexão</strong><span>O que você aprendeu naquele dia.</span></div></li>
      <li class="hl1"><b>2</b><div><strong>O que mudou</strong><span>O que você faz agora, na sua rotina.</span></div></li>
      <li class="hl5"><b>3</b><div><strong>O fim</strong><span>Uma frase bonita para o leitor guardar.</span></div></li>
    </ol>`}
};

const FASES = [
  {id:'proposta', titulo:'Entender a proposta', sub:'O que é uma crônica lírica',
   steps:[{t:'proposta'},{t:'info',k:'cronica'},{t:'quiz',q:'pessoa'},{t:'quiz',q:'assunto'},{t:'quiz',q:'comeco'},{t:'reward'}]},
  {id:'texto', titulo:'Ler o texto de apoio', sub:'Um olhar novo sobre uma coisa comum',
   steps:[{t:'read'},{t:'quiz',q:'fazia'},{t:'quiz',q:'bolas'},{t:'quiz',q:'so'},{t:'info',k:'olhar'},{t:'reward'}]},
  {id:'p1', titulo:'O caminho de todo dia', sub:'1º parágrafo', para:0,
   steps:[{t:'escolha',k:'cena'},{t:'info',k:'p1'},{t:'monte',id:'p1_eu'},{t:'monte',id:'p1_auto'},{t:'review',p:0},{t:'reward'}]},
  {id:'p2', titulo:'O que eu vejo', sub:'2º parágrafo', para:1,
   steps:[{t:'info',k:'sentidos'},{t:'monte',id:'p2_vejo'},{t:'monte',id:'p2_ouco'},{t:'monte',id:'p2_sinto'},{t:'review',p:1},{t:'reward'}]},
  {id:'p3', titulo:'O dia em que eu olhei de verdade', sub:'3º parágrafo', para:2,
   steps:[{t:'info',k:'virada'},{t:'quiz',q:'figura'},{t:'monte',id:'p3_virada'},{t:'monte',id:'p3_notei'},{t:'monte',id:'p3_senti'},{t:'review',p:2},{t:'reward'}]},
  {id:'p4', titulo:'O que eu aprendi', sub:'4º parágrafo', para:3,
   steps:[{t:'info',k:'fim'},{t:'quiz',q:'final'},{t:'monte',id:'p4_aprendi'},{t:'monte',id:'p4_agora'},{t:'monte',id:'p4_fecho'},{t:'review',p:3},{t:'reward'}]}
];

(window.ATIVIDADES = window.ATIVIDADES || []).push({
  id: 'cronica-olhar', serie: '2', ordem: 2, rotulo: 'Texto 2',
  tipo: 'cronica', genero: 'Crônica lírica',
  tema: 'O olhar pessoal sobre situações do cotidiano',
  temaRotulo: 'Tema da crônica',
  obra: 'crônica', obraGenero: 'f',
  folhaTitulo: 'Folha da crônica', folhaCabecalho: 'Crônica · Revista digital da escola',
  lead: 'Você vai escrever uma crônica lírica: um olhar novo sobre uma cena do seu dia a dia. Cada escolha sua vira um pedaço do texto, e cada acerto vale XP.',
  trilhaTip: '6 fases. Nas 2 primeiras, você entende a proposta e lê o texto. Depois, monta a crônica parágrafo por parágrafo.',
  proposta: {
    contexto: 'A sua escola está organizando uma revista digital de crônicas produzidas pelos estudantes da 2ª série. Você decidiu participar da publicação como autor de uma crônica lírica, compartilhando com a comunidade escolar um olhar pessoal sobre uma situação do cotidiano que desperta sua atenção. Seu texto será publicado na revista com o objetivo de levar os leitores a perceber e refletir sobre situações comuns sob uma nova perspectiva.',
    comando: 'A partir da leitura do texto motivador e de suas experiências, escreva uma CRÔNICA lírica, com o título “O olhar”, sobre o tema “O olhar pessoal sobre situações do cotidiano”. Observe uma cena ou acontecimento do cotidiano e, a partir de sua perspectiva, desenvolva percepções, sentimentos e reflexões sobre o que foi observado.</p><p>Escreva em 1ª pessoa, utilizando uma linguagem adequada à crônica lírica. Seu texto deve iniciar com a seguinte frase:</p><p>“' + FRASE + '”'
  },
  textos: [{
    rotulo: 'Texto de apoio 1',
    chamada: 'Leia o texto com calma',
    html: `
    <h3>Múltiplo sorriso</h3>
    <p><i>Heloísa Seixas</i></p>
    <p>Pendurou a última bola na árvore de Natal e deu alguns passos atrás. Estava bonita. Era um pinheiro [[artificial|artificial]], mas parecia de verdade. Só bolas vermelhas. Nunca deixava de [[armar|armar]] sua árvore, [[embora|embora]] as amigas dissessem que era [[bobagem|bobagem]] fazer isso quando se mora sozinha. Olhou com mais [[vagar|vagar]]. Na luz do fim da tarde, notou que sua imagem se [[espelhava|espelhava]] nas bolas. Em todas elas, lá estava seu rosto, um pouco [[distorcido|distorcido]], é verdade – mas sorrindo. “Estão vendo?”, diria às amigas, se estivessem por perto. “Eu não estou [[so|só]].”</p>
    <p class="fonte">SEIXAS, Heloisa. Contos Mínimos: Múltiplo sorriso. <i>Folha de S.Paulo</i>, São Paulo, 25 dez. 1997. Ilustrada. Disponível em: <a href="https://www1.folha.uol.com.br/fsp/ilustrad/fq251209.htm" target="_blank" rel="noopener">https://www1.folha.uol.com.br/fsp/ilustrad/fq251209.htm</a> Acesso em: 05 set. 2026.</p>`,
    facil: `
    <h3>O texto em 6 frases</h3>
    <ul class="facil">
      <li>Uma mulher <b>mora sozinha</b>.</li>
      <li>No Natal, ela <b>monta uma árvore</b> só com bolas vermelhas.</li>
      <li>As amigas acham <b>bobagem</b> montar a árvore quando se mora sozinha.</li>
      <li>No fim da tarde, ela <b>olha a árvore com calma</b>.</li>
      <li>Ela vê o <b>próprio rosto sorrindo</b> em todas as bolas.</li>
      <li>Então ela pensa: <b>“Eu não estou só.”</b></li>
    </ul>`
  }],
  gloss: GLOSS, quiz: QUIZ, info: INFO, fases: FASES,
  niveis: [[0,'Observador iniciante'],[50,'Olhar curioso'],[100,'Olhar atento'],[160,'Poeta do cotidiano'],[220,'Cronista']],
  partes: [
    {nome:'Seu 1º parágrafo', curto:'1º parágrafo', campo:'1º parágrafo', blocos:[{fixo:FRASE}, 'p1_eu', 'p1_auto'], rotulos:['Frase do professor','Comigo também','No automático'], cores:['hl0','hl4','hl1']},
    {nome:'Seu 2º parágrafo', curto:'2º parágrafo', campo:'2º parágrafo', blocos:['p2_vejo', 'p2_ouco', 'p2_sinto'], rotulos:['O que eu vejo','O que eu ouço','O que eu sinto'], cores:['hl1','hl3','hl4']},
    {nome:'Seu 3º parágrafo', curto:'3º parágrafo', campo:'3º parágrafo', blocos:['p3_virada', 'p3_notei', 'p3_senti'], rotulos:['A mudança','O detalhe','O sentimento'], cores:['hl2','hl1','hl3']},
    {nome:'Seu 4º parágrafo', curto:'4º parágrafo', campo:'4º parágrafo', blocos:['p4_aprendi', 'p4_agora', 'p4_fecho'], rotulos:['O que aprendi','O que mudou','O fim'], cores:['hl0','hl1','hl5']}
  ],
  escolhas: {
    cena: {
      eyebrow: 'Escolha a sua cena',
      titulo: 'Qual cena do seu dia a dia você vai olhar?',
      tip: 'Escolha um momento que você vive todo dia. A sua crônica inteira vai falar dele.',
      cards: CENA_ORDEM.map(k => CENAS[k].card),
      reseta: ['p1_eu','p1_auto','p2_vejo','p2_ouco','p2_sinto','p3_virada','p3_notei','p3_senti','p4_agora','p4_fecho']
    }
  },
  tituloFixo: 'O olhar',
  blockDef: blockDef,
  checks: checks
});
})();
