/* Missão Redação · atividade da 3ª Série, Texto 1 (dissertativo-argumentativo).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';
const REP = {
  cf225:{tipo:'Lei',titulo:'Constituição Federal de 1988',resumo:'O artigo 225 diz que todos têm direito a um meio ambiente saudável e equilibrado.',frase:'A Constituição Federal de 1988, no artigo 225, afirma que todos têm direito ao meio ambiente ecologicamente equilibrado.'},
  paris:{tipo:'Acordo internacional',titulo:'Acordo de Paris (2015)',resumo:'Quase todos os países do mundo, inclusive o Brasil, se comprometeram a combater o aquecimento global.',frase:'No Acordo de Paris, de 2015, quase todos os países, inclusive o Brasil, se comprometeram a combater o aquecimento global.'},
  ods13:{tipo:'Meta da ONU',titulo:'Agenda 2030 da ONU (ODS 13)',resumo:'O Objetivo de Desenvolvimento Sustentável 13 pede ação contra a mudança do clima.',frase:'A Agenda 2030 da ONU, no ODS 13, pede medidas urgentes para combater a mudança do clima e os seus impactos.'},
  pobres80:{tipo:'Dado do texto de apoio',titulo:'887 milhões de pobres em risco',resumo:'Quase 80% dos pobres do mundo vivem em lugares com pelo menos um risco do clima.',frase:'Segundo o PNUD e a Universidade de Oxford, 887 milhões de pessoas pobres, quase 80% da população pobre do mundo, vivem em regiões expostas a pelo menos um risco climático.'},
  riscos651:{tipo:'Dado do texto de apoio',titulo:'651 milhões com 2 riscos ou mais',resumo:'651 milhões de pessoas pobres enfrentam dois ou mais riscos do clima ao mesmo tempo.',frase:'Segundo o PNUD, 651 milhões de pessoas pobres no mundo enfrentam dois ou mais riscos climáticos ao mesmo tempo.'},
  ipcc:{tipo:'Dado do texto de apoio',titulo:'IPCC: eventos mais fortes',resumo:'Os eventos extremos estão mais frequentes e mais intensos, e parte dos danos já não tem volta.',frase:'Segundo o Painel Intergovernamental sobre Mudanças Climáticas (IPCC), os eventos climáticos extremos estão cada vez mais frequentes e intensos, e parte dos danos aos ecossistemas já é irreversível.'},
  d460:{tipo:'Dado do texto de apoio',titulo:'460% mais desastres',resumo:'O número de desastres climáticos no Brasil aumentou 460% em relação aos anos 1990.',frase:'Segundo a Aliança Brasileira pela Cultura Oceânica, o número de desastres climáticos no Brasil aumentou 460% em relação aos anos 1990.'},
  fav60:{tipo:'Dado do texto de apoio',titulo:'60% das favelas sem proteção',resumo:'60% das favelas não têm obras de contenção para desastres ambientais.',frase:'Segundo a organização TETO Brasil, 60% das favelas não possuem obras de contenção para desastres ambientais.'},
  perigo60:{tipo:'Dado do texto de apoio',titulo:'60% se sentem em perigo',resumo:'60% dos moradores das comunidades se sentem em perigo quando há tempestades e chuvas.',frase:'Segundo a organização TETO Brasil, 60% das pessoas que vivem nas comunidades consideram estar em perigo no caso de tempestades e chuvas.'},
  lei12187:{tipo:'Lei',titulo:'Lei nº 12.187/2009',resumo:'Criou a Política Nacional sobre Mudança do Clima: menos gases que aquecem o planeta e adaptação ao novo clima.',frase:'A Lei nº 12.187, de 2009, criou a Política Nacional sobre Mudança do Clima, que prevê a redução dos gases que aquecem o planeta e a adaptação do país ao novo clima.'}
};
const REP_ORDER = ['cf225','paris','ods13','pobres80','riscos651','ipcc','d460','fav60','perigo60','lei12187'];

const CAUSAS = [
  {id:'desigualdade',nome:'Pobreza e desigualdade',desc:'Quem tem pouco dinheiro tem menos como se proteger do calor, da seca e da enchente, e demora mais para se recuperar.',
   tese:'à desigualdade social',por:'pela desigualdade social',nom:'a desigualdade social',
   topico:['a desigualdade social deixa os mais pobres sem defesa contra os riscos do clima.','a pobreza torna milhões de brasileiros mais vulneráveis ao clima extremo.','os efeitos das mudanças climáticas não atingem ricos e pobres da mesma forma.'],
   explica:['as famílias de baixa renda têm menos condições de se proteger do calor forte e da seca.','as famílias pobres não têm dinheiro guardado para recomeçar depois de um desastre.','quem é pobre já tem menos acesso à saúde e à educação, e os eventos extremos agravam esses problemas.'],
   prova:[['pobres80','Segundo o PNUD, 887 milhões de pessoas pobres, quase 80% dos pobres do mundo, vivem em regiões expostas a pelo menos um risco climático.'],
          ['riscos651','Um relatório do PNUD mostra que 651 milhões de pessoas pobres no mundo enfrentam dois ou mais riscos climáticos ao mesmo tempo.'],
          ['cf225','A Constituição Federal de 1988 garante a todos o direito ao meio ambiente ecologicamente equilibrado, mas esse direito ainda depende da renda de cada um.'],
          ['perigo60','De acordo com a organização TETO Brasil, 60% das pessoas que vivem nas comunidades consideram estar em perigo no caso de tempestades e chuvas.']],
   fecha:['as diferenças sociais no país ficam ainda maiores.','as perdas se acumulam, e sair da pobreza fica mais difícil.','a injustiça climática se torna cada vez maior no país.']},
  {id:'moradia',nome:'Casas em áreas de risco',desc:'Muitas famílias pobres moram em morros e perto de rios, onde a chuva forte causa deslizamentos e enchentes.',
   tese:'à moradia em áreas de risco',por:'pela moradia em áreas de risco',nom:'a moradia em áreas de risco',
   topico:['muitas famílias pobres não têm outra opção a não ser viver em áreas de risco.','a falta de moradia segura ameaça a vida de muitas famílias.','muitas casas ficam em morros e na beira de rios, onde há risco de deslizamentos e enchentes.'],
   explica:['os terrenos seguros custam caro, e quem ganha pouco acaba construindo onde consegue.','as cidades cresceram sem planejamento e empurraram os mais pobres para regiões inseguras.','os programas de moradia popular ainda não atendem a todos os que precisam.'],
   prova:[['fav60','Segundo a organização TETO Brasil, 60% das favelas não possuem obras de contenção para desastres ambientais.'],
          ['perigo60','De acordo com a organização TETO Brasil, 60% das pessoas que vivem nas comunidades consideram estar em perigo no caso de tempestades e chuvas.'],
          ['cf225','A Constituição Federal de 1988 garante a todos o direito ao meio ambiente ecologicamente equilibrado, mas muitas favelas ainda estão longe disso.'],
          ['d460','Segundo a Aliança Brasileira pela Cultura Oceânica, o número de desastres climáticos no Brasil aumentou 460% em relação aos anos 1990.']],
   fecha:['nas chuvas fortes, muitas famílias perdem a casa e tudo o que têm.','os desastres atingem com mais força os bairros mais pobres.','muitos moradores ficam desabrigados, ou seja, sem ter onde morar.']},
  {id:'prevencao',nome:'Pouca prevenção do governo',desc:'Muitas vezes, o governo só age depois da tragédia. Faltam obras e planos para proteger as pessoas antes.',
   tese:'à pouca prevenção do governo',por:'pela pouca prevenção do governo',nom:'a pouca prevenção do governo',
   topico:['o poder público ainda investe pouco para evitar os desastres climáticos.','muitas vezes, o governo só age depois que o estrago já foi feito.','faltam ações do poder público que preparem o país para o clima extremo.'],
   explica:['a prevenção nem sempre é tratada como prioridade pelos governantes.','muitas prefeituras não têm técnicos nem dinheiro para planejar e fazer as obras necessárias.','muitos governantes pensam só nos problemas de hoje, e não nos riscos dos próximos anos.'],
   prova:[['lei12187','A Lei nº 12.187, de 2009, prevê medidas para adaptar o país às mudanças do clima, mas essas medidas ainda não chegam a todos.'],
          ['ipcc','Segundo o IPCC, os eventos climáticos extremos estão cada vez mais frequentes e intensos, mas a prevenção no Brasil não cresce no mesmo ritmo.'],
          ['d460','Segundo a Aliança Brasileira pela Cultura Oceânica, o número de desastres climáticos no Brasil aumentou 460% em relação aos anos 1990.'],
          ['fav60','Segundo a organização TETO Brasil, 60% das favelas não possuem obras de contenção para desastres ambientais.']],
   fecha:['muitas tragédias que poderiam ser evitadas continuam acontecendo.','os mais pobres continuam sendo as maiores vítimas.','as mesmas tragédias se repetem ano após ano.']},
  {id:'informacao',nome:'Falta de informação',desc:'Muita gente não sabe o que são as mudanças do clima nem o que fazer quando chega um alerta de perigo.',
   tese:'à falta de informação sobre o clima',por:'pela falta de informação sobre o clima',nom:'a falta de informação sobre o clima',
   topico:['a falta de informação deixa muitos brasileiros despreparados para o clima extremo.','muitos brasileiros não sabem como agir em caso de enchente, deslizamento ou seca.','grande parte da população ainda conhece pouco sobre os riscos do clima.'],
   explica:['muitas famílias nunca aprenderam o que fazer quando chega um alerta de perigo.','a educação ambiental ainda não é prioridade nas escolas.','muitas pessoas acham que o problema do clima está longe e não vai chegar até elas.'],
   prova:[['cf225','A Constituição Federal de 1988, no artigo 225, obriga o poder público a promover a educação ambiental em todos os níveis de ensino, mas isso nem sempre acontece.'],
          ['ods13','Uma das metas do ODS 13, da Agenda 2030 da ONU, é melhorar a educação sobre a mudança do clima, mas isso ainda não acontece em todo o Brasil.'],
          ['ipcc','Segundo o IPCC, os eventos climáticos extremos estão cada vez mais frequentes e intensos, por isso quem não conhece esses riscos corre mais perigo.'],
          ['d460','Segundo a Aliança Brasileira pela Cultura Oceânica, o número de desastres climáticos no Brasil aumentou 460% em relação aos anos 1990, mas a informação ainda não chega a todos.']],
   fecha:['o perigo só é percebido quando já é tarde demais.','fica mais difícil cobrar proteção do governo.','muitas vidas que poderiam ser salvas acabam perdidas.']},
  {id:'ambiente',nome:'Desmatamento e poluição',desc:'Derrubar florestas e soltar gases poluentes no ar esquenta o planeta e deixa os eventos extremos mais fortes.',
   tese:'à destruição do meio ambiente',por:'pela destruição do meio ambiente',nom:'a destruição do meio ambiente',
   topico:['a destruição do meio ambiente torna as mudanças climáticas ainda mais graves.','o desmatamento e a poluição agravam o aquecimento do planeta.','a destruição das florestas deixa o clima mais instável.'],
   explica:['as queimadas, os carros e as fábricas lançam no ar gases que prendem o calor na Terra.','as árvores ajudam a regular a temperatura e as chuvas, e o corte delas enfraquece essa proteção.','o desmatamento é responsável por grande parte dos gases que o Brasil lança no ar.'],
   prova:[['paris','No Acordo de Paris, de 2015, o Brasil assumiu o compromisso de combater o aquecimento global, mas muitas florestas do país continuam sendo destruídas.'],
          ['ipcc','Segundo o IPCC, os eventos climáticos extremos estão cada vez mais frequentes e intensos, e parte dos danos aos ecossistemas já é irreversível.'],
          ['lei12187','A Lei nº 12.187, de 2009, que criou a Política Nacional sobre Mudança do Clima, prevê reduzir os gases que aquecem o planeta, mas o desmatamento continua.'],
          ['ods13','A Agenda 2030 da ONU, no ODS 13, pede medidas urgentes para combater a mudança do clima e os seus impactos, mas a destruição da natureza continua.']],
   fecha:['a vida no campo e nas cidades se torna mais difícil.','os mais pobres, que menos poluem, são os que mais sofrem.','as próximas gerações vão herdar um mundo mais quente e perigoso.']}
];

/* abertura: a lei e o acordo pedem ideia contrária; o dado pede explicação */
const ABERTURAS = [{id:'cf225',tipo:'contraste'},{id:'paris',tipo:'contraste'},{id:'d460',tipo:'dado'},{id:'fav60',tipo:'dado'}];
const PONTE = {
  contraste:['na prática, muitos brasileiros ainda vivem desprotegidos diante de enchentes, secas e ondas de calor.','os desastres causados pelo clima já são uma realidade em muitas regiões brasileiras.','segundo a Aliança Brasileira pela Cultura Oceânica, o número de desastres climáticos no país aumentou 460% em relação aos anos 1990.'],
  dado:['o país precisa se preparar melhor para enfrentar os eventos climáticos extremos.','o clima extremo já é uma ameaça real para milhões de brasileiros.','proteger a população dos desastres do clima ainda é uma tarefa difícil no país.']
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

/* proposta de intervenção: todo agente pode fazer toda ação, com todo meio e todo fim */
const AGENTES = [
  {t:'o Governo Federal',v:'deve'},
  {t:'o Governo Federal, junto com os estados e os municípios,',v:'deve'},
  {t:'os governos estaduais',v:'devem'},
  {t:'as prefeituras',v:'devem'},
  {t:'o poder público',v:'deve'}
];
const ACOES = [
  {t:'construir obras de contenção nas áreas de risco',det:['Essas obras poderiam incluir muros para segurar a terra dos morros e canais para levar embora a água da chuva.','As obras poderiam começar pelos bairros onde há mais famílias em perigo.']},
  {t:'ampliar os sistemas de alerta contra enchentes e deslizamentos',det:['Os alertas poderiam chegar pelo celular, por sirenes e pelo rádio, em linguagem simples.','Cada bairro em área de risco poderia ter pontos de encontro seguros e treinamentos para os moradores.']},
  {t:'oferecer moradias seguras às famílias que vivem em áreas de risco',det:['As novas casas poderiam ficar perto do trabalho dos moradores e da escola dos filhos.','A transferência das famílias poderia ser feita com diálogo e com respeito à história de cada uma.']},
  {t:'incluir a educação climática em todas as escolas',det:['Os alunos poderiam aprender, em aulas práticas, o que fazer em caso de enchente, seca ou calor extremo.','As escolas poderiam promover rodas de conversa sobre o clima abertas a toda a comunidade.']},
  {t:'combater o desmatamento e plantar árvores nas cidades',det:['As árvores deixariam as ruas mais frescas nos dias de calor e ajudariam a água da chuva a entrar no solo.','A fiscalização poderia usar imagens de satélite para encontrar as áreas desmatadas de forma ilegal.']}
];
const DET_GERAL = ['Essas medidas poderiam começar pelas regiões mais pobres e mais atingidas pelos desastres.','Dessa maneira, a proteção contra o clima extremo chegaria a todos os brasileiros.'];
const MEIOS = ['por meio de verbas públicas','por meio de parcerias com universidades','por meio de um plano com metas e prazos','com o apoio de empresas e organizações sociais','com a participação dos próprios moradores'];
const FINS = ['a fim de salvar vidas','para que os mais pobres deixem de ser os que mais sofrem com o clima','com o objetivo de reduzir as perdas causadas pelo clima','para que as cidades e o campo resistam melhor ao clima extremo'];

const QUIZ = {
  tipo:{p:'Que tipo de texto você vai escrever?',ops:['Uma história com personagens','Uma carta para um amigo','Um texto que defende uma opinião com argumentos','Um poema com rimas'],c:2,
    ok:'Isso! Dissertativo-argumentativo é um texto que defende uma opinião e prova com argumentos.',
    dicas:{0:'História com personagens é narração. Aqui você precisa defender uma opinião.',1:'Carta não é o texto pedido. Volte e releia o cartão “O que escrever”.',3:'Poema não. O texto precisa defender uma opinião com argumentos.'}},
  tema:{p:'Qual destes assuntos está dentro do tema da redação?',ops:['Como funciona a previsão do tempo','Por que os mais pobres sofrem mais com enchentes, secas e calor no Brasil','A importância do esporte na escola','A história do futebol brasileiro'],c:1,
    ok:'Isso! O tema fala do que impede que todos os brasileiros sejam protegidos do clima de forma justa.',
    dicas:{0:'Fala do tempo, mas não da justiça climática. Isso é passar perto do tema sem entrar nele (tangenciar), e perde muitos pontos.',2:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!',3:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!'}},
  final:{p:'O que precisa aparecer no último parágrafo?',ops:['Uma solução para o problema','Uma piada para animar quem lê','Seu nome e sua assinatura','Uma pergunta sem resposta'],c:0,
    ok:'Isso! Essa solução se chama proposta de intervenção e precisa respeitar os direitos humanos.',
    dicas:{1:'Piada não combina com um texto formal.',2:'Cuidado! No ENEM, redação com nome ou assinatura vale zero.',3:'O final precisa resolver o problema, não deixar dúvidas.'}},
  oitenta:{p:'O texto de apoio 1 diz que quase 80% dos pobres do mundo vivem em regiões expostas a riscos do clima. Isso quer dizer que…',ops:['quase 8 em cada 10 pessoas pobres vivem nessa situação','quase 8 em cada 100 pessoas pobres vivem nessa situação','só os pobres da Ásia e da África vivem nessa situação'],c:0,
    ok:'Isso! 80% quer dizer 80 em cada 100, ou seja, 8 em cada 10. O texto fala em quase 80%: são 887 milhões de pessoas pobres.',
    dicas:{1:'Cuidado: 80% quer dizer 80 em cada 100, ou seja, 8 em cada 10.',2:'O texto diz que os impactos se concentram no Sul da Ásia e na África Subsaariana, mas os 80% falam dos pobres do mundo todo.'}},
  piora:{p:'O texto de apoio 1 diz que a pobreza “não é apenas um problema econômico”. O que as mudanças do clima pioram na vida dos mais pobres?',ops:['A saúde, a educação e as condições de vida','Só o salário das pessoas','Nada, porque o clima atinge todos do mesmo jeito'],c:0,
    ok:'Isso! As mudanças do clima agravam os problemas de saúde, de educação e de condições de vida. Por isso, os pobres ficam ainda mais vulneráveis.',
    dicas:{1:'O texto diz que a pobreza NÃO é só um problema de dinheiro. Releia o 2º parágrafo.',2:'O texto mostra o contrário: os mais pobres sofrem mais. Releia o 2º parágrafo.'}},
  desigual:{p:'Segundo o texto de apoio 2, as mudanças climáticas atingem todas as pessoas da mesma forma?',ops:['Sim, todos sofrem igual','Não, as pessoas mais pobres e vulneráveis sofrem mais','Não, as pessoas mais ricas sofrem mais'],c:1,
    ok:'Isso! Os mais vulneráveis sofrem mais, e a desigualdade aumenta. A justiça climática quer corrigir isso.',
    dicas:{0:'Releia a 1ª frase: os impactos “não atingem todas as pessoas da mesma forma”.',2:'Releia: quem sofre mais são as “populações em situação de vulnerabilidade”, ou seja, as mais pobres e desprotegidas.'}},
  favelas:{p:'Segundo os dados do texto de apoio 2, qual frase está certa?',ops:['Os desastres climáticos no Brasil diminuíram em relação aos anos 1990.','60% das favelas não têm obras de contenção para desastres.','Todas as favelas têm obras de contenção para desastres.'],c:1,
    ok:'Isso! Mais da metade das favelas (60%) não tem obras que seguram a terra e a água. Por isso, quem mora lá corre mais perigo.',
    dicas:{0:'Pelo contrário: o número de desastres aumentou 460%. Releia o 1º dado.',2:'Releia o 2º dado: 60% das favelas NÃO têm essas obras.'}},
  dh:{p:'Qual destas soluções NÃO pode aparecer na redação, porque desrespeita os direitos humanos?',ops:['Construir obras de contenção nos morros','Expulsar à força as famílias das áreas de risco, sem dar outra casa para elas','Enviar alertas de enchente pelo celular','Plantar árvores nas cidades'],c:1,
    ok:'Isso! Tirar as famílias de casa à força, sem oferecer outro lugar para morar, desrespeita os direitos humanos. A solução deve proteger as pessoas, e não castigá-las.',dica:'Essa solução protege as pessoas. Procure a que machuca ou castiga alguém.'}
};

const GLOSS = {
  multidimensional:['Pobreza multidimensional','pobreza que não é só falta de dinheiro: falta também saúde, educação e boas condições de vida, como água, luz e moradia.'],
  expostas:['Expostas','que estão sem proteção diante de um perigo.'],
  risco:['Risco climático','perigo causado pelo clima, como calor forte, enchente, seca ou ar poluído.'],
  inundacoes:['Inundações','enchentes; quando a água cobre ruas, casas e plantações.'],
  pnud:['PNUD','Programa das Nações Unidas para o Desenvolvimento. É um órgão da ONU que trabalha para diminuir a pobreza no mundo.'],
  agravam:['Agravar','piorar, deixar mais grave.'],
  vulneraveis:['Vulneráveis','mais frágeis; pessoas que são atingidas com mais facilidade por um problema.'],
  simultaneamente:['Simultaneamente','ao mesmo tempo.'],
  subsaariana:['África Subsaariana','a parte da África que fica ao sul do deserto do Saara.'],
  decadas:['Décadas','períodos de dez anos.'],
  adaptacao:['Adaptação às mudanças climáticas','preparar as cidades, o campo e as pessoas para conviver com o clima mais extremo, por exemplo, com obras contra enchentes.'],
  cooperacao:['Cooperação internacional','países trabalhando juntos e ajudando uns aos outros.'],
  vulnerabilidade:['Vulnerabilidade','quando a pessoa está mais frágil e desprotegida diante de um perigo.'],
  extremos:['Eventos extremos','fenômenos do clima muito fortes e perigosos, como tempestades, secas longas e ondas de calor.'],
  desigualdades:['Desigualdades sociais','diferenças injustas entre ricos e pobres, por exemplo, no acesso à moradia, à saúde e à educação.'],
  ipcc:['IPCC','grupo da ONU que reúne cientistas do mundo todo para estudar as mudanças do clima.'],
  fenomenos:['Fenômenos','acontecimentos da natureza, como chuvas fortes, secas e ondas de calor.'],
  ecossistemas:['Ecossistemas','os seres vivos (plantas e animais) junto com o lugar onde vivem, como uma floresta ou um rio.'],
  irreversivel:['Irreversível','que não tem volta; não dá mais para consertar.'],
  desastres:['Desastres climáticos','tragédias causadas pelo clima, como enchentes, deslizamentos de terra e secas fortes.'],
  contencao:['Obras de contenção','obras que seguram a terra dos morros e controlam a água da chuva, para evitar deslizamentos e enchentes.'],
  comunidades:['Comunidades','aqui, são as favelas e os bairros mais pobres das cidades.']
};

const FASES = [
  {id:'missao',titulo:'Entender a missão',sub:'O que a prova pede',unlock:['cf225','paris','ods13'],
   steps:[{t:'proposta'},{t:'info',k:'missao'},{t:'quiz',q:'tipo'},{t:'quiz',q:'tema'},{t:'quiz',q:'final'},{t:'reward'}]},
  {id:'texto',titulo:'Ler os textos de apoio',sub:'Pegar dados para usar',unlock:['pobres80','riscos651','ipcc','d460','fav60','perigo60'],
   steps:[{t:'read',x:0},{t:'quiz',q:'oitenta'},{t:'quiz',q:'piora'},{t:'read',x:1},{t:'quiz',q:'desigual'},{t:'quiz',q:'favelas'},{t:'reward'}]},
  {id:'causas',titulo:'Escolher os argumentos',sub:'Os 2 motivos do problema',unlock:['lei12187'],
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
  id: 'justica-climatica', serie: '3', ordem: 1, rotulo: 'Texto 1',
  tipo: 'dissertativo', genero: 'Dissertativo-argumentativo',
  tema: 'Desafios para a promoção da justiça climática no Brasil',
  temaRotulo: 'Tema da redação',
  obra: 'redação', obraGenero: 'f',
  folhaTitulo: 'Folha de redação', folhaCabecalho: 'Redação · ENEM',
  lead: 'Você vai montar uma redação do ENEM sobre justiça climática jogando. Cada escolha sua vira um pedaço do texto, e cada acerto vale XP.',
  trilhaTip: '7 fases. As 3 primeiras preparam você. Nas 4 últimas, você monta os 4 parágrafos da redação.',
  proposta: {
    contexto: 'Você está prestando o 1º dia do Exame Nacional do Ensino Médio (ENEM), e está na hora de fazer a redação. Esta é a primeira coisa que você deve fazer no dia da prova, enquanto a cabeça está “fresca”. Leia a proposta completa com atenção. Fique atento(a) aos textos motivadores, lendo-os mais de uma vez, e elabore seu texto.',
    comando: 'A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema “Desafios para a promoção da justiça climática no Brasil.”, apresentando proposta de intervenção que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para defesa de seu ponto de vista.'
  },
  textos: [{
    rotulo: 'Texto de apoio 1',
    html: `
    <h3>Pobreza e mudanças climáticas: uma relação cada vez mais intensa</h3>
    <p>Segundo o Relatório do Índice de Pobreza Multidimensional Global 2025, divulgado pelo Programa das Nações Unidas para o Desenvolvimento ([[pnud|PNUD]]) e pela Universidade de Oxford, 887 milhões de pessoas em situação de [[multidimensional|pobreza multidimensional]] vivem em regiões [[expostas|expostas]] a pelo menos um [[risco|risco climático]], como calor extremo, [[inundacoes|inundações]], secas ou poluição do ar. Isso representa quase 80% da população pobre do mundo.</p>
    <p>O estudo mostra que a pobreza não é apenas um problema econômico. Ela está diretamente ligada às mudanças climáticas, que [[agravam|agravam]] dificuldades relacionadas à saúde, à educação e às condições de vida, tornando essas populações ainda mais [[vulneraveis|vulneráveis]].</p>
    <p><b>Os impactos são desiguais e tendem a aumentar</b></p>
    <p>O relatório revela que 651 milhões de pessoas pobres enfrentam dois ou mais riscos climáticos ao mesmo tempo, enquanto 309 milhões convivem [[simultaneamente|simultaneamente]] com três ou quatro riscos, como secas, enchentes, altas temperaturas e poluição do ar.</p>
    <p>Além disso, os impactos concentram-se principalmente no Sul da Ásia e na [[subsaariana|África Subsaariana]], regiões onde a pobreza e a vulnerabilidade climática são mais intensas. Segundo o PNUD, os países com maiores índices de pobreza também devem sofrer os maiores aumentos de temperatura nas próximas [[decadas|décadas]], reforçando a necessidade de políticas que combinem redução da pobreza, [[adaptacao|adaptação]] às mudanças climáticas e [[cooperacao|cooperação internacional]].</p>
    <p class="fonte">Fonte: Programa das Nações Unidas para o Desenvolvimento (PNUD). Índice de Pobreza Multidimensional Global 2025: Dificuldades Sobrepostas – Pobreza e Riscos Climáticos, 17 out. 2025. Adaptado.<br>Disponível em: <a href="https://www.undp.org/pt/brazil/press-releases/quase-80-dos-pobres-do-mundo-vivem-em-regioes-expostas-riscos-climaticos" target="_blank" rel="noopener">https://www.undp.org/pt/brazil/press-releases/quase-80-dos-pobres-do-mundo-vivem-em-regioes-expostas-riscos-climaticos</a> Acesso em: 20 jul. 2026. Adaptado.</p>`,
    facil: `
    <h3>O texto em 6 frases</h3>
    <ul class="facil">
      <li>Um estudo do PNUD (um órgão da ONU) e da Universidade de Oxford olhou para as pessoas pobres do mundo.</li>
      <li><b>887 milhões</b> de pessoas pobres vivem em lugares com pelo menos um perigo do clima: calor forte, enchentes, secas ou ar poluído. Isso é <b>quase 80%</b> dos pobres do mundo, ou seja, quase 8 em cada 10.</li>
      <li>A pobreza não é só falta de dinheiro. As mudanças do clima pioram a <b>saúde</b>, a <b>educação</b> e as <b>condições de vida</b> dos mais pobres.</li>
      <li><b>651 milhões</b> de pessoas pobres enfrentam 2 ou mais desses perigos ao mesmo tempo. E <b>309 milhões</b> enfrentam 3 ou 4.</li>
      <li>Os problemas são maiores no <b>Sul da Ásia</b> e na <b>África</b>, ao sul do deserto do Saara.</li>
      <li>Os países mais pobres devem ser os que mais vão esquentar nas próximas décadas. Por isso, é preciso combater a pobreza, preparar as pessoas para o novo clima e fazer os países trabalharem juntos.</li>
    </ul>`
  }, {
    rotulo: 'Texto de apoio 2',
    chamada: 'Leia o texto e os dados com calma',
    html: `
    <h3>Justiça climática: por que ela é necessária?</h3>
    <p>As mudanças climáticas afetam todo o planeta, mas seus impactos não atingem todas as pessoas da mesma forma. Populações em situação de [[vulnerabilidade|vulnerabilidade]] costumam sofrer mais com enchentes, secas, ondas de calor e outros [[extremos|eventos extremos]], agravando [[desigualdades|desigualdades sociais]] já existentes.</p>
    <p>Segundo o Painel Intergovernamental sobre Mudanças Climáticas ([[ipcc|IPCC]]), esses [[fenomenos|fenômenos]] estão se tornando cada vez mais frequentes e intensos, e parte dos danos causados aos [[ecossistemas|ecossistemas]] já é [[irreversivel|irreversível]].</p>
    <p><b>Dados sobre mudanças climáticas</b></p>
    <ul class="dados">
      <li><b>460%</b>foi o aumento no número de [[desastres|desastres climáticos]] no Brasil em relação aos anos 1990. <small>Fonte: Aliança Brasileira pela Cultura Oceânica</small></li>
      <li><b>60%</b>das favelas não possuem [[contencao|obras de contenção]] para desastres ambientais. <small>Fonte: TETO Brasil</small></li>
      <li><b>60%</b>das pessoas que vivem nas [[comunidades|comunidades]] consideram estar em perigo no caso de tempestades e chuvas. <small>Fonte: TETO Brasil</small></li>
    </ul>
    <p class="fonte">Fonte: Greenpeace.org. 2026. Adaptado.<br>Disponível em: <a href="https://www.greenpeace.org/brasil/informe-se/justica-climatica/" target="_blank" rel="noopener">https://www.greenpeace.org/brasil/informe-se/justica-climatica/</a> Acesso em: 20 jul. 2026. Adaptado.</p>`,
    facil: `
    <h3>O texto em 6 frases</h3>
    <ul class="facil">
      <li>As mudanças do clima atingem o planeta todo, mas <b>não atingem todas as pessoas do mesmo jeito</b>.</li>
      <li>Os mais pobres e desprotegidos sofrem mais com enchentes, secas e ondas de calor. Assim, a <b>desigualdade</b> aumenta.</li>
      <li>O <b>IPCC</b>, grupo de cientistas da ONU, diz que esses eventos estão cada vez <b>mais frequentes e mais fortes</b>. E parte dos estragos na natureza <b>não tem mais volta</b>.</li>
      <li>No Brasil, o número de desastres do clima aumentou <b>460%</b> em comparação com os anos 1990.</li>
      <li><b>60%</b> das favelas não têm obras que seguram a terra e a água para evitar desastres.</li>
      <li><b>60%</b> dos moradores das comunidades acham que estão em perigo quando há tempestades e chuvas.</li>
    </ul>`
  }],
  rep: REP, repOrdem: REP_ORDER, causas: CAUSAS, aberturas: ABERTURAS, ponte: PONTE,
  ponteRep: { contraste: { 2: 'd460' } },
  con: CON, agentes: AGENTES, acoes: ACOES, detGeral: DET_GERAL, meios: MEIOS, fins: FINS,
  quiz: QUIZ, gloss: GLOSS, fases: FASES,
  causasPergunta: 'Por que é difícil garantir a justiça climática no Brasil?',
  teses: [
    (a, b) => `os desafios para a promoção da justiça climática no Brasil estão ligados, principalmente, ${a.tese} e ${b.tese}.`,
    (a, b) => `a promoção da justiça climática no Brasil é dificultada, principalmente, ${a.por} e ${b.por}.`,
    (a, b) => `dois fatores dificultam a promoção da justiça climática no Brasil: ${a.nom} e ${b.nom}.`
  ],
  retomadas: (a, b) => ['fica claro que o Brasil ainda precisa avançar muito na promoção da justiça climática.', 'é preciso proteger, de forma justa, todos os brasileiros dos efeitos do clima.', `${a.nom} e ${b.nom} precisam ser enfrentadas para garantir a justiça climática.`],
  info: {
    temaCard: '<p><b>Desafios</b> = dificuldades.<br><b>Promover</b> = fazer acontecer.</p><p>Os efeitos das <b>mudanças do clima</b> (enchentes, secas, calor forte) atingem com mais força as pessoas <b>mais pobres</b>, que são as que menos contribuíram para o problema.</p><p><b>Justiça climática</b> = todas as pessoas protegidas do clima de forma justa.</p><p class="exmini">A pergunta do tema é: <b>o que impede que todos os brasileiros sejam protegidos do clima de forma justa?</b></p>',
    argumentoExemplo: { opiniao: 'é difícil garantir a justiça climática no Brasil.', argumento: 'porque muitas famílias pobres moram em áreas de risco, sem proteção contra enchentes.' },
    introExemplo: 'A Constituição Federal de 1988, no artigo 225, afirma que todos têm direito ao meio ambiente ecologicamente equilibrado. No entanto, na prática, muitos brasileiros ainda vivem desprotegidos diante de enchentes, secas e ondas de calor. Nesse contexto, os desafios para a promoção da justiça climática no Brasil estão ligados, principalmente, à desigualdade social e à pouca prevenção do governo.',
    solucaoExemplos: { agente: 'as prefeituras', acao: 'construir obras de contenção', meio: 'por meio de verbas públicas', fim: 'a fim de salvar vidas' }
  },
  checagem: {
    temaRegex: /\bclima|clim[aá]tic/i,
    temaDica: 'Use as palavras “clima” ou “justiça climática” já no 1º parágrafo.',
    repRegex: /constitui[cç][aã]o|artigo 225|acordo de paris|agenda 2030|\bods\b|12\.187|pol[ií]tica nacional sobre mudan[cç]a do clima|pnud|oxford|ipcc|painel intergovernamental|alian[cç]a brasileira|teto brasil|\d+(,\d+)?\s?%|\d+\s?milh[oõ]es/i
  }
});
})();
