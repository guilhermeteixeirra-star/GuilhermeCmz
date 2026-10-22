/* Missão Redação · atividade da 2ª Série, Texto 1 (dissertativo-argumentativo).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';
const REP = {
  lobato:{tipo:'Frase famosa',titulo:'Monteiro Lobato',resumo:'Escritor brasileiro, autor do Sítio do Picapau Amarelo.',frase:'O escritor Monteiro Lobato afirmou que “um país se faz com homens e livros”.'},
  freire:{tipo:'Frase famosa',titulo:'Paulo Freire',resumo:'Educador brasileiro conhecido no mundo todo.',frase:'O educador Paulo Freire afirmou que “a leitura do mundo precede a leitura da palavra”.'},
  cf:{tipo:'Lei',titulo:'Constituição Federal de 1988',resumo:'O artigo 205 diz que a educação é direito de todos.',frase:'A Constituição Federal de 1988 garante que a educação é direito de todos e dever do Estado e da família.'},
  r53:{tipo:'Dado do texto de apoio',titulo:'53% não são leitores',resumo:'Pesquisa Retratos da Leitura no Brasil.',frase:'Segundo a pesquisa Retratos da Leitura no Brasil, 53% dos brasileiros não são leitores.'},
  queda:{tipo:'Dado do texto de apoio',titulo:'Leitores em queda',resumo:'Eram 55% da população em 2007. Hoje são 47%.',frase:'De acordo com a pesquisa Retratos da Leitura no Brasil, os leitores eram 55% da população em 2007 e hoje são apenas 47%.'},
  funcional:{tipo:'Conceito da Unesco',titulo:'Analfabetismo funcional',resumo:'A pessoa reconhece letras, mas não entende textos simples.',frase:'Segundo a Unesco, o analfabeto funcional até reconhece letras e números, mas não consegue interpretar textos simples.'},
  lei:{tipo:'Lei',titulo:'Lei nº 12.244/2010',resumo:'Toda escola do país deve ter biblioteca.',frase:'A Lei nº 12.244, de 2010, determina que todas as escolas do país tenham biblioteca.'}
};
const REP_ORDER = ['lobato','freire','cf','r53','queda','funcional','lei'];

const CAUSAS = [
  {id:'redes',nome:'Celular e redes sociais',desc:'Vídeos curtos e notificações o tempo todo tiram a concentração. Aí, ler um livro inteiro parece difícil.',
   tese:'ao uso exagerado das redes sociais',por:'pelo uso exagerado das redes sociais',nom:'o uso exagerado das redes sociais',
   topico:['o uso exagerado das redes sociais atrapalha a formação de leitores.','o celular tem afastado muitos jovens dos livros.','as redes sociais disputam com os livros a atenção dos jovens.'],
   explica:['os vídeos curtos acostumam o cérebro a respostas rápidas, e a leitura exige calma e concentração.','as notificações do celular interrompem a leitura o tempo todo.','muitos jovens passam horas nas redes sociais e não sobra tempo para ler.'],
   prova:[['r53','Segundo a pesquisa Retratos da Leitura no Brasil, os brasileiros estão com menos capacidade de concentração e de compreensão.'],
          ['queda','Prova disso é que os leitores eram 55% da população em 2007 e hoje são apenas 47%, segundo a pesquisa Retratos da Leitura no Brasil.'],
          ['funcional','Segundo a Unesco, o analfabeto funcional até reconhece letras, mas não consegue interpretar textos simples, e esse problema está crescendo no país.'],
          ['lobato','O escritor Monteiro Lobato afirmou que “um país se faz com homens e livros”, mas hoje muitos jovens trocam os livros pelas telas.']],
   fecha:['muitos jovens trocam os livros pela tela e perdem o hábito de ler.','a leitura fica cada vez mais distante do dia a dia dos estudantes.','cresce o número de pessoas que leem, mas não entendem o que leram.']},
  {id:'acesso',nome:'Poucas bibliotecas e livros caros',desc:'Muitos bairros não têm biblioteca pública, e um livro novo custa caro para muitas famílias.',
   tese:'à falta de acesso aos livros',por:'pela falta de acesso aos livros',nom:'a falta de acesso aos livros',
   topico:['a falta de acesso aos livros é um grande obstáculo.','muitos brasileiros não têm livros por perto.','o preço dos livros e a falta de bibliotecas afastam muita gente da leitura.'],
   explica:['muitos bairros não têm bibliotecas públicas.','um livro novo custa caro para grande parte das famílias.','muitas escolas não têm biblioteca ou têm poucos livros.'],
   prova:[['lei','A Lei nº 12.244, de 2010, determina que todas as escolas do país tenham biblioteca, mas muitas escolas brasileiras ainda não têm uma.'],
          ['cf','A Constituição Federal de 1988 garante que a educação é direito de todos, mas muitos brasileiros ainda não têm acesso a livros.'],
          ['r53','Segundo a pesquisa Retratos da Leitura no Brasil, 53% dos brasileiros não são leitores.'],
          ['queda','Segundo a pesquisa Retratos da Leitura no Brasil, os leitores eram 55% da população em 2007 e hoje são apenas 47%.']],
   fecha:['quem não tem dinheiro nem biblioteca por perto fica longe da leitura.','a leitura vira um privilégio de quem pode pagar.','muitas crianças crescem sem nunca ter um livro em casa.']},
  {id:'familia',nome:'Falta de exemplo em casa',desc:'Quando a criança não vê ninguém lendo em casa, fica mais difícil aprender a gostar de ler.',
   tese:'à falta de incentivo à leitura dentro de casa',por:'pela falta de incentivo à leitura dentro de casa',nom:'a falta de incentivo à leitura dentro de casa',
   topico:['a falta de incentivo dentro de casa dificulta a formação de leitores.','muitas crianças não veem ninguém lendo em casa.','a família tem um papel importante, mas nem sempre incentiva a leitura.'],
   explica:['as crianças aprendem pelo exemplo: se os adultos não leem, elas também não criam esse hábito.','muitos pais trabalham o dia todo e não têm tempo para ler com os filhos.','muitos adultos também não tiveram o costume de ler quando eram jovens.'],
   prova:[['r53','Segundo a pesquisa Retratos da Leitura no Brasil, 53% dos brasileiros não são leitores, ou seja, em muitas casas ninguém tem o costume de ler.'],
          ['lobato','O escritor Monteiro Lobato afirmou que “um país se faz com homens e livros”, mas muitas famílias ainda vivem longe dos livros.'],
          ['cf','A Constituição Federal de 1988 diz que a educação é dever do Estado e da família, por isso a família também precisa incentivar a leitura.'],
          ['freire','O educador Paulo Freire afirmou que “a leitura do mundo precede a leitura da palavra”, e essa leitura do mundo começa dentro de casa.']],
   fecha:['a falta de leitura passa de pais para filhos.','muitas crianças chegam à escola sem nenhum interesse pelos livros.','o hábito de ler não nasce dentro de casa.']},
  {id:'escola',nome:'Leitura só por obrigação',desc:'Quando o aluno só lê para fazer prova, ele vê a leitura como castigo, e não como prazer.',
   tese:'à leitura vista apenas como obrigação escolar',por:'pela leitura vista apenas como obrigação escolar',nom:'a leitura vista apenas como obrigação escolar',
   topico:['a leitura tratada apenas como obrigação afasta os jovens dos livros.','muitos alunos só leem quando são obrigados.','a escola nem sempre consegue mostrar que ler pode ser prazeroso.'],
   explica:['os alunos leem só para fazer prova, sem poder escolher livros de que gostam.','muitos livros escolhidos não têm ligação com a vida dos estudantes.','a leitura vira uma tarefa chata, e não um momento de prazer.'],
   prova:[['freire','O educador Paulo Freire afirmou que “a leitura do mundo precede a leitura da palavra”, ou seja, a leitura precisa ter sentido na vida do estudante.'],
          ['queda','Segundo a pesquisa Retratos da Leitura no Brasil, os leitores eram 55% da população em 2007 e hoje são apenas 47%.'],
          ['cf','A Constituição Federal de 1988 diz que a educação deve buscar o pleno desenvolvimento da pessoa, e isso inclui o gosto pela leitura.'],
          ['funcional','Segundo a Unesco, o analfabeto funcional até reconhece letras, mas não consegue interpretar textos simples, e a escola precisa enfrentar esse problema.']],
   fecha:['muitos estudantes terminam a escola sem gostar de ler.','os jovens passam a ver o livro como um castigo.','a escola perde a chance de formar leitores para a vida toda.']},
  {id:'desigualdade',nome:'Desigualdade social',desc:'Quem precisa trabalhar cedo ou vive com pouco dinheiro tem menos tempo e menos acesso aos livros.',
   tese:'à desigualdade social',por:'pela desigualdade social',nom:'a desigualdade social',
   topico:['a desigualdade social impede que todos tenham as mesmas chances de ler.','a pobreza afasta muitos brasileiros dos livros.','nem todos os brasileiros têm as mesmas oportunidades de se tornar leitores.'],
   explica:['muitos jovens precisam trabalhar cedo para ajudar a família e não têm tempo para ler.','quem vive com pouco dinheiro precisa gastar com comida e contas, e não com livros.','as regiões mais pobres costumam ter menos bibliotecas e menos livros nas escolas.'],
   prova:[['cf','A Constituição Federal de 1988 garante que a educação é direito de todos, mas essa garantia ainda não chega igualmente a todos os brasileiros.'],
          ['funcional','Segundo a Unesco, o analfabeto funcional até reconhece letras e números, mas não consegue interpretar textos simples, o que afeta a cidadania.'],
          ['r53','Segundo a pesquisa Retratos da Leitura no Brasil, 53% dos brasileiros não são leitores.'],
          ['lei','A Lei nº 12.244, de 2010, determina que todas as escolas do país tenham biblioteca, mas essa garantia ainda não chega a todos os estudantes.']],
   fecha:['a leitura acaba virando um privilégio de poucos.','a desigualdade continua passando de uma geração para outra.','muitos brasileiros perdem oportunidades de estudo e de trabalho.']}
];

/* abertura: a frase famosa/lei pede ideia contrária; o dado pede explicação */
const ABERTURAS = [{id:'lobato',tipo:'contraste'},{id:'cf',tipo:'contraste'},{id:'r53',tipo:'dado'},{id:'freire',tipo:'contraste'}];
const PONTE = {
  contraste:['o Brasil ainda está longe dessa realidade, já que muitas pessoas não têm o hábito de ler.','essa ideia ainda não é realidade no Brasil, pois mais da metade da população não é leitora.','muitos brasileiros ainda vivem longe dos livros e da leitura.'],
  dado:['formar leitores ainda é um grande desafio no país.','a leitura ainda não faz parte da vida de muitos brasileiros.','o Brasil precisa dar mais atenção à formação de leitores.']
};

/* palavras de ligação: as certas (ok) e as pegadinhas, com a dica de cada uma */
const CON = {
  d1:[{t:'Portanto,',d:'“Portanto” serve para concluir. Aqui você está começando o 1º argumento.'},{t:'Em primeiro lugar,',ok:1},{t:'Além disso,',d:'“Além disso” junta uma ideia nova. Guarde para o 2º argumento.'},{t:'Primeiramente,',ok:1}],
  d2:[{t:'Além disso,',ok:1},{t:'Em primeiro lugar,',d:'Este já é o 2º argumento. “Em primeiro lugar” foi no 1º.'},{t:'Somado a isso,',ok:1},{t:'Portanto,',d:'“Portanto” serve para concluir. Ainda não é a hora.'}],
  explica:[{t:'Em suma,',d:'“Em suma” resume tudo no final. Aqui você precisa explicar a causa.'},{t:'Isso acontece porque',ok:1},{t:'Isso ocorre, pois',ok:1}],
  fecha:[{t:'Dessa forma,',ok:1},{t:'Em primeiro lugar,',d:'“Em primeiro lugar” começa um argumento. Aqui você está fechando o parágrafo.'},{t:'Assim,',ok:1},{t:'Como consequência,',ok:1}],
  contraste:[{t:'Além disso,',d:'“Além disso” junta uma ideia parecida. Aqui a ideia é contrária: a frase mostra como deveria ser, e o Brasil ainda não é assim.'},{t:'No entanto,',ok:1},{t:'Entretanto,',ok:1},{t:'Porém,',ok:1}],
  dado:[{t:'No entanto,',d:'“No entanto” mostra uma ideia contrária. Aqui você quer explicar o que o dado mostra.'},{t:'Esse dado mostra que',ok:1},{t:'Isso revela que',ok:1}],
  tese:[{t:'Por exemplo,',d:'“Por exemplo” apresenta um exemplo. Aqui você vai dar a sua opinião.'},{t:'Nesse contexto,',ok:1},{t:'Diante disso,',ok:1}],
  retomada:[{t:'Portanto,',ok:1},{t:'Além disso,',d:'“Além disso” junta mais um argumento. Agora é hora de concluir.'},{t:'Diante disso,',ok:1},{t:'Em suma,',ok:1}]
};

const AGENTES = [
  {t:'o Ministério da Educação',v:'deve'},
  {t:'o Governo Federal, junto com as prefeituras,',v:'deve'},
  {t:'as escolas',v:'devem'},
  {t:'a mídia (TV, rádio e internet)',v:'deve'},
  {t:'as famílias, com o apoio das escolas,',v:'devem'}
];
const ACOES = [
  {t:'criar clubes de leitura nas escolas',det:['Esses clubes poderiam acontecer uma vez por semana, com livros escolhidos pelos próprios alunos.','Nesses clubes, os alunos poderiam conversar sobre os livros e indicar leituras aos colegas.']},
  {t:'construir e ampliar bibliotecas públicas nos bairros',det:['Essas bibliotecas poderiam abrir também à noite e nos fins de semana, para atender quem trabalha.','Esses espaços poderiam oferecer atividades para as crianças, como a contação de histórias.']},
  {t:'fazer campanhas de incentivo à leitura',det:['Essas campanhas poderiam mostrar jovens contando, nas redes sociais, quais livros mudaram a vida deles.','As campanhas poderiam passar na TV e na internet, com uma linguagem próxima dos jovens.']},
  {t:'distribuir livros gratuitos para os estudantes',det:['Cada estudante poderia receber alguns livros por ano e trocá-los com os colegas em feiras na escola.','Os livros poderiam ser escolhidos pelos próprios alunos, de acordo com o gosto de cada um.']},
  {t:'criar bibliotecas digitais gratuitas',det:['Os livros poderiam ser lidos no próprio celular, sem custo, por qualquer pessoa.','Essas bibliotecas poderiam ter livros em áudio, para ajudar quem tem dificuldade de leitura.']}
];
const DET_GERAL = ['Essas ações poderiam acontecer toda semana, com a participação de toda a comunidade.','Dessa maneira, mais pessoas teriam contato com os livros desde a infância.'];
const MEIOS = ['por meio de verbas públicas','por meio de parcerias com escritores e influenciadores digitais','por meio de aulas em que os alunos escolhem o que vão ler','por meio de aplicativos de leitura gratuitos','por meio de rodas de leitura abertas à comunidade'];
const FINS = ['a fim de que os jovens criem o hábito de ler','com o objetivo de diminuir o analfabetismo funcional','para que a leitura deixe de ser um privilégio de poucos','para formar cidadãos mais críticos'];

const QUIZ = {
  tipo:{p:'Que tipo de texto você vai escrever?',ops:['Uma história com personagens','Uma carta para um amigo','Um texto que defende uma opinião com argumentos','Um poema com rimas'],c:2,
    ok:'Isso! Dissertativo-argumentativo é um texto que defende uma opinião e prova com argumentos.',
    dicas:{0:'História com personagens é narração. Aqui você precisa defender uma opinião.',1:'Carta não é o texto pedido. Volte e releia o cartão “O que escrever”.',3:'Poema não. O texto precisa defender uma opinião com argumentos.'}},
  tema:{p:'Qual destes assuntos está dentro do tema da redação?',ops:['A importância do esporte na escola','Por que muitos brasileiros não têm o hábito de ler','A história do livro no mundo','A violência nas escolas'],c:1,
    ok:'Isso! O tema fala dos problemas que impedem os brasileiros de se tornarem leitores.',
    dicas:{0:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!',2:'Fala de livros, mas não dos leitores no Brasil. Isso é passar perto do tema sem entrar nele (tangenciar), e perde muitos pontos.',3:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!'}},
  final:{p:'O que precisa aparecer no último parágrafo?',ops:['Uma solução para o problema','Uma piada para animar quem lê','Seu nome e sua assinatura','Uma pergunta sem resposta'],c:0,
    ok:'Isso! Essa solução se chama proposta de intervenção e precisa respeitar os direitos humanos.',
    dicas:{1:'Piada não combina com um texto formal.',2:'Cuidado! No ENEM, redação com nome ou assinatura vale zero.',3:'O final precisa resolver o problema, não deixar dúvidas.'}},
  naoleitores:{p:'Segundo o texto, quantos brasileiros NÃO são leitores?',ops:['8%','47%','53%','55%'],c:2,
    ok:'Isso! Mais da metade da população: 53%.',
    dicas:{0:'8 é a diferença entre 2007 e hoje (55 − 47).',1:'47% é quem LÊ. A pergunta quer saber quem NÃO lê.',3:'55% eram os leitores em 2007.'}},
  queda:{p:'De 2007 até hoje, o número de leitores no Brasil…',ops:['aumentou','diminuiu','ficou igual'],c:1,
    ok:'Isso! Caiu de 55% para 47% da população.',dica:'Compare os números: em 2007 eram 55%. Hoje são 47%.'},
  funcional:{p:'O que é analfabetismo funcional?',ops:['Não conhecer nenhuma letra','Conhecer letras e números, mas não conseguir entender textos simples','Ler muitos livros por ano','Ter a letra difícil de entender'],c:1,
    ok:'Isso! A pessoa até lê as palavras, mas não entende o que leu.',dica:'Releia o último parágrafo do texto. A Unesco explica o que é.'},
  conectivo:{p:'Você vai começar o 2º argumento. Qual expressão mostra que você vai ACRESCENTAR uma ideia?',ops:['Portanto','Além disso','Mas','Porque'],c:1,
    ok:'Isso! “Além disso” junta uma ideia nova à anterior.',
    dicas:{0:'“Portanto” serve para concluir. Guarde para o último parágrafo.',2:'“Mas” mostra uma ideia contrária.',3:'“Porque” explica uma causa.'}},
  dh:{p:'Qual destas soluções NÃO pode aparecer na redação, porque desrespeita os direitos humanos?',ops:['Criar bibliotecas nos bairros','Prender os pais que não leem para os filhos','Fazer clubes de leitura nas escolas','Distribuir livros de graça'],c:1,
    ok:'Isso! Prender ou castigar pessoas desrespeita os direitos humanos. A solução deve ajudar, não punir.',dica:'Essa solução ajuda as pessoas. Procure a que castiga alguém.'},
  portanto:{p:'Qual palavra é boa para começar a conclusão?',ops:['Em primeiro lugar','Além disso','Portanto','Porque'],c:2,
    ok:'Isso! “Portanto” mostra que você está concluindo.',
    dicas:{0:'“Em primeiro lugar” abre o 1º argumento.',1:'“Além disso” junta mais um argumento.',3:'“Porque” explica uma causa.'}}
};

const GLOSS = {
  declinio:['Declínio','queda, diminuição.'],
  habito:['Hábito','costume; algo que a pessoa faz sempre.'],
  naoleitores:['Não leitores','pessoas que não leram nenhum livro nos últimos 3 meses.'],
  pontos:['Pontos percentuais','a diferença entre duas porcentagens. De 55% para 47%, a queda é de 8 pontos.'],
  concentracao:['Concentração','conseguir prestar atenção em uma coisa só por um tempo.'],
  compreensao:['Compreensão','entender o sentido do que leu.'],
  funcional:['Analfabetismo funcional','quando a pessoa reconhece letras e números, mas não entende textos simples.'],
  unesco:['Unesco','órgão da ONU que cuida da educação, da ciência e da cultura no mundo.'],
  interpretar:['Interpretar','entender e explicar o sentido de um texto.'],
  cotidiano:['Cotidiano','o dia a dia.'],
  cidadania:['Cidadania','viver em sociedade, com direitos e deveres.']
};

const FASES = [
  {id:'missao',titulo:'Entender a missão',sub:'O que a prova pede',unlock:['lobato','freire','cf'],
   steps:[{t:'proposta'},{t:'info',k:'missao'},{t:'quiz',q:'tipo'},{t:'quiz',q:'tema'},{t:'quiz',q:'final'},{t:'reward'}]},
  {id:'texto',titulo:'Ler o texto de apoio',sub:'Pegar dados para usar',unlock:['r53','queda','funcional'],
   steps:[{t:'read'},{t:'quiz',q:'naoleitores'},{t:'quiz',q:'queda'},{t:'quiz',q:'funcional'},{t:'reward'}]},
  {id:'causas',titulo:'Escolher os argumentos',sub:'Os 2 motivos do problema',unlock:['lei'],
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
  id: 'leitores', serie: '2', ordem: 1, rotulo: 'Texto 1',
  tipo: 'dissertativo', genero: 'Dissertativo-argumentativo',
  tema: 'Os desafios para a formação de leitores no Brasil',
  temaRotulo: 'Tema da redação',
  obra: 'redação', obraGenero: 'f',
  folhaTitulo: 'Folha de redação', folhaCabecalho: 'Redação · ENEM treineiro',
  lead: 'Você vai montar uma redação do ENEM jogando. Cada escolha sua vira um pedaço do texto, e cada acerto vale XP.',
  trilhaTip: '7 fases. As 3 primeiras preparam você. Nas 4 últimas, você monta os 4 parágrafos da redação.',
  proposta: {
    contexto: 'Você está prestando o 1º dia do Exame Nacional do Ensino Médio (ENEM) como treineiro, e está na hora de fazer a redação. Esta é a primeira ação a ser realizada no dia da prova, enquanto a cabeça está “fresca”. Leia a proposta completa com atenção. Fique atento aos textos motivadores, lendo-os mais de uma vez, e elabore seu texto.',
    comando: 'A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema “Os desafios para a formação de leitores no Brasil”, apresentando proposta de intervenção que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para defesa de seu ponto de vista.'
  },
  textos: [{
    rotulo: 'Texto de apoio 1',
    html: `
    <h3>Cultura da leitura em [[declinio|declínio]] e o avanço do [[funcional|analfabetismo funcional]] no Brasil</h3>
    <p>O [[habito|hábito]] da leitura entre os brasileiros está em queda. Em um país com mais de 200 milhões de habitantes, o número de [[naoleitores|não leitores]] representa 53% da população. O dado desperta preocupação na Semana Nacional do Livro e da Biblioteca, celebrada entre quinta (23) e quarta-feira (29).</p>
    <p>Hoje, o Brasil tem cerca de 93,4 milhões de leitores — quem leu ao menos um livro nos três meses anteriores —, que correspondem a 47% da população.</p>
    <p>O número é oito [[pontos|pontos percentuais]] menor do que o registrado em 2007, quando os leitores eram 55% dos brasileiros, segundo a sexta edição da pesquisa Retratos da Leitura no Brasil, do Instituto Pró-Livro e Ministério da Cultura.</p>
    <p>A queda, no entanto, não é apenas percentual. O estudo também aponta para uma diminuição da capacidade de [[concentracao|concentração]] e [[compreensao|compreensão]], acendendo um alerta sobre o avanço do chamado [[funcional|analfabetismo funcional]]. A condição, segundo a Organização das Nações Unidas para a Educação, a Ciência e a Cultura ([[unesco|Unesco]]), abrange pessoas que até reconhecem letras e números, mas não conseguem [[interpretar|interpretar]] textos simples e usar a leitura e a escrita no [[cotidiano|cotidiano]], o que afeta o desenvolvimento pessoal e a plena [[cidadania|cidadania]].</p>
    <p class="fonte">Disponível em: <a href="https://www12.senado.leg.br/noticias/infomaterias/2025/10/cultura-da-leitura-em-declinio-e-o-avanco-do-analfabetismo-funcional-no-brasil" target="_blank" rel="noopener">www12.senado.leg.br/noticias/infomaterias/2025/10/cultura-da-leitura-em-declinio-e-o-avanco-do-analfabetismo-funcional-no-brasil</a>. Acesso em: 20 ago. 2026. Adaptado.</p>`,
    facil: `
    <h3>O texto em 5 frases</h3>
    <ul class="facil">
      <li>Mais da metade dos brasileiros (<b>53%</b>) não é leitora.</li>
      <li>Na pesquisa, <b>leitor</b> é quem leu pelo menos 1 livro nos últimos 3 meses.</li>
      <li>Em 2007, <b>55%</b> eram leitores. Hoje, são só <b>47%</b>. O número caiu.</li>
      <li>As pessoas estão com <b>mais dificuldade de se concentrar</b> e de entender o que leem.</li>
      <li>Isso faz crescer o <b>analfabetismo funcional</b>: a pessoa conhece as letras, mas não entende um texto simples.</li>
    </ul>`
  }],
  rep: REP, repOrdem: REP_ORDER, causas: CAUSAS, aberturas: ABERTURAS, ponte: PONTE,
  ponteRep: { contraste: { 1: 'r53' } },
  con: CON, agentes: AGENTES, acoes: ACOES, detGeral: DET_GERAL, meios: MEIOS, fins: FINS,
  quiz: QUIZ, gloss: GLOSS, fases: FASES,
  causasPergunta: 'Por que é difícil formar leitores no Brasil?',
  teses: [
    (a, b) => `os desafios para a formação de leitores no Brasil estão ligados, principalmente, ${a.tese} e ${b.tese}.`,
    (a, b) => `a formação de leitores no Brasil é prejudicada, principalmente, ${a.por} e ${b.por}.`,
    (a, b) => `dois fatores dificultam a formação de leitores no Brasil: ${a.nom} e ${b.nom}.`
  ],
  retomadas: (a, b) => ['fica claro que o Brasil ainda precisa avançar muito na formação de leitores.', 'é necessário enfrentar os problemas que afastam os brasileiros da leitura.', `${a.nom} e ${b.nom} precisam ser enfrentados para que o Brasil tenha mais leitores.`],
  info: {
    temaCard: '<p><b>Desafios</b> = problemas, dificuldades.<br><b>Formação de leitores</b> = fazer as pessoas lerem e gostarem de ler.</p><p class="exmini">A pergunta do tema é: <b>por que é difícil fazer os brasileiros lerem?</b></p>',
    argumentoExemplo: { opiniao: 'formar leitores no Brasil é difícil.', argumento: 'porque muitos bairros não têm biblioteca.' },
    introExemplo: 'O escritor Monteiro Lobato afirmou que “um país se faz com homens e livros”. No entanto, o Brasil ainda está longe dessa ideia, já que muitas pessoas não têm o hábito de ler. Nesse contexto, os desafios para a formação de leitores no Brasil estão ligados, principalmente, ao uso exagerado das redes sociais e à falta de acesso aos livros.',
    solucaoExemplos: { agente: 'o Ministério da Educação', acao: 'criar clubes de leitura', meio: 'por meio de verbas públicas', fim: 'a fim de que os jovens leiam mais' }
  },
  checagem: {
    temaRegex: /leitor|leitura|\bler\b|livro/i,
    temaDica: 'Use as palavras “leitura” ou “leitores” já no 1º parágrafo.',
    repRegex: /retratos da leitura|constitui[cç][aã]o|lobato|freire|unesco|12\.244|\d+(,\d+)?\s?%/i
  }
});
})();
