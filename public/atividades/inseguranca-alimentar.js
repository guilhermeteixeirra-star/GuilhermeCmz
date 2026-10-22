/* Missão Redação · atividade da 3ª Série, Texto 2 (dissertativo-argumentativo, ENEM 2022 · 2ª edição).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';
const REP = {
  cf:{tipo:'Lei',titulo:'Constituição Federal de 1988',resumo:'O artigo 6º diz que a alimentação é um direito social. Ela entrou nesse artigo em 2010.',frase:'A Constituição Federal de 1988, em seu artigo 6º, garante a alimentação como um direito social.'},
  losan:{tipo:'Lei',titulo:'Lei nº 11.346/2006',resumo:'Lei Orgânica de Segurança Alimentar e Nutricional. Garante o direito humano à alimentação adequada.',frase:'A Lei nº 11.346, de 2006, reconhece o direito de todos ao acesso regular e permanente a alimentos de qualidade, em quantidade suficiente.'},
  mapa:{tipo:'Fato histórico',titulo:'Mapa da Fome da ONU',resumo:'Mapa da ONU que mostra os países onde parte da população não come o suficiente. O Brasil saiu dele em 2014 e, anos depois, voltou.',frase:'Em 2014, o Brasil saiu do Mapa da Fome da ONU, mas, anos depois, voltou a fazer parte dele.'},
  josue:{tipo:'Livro',titulo:'Geografia da Fome (1946)',resumo:'Livro de Josué de Castro. Mostra que a fome tem causas mais sociais do que geográficas.',frase:'No livro “Geografia da Fome”, de 1946, Josué de Castro mostrou que as causas da fome no Brasil são mais sociais e culturais do que geográficas.'},
  betinho:{tipo:'Frase famosa',titulo:'Betinho',resumo:'Sociólogo que mobilizou o país contra a fome na década de 1990, com a Ação da Cidadania.',frase:'O sociólogo Herbert de Souza, o Betinho, tinha como lema a frase “Quem tem fome tem pressa”.'},
  fome33:{tipo:'Dado do texto de apoio',titulo:'33 milhões com fome',resumo:'Eram 32 milhões em 1993, segundo o Ipea. Em 2022, eram 33 milhões.',frase:'Segundo o Ipea, 32 milhões de pessoas passavam fome no Brasil em 1993; em 2022, uma nova pesquisa apontou 33 milhões.'},
  pnae:{tipo:'Programa do governo',titulo:'Alimentação escolar (PNAE)',resumo:'Programa que garante a merenda nas escolas públicas e compra parte dela da agricultura familiar.',frase:'O Programa Nacional de Alimentação Escolar (PNAE) oferece merenda aos estudantes das escolas públicas e compra parte desses alimentos da agricultura familiar.'}
};
const REP_ORDER = ['cf','losan','mapa','josue','betinho','fome33','pnae'];

const CAUSAS = [
  {id:'desigualdade',nome:'Desigualdade social',desc:'Muita riqueza fica nas mãos de poucas pessoas, e milhões vivem com pouco. Quem ganha pouco nem sempre consegue comprar comida.',
   tese:'à desigualdade social',por:'pela desigualdade social',nom:'a desigualdade social',
   topico:['a desigualdade social está na origem da fome no país.','a má divisão da riqueza deixa muitos brasileiros sem comida suficiente.','a desigualdade faz a fome atingir com mais força as famílias pobres.'],
   explica:['poucas pessoas ficam com grande parte da renda, enquanto milhões vivem com pouco dinheiro.','quem ganha pouco gasta quase tudo com aluguel, luz e transporte, e sobra pouco para a comida.','quem tem pouco dinheiro compra menos e escolhe produtos mais baratos e menos saudáveis.'],
   prova:[['josue','Em “Geografia da Fome”, Josué de Castro mostrou que a fome no Brasil tem causas mais sociais do que geográficas, e a desigualdade é uma delas.'],
          ['fome33','Segundo uma pesquisa publicada em junho de 2022, 33 milhões de pessoas passavam fome no Brasil.'],
          ['cf','A Constituição Federal de 1988 garante a alimentação como um direito social, mas a desigualdade impede que esse direito chegue a todos.'],
          ['losan','A Lei nº 11.346, de 2006, reconhece o direito de todos ao acesso regular e permanente a alimentos de qualidade, mas isso ainda não se cumpre na prática.']],
   fecha:['a pobreza e a falta de comida passam de pais para filhos.','muitas crianças crescem sem se alimentar bem.','comer bem vira um privilégio de poucos.']},
  {id:'crise',nome:'Crise econômica',desc:'Em tempos de crise, muita gente perde o emprego e a comida fica mais cara. O dinheiro da família compra cada vez menos.',
   tese:'à crise econômica',por:'pela crise econômica',nom:'a crise econômica',
   topico:['a crise econômica tira o pão da mesa de muita gente.','o desemprego e a alta no preço dos alimentos fazem a fome crescer.','cada crise na economia empurra muita gente de volta à fome.'],
   explica:['quem perde o emprego perde também a renda que sustenta a família.','o salário passa a valer menos no mercado quando os preços sobem.','muitos trabalhadores não têm carteira assinada e podem perder a renda de repente.'],
   prova:[['fome33','Segundo uma pesquisa publicada em junho de 2022, 33 milhões de pessoas passavam fome no Brasil, mais do que os 32 milhões de 1993.'],
          ['betinho','O sociólogo Betinho dizia que “quem tem fome tem pressa”, e ninguém consegue esperar a economia melhorar para comer.'],
          ['cf','A Constituição Federal de 1988 garante a alimentação como um direito social, e esse direito precisa ser protegido também nos momentos de crise.'],
          ['losan','A Lei nº 11.346, de 2006, reconhece o direito de todos ao acesso regular e permanente a alimentos de qualidade, mas o desemprego ameaça essa garantia.']],
   fecha:['muitas famílias passam a pular refeições para a comida durar mais.','muitas famílias passam a depender de doações para se alimentar.','até famílias que nunca tinham passado fome começam a enfrentar esse problema.']},
  {id:'politicas',nome:'Programas contra a fome enfraquecidos',desc:'Quando os programas do governo contra a fome perdem dinheiro ou são cortados, a fome que tinha diminuído volta a crescer.',
   tese:'ao enfraquecimento dos programas contra a fome',por:'pelo enfraquecimento dos programas contra a fome',nom:'o enfraquecimento dos programas contra a fome',
   topico:['o enfraquecimento dos programas contra a fome faz o problema voltar.','a fome aumenta quando as ações que a combatem perdem força.','quando as ações contra a fome são interrompidas, o problema volta rapidamente.'],
   explica:['os programas sociais dependem de cada governo e podem ser cortados a qualquer momento.','menos famílias recebem ajuda quando o governo diminui os gastos com esse combate.','muitas famílias pobres dependem do Estado para colocar comida na mesa.'],
   prova:[['mapa','O Brasil saiu do Mapa da Fome da ONU em 2014, mas, anos depois, voltou a fazer parte dele.'],
          ['betinho','Na década de 1990, a Ação da Cidadania, liderada por Betinho, colocou o combate à fome no foco das políticas públicas, e esse esforço não pode parar.'],
          ['losan','A Lei nº 11.346, de 2006, reconhece o direito de todos ao acesso regular e permanente a alimentos de qualidade, e isso exige um trabalho contínuo.'],
          ['josue','Em “Geografia da Fome”, Josué de Castro mostrou que a fome no Brasil tem causas mais sociais do que geográficas, e as escolhas dos governos são uma delas.']],
   fecha:['os avanços conquistados contra a fome se perdem em poucos anos.','o país precisa recomeçar o que já tinha dado certo.','quem já vivia com pouco fica sem proteção nos momentos mais difíceis.']},
  {id:'desperdicio',nome:'Desperdício de alimentos',desc:'Muita comida se perde no caminho até a mesa ou vai para o lixo, enquanto muitas pessoas não têm o que comer.',
   tese:'ao desperdício de alimentos',por:'pelo desperdício de alimentos',nom:'o desperdício de alimentos',
   topico:['o desperdício de alimentos agrava a insegurança alimentar no país.','muita comida vai para o lixo, enquanto tantas pessoas não têm o que comer.','o Brasil perde alimentos que poderiam estar na mesa dos mais pobres.'],
   explica:['parte da colheita estraga no transporte ou no armazenamento.','frutas e verduras com pequenas manchas são rejeitadas nos mercados, mesmo estando boas.','a comida que sobra em mercados e restaurantes nem sempre é doada.'],
   prova:[['josue','Em “Geografia da Fome”, Josué de Castro mostrou que a fome no Brasil tem causas mais sociais do que geográficas, e o desperdício é um exemplo disso.'],
          ['fome33','Segundo uma pesquisa publicada em junho de 2022, 33 milhões de pessoas passavam fome no Brasil.'],
          ['betinho','O sociólogo Betinho dizia que “quem tem fome tem pressa”, e cada alimento desperdiçado é uma refeição a menos para alguém que não pode esperar.'],
          ['losan','A Lei nº 11.346, de 2006, reconhece o direito de todos a alimentos de qualidade, em quantidade suficiente, mas o desperdício dificulta que isso aconteça.']],
   fecha:['a fome continua, mesmo com uma produção tão grande de alimentos.','o problema da fome não se resolve apenas produzindo mais.','o esforço de quem planta também se perde.']},
  {id:'agricultura',nome:'Pouco apoio à agricultura familiar',desc:'A agricultura familiar (pequenos agricultores que trabalham com a família) produz muitos alimentos do dia a dia, mas recebe pouca ajuda para plantar e vender.',
   tese:'ao pouco apoio à agricultura familiar',por:'pelo pouco apoio à agricultura familiar',nom:'o pouco apoio à agricultura familiar',
   topico:['o pouco apoio à agricultura familiar contribui para a volta da fome.','os pequenos agricultores ajudam a alimentar o país, mas recebem pouco apoio.','a agricultura familiar põe comida na mesa, mas ainda é pouco valorizada.'],
   explica:['muitos pequenos produtores não conseguem crédito, isto é, empréstimos para plantar.','muitos agricultores sofrem com estradas ruins e não têm onde vender a produção.','os grandes produtores recebem muito mais apoio do governo do que os pequenos.'],
   prova:[['pnae','O Programa Nacional de Alimentação Escolar (PNAE) compra parte da merenda da agricultura familiar, o que mostra a importância do pequeno agricultor para as escolas.'],
          ['josue','Em “Geografia da Fome”, Josué de Castro mostrou que a fome no Brasil tem causas mais sociais do que geográficas, e a falta de apoio ao agricultor é uma delas.'],
          ['losan','A Lei nº 11.346, de 2006, reconhece o direito de todos ao acesso regular e permanente a alimentos de qualidade, e quem planta precisa de condições para produzir.'],
          ['cf','A Constituição Federal de 1988 garante a alimentação como um direito social, e esse direito depende do trabalho dos agricultores.']],
   fecha:['muitas famílias abandonam o campo em busca de trabalho na cidade.','o próprio agricultor, que planta comida, pode passar fome.','menos alimentos frescos chegam às feiras e aos mercados.']}
];

/* abertura: a lei/frase famosa pede ideia contrária; o dado/fato pede explicação */
const ABERTURAS = [{id:'betinho',tipo:'contraste'},{id:'cf',tipo:'contraste'},{id:'fome33',tipo:'dado'},{id:'mapa',tipo:'dado'}];
const PONTE = {
  contraste:['a fome ainda faz parte da vida de milhões de brasileiros.','em 2022, 33 milhões de pessoas ainda passavam fome no país.','o país ainda não venceu a fome definitivamente, pois ela diminuiu e depois voltou a crescer.'],
  dado:['a fome ainda não é um problema do passado no país.','a fome ainda não foi vencida definitivamente.','o país andou para trás no combate à fome.']
};

/* palavras de ligação: as certas (ok) e as pegadinhas, com a dica de cada uma */
const CON = {
  d1:[{t:'Portanto,',d:'“Portanto” serve para concluir. Aqui você está começando o 1º argumento.'},{t:'Em primeiro lugar,',ok:1},{t:'Além disso,',d:'“Além disso” junta uma ideia nova. Guarde para o 2º argumento.'},{t:'Primeiramente,',ok:1}],
  d2:[{t:'Além disso,',ok:1},{t:'Em primeiro lugar,',d:'Este já é o 2º argumento. “Em primeiro lugar” foi no 1º.'},{t:'Somado a isso,',ok:1},{t:'Portanto,',d:'“Portanto” serve para concluir. Ainda não é a hora.'}],
  explica:[{t:'Em suma,',d:'“Em suma” resume tudo no final. Aqui você precisa explicar a causa.'},{t:'Isso acontece porque',ok:1},{t:'Isso ocorre, pois',ok:1}],
  fecha:[{t:'Dessa forma,',ok:1},{t:'Em primeiro lugar,',d:'“Em primeiro lugar” começa um argumento. Aqui você está fechando o parágrafo.'},{t:'Assim,',ok:1},{t:'Como consequência,',ok:1}],
  contraste:[{t:'Além disso,',d:'“Além disso” junta uma ideia parecida. Aqui a ideia é contrária: a frase mostra como deveria ser, e o Brasil ainda não é assim.'},{t:'No entanto,',ok:1},{t:'Entretanto,',ok:1},{t:'Porém,',ok:1}],
  dado:[{t:'No entanto,',d:'“No entanto” mostra uma ideia contrária. Aqui você quer explicar o que esse fato mostra.'},{t:'Isso mostra que',ok:1},{t:'Isso revela que',ok:1}],
  tese:[{t:'Por exemplo,',d:'“Por exemplo” apresenta um exemplo. Aqui você vai dar a sua opinião.'},{t:'Nesse contexto,',ok:1},{t:'Nesse cenário,',ok:1}],
  retomada:[{t:'Portanto,',ok:1},{t:'Além disso,',d:'“Além disso” junta mais um argumento. Agora é hora de concluir.'},{t:'Diante disso,',ok:1},{t:'Em suma,',ok:1}]
};

const AGENTES = [
  {t:'o Governo Federal',v:'deve'},
  {t:'o Governo Federal, com os estados e as prefeituras,',v:'deve'},
  {t:'os governos estaduais',v:'devem'},
  {t:'as prefeituras, com a ajuda do Governo Federal,',v:'devem'}
];
const ACOES = [
  {t:'garantir uma renda mínima às famílias mais pobres',det:['Esse dinheiro poderia ser pago todo mês, desde que as crianças estivessem na escola.','Esse dinheiro ajudaria as famílias a atravessar os períodos de desemprego.']},
  {t:'dar mais apoio aos pequenos agricultores',det:['Esse apoio poderia incluir empréstimos com juros baixos e a compra garantida da colheita.','Os alimentos comprados desses agricultores poderiam abastecer escolas, hospitais e restaurantes populares.']},
  {t:'criar restaurantes populares e cozinhas comunitárias',det:['Nesses lugares, as refeições poderiam ser muito baratas ou até gratuitas para quem mais precisa.','Esses espaços poderiam funcionar nos bairros mais pobres e também nas cidades do interior.']},
  {t:'manter os programas sociais funcionando sem interrupção',det:['Desse modo, a ajuda às famílias continuaria mesmo quando o governo mudasse.','Conselhos com representantes da população poderiam acompanhar esses programas e cobrar resultados.']},
  {t:'criar uma rede de doação dos alimentos que sobram no comércio',det:['Esses alimentos poderiam ser recolhidos todos os dias e levados a abrigos, escolas e cozinhas comunitárias.','Os comerciantes poderiam receber orientação para doar esses alimentos com segurança.']}
];
const DET_GERAL = ['Essas ações deveriam ser acompanhadas de perto pela comunidade, para que funcionem de verdade.','Dessa maneira, a luta contra a fome seria contínua, e não apenas uma ação passageira.'];
const MEIOS = ['por meio de verbas públicas previstas no orçamento','por meio de uma lei que torne essa medida permanente','por meio de parcerias com ONGs, empresas e associações','por meio de um levantamento das regiões mais necessitadas','por meio de metas claras para cada ano'];
const FINS = ['a fim de que nenhum brasileiro passe fome','para evitar que a fome volte no futuro','para que o direito à alimentação adequada seja respeitado','para que cada brasileiro tenha comida suficiente e saudável todos os dias'];

const QUIZ = {
  tipo:{p:'Que tipo de texto você vai escrever?',ops:['Uma história com personagens','Uma carta para um amigo','Um texto que defende uma opinião com argumentos','Um poema com rimas'],c:2,
    ok:'Isso! Dissertativo-argumentativo é um texto que defende uma opinião e prova com argumentos.',
    dicas:{0:'História com personagens é narração. Aqui você precisa defender uma opinião.',1:'Carta não é o texto pedido. Volte e releia o cartão “O que escrever”.',3:'Poema não. O texto precisa defender uma opinião com argumentos.'}},
  tema:{p:'Qual destes assuntos está dentro do tema da redação?',ops:['A violência no trânsito','O que fazer para que a fome não volte a crescer no Brasil','A importância de comer frutas e verduras','A fome em outros países do mundo'],c:1,
    ok:'Isso! O tema pede medidas, ou seja, soluções para que a fome não volte.',
    dicas:{0:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!',2:'Comer bem é um assunto parecido, mas o tema fala de quem não tem comida garantida. Isso é passar perto do tema sem entrar nele (tangenciar), e perde muitos pontos.',3:'O tema fala da fome no Brasil. Escrever só sobre outros países é tangenciar o tema, e isso perde muitos pontos.'}},
  recorrencia:{p:'No tema, o que quer dizer “recorrência”?',ops:['Algo que acontece uma única vez','Algo que volta a acontecer','Algo que já acabou para sempre'],c:1,
    ok:'Isso! A fome tinha diminuído no Brasil, mas voltou a crescer. Por isso, o tema fala em recorrência.',
    dicas:{0:'É o contrário: recorrência é algo que acontece de novo. Releia o cartão “Sobre o quê”.',2:'Se tivesse acabado, não precisaria de medidas! Releia o cartão “Sobre o quê”.'}},
  final:{p:'O que precisa aparecer no último parágrafo?',ops:['Uma solução para o problema','Uma piada para animar quem lê','Seu nome e sua assinatura','Uma pergunta sem resposta'],c:0,
    ok:'Isso! Essa solução se chama proposta de intervenção e precisa respeitar os direitos humanos.',
    dicas:{1:'Piada não combina com um texto formal.',2:'Cuidado! No ENEM, redação com nome ou assinatura vale zero.',3:'O final precisa resolver o problema, não deixar dúvidas.'}},
  josue:{p:'Para Josué de Castro, as causas da fome no Brasil são mais…',ops:['geográficas, como o clima e o solo','socioculturais, ligadas ao jeito como a sociedade vive e se organiza','ligadas apenas à falta de chuva'],c:1,
    ok:'Isso! Para ele, a fome tem mais a ver com a sociedade do que com a natureza.',
    dicas:{0:'É o contrário! Releia a última frase: as causas são “mais produto de fatores socioculturais do que de fatores de natureza geográfica”.',2:'O texto não fala de chuva. Releia a última frase do texto.'}},
  cronica:{p:'No Texto I, o que é “fome crônica”?',ops:['Uma fome que dura muito tempo e não passa','Uma fome que aparece só de vez em quando','Um texto de jornal sobre a fome'],c:0,
    ok:'Isso! A fome crônica dura muito tempo. Já a subnutrição é quando a pessoa come, mas falta o que o corpo precisa.',
    dicas:{1:'Ainda não. Volte ao Texto I e toque em “fome crônica” para ver o que quer dizer.',2:'Boa lembrança: crônica também é um gênero de texto! Mas, aqui, a palavra fala de uma fome que dura muito tempo.'}},
  betinho:{p:'O que quer dizer o lema “Quem tem fome tem pressa”?',ops:['Que a fome não pode esperar: é preciso agir logo','Que quem tem fome come muito rápido','Que a fome passa sozinha com o tempo'],c:0,
    ok:'Isso! Quem passa fome precisa de ajuda agora, e não daqui a muitos anos.',
    dicas:{1:'A frase não fala do jeito de comer. Pense: quem tem fome pode esperar muito tempo por ajuda?',2:'A fome não passa sozinha. Pense: quem tem fome pode esperar?'}},
  numeros:{p:'Compare os números do Texto III. O que eles mostram?',ops:['Em 2022, havia menos pessoas com fome do que em 1993','Em 2022, havia mais pessoas com fome do que em 1993','Em 2022, a fome tinha acabado no Brasil'],c:1,
    ok:'Isso! Eram 32 milhões em 1993 e 33 milhões em 2022. Quase 30 anos depois, o número de pessoas com fome não tinha diminuído.',
    dicas:{0:'Compare: em 1993, eram 32 milhões. Em 2022, eram 33 milhões. Qual número é maior?',2:'Não. O texto diz que 33 milhões de pessoas passavam fome em 2022.'}},
  dh:{p:'Qual destas soluções NÃO pode aparecer na redação, porque desrespeita os direitos humanos?',ops:['Criar restaurantes populares','Prender quem pede comida na rua','Apoiar os pequenos agricultores','Doar a comida que sobra nos mercados'],c:1,
    ok:'Isso! Prender ou castigar pessoas desrespeita os direitos humanos. A solução deve ajudar, não punir.',dica:'Essa solução ajuda as pessoas. Procure a que castiga alguém.'}
};

const GLOSS = {
  aluz:['À luz de','com base em; olhando para.'],
  inqueritos:['Inquéritos sociais','pesquisas sobre como as pessoas vivem.'],
  nutritivas:['Qualidades nutritivas','o que a comida tem de bom para o corpo, como vitaminas e proteínas.'],
  precarias:['Precárias','fracas, ruins; que não são suficientes.'],
  dieteticos:['Padrões dietéticos','o jeito de se alimentar: o que as pessoas costumam comer.'],
  desarmonicos:['Desarmônicos','sem equilíbrio: com coisas demais de um tipo e de menos de outro.'],
  numas:['Numas… noutras','em umas… em outras.'],
  cronica:['Fome crônica','fome que dura muito tempo e não passa.'],
  subnutricao:['Subnutrição','quando a pessoa come, mas não recebe tudo de que o corpo precisa para crescer e ter saúde.'],
  emregra:['Em regra','quase sempre; na maioria das vezes.'],
  defeituosa:['Defeituosa','com defeitos; que não está boa.'],
  evolucao:['Evolução econômico-social','o desenvolvimento da economia e da vida do povo.'],
  socioculturais:['Fatores socioculturais','motivos ligados à sociedade e à cultura, ou seja, ao jeito como as pessoas vivem e se organizam.'],
  geografica:['Natureza geográfica','ligada ao lugar, como o clima, o solo e a chuva.'],
  sociologo:['Sociólogo','pessoa que estuda a sociedade.'],
  imortalizado:['Imortalizado','lembrado para sempre.'],
  henfil:['“Irmão do Henfil”','Henfil era um desenhista famoso, irmão de Betinho. Na música “O bêbado e a equilibrista”, Betinho é lembrado como “o irmão do Henfil”.'],
  mobilizou:['Mobilizou','fez muitas pessoas se unirem e agirem por uma causa.'],
  etica:['Ética','agir com honestidade e respeito às pessoas e às regras.'],
  miseria:['Miséria','pobreza muito grande; quando falta até o básico para viver.'],
  lema:['Lema','frase curta que resume uma ideia ou uma luta.'],
  campanha:['Campanha','conjunto de ações para alcançar um objetivo.'],
  cidadania:['Ação da Cidadania','movimento criado por Betinho para combater a fome. Cidadania é viver em sociedade, com direitos e deveres.'],
  manifestacoes:['Manifestações populares','quando o povo se reúne, nas ruas ou em outros lugares, para pedir mudanças.'],
  politicas:['Políticas públicas','programas e ações do governo para resolver problemas da população.'],
  atualmente:['Atualmente','hoje. Neste texto, quer dizer 2022, o ano em que ele foi publicado.'],
  semelhantes:['Semelhantes','parecidos.'],
  ipea:['Ipea','Instituto de Pesquisa Econômica Aplicada: órgão do governo federal que faz pesquisas sobre a economia e a vida da população.']
};

const INEP = '<a href="https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos" target="_blank" rel="noopener">www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos</a>';

const FASES = [
  {id:'missao',titulo:'Entender a missão',sub:'O que a prova pede',unlock:['cf','losan','mapa'],
   steps:[{t:'proposta'},{t:'info',k:'missao'},{t:'quiz',q:'tipo'},{t:'quiz',q:'tema'},{t:'quiz',q:'recorrencia'},{t:'quiz',q:'final'},{t:'reward'}]},
  {id:'texto',titulo:'Ler os textos de apoio',sub:'Pegar ideias e dados',unlock:['josue','betinho','fome33'],
   steps:[{t:'read',x:0},{t:'quiz',q:'josue'},{t:'quiz',q:'cronica'},{t:'read',x:1},{t:'quiz',q:'betinho'},{t:'read',x:2},{t:'quiz',q:'numeros'},{t:'reward'}]},
  {id:'causas',titulo:'Escolher os argumentos',sub:'Os 2 motivos do problema',unlock:['pnae'],
   steps:[{t:'info',k:'causas'},{t:'causas'},{t:'reward'}]},
  {id:'intro',titulo:'Introdução',sub:'1º parágrafo',para:0,
   steps:[{t:'info',k:'intro'},{t:'abertura'},{t:'monte',id:'intro_ponte'},{t:'monte',id:'intro_tese'},{t:'review',p:0},{t:'reward'}]},
  {id:'d1',titulo:'1º argumento',sub:'2º parágrafo',para:1,
   steps:[{t:'info',k:'desenv'},{t:'monte',id:'d1_topico'},{t:'monte',id:'d1_explica'},{t:'monte',id:'d1_prova'},{t:'monte',id:'d1_fecha'},{t:'review',p:1},{t:'reward'}]},
  {id:'d2',titulo:'2º argumento',sub:'3º parágrafo',para:2,
   steps:[{t:'monte',id:'d2_topico'},{t:'monte',id:'d2_explica'},{t:'monte',id:'d2_prova'},{t:'monte',id:'d2_fecha'},{t:'review',p:2},{t:'reward'}]},
  {id:'concl',titulo:'Conclusão',sub:'4º parágrafo e solução',para:3,
   steps:[{t:'info',k:'concl'},{t:'quiz',q:'dh'},{t:'monte',id:'c_retomada'},{t:'proposal'},{t:'monte',id:'c_detalhe'},{t:'review',p:3},{t:'reward'}]}
];

(window.ATIVIDADES = window.ATIVIDADES || []).push({
  id: 'inseguranca-alimentar', serie: '3', ordem: 2, rotulo: 'Texto 2',
  tipo: 'dissertativo', genero: 'Dissertativo-argumentativo',
  tema: 'Medidas para o enfrentamento da recorrência da insegurança alimentar no Brasil',
  temaRotulo: 'Tema da redação',
  obra: 'redação', obraGenero: 'f',
  folhaTitulo: 'Folha de redação', folhaCabecalho: 'Redação · ENEM 2022 (2ª edição)',
  lead: 'Você vai montar uma redação do ENEM sobre a fome no Brasil. Cada escolha sua vira um pedaço do texto, e cada acerto vale XP.',
  trilhaTip: '7 fases. Nas 3 primeiras, você entende a proposta, lê os 3 textos e escolhe os argumentos. Nas 4 últimas, monta os 4 parágrafos da redação.',
  proposta: {
    contexto: 'Esta é a proposta de redação do Enem 2022 (2ª edição). Leia a proposta completa e os textos motivadores com atenção, mais de uma vez, e elabore seu texto.',
    comando: 'A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema “Medidas para o enfrentamento da recorrência da insegurança alimentar no Brasil”, apresentando proposta de intervenção que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para a defesa de seu ponto de vista.'
  },
  textos: [{
    rotulo: 'Texto de apoio I',
    html: `
    <h3>Fragmento do livro <i>Geografia da Fome</i>, de Josué de Castro, publicado em 1946</h3>
    <p>A alimentação do brasileiro tem-se revelado, [[aluz|à luz]] dos [[inqueritos|inquéritos sociais]] realizados, com [[nutritivas|qualidades nutritivas]] bem [[precarias|precárias]], apresentando, nas diferentes regiões do país, [[dieteticos|padrões dietéticos]] mais ou menos incompletos e [[desarmonicos|desarmônicos]]. [[numas|Numas]] regiões, os erros e efeitos são mais graves, e vive-se num estado de [[cronica|fome crônica]]; [[numas|noutras]], são mais discretos, e tem-se a [[subnutricao|subnutrição]]. Procurando investigar as causas fundamentais dessa alimentação [[emregra|em regra]] tão [[defeituosa|defeituosa]] e que tem pesado tão duramente na [[evolucao|evolução econômico-social]] do povo, chega-se à conclusão de que elas são mais produto de fatores [[socioculturais|socioculturais]] do que de fatores de [[geografica|natureza geográfica]].</p>
    <p class="fonte">CASTRO, J. <i>Geografia da Fome</i>. 9ª ed. Rio de Janeiro: Civilização Brasileira, 2008 (adaptado).</p>
    <p class="fonte">Disponível em: ${INEP}. Acesso em: 18 mar. 2024.</p>`,
    facil: `
    <h3>O texto em 4 frases</h3>
    <ul class="facil">
      <li>Josué de Castro escreveu o livro <b>Geografia da Fome</b>, publicado em 1946.</li>
      <li>Ele mostrou que a alimentação do brasileiro era <b>fraca e desequilibrada</b>.</li>
      <li>Em algumas regiões, havia <b>fome crônica</b>, uma fome que não passa. Em outras, havia <b>subnutrição</b>: a pessoa come, mas falta o que o corpo precisa.</li>
      <li>Para ele, as causas da fome estão <b>mais ligadas à sociedade</b> (o jeito como as pessoas vivem e se organizam) <b>do que à natureza</b> (o clima e o solo).</li>
    </ul>`
  }, {
    rotulo: 'Texto de apoio II',
    html: `
    <p>O [[sociologo|sociólogo]] Herbert de Souza, o Betinho, [[imortalizado|imortalizado]] na música de Aldir Blanc e João Bosco, pela voz de Elis Regina, como o [[henfil|“irmão do Henfil”]], [[mobilizou|mobilizou]] o país na luta pela [[etica|ética]] na política, pelo combate à fome e à [[miseria|miséria]] e na defesa da vida, na década de 1990.</p>
    <p><b>Quem tem fome tem pressa.</b> A frase era o [[lema|lema]] de Betinho durante a [[campanha|campanha]] da [[cidadania|Ação da Cidadania]] contra a Fome, a Miséria, e pela Vida, que colocou o combate à fome no foco das [[manifestacoes|manifestações populares]] e das [[politicas|políticas públicas]].</p>
    <p class="fonte">Disponível em: <a href="https://agenciabrasil.ebc.com.br" target="_blank" rel="noopener">agenciabrasil.ebc.com.br</a>. Acesso em: 15 jun. 2022 (adaptado).</p>
    <p class="fonte">Disponível em: ${INEP}. Acesso em: 18 mar. 2024.</p>`,
    facil: `
    <h3>O texto em 5 frases</h3>
    <ul class="facil">
      <li><b>Betinho</b> (Herbert de Souza) era sociólogo, alguém que estuda a sociedade.</li>
      <li>Ele aparece numa música famosa, cantada por Elis Regina, como o “irmão do Henfil”.</li>
      <li>Na década de 1990, ele uniu o país na luta contra a fome e a miséria.</li>
      <li>O lema dele era <b>“Quem tem fome tem pressa”</b>. Ou seja: a fome não pode esperar.</li>
      <li>A campanha da <b>Ação da Cidadania</b> levou o combate à fome para as ruas e para os programas do governo.</li>
    </ul>`
  }, {
    rotulo: 'Texto de apoio III',
    html: `
    <p>[[atualmente|Atualmente]], <b>33 milhões</b> de pessoas passam fome no país, segundo resultado de uma nova pesquisa sobre o tema publicada em junho de 2022. Em 1993, eram <b>32 milhões</b> de pessoas nessa situação, segundo dados [[semelhantes|semelhantes]] do [[ipea|Ipea]] (Instituto de Pesquisa Econômica Aplicada).</p>
    <p class="fonte">Disponível em: <a href="https://www1.folha.uol.com.br" target="_blank" rel="noopener">www1.folha.uol.com.br</a>. Acesso em: 15 jun. 2022 (adaptado).</p>
    <p class="fonte">Disponível em: ${INEP}. Acesso em: 18 mar. 2024.</p>`,
    facil: `
    <h3>O texto em 3 frases</h3>
    <ul class="facil">
      <li>Em <b>2022</b>, uma pesquisa mostrou que <b>33 milhões</b> de pessoas passavam fome no Brasil.</li>
      <li>Em <b>1993</b>, eram <b>32 milhões</b>, segundo o Ipea.</li>
      <li>Ou seja: quase 30 anos depois, o número de pessoas com fome não diminuiu. Ele ficou até um pouco maior.</li>
    </ul>`
  }],
  rep: REP, repOrdem: REP_ORDER, causas: CAUSAS, aberturas: ABERTURAS, ponte: PONTE,
  ponteRep: { contraste: { 1: 'fome33', 2: 'mapa' } },
  con: CON, agentes: AGENTES, acoes: ACOES, detGeral: DET_GERAL, meios: MEIOS, fins: FINS,
  quiz: QUIZ, gloss: GLOSS, fases: FASES,
  causasPergunta: 'Por que a fome volta a crescer no Brasil?',
  teses: [
    (a, b) => `para enfrentar a recorrência da insegurança alimentar no Brasil, é preciso agir, principalmente, sobre duas causas: ${a.nom} e ${b.nom}.`,
    (a, b) => `a insegurança alimentar se repete no Brasil devido, principalmente, ${a.tese} e ${b.tese}, o que exige medidas urgentes.`,
    (a, b) => `a recorrência da insegurança alimentar no Brasil é causada, principalmente, ${a.por} e ${b.por}, problemas que exigem medidas firmes.`
  ],
  retomadas: (a, b) => ['fica claro que o Brasil precisa agir continuamente contra a insegurança alimentar.', 'a fome no Brasil só será vencida com ações que não parem na metade.', `${a.nom} e ${b.nom} precisam de respostas rápidas e duradouras.`],
  info: {
    temaCard: '<p><b>Insegurança alimentar</b> = não ter certeza de que vai ter comida suficiente e saudável todo dia.<br><b>Recorrência</b> = algo que volta a acontecer. A fome diminuiu no Brasil e depois voltou a crescer.<br><b>Medidas para o enfrentamento</b> = ações para resolver o problema.</p><p class="exmini">O tema pede <b>soluções</b>: o que fazer para a fome não voltar? Por isso, a sua tese e a sua conclusão precisam falar de <b>medidas</b>.</p>',
    argumentoExemplo: { opiniao: 'é preciso agir para que a fome não volte a crescer no Brasil.', argumento: 'porque muitas famílias perdem a renda quando falta emprego.' },
    introExemplo: 'O sociólogo Herbert de Souza, o Betinho, tinha como lema a frase “Quem tem fome tem pressa”. No entanto, a fome ainda faz parte da vida de milhões de brasileiros. Nesse contexto, para enfrentar a recorrência da insegurança alimentar no Brasil, é preciso agir, principalmente, sobre duas causas: a desigualdade social e o enfraquecimento dos programas contra a fome.',
    solucaoExemplos: { agente: 'o Governo Federal', acao: 'criar restaurantes populares', meio: 'por meio de verbas públicas', fim: 'para que ninguém passe fome' }
  },
  checagem: {
    temaRegex: /fome|alimentar|alimenta[cç][aã]o|alimento|comida/i,
    temaDica: 'Use as palavras “fome” ou “insegurança alimentar” já no 1º parágrafo.',
    repRegex: /josu[eé] de castro|geografia da fome|betinho|herbert de souza|a[cç][aã]o da cidadania|quem tem fome tem pressa|constitui[cç][aã]o|11\.346|mapa da fome|\bonu\b|\bfao\b|alimenta[cç][aã]o escolar|\bpnae\b|\bipea\b|\d+\s?milh[oõ]es/i
  }
});
})();
