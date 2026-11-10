/* Missão Redação · atividade da 3ª Série, Texto 4 (dissertativo-argumentativo).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';
const REP = {
  cf:{tipo:'Lei',titulo:'Constituição Federal de 1988',resumo:'O artigo 226 diz que a família tem especial proteção do Estado. O artigo 196 diz que a saúde é direito de todos e dever do Estado.',frase:'A Constituição Federal de 1988, no artigo 226, afirma que a família, base da sociedade, tem especial proteção do Estado.'},
  lei14181:{tipo:'Lei',titulo:'Lei do Superendividamento (Lei nº 14.181/2021)',resumo:'Mudou o Código de Defesa do Consumidor para prevenir e tratar o excesso de dívidas. Também incentiva a educação financeira.',frase:'A Lei nº 14.181, de 2021, conhecida como Lei do Superendividamento, busca evitar que os consumidores devam mais do que conseguem pagar.'},
  cdc:{tipo:'Lei',titulo:'Código de Defesa do Consumidor (Lei nº 8.078/1990)',resumo:'Protege quem compra produtos e serviços. O artigo 37 proíbe a propaganda enganosa ou abusiva.',frase:'O Código de Defesa do Consumidor, de 1990, proíbe toda publicidade enganosa ou abusiva.'},
  gastos500:{tipo:'Dado do texto de apoio',titulo:'500% em três anos',resumo:'Os gastos das famílias com apostas on-line cresceram 500% em apenas três anos.',frase:'Segundo a Confederação Nacional do Comércio (CNC), os gastos das famílias com apostas on-line cresceram 500% em apenas três anos.'},
  bi30:{tipo:'Dado do texto de apoio',titulo:'Mais de R$ 30 bilhões por mês',resumo:'Em março de 2026, as famílias já gastavam mais de R$ 30 bilhões por mês com apostas on-line.',frase:'Em março de 2026, as famílias já gastavam mais de R$ 30 bilhões por mês com apostas on-line, segundo a Confederação Nacional do Comércio (CNC).'},
  substituicao:{tipo:'Conceito do texto de apoio',titulo:'Efeito substituição',resumo:'O dinheiro que antes ia para as contas essenciais agora vai para as apostas.',frase:'Segundo a CNC, o dinheiro gasto com apostas on-line antes iria para o pagamento de contas essenciais, o que a pesquisa chama de “efeito substituição”.'},
  relacao:{tipo:'Dado do texto de apoio',titulo:'Apostas e dívidas crescem juntas',resumo:'O crescimento das apostas coincide com o aumento do endividamento e da inadimplência.',frase:'De acordo com a CNC, o crescimento das apostas on-line coincide com o aumento do endividamento e da inadimplência das famílias, o que sugere uma relação direta entre os dois fenômenos.'},
  perfil:{tipo:'Dado do texto de apoio',titulo:'Quem mais se endivida',resumo:'O perfil do endividado: homens com 35 anos ou mais e famílias de baixa renda.',frase:'Segundo a CNC, o perfil do endividado está concentrado entre homens com 35 anos ou mais e famílias de baixa renda.'},
  tadros:{tipo:'Fala do texto de apoio',titulo:'José Roberto Tadros',resumo:'Presidente do Sistema CNC-Sesc-Senac. Disse que as apostas estão comprometendo a renda das famílias.',frase:'Para José Roberto Tadros, presidente do Sistema CNC-Sesc-Senac, “as apostas online estão comprometendo a renda das famílias brasileiras”.'},
  lei14790:{tipo:'Lei',titulo:'Lei nº 14.790/2023 (Lei das Bets)',resumo:'Regulamentou as apostas de quota fixa, as “bets”. Proíbe propaganda que mostre a aposta como solução para problemas financeiros.',frase:'A Lei nº 14.790, de 2023, que regulamentou as apostas de quota fixa, as chamadas “bets”, proíbe propagandas que apresentem a aposta como solução para problemas financeiros.'},
  oms:{tipo:'Classificação da OMS',titulo:'Vício em apostas é doença',resumo:'A Organização Mundial da Saúde reconhece o transtorno do jogo, o vício em apostas, como uma doença.',frase:'A Organização Mundial da Saúde (OMS) reconhece o transtorno do jogo, isto é, o vício em apostas, como uma doença.'}
};
const REP_ORDER = ['cf','lei14181','cdc','gastos500','bi30','substituicao','relacao','perfil','tadros','lei14790','oms'];

const CAUSAS = [
  {id:'publicidade',nome:'Propaganda agressiva',desc:'Há propaganda de apostas na TV, no celular, com influenciadores e até na camisa dos times de futebol. Ela mostra quem ganha, mas quase nunca quem perde.',
   tese:'à publicidade agressiva',por:'pela publicidade agressiva',nom:'a publicidade agressiva',
   topico:['a publicidade agressiva conquista novos apostadores.','a propaganda faz a aposta parecer uma diversão sem riscos.','as propagandas incentivam o público a apostar com frequência.'],
   explica:['as casas de apostas patrocinam times de futebol e aparecem o tempo todo na internet.','muitos influenciadores digitais mostram os prêmios e quase nunca falam das perdas.','muitas campanhas sugerem que basta um clique para enriquecer.'],
   prova:[['cdc','O Código de Defesa do Consumidor proíbe toda publicidade enganosa ou abusiva, mas a fiscalização ainda não consegue acompanhar tantos anúncios.'],
          ['lei14790','A Lei nº 14.790, de 2023, proíbe anúncios que apresentem a aposta como solução para problemas financeiros, mas essa ideia ainda é comum.'],
          ['tadros','Para José Roberto Tadros, presidente da CNC, “precisamos discutir os limites desse mercado, especialmente no que diz respeito à publicidade”, mas os anúncios continuam comuns.'],
          ['gastos500','Segundo a CNC, os gastos das famílias com apostas on-line cresceram 500% em apenas três anos.']],
   fecha:['a família se endivida sem perceber.','apostar entra na rotina, e logo surgem as dívidas.','apostar se torna um hábito difícil de largar.']},
  {id:'acesso',nome:'Aposta a um clique',desc:'Basta um celular e o Pix. Dá para apostar a qualquer hora e em qualquer lugar, em poucos segundos.',
   tese:'à facilidade de apostar pelo celular',por:'pela facilidade de apostar pelo celular',nom:'a facilidade de apostar pelo celular',
   topico:['a facilidade de apostar pelo celular estimula o jogo por impulso.','com o celular, apostar ficou tão fácil quanto mandar uma mensagem.','o celular deixou as apostas ao alcance da mão de qualquer um.'],
   explica:['o dinheiro sai pelo Pix em poucos segundos, e o apostador perde a noção do que já apostou.','os aplicativos funcionam dia e noite e podem enviar avisos para o usuário voltar a jogar.','é possível apostar sem sair de casa e sem pegar a fila da lotérica.'],
   prova:[['substituicao','Uma pesquisa da CNC mostra que o valor usado nas apostas antes iria para o pagamento de contas essenciais, o chamado “efeito substituição”.'],
          ['gastos500','Segundo a CNC, os gastos das famílias com apostas on-line cresceram 500% em apenas três anos.'],
          ['relacao','De acordo com a CNC, o crescimento das apostas on-line coincide com o aumento do endividamento e da inadimplência das famílias.'],
          ['tadros','Para José Roberto Tadros, presidente do Sistema CNC-Sesc-Senac, “as apostas online estão comprometendo a renda das famílias brasileiras”.']],
   fecha:['muita gente aposta mais do que pode e acaba endividada.','pequenas apostas, feitas todos os dias, geram grandes dívidas.','o prejuízo vira uma bola de neve.']},
  {id:'ilusao',nome:'Ilusão de dinheiro fácil',desc:'Quem ganha pouco e tem contas atrasadas pode ver na aposta uma saída. Mas, na maioria das vezes, perde ainda mais.',
   tese:'à ilusão do dinheiro fácil',por:'pela ilusão do dinheiro fácil',nom:'a ilusão do dinheiro fácil',
   topico:['a ilusão do dinheiro fácil leva muitos a apostar o que não podem perder.','muitos apostam na esperança de mudar de vida de uma hora para outra.','a promessa de ganhar muito engana justamente quem mais precisa de dinheiro.'],
   explica:['o aperto no orçamento torna a aposta uma tentação.','uma vitória pequena no começo dá a falsa impressão de que a sorte vai continuar.','o apostador costuma esquecer que as casas de apostas existem para ter lucro.'],
   prova:[['substituicao','Uma pesquisa da CNC mostra que o valor usado nas apostas antes iria para o pagamento de contas essenciais, o chamado “efeito substituição”.'],
          ['perfil','A CNC aponta que o perfil do endividado se concentra entre homens com 35 anos ou mais e famílias de baixa renda.'],
          ['lei14790','A Lei nº 14.790, de 2023, não permite anúncios que mostrem a aposta como solução para problemas financeiros, mas essa ideia segue seduzindo os endividados.'],
          ['tadros','Para José Roberto Tadros, presidente do Sistema CNC-Sesc-Senac, “as apostas online estão comprometendo a renda das famílias brasileiras”.']],
   fecha:['quem já vivia com dificuldade acaba ficando com ainda menos.','as dívidas aumentam, e a situação só piora.','o sonho de ficar rico se transforma em pesadelo.']},
  {id:'vicio',nome:'Vício sem tratamento',desc:'Para algumas pessoas, apostar vira uma doença: elas não conseguem parar. E muitas não sabem onde buscar ajuda.',
   tese:'ao vício em jogo',por:'pelo vício em jogo',nom:'o vício em jogo',
   topico:['o vício em apostas tira de muitas pessoas o controle do próprio dinheiro.','para alguns, a aposta começa como passatempo e termina em vício.','muitos apostadores não conseguem parar, mesmo depois de grandes perdas.'],
   explica:['cada aposta traz uma sensação de prazer que o jogador quer sentir de novo.','quem tenta recuperar o prejuízo acaba apostando mais.','esse comportamento costuma ser visto como fraqueza, e por isso o cuidado médico demora.'],
   prova:[['oms','A Organização Mundial da Saúde (OMS) reconhece o transtorno do jogo como uma doença, mas o tratamento ainda não chega a todos os que precisam.'],
          ['cf','A Constituição Federal de 1988 garante a saúde como direito de todos, mas falta informação sobre onde buscar ajuda para esse problema.'],
          ['lei14790','A Lei nº 14.790, de 2023, exige ações de prevenção ao transtorno do jogo, mas essa prevenção ainda não chega a todos.'],
          ['relacao','De acordo com a CNC, o crescimento das apostas on-line coincide com o aumento do endividamento e da inadimplência das famílias.']],
   fecha:['os parentes só descobrem as dívidas quando elas já estão enormes.','dívidas e dependência andam juntas, e todos em casa sofrem.','o sofrimento se espalha por toda a casa.']},
  {id:'educacao',nome:'Falta de educação financeira',desc:'Muita gente nunca aprendeu a organizar o dinheiro do mês, a calcular os juros ou a fugir das dívidas.',
   tese:'à falta de educação financeira',por:'pela falta de educação financeira',nom:'a falta de educação financeira',
   topico:['a falta de educação financeira deixa as pessoas sem defesa diante das apostas.','muitos brasileiros nunca aprenderam a planejar os próprios gastos.','nem todos sabem calcular quanto realmente perdem com as apostas.'],
   explica:['a escola nem sempre ensina a montar um orçamento ou a entender os juros.','o assunto dinheiro quase não é conversado dentro de muitas casas.','os pais, muitas vezes, também não tiveram essas lições e não conseguem ensinar os filhos.'],
   prova:[['lei14181','A Lei nº 14.181, de 2021, prevê ações de educação financeira para os consumidores, mas essas iniciativas ainda são pouco conhecidas.'],
          ['substituicao','Uma pesquisa da CNC mostra que o valor usado nas apostas antes iria para o pagamento de contas essenciais, o chamado “efeito substituição”.'],
          ['relacao','De acordo com a CNC, o crescimento das apostas on-line coincide com o aumento do endividamento e da inadimplência das famílias.'],
          ['cf','A Constituição Federal de 1988 dá à família especial proteção do Estado, mas essa proteção raramente inclui orientação sobre como poupar.']],
   fecha:['a ajuda só é procurada quando já é tarde.','o salário acaba antes do fim do mês.','sobram só os empréstimos caros para fechar o mês.']}
];

/* abertura: as leis pedem ideia contrária; os dados pedem explicação */
const ABERTURAS = [{id:'cf',tipo:'contraste'},{id:'lei14181',tipo:'contraste'},{id:'gastos500',tipo:'dado'},{id:'bi30',tipo:'dado'}];
const PONTE = {
  contraste:['na prática, muitos lares estão vendo o orçamento encolher por causa das “bets”.','muitos lares estão desprotegidos diante do avanço das “bets”.','segundo a CNC, os gastos com “bets” cresceram 500% em apenas três anos.'],
  dado:['a aposta ocupa um espaço grande nas despesas dos consumidores.','uma simples diversão virou um peso para o orçamento de muitos lares.','o problema afeta a economia do país inteiro.']
};

/* palavras de ligação: as certas (ok) e as pegadinhas, com a dica de cada uma */
const CON = {
  d1:[{t:'Portanto,',d:'“Portanto” serve para concluir. Aqui você está começando o 1º argumento.'},{t:'Em primeiro lugar,',ok:1},{t:'Além disso,',d:'“Além disso” junta uma ideia nova. Guarde para o 2º argumento.'},{t:'Primeiramente,',ok:1}],
  d2:[{t:'Além disso,',ok:1},{t:'Em primeiro lugar,',d:'Este já é o 2º argumento. “Em primeiro lugar” foi no 1º.'},{t:'Somado a isso,',ok:1},{t:'Portanto,',d:'“Portanto” serve para concluir. Ainda não é a hora.'}],
  explica:[{t:'Em suma,',d:'“Em suma” resume tudo no final. Aqui você precisa explicar a causa.'},{t:'Isso acontece porque',ok:1},{t:'Isso ocorre, pois',ok:1}],
  fecha:[{t:'Dessa forma,',ok:1},{t:'Em primeiro lugar,',d:'“Em primeiro lugar” começa um argumento. Aqui você está fechando o parágrafo.'},{t:'Assim,',ok:1},{t:'Como consequência,',ok:1}],
  contraste:[{t:'Além disso,',d:'“Além disso” junta uma ideia parecida. Aqui a ideia é contrária: a frase mostra como deveria ser, e o Brasil ainda não é assim.'},{t:'No entanto,',ok:1},{t:'Entretanto,',ok:1},{t:'Porém,',ok:1}],
  dado:[{t:'No entanto,',d:'“No entanto” mostra uma ideia contrária. Aqui você quer explicar o que o dado mostra.'},{t:'Esse dado mostra que',ok:1},{t:'Isso revela que',ok:1}],
  tese:[{t:'Por exemplo,',d:'“Por exemplo” apresenta um exemplo. Aqui você vai dar a sua opinião.'},{t:'Nesse contexto,',ok:1},{t:'Nesse cenário,',ok:1}],
  retomada:[{t:'Portanto,',ok:1},{t:'Além disso,',d:'“Além disso” junta mais um argumento. Agora é hora de concluir.'},{t:'Diante disso,',ok:1},{t:'Em suma,',ok:1}]
};

/* proposta de intervenção: todo agente pode fazer toda ação, com todo meio e todo fim */
const AGENTES = [
  {t:'o Governo Federal',v:'deve'},
  {t:'o Governo Federal, junto com os estados e os municípios,',v:'deve'},
  {t:'o Estado',v:'deve'},
  {t:'o Congresso Nacional e o Governo Federal',v:'devem'}
];
const ACOES = [
  {t:'fiscalizar com mais rigor a propaganda das casas de apostas',det:['Os anúncios enganosos poderiam ser retirados do ar, e as empresas responsáveis pagariam multa.','Cada anúncio poderia trazer um alerta sobre os riscos para a saúde e para o bolso.']},
  {t:'oferecer tratamento gratuito aos dependentes de apostas',det:['Os Centros de Atenção Psicossocial (CAPS), do SUS, poderiam atender essas pessoas e também as suas famílias.','As próprias casas de apostas poderiam ser obrigadas a mostrar onde buscar esse atendimento.']},
  {t:'levar a educação financeira a todas as escolas',det:['Os alunos poderiam aprender, com exemplos do dia a dia, a fazer as contas do mês e a evitar dívidas.','As aulas poderiam mostrar, com números, que nas apostas quem quase sempre ganha é a empresa.']},
  {t:'criar um sistema de limites de gasto e de alertas para os apostadores',det:['Cada usuário poderia escolher um valor máximo por mês, e as plataformas seriam obrigadas a respeitá-lo.','Quem apostasse por muitas horas seguidas receberia um aviso na tela, com a indicação de onde encontrar atendimento.']},
  {t:'ajudar as famílias a renegociar as suas dívidas',det:['Os Procons poderiam analisar cada situação e montar um plano de pagamento possível.','As parcelas poderiam ser menores e mais longas, sem tirar o necessário para viver.']}
];
const DET_GERAL = ['Essas medidas poderiam começar pelas cidades onde há mais famílias endividadas.','Os resultados poderiam ser acompanhados todo ano, com dados sobre as dívidas das famílias.'];
const MEIOS = ['por meio de verbas públicas','por meio de uma nova lei','por meio de um programa com metas e prazos','em parceria com universidades e organizações sociais','com o apoio de especialistas de várias áreas'];
const FINS = ['a fim de proteger a renda da população','para que ninguém fique sem o seu sustento','com o objetivo de diminuir os casos de superendividamento','para que comida, luz e aluguel voltem a ser prioridade'];

const QUIZ = {
  tipo:{p:'Que tipo de texto você vai escrever?',ops:['Uma história com personagens','Uma carta para um amigo','Um texto que defende uma opinião com argumentos','Um poema com rimas'],c:2,
    ok:'Isso! Dissertativo-argumentativo é um texto que defende uma opinião e prova com argumentos.',
    dicas:{0:'História com personagens é narração. Aqui você precisa defender uma opinião.',1:'Carta não é o texto pedido. Volte uma tela e releia o cartão “O que escrever”.',3:'Poema não. O texto precisa defender uma opinião com argumentos.'}},
  tema:{p:'Qual destes assuntos está dentro do tema da redação?',ops:['A história do futebol brasileiro','Como as apostas on-line em excesso endividam as famílias brasileiras','A importância de guardar dinheiro para o futuro','Os jogos de videogame mais populares'],c:1,
    ok:'Isso! O tema pede os impactos, ou seja, os efeitos das apostas em excesso nas dívidas das famílias.',
    dicas:{0:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!',2:'Fala de dinheiro, mas não das apostas on-line. Isso é passar perto do tema sem entrar nele (tangenciar), e perde muitos pontos.',3:'Videogame não é aposta com dinheiro. Esse assunto foge do tema, e fugir do tema dá nota zero no ENEM!'}},
  excesso:{p:'No tema, o que quer dizer “prática excessiva” de apostas?',ops:['Apostar uma única vez, só para conhecer','Apostar demais, sem controle','Nunca apostar'],c:1,
    ok:'Isso! “Excessiva” vem de excesso: é apostar demais, sem controle. É esse excesso que leva muitas famílias às dívidas.',
    dicas:{0:'Uma única vez não é excesso. Volte à tela “Traduzindo a proposta” e releia o cartão “Sobre o quê”.',2:'Quem nunca aposta não pratica apostas. Volte à tela “Traduzindo a proposta” e releia o cartão “Sobre o quê”.'}},
  final:{p:'O que precisa aparecer no último parágrafo?',ops:['Uma solução para o problema','Uma piada para animar quem lê','Seu nome e sua assinatura','Uma pergunta sem resposta'],c:0,
    ok:'Isso! Essa solução se chama proposta de intervenção e precisa respeitar os direitos humanos.',
    dicas:{1:'Piada não combina com um texto formal.',2:'Cuidado! No ENEM, redação com nome ou assinatura vale zero.',3:'O final precisa resolver o problema, não deixar dúvidas.'}},
  gastos:{p:'Segundo o texto, o que aconteceu com os gastos das famílias com apostas on-line em três anos?',ops:['Cresceram 500%','Caíram pela metade','Ficaram iguais'],c:0,
    ok:'Isso! Os gastos cresceram 500% em apenas três anos. Em março de 2026, já passavam de R$ 30 bilhões por mês.',
    dicas:{1:'Volte ao texto e releia o título e a 1ª frase: os gastos cresceram, e muito.',2:'Volte ao texto e releia o título e a 1ª frase: os gastos não ficaram iguais.'}},
  substituicao:{p:'O texto diz que o dinheiro gasto com apostas “antes iria para o pagamento de contas essenciais”. Isso é o “efeito substituição”. O que ele quer dizer?',ops:['O dinheiro das contas da casa passa a ir para as apostas','As famílias param de apostar para pagar as contas','As casas de apostas pagam as contas das famílias'],c:0,
    ok:'Isso! O dinheiro que pagaria contas como água, luz e aluguel vai para as apostas. Por isso, a pesquisa liga as apostas às dívidas e às contas atrasadas.',
    dicas:{1:'É o contrário: as famílias passam a usar nas apostas o dinheiro das contas.',2:'As casas de apostas não pagam as contas de ninguém. O dinheiro sai das famílias e vai para as apostas.'}},
  perfil:{p:'Segundo o texto, o perfil do endividado está concentrado em quem?',ops:['Em mulheres jovens e famílias ricas','Em homens com 35 anos ou mais e famílias de baixa renda','Em crianças e adolescentes'],c:1,
    ok:'Isso! O perfil do endividado se concentra em homens com 35 anos ou mais e em famílias de baixa renda, que já têm pouco dinheiro para as contas do mês.',
    dicas:{0:'Volte ao texto e releia a última frase: ela fala do gênero masculino, ou seja, de homens.',2:'Volte ao texto e releia a última frase: ela fala de pessoas com 35 anos ou mais.'}},
  tadros:{p:'O que José Roberto Tadros diz que precisamos discutir?',ops:['Como fazer as famílias apostarem mais','Os limites do mercado de apostas, principalmente a publicidade e a proteção das famílias','Como usar as apostas para pagar as dívidas'],c:1,
    ok:'Isso! Ele diz que é preciso discutir os limites desse mercado, principalmente a publicidade e a proteção das famílias. Essa ideia pode ajudar na sua solução, no fim da redação.',
    dicas:{0:'Não. Ele diz que as apostas estão comprometendo a renda das famílias. Volte ao texto e releia a fala dele, entre aspas.',2:'Ele não diz isso. Volte ao texto e releia a última frase da fala dele, entre aspas.'}},
  dh:{p:'Qual destas soluções NÃO pode aparecer na redação, porque desrespeita os direitos humanos?',ops:['Oferecer tratamento gratuito para o vício em apostas','Prender as pessoas viciadas em apostas','Ensinar educação financeira nas escolas','Fiscalizar a propaganda das casas de apostas'],c:1,
    ok:'Isso! Prender quem tem vício desrespeita os direitos humanos. O vício em apostas é uma doença: a pessoa precisa de tratamento, e não de castigo.',dica:'Essa solução ajuda as pessoas. Procure a que castiga alguém.'}
};

const GLOSS = {
  bets:['Bets','palavra em inglês que quer dizer “apostas”. No Brasil, é o nome dado aos sites e aplicativos de apostas on-line.'],
  montante:['Montante','quantia; o total de dinheiro.'],
  substituicao:['Efeito substituição','quando o dinheiro que ia para uma coisa passa a ir para outra. Aqui, o dinheiro das contas da casa vai para as apostas.'],
  deteriorando:['Deteriorando','piorando, estragando aos poucos.'],
  consumo:['Consumo real','o que as famílias conseguem comprar de verdade com o dinheiro que têm.'],
  cnc:['CNC','Confederação Nacional do Comércio de Bens, Serviços e Turismo: organização que representa as empresas do comércio no Brasil.'],
  peic:['PEIC','Pesquisa de Endividamento e Inadimplência do Consumidor: pesquisa feita todo mês pela CNC sobre as dívidas das famílias.'],
  explosivo:['Explosivo','muito rápido e muito grande, como uma explosão.'],
  coincide:['Coincide','acontece ao mesmo tempo.'],
  indicadores:['Indicadores','números que mostram como algo está. Por exemplo: quantas famílias têm dívidas.'],
  endividamento:['Endividamento','quando a pessoa ou a família fica com dívidas, isto é, deve dinheiro.'],
  inadimplencia:['Inadimplência','quando a pessoa não paga uma conta ou uma dívida no dia certo; conta atrasada.'],
  fenomenos:['Fenômenos','acontecimentos. Aqui: o crescimento das apostas e o aumento das dívidas.'],
  variaveis:['Variáveis macroeconômicas','números que mostram como está a economia do país inteiro, como o desemprego e a inflação.'],
  desocupacao:['Taxa de desocupação','a parte das pessoas que procuram trabalho e não encontram; o desemprego.'],
  credito:['Concessões de crédito pessoa física','empréstimos e financiamentos que os bancos dão às pessoas (e não às empresas).'],
  inflacao:['Inflação','aumento dos preços. Com inflação, o mesmo dinheiro compra menos coisas.'],
  metodologia:['Metodologia','o método, o jeito usado para fazer uma pesquisa.'],
  difdif:['Diferenças em Diferenças','nome de um método de estatística que compara dois grupos antes e depois de uma mudança.'],
  tendencias:['Tendências paralelas','quando dois grupos vinham mudando do mesmo jeito antes do fato estudado. Isso permite comparar os dois de forma justa.'],
  sistema:['Sistema CNC-Sesc-Senac','o conjunto formado pela CNC, pelo Sesc (que oferece cultura, lazer e saúde) e pelo Senac (que oferece cursos profissionais).'],
  poder:['Poder de compra','o quanto a pessoa consegue comprar com o dinheiro que tem.'],
  entretenimento:['Entretenimento virtual','diversão feita pela internet, no celular ou no computador.'],
  comprometendo:['Comprometendo','prejudicando; tomando uma parte do dinheiro que faria falta para outras coisas.'],
  pontual:['Pontual','aqui, quer dizer pequeno, que atinge só alguns casos.'],
  macro:['Macroeconômico','que atinge a economia do país inteiro, e não só algumas pessoas.'],
  publicidade:['Publicidade','propaganda; anúncios na TV, na internet, nas redes sociais e nos estádios.'],
  perfil:['Perfil do endividado','as características de quem mais tem dívidas, como o gênero, a idade e a renda.'],
  masculino:['Gênero masculino','homens.'],
  baixarenda:['Baixa renda','quem ganha pouco dinheiro.']
};

const FASES = [
  {id:'missao',titulo:'Entender a missão',sub:'O que a prova pede',unlock:['cf','lei14181','cdc'],
   steps:[{t:'proposta'},{t:'info',k:'missao'},{t:'quiz',q:'tipo'},{t:'quiz',q:'tema'},{t:'quiz',q:'excesso'},{t:'quiz',q:'final'},{t:'reward'}]},
  {id:'texto',titulo:'Ler o texto de apoio',sub:'Pegar dados para usar',unlock:['gastos500','bi30','substituicao','relacao','perfil','tadros'],
   steps:[{t:'read',x:0},{t:'quiz',q:'gastos'},{t:'quiz',q:'substituicao'},{t:'quiz',q:'perfil'},{t:'quiz',q:'tadros'},{t:'reward'}]},
  {id:'causas',titulo:'Escolher os argumentos',sub:'Os 2 motivos do problema',unlock:['lei14790','oms'],
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
  id: 'apostas-online', serie: '3', ordem: 4, rotulo: 'Texto 4',
  tipo: 'dissertativo', genero: 'Dissertativo-argumentativo',
  tema: 'Impactos da prática excessiva de apostas on-line no endividamento das famílias brasileiras',
  temaRotulo: 'Tema da redação',
  obra: 'redação', obraGenero: 'f',
  folhaTitulo: 'Folha de redação', folhaCabecalho: 'Redação · ENEM',
  lead: 'Você vai montar uma redação do ENEM sobre as apostas on-line e as dívidas das famílias. Cada escolha sua vira um pedaço do texto, e cada acerto vale XP.',
  trilhaTip: '7 fases. Nas 3 primeiras, você entende a proposta, lê o texto de apoio e escolhe os argumentos. Nas 4 últimas, monta os 4 parágrafos da redação.',
  proposta: {
    contexto: 'Você está prestando o 1º dia do Exame Nacional do Ensino Médio (ENEM), e está na hora de fazer a redação. Esta é a primeira ação a ser realizada no dia da prova, enquanto a cabeça está “fresca”. Leia a proposta completa com atenção. Atente-se aos textos motivadores, lendo-os mais de uma vez, e elabore seu texto.',
    comando: 'A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija um texto DISSERTATIVO-ARGUMENTATIVO em modalidade escrita formal da língua portuguesa sobre o tema “Impactos da prática excessiva de apostas on-line no endividamento das famílias brasileiras.”, apresentando proposta de intervenção que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para defesa de seu ponto de vista.'
  },
  textos: [{
    rotulo: 'Texto de apoio 1',
    html: `
    <h3>Gasto das famílias com apostas em bets cresce 500% em três anos, mostra CNC</h3>
    <p>Os gastos das famílias brasileiras com apostas online ([[bets|bets]]) cresceram 500% em apenas três anos, passando de praticamente zero para mais de R$30 bilhões mensais em março de 2026. Esse [[montante|montante]], que antes iria para o pagamento de contas essenciais, atualmente sofre um [[substituicao|“efeito substituição”]], [[deteriorando|deteriorando]] o [[consumo|consumo real]], de acordo com pesquisa da Confederação Nacional do Comércio de Bens, Serviços e Turismo ([[cnc|CNC]]), com base na análise de dados mensais da Pesquisa de Endividamento e Inadimplência do Consumidor ([[peic|PEIC]]), relativo ao período de maio de 2021 a março de 2026.</p>
    <p>Na avaliação da CNC, o crescimento [[explosivo|explosivo]] [[coincide|coincide]] com o aumento dos [[indicadores|indicadores]] de [[endividamento|endividamento]] e [[inadimplencia|inadimplência]], sugerindo uma relação direta entre os dois [[fenomenos|fenômenos]] no período avaliado. Para compreender o ambiente econômico em que as bets se expandiram, a CNC analisou a evolução das [[variaveis|variáveis macroeconômicas]] [[desocupacao|taxa de desocupação]], [[credito|concessões de crédito pessoa física]] e [[inflacao|inflação]], em paralelo aos indicadores de endividamento e inadimplência. A [[metodologia|metodologia]] aplicada foi a de [[difdif|‘Diferenças em Diferenças’]] para se verificar as possibilidades de [[tendencias|tendências paralelas]].</p>
    <p>Para José Roberto Tadros, presidente do [[sistema|Sistema CNC-Sesc-Senac]], o [[poder|poder de compra]] do cidadão é reduzido por essa opção de [[entretenimento|entretenimento virtual]] que tem efeito negativo na vida real: “As apostas online estão [[comprometendo|comprometendo]] a renda das famílias brasileiras. O impacto já deixou de ser [[pontual|pontual]] e se tornou [[macro|macroeconômico]]. Precisamos discutir os limites desse mercado, especialmente no que diz respeito à [[publicidade|publicidade]] e à proteção das famílias brasileiras.” Os dados mostram que o [[perfil|perfil do endividado]] está concentrado entre as pessoas do [[masculino|gênero masculino]], com idade de 35 anos ou mais, e famílias de [[baixarenda|baixa renda]].</p>
    <p class="fonte">SCHNOOR, Tatiana. Gasto das famílias com apostas em bets cresce 500% em três anos, mostra CNC. <i>IstoÉ Dinheiro</i>, [S. l.], 28 abr. 2026. Disponível em: <a href="https://istoedinheiro.com.br/bets-familias-apostas-online-cresce-500-cnc" target="_blank" rel="noopener">https://istoedinheiro.com.br/bets-familias-apostas-online-cresce-500-cnc</a> Acesso em: 22 set. 2026.</p>`,
    facil: `
    <h3>O texto em 7 frases</h3>
    <ul class="facil">
      <li>Uma pesquisa da <b>CNC</b>, uma organização do comércio, estudou as dívidas das famílias brasileiras.</li>
      <li>Os gastos das famílias com <b>apostas on-line</b> (as “bets”) cresceram <b>500%</b> em só <b>três anos</b>. Antes, eram quase zero. Em <b>março de 2026</b>, passavam de <b>R$ 30 bilhões por mês</b>.</li>
      <li>Esse dinheiro antes ia para as <b>contas essenciais</b>, como água, luz e aluguel. Agora, vai para as apostas. A pesquisa chama isso de <b>“efeito substituição”</b>.</li>
      <li>As apostas cresceram ao mesmo tempo que as <b>dívidas</b> e as <b>contas atrasadas</b> das famílias. Para a CNC, uma coisa está ligada à outra.</li>
      <li>Para entender a economia desse período, a CNC também olhou outros números: o <b>desemprego</b>, os <b>empréstimos</b> e a <b>inflação</b>.</li>
      <li><b>José Roberto Tadros</b>, presidente do Sistema CNC-Sesc-Senac, disse que as apostas estão <b>tirando renda das famílias</b> e que o problema já atinge a <b>economia do país inteiro</b>. Ele também disse que é preciso discutir os <b>limites</b> desse mercado, principalmente a <b>propaganda</b> e a proteção das famílias.</li>
      <li>O perfil do endividado se concentra em <b>homens</b> com <b>35 anos ou mais</b> e em <b>famílias de baixa renda</b>, que ganham pouco.</li>
    </ul>`
  }],
  rep: REP, repOrdem: REP_ORDER, causas: CAUSAS, aberturas: ABERTURAS, ponte: PONTE,
  // os dois números de gastos da CNC (500% e R$ 30 bi) nunca aparecem juntos: a abertura "dado" (qualquer uma das duas)
  // e a ponte contraste[2] já trazem os gastos, por isso bloqueiam a prova dos 500%; o R$ 30 bi só existe como abertura
  ponteRep: { contraste: { 2: 'gastos500' }, dado: { 0: 'gastos500', 1: 'gastos500', 2: 'gastos500' } },
  con: CON, agentes: AGENTES, acoes: ACOES, detGeral: DET_GERAL, meios: MEIOS, fins: FINS,
  quiz: QUIZ, gloss: GLOSS, fases: FASES,
  causasPergunta: 'Por que as apostas on-line estão endividando as famílias brasileiras?',
  teses: [
    (a, b) => `as dívidas que as apostas on-line trazem às famílias brasileiras são agravadas, principalmente, ${a.por} e ${b.por}.`,
    (a, b) => `o excesso de apostas on-line tem endividado cada vez mais famílias brasileiras, sobretudo devido ${a.tese} e ${b.tese}.`,
    (a, b) => `dois fatores explicam por que as apostas on-line em excesso endividam tantas famílias brasileiras: ${a.nom} e ${b.nom}.`
  ],
  retomadas: (a, b) => ['fica claro que o Brasil precisa agir para conter o excesso de apostas.', 'o endividamento ligado às apostas exige uma resposta urgente.', `é preciso enfrentar ${a.nom} e ${b.nom}.`],
  info: {
    temaCard: '<p><b>Apostas on-line</b> (as “bets”) = apostas a dinheiro feitas pelo celular ou pelo computador.<br><b>Prática excessiva</b> = apostar demais, sem controle.<br><b>Endividamento</b> = ficar com dívidas, isto é, dever dinheiro.<br><b>Impactos</b> = efeitos, consequências.</p><p class="exmini">A pergunta do tema é: <b>como as apostas em excesso fazem as famílias brasileiras se endividarem?</b></p>',
    argumentoExemplo: { opiniao: 'as apostas on-line em excesso estão endividando muitas famílias brasileiras.', argumento: 'porque muita gente usa nas apostas o dinheiro que pagaria as contas da casa.' },
    introExemplo: 'A Constituição Federal de 1988, no artigo 226, afirma que a família, base da sociedade, tem especial proteção do Estado. No entanto, muitos lares estão desprotegidos diante do avanço das “bets”. Nesse contexto, dois fatores explicam por que as apostas on-line em excesso endividam tantas famílias brasileiras: a publicidade agressiva e a falta de educação financeira.',
    solucaoExemplos: { agente: 'o Governo Federal', acao: 'oferecer tratamento gratuito aos dependentes de apostas', meio: 'por meio de verbas públicas', fim: 'a fim de proteger a renda da população' }
  },
  checagem: {
    temaRegex: /apost|\bbets?\b|endivid|d[ií]vida/i,
    temaDica: 'Use as palavras “apostas on-line” e “endividamento” já no 1º parágrafo.',
    repRegex: /constitui[cç][aã]o|artigo 226|artigo 196|14\.181|superendividamento|c[oó]digo de defesa do consumidor|8\.078|14\.790|lei das bets|\boms\b|organiza[cç][aã]o mundial da sa[uú]de|transtorno do jogo|\bcnc\b|confedera[cç][aã]o nacional do com[eé]rcio|tadros|efeito substitui[cç][aã]o|\bpeic\b|\d+(,\d+)?\s?%|r\$\s?\d+/i
  }
});
})();
