/* Missão Redação · atividade da 3ª Série, Texto 3 (dissertativo-argumentativo, a partir de “O Hobbit”).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';
const REP = {
  cf37:{tipo:'Lei',titulo:'Constituição Federal de 1988 (artigo 37)',resumo:'O artigo 37 diz que o governo e os servidores públicos devem agir com moralidade, ou seja, com honestidade.',frase:'A Constituição Federal de 1988, no artigo 37, determina que a administração pública obedeça ao princípio da moralidade.'},
  aristoteles:{tipo:'Filosofia',titulo:'Aristóteles',resumo:'Filósofo grego da Antiguidade. Para ele, a virtude está no meio-termo: nem de menos, nem demais.',frase:'Para o filósofo grego Aristóteles, a virtude está no meio-termo, ou seja, no equilíbrio entre a falta e o excesso.'},
  hobbit:{tipo:'Obra literária',titulo:'“O Hobbit”, de J.R.R. Tolkien',resumo:'A “doença do dragão” é o desejo sem controle pelo ouro da Montanha Solitária. Na obra, ela corrompe personagens e destrói alianças.',frase:'Na obra “O Hobbit”, de J.R.R. Tolkien, o desejo incontrolável pelo ouro, a chamada “doença do dragão”, corrompe personagens e destrói alianças.'},
  arken:{tipo:'Obra literária',titulo:'Bilbo e a Pedra Arken',resumo:'Em “O Hobbit”, Thorin fica obcecado pelo ouro. Já Bilbo abre mão da Pedra Arken, a joia que Thorin mais desejava, para tentar evitar uma guerra.',frase:'Em “O Hobbit”, enquanto Thorin fica obcecado pelo ouro, Bilbo abre mão da Pedra Arken para tentar evitar uma guerra.'},
  gerson:{tipo:'Expressão popular',titulo:'“Lei de Gérson” (1976)',resumo:'Em 1976, numa propaganda de cigarros, o ex-jogador de futebol Gérson dizia: “Gosto de levar vantagem em tudo, certo?” Desde então, “Lei de Gérson” é o nome do hábito de querer levar vantagem sem pensar nos outros.',frase:'Em 1976, uma propaganda de cigarros popularizou a ideia de “levar vantagem em tudo”, que deu origem à expressão “Lei de Gérson”.'},
  holanda:{tipo:'Livro',titulo:'“Raízes do Brasil” (1936)',resumo:'Livro de Sérgio Buarque de Holanda. Ele fala do “homem cordial”. Aqui, “cordial” não quer dizer educado: é quem age pelo coração, põe as relações pessoais acima das regras e mistura o público com o privado.',frase:'Em “Raízes do Brasil”, de 1936, Sérgio Buarque de Holanda descreveu o “homem cordial”, que tem dificuldade de separar o público do privado.'},
  kant:{tipo:'Filosofia',titulo:'Immanuel Kant',resumo:'Filósofo alemão. Para ele, uma atitude só é correta se puder virar uma regra para todos.',frase:'O filósofo alemão Immanuel Kant defendia que cada pessoa deve agir como se a sua atitude pudesse virar uma regra para todos.'},
  jonas:{tipo:'Texto de apoio',titulo:'Hans Jonas (1979)',resumo:'Filósofo alemão. Para ele, a ética de hoje não se baseia mais nas relações próximas entre as pessoas: ela precisa regrar as ações que a técnica modificou.',frase:'Para o filósofo alemão Hans Jonas (1979), a ética atual precisa regrar as ações humanas modificadas pela técnica.'},
  herrero:{tipo:'Texto de apoio',titulo:'Herrero (1999)',resumo:'O texto diz que a preocupação exagerada com o dinheiro gerou um vazio ético. Por isso, como diz Herrero (1999), é urgente recriar uma ética solidária e universal.',frase:'Segundo o texto de apoio, a preocupação excessiva com o capital gerou um vazio ético, e Herrero (1999) aponta a urgência de recriar uma ética solidária e universal.'},
  weber:{tipo:'Texto de apoio',titulo:'Weber (2013)',resumo:'O texto diz que os valores nascem da cultura de cada comunidade. Weber acreditava que nem a cristandade conseguiu unificar a ética.',frase:'Segundo o texto de apoio, os princípios morais nascem da cultura de cada comunidade, e Weber (2013) acreditava que nem a cristandade unificou a ética.'},
  cf5:{tipo:'Lei',titulo:'Constituição Federal de 1988 (artigo 5º)',resumo:'O artigo 5º diz que todos são iguais perante a lei, ou seja, a lei vale do mesmo jeito para todas as pessoas.',frase:'A Constituição Federal de 1988, no artigo 5º, afirma que todos são iguais perante a lei.'},
  anticorrupcao:{tipo:'Lei',titulo:'Lei nº 12.846/2013',resumo:'É a Lei Anticorrupção. Ela permite punir as empresas que causam prejuízo ao poder público, por exemplo, pagando propina.',frase:'A Lei nº 12.846, de 2013, conhecida como Lei Anticorrupção, permite punir as empresas que causam prejuízo ao poder público.'},
  ldb:{tipo:'Lei',titulo:'LDB (Lei nº 9.394/1996)',resumo:'É a Lei de Diretrizes e Bases da Educação. Ela diz que uma das finalidades do ensino médio é a formação ética dos estudantes.',frase:'A Lei nº 9.394, de 1996, a LDB, inclui a formação ética entre as finalidades do ensino médio.'}
};
const REP_ORDER = ['hobbit','arken','cf37','aristoteles','jonas','herrero','weber','gerson','holanda','kant','cf5','anticorrupcao','ldb'];

const CAUSAS = [
  {id:'individualismo',nome:'Individualismo e consumismo',desc:'Muita gente pensa só em si e acha que uma pessoa vale pelo que tem. Assim, ganhar mais parece mais importante do que agir certo.',
   tese:'ao individualismo',por:'pelo individualismo',nom:'o individualismo',
   topico:['o individualismo leva cada um a pensar apenas em si mesmo.','o consumismo transforma a vida em uma disputa por bens e por dinheiro.','a pressa de se destacar leva as pessoas a esquecerem quem convive com elas.'],
   explica:['o valor de alguém costuma ser medido pelo que ele compra, e não pelo seu caráter.','a publicidade repete, o tempo todo, que comprar traz felicidade.','o outro passa a ser visto como um concorrente, e não como alguém que merece respeito.'],
   prova:[['herrero','Herrero (1999), citado no texto de apoio, aponta a urgência de recriar uma ética solidária e universal, mas o egoísmo ainda é forte nas relações.'],
          ['aristoteles','Para o filósofo Aristóteles, a virtude está no meio-termo, mas, hoje, o excesso parece não ter fim.'],
          ['arken','Bilbo, protagonista de “O Hobbit”, abre mão da Pedra Arken para tentar evitar uma guerra, mas, fora da ficção, muitos fazem a escolha oposta.'],
          ['hobbit','Em “O Hobbit”, de J.R.R. Tolkien, Thorin se torna tão obcecado pelo ouro que prefere a guerra a dividir o tesouro, e algo parecido acontece fora da ficção.']],
   fecha:['os laços entre vizinhos, colegas e amigos ficam mais frágeis.','qualquer atalho para chegar ao topo é aceito.','a sociedade fica mais desigual e injusta.']},
  {id:'jeitinho',nome:'Jeitinho brasileiro',desc:'Muita gente acha esperto dar um “jeitinho” para fugir das regras: furar a fila, colar na prova, ficar com o troco errado.',
   tese:'à cultura do “jeitinho”',por:'pela cultura do “jeitinho”',nom:'a cultura do “jeitinho”',
   topico:['a cultura do “jeitinho” faz as normas parecerem negociáveis.','a esperteza costuma ser admirada, mesmo quando fere os direitos de alguém.','pequenas trapaças do dia a dia ainda são vistas como algo sem importância.'],
   explica:['a mentira muitas vezes é tolerada desde a infância.','atitudes como furar a fila ou colar na prova raramente têm consequências.','favores entre amigos podem pesar mais do que as regras.'],
   prova:[['gerson','Em 1976, uma propaganda de cigarros popularizou a ideia de “levar vantagem em tudo”, que ganhou o nome de “Lei de Gérson”.'],
          ['holanda','Em “Raízes do Brasil”, de 1936, Sérgio Buarque de Holanda descreveu o “homem cordial”, que tem dificuldade de separar o público do privado.'],
          ['kant','O filósofo Immanuel Kant defendia que só é correto agir de um modo que possa valer para todos, mas quem leva vantagem espera que os outros não façam o mesmo.'],
          ['cf37','A Constituição Federal de 1988 exige moralidade na administração pública, mas, mesmo nela, alguns ajudam conhecidos a passar na frente.']],
   fecha:['quem faz a coisa certa acaba ficando para trás.','o erro de hoje vira o hábito de amanhã.','as leis só são cumpridas sob vigilância.']},
  {id:'impunidade',nome:'Impunidade e maus exemplos',desc:'Quando quem tem poder engana ou desvia dinheiro e não é punido, muita gente pensa que agir errado compensa.',
   tese:'à impunidade',por:'pela impunidade',nom:'a impunidade',
   topico:['a impunidade passa a mensagem de que agir errado compensa.','há poderosos que cometem abusos e continuam impunes, o que serve de mau exemplo.','desvios de verbas do governo costumam acabar sem castigo.'],
   explica:['a Justiça muitas vezes é lenta, e bons advogados conseguem adiar o julgamento.','alguns líderes usam a sua influência para escapar das investigações.','a fiscalização ainda é fraca em muitas cidades.'],
   prova:[['cf37','A Constituição Federal de 1988, no artigo 37, exige moralidade na administração pública, mas quem desrespeita esse princípio nem sempre é punido.'],
          ['anticorrupcao','A Lei nº 12.846, de 2013, a Lei Anticorrupção, permite punir empresas que causam prejuízo ao poder público, mas muitos casos ficam sem resposta.'],
          ['cf5','O artigo 5º da Constituição Federal afirma que todos são iguais perante a lei, mas a punição não chega igualmente a todos.'],
          ['holanda','Em “Raízes do Brasil”, Sérgio Buarque de Holanda apontou a dificuldade de separar o público do privado, o que favorece quem usa o cargo em benefício próprio.']],
   fecha:['o povo deixa de acreditar nas instituições.','os mesmos problemas se repetem a cada nova eleição.','a saúde, a educação e outros serviços básicos perdem investimentos.']},
  {id:'ostentacao',nome:'Dinheiro fácil e ostentação',desc:'Nas redes sociais, muita gente exibe carros, roupas caras e muito dinheiro. Isso faz parecer que ficar rico rápido, de qualquer jeito, é o que importa.',
   tese:'à ostentação nas redes sociais',por:'pela ostentação nas redes sociais',nom:'a ostentação nas redes sociais',
   topico:['a ostentação nas redes sociais faz do dinheiro fácil um sonho para a juventude.','boa parte dos jovens admira quem exibe carros e roupas caras, sem saber de onde veio o dinheiro.','a internet espalha a crença de que é possível ganhar muito dinheiro sem esforço.'],
   explica:['os usuários comparam a própria vida com imagens que nem sempre são reais.','anúncios de apostas e de golpes prometem ganhos imediatos.','quem mostra mais nas telas costuma receber mais curtidas e mais atenção.'],
   prova:[['jonas','O filósofo alemão Hans Jonas (1979) defendeu que a ética atual precisa regrar as ações modificadas pela técnica, mas o mundo digital tem poucos limites.'],
          ['herrero','De acordo com o texto de apoio, a preocupação excessiva com o capital gerou um vazio ético.'],
          ['aristoteles','Para o filósofo Aristóteles, a virtude está no meio-termo, mas perfis famosos tratam o exagero como sinal de vitória.'],
          ['hobbit','Em “O Hobbit”, a obsessão pelo ouro, conhecida como “doença do dragão”, cega os personagens, e a busca por fama pode ter o mesmo efeito.']],
   fecha:['muitas famílias se endividam para manter as aparências.','trabalhar e estudar passam a parecer caminhos lentos demais.','parecer rico passa a importar mais do que ser honesto.']},
  {id:'formacao',nome:'Pouca formação em valores',desc:'Valores são o que a gente acha certo e importante, como a honestidade e o respeito. Em muitas casas e escolas, quase não se conversa sobre eles.',
   tese:'à pouca formação em valores',por:'pela pouca formação em valores',nom:'a pouca formação em valores',
   topico:['nem todas as crianças recebem referências claras sobre o certo e o errado.','a família e a escola nem sempre ensinam as crianças a pensar no bem comum.','os adolescentes raramente discutem valores como respeito e justiça, em casa ou na escola.'],
   explica:['vários pais trabalham o dia todo e têm pouco tempo para conversar com os filhos.','as aulas costumam priorizar o conteúdo das provas, e não a convivência.','muitos adultos também não tiveram esse tipo de orientação.'],
   prova:[['ldb','Na Lei nº 9.394, de 1996, a LDB, a formação ética aparece entre as finalidades do ensino médio, mas o tema ainda é deixado para depois.'],
          ['kant','O filósofo Immanuel Kant defendia que cada um deve agir como se a sua atitude pudesse virar regra para todos, mas os jovens quase não aprendem essa lição.'],
          ['weber','Como mostra o texto de apoio, os princípios morais nascem da cultura de cada comunidade, mas esse assunto quase não é tratado com os mais novos.'],
          ['arken','Bilbo, protagonista de “O Hobbit”, abre mão da Pedra Arken para tentar evitar uma guerra, mas exemplos como esse quase nunca são debatidos.']],
   fecha:['muita gente não sabe até onde pode ir para conseguir o que quer.','a ética fica só no discurso, longe da prática.','a falta de limites passa de uma geração para outra.']}
];

/* abertura: a lei e a ideia de Aristóteles pedem ideia contrária; a obra e a expressão mostram um problema */
const ABERTURAS = [{id:'cf37',tipo:'contraste'},{id:'aristoteles',tipo:'contraste'},{id:'hobbit',tipo:'dado'},{id:'gerson',tipo:'dado'}];
const PONTE = {
  contraste:['na prática, a busca exagerada por dinheiro e poder frequentemente deixa a honestidade de lado.','há quem, até no governo, ainda coloque o próprio ganho acima do bem coletivo.','a chamada “Lei de Gérson”, a ideia de “levar vantagem em tudo”, ainda orienta muitos comportamentos.'],
  dado:['a vontade de ganhar a qualquer custo ameaça a honestidade.','a ganância vem de longe e ainda ameaça a confiança entre as pessoas.','a vontade de ter sempre mais pode colocar o bem coletivo em risco.']
};

/* palavras de ligação: as certas (ok) e as pegadinhas, com a dica de cada uma */
const CON = {
  d1:[{t:'Portanto,',d:'“Portanto” serve para concluir. Aqui você está começando o 1º argumento.'},{t:'Em primeiro lugar,',ok:1},{t:'Além disso,',d:'“Além disso” junta uma ideia nova. Guarde para o 2º argumento.'},{t:'Primeiramente,',ok:1}],
  d2:[{t:'Além disso,',ok:1},{t:'Em primeiro lugar,',d:'Este já é o 2º argumento. “Em primeiro lugar” foi no 1º.'},{t:'Somado a isso,',ok:1},{t:'Portanto,',d:'“Portanto” serve para concluir. Ainda não é a hora.'}],
  explica:[{t:'Em suma,',d:'“Em suma” resume tudo no final. Aqui você precisa explicar a causa.'},{t:'Isso acontece porque',ok:1},{t:'Isso ocorre, pois',ok:1}],
  fecha:[{t:'Dessa forma,',ok:1},{t:'Em primeiro lugar,',d:'“Em primeiro lugar” começa um argumento. Aqui você está fechando o parágrafo.'},{t:'Assim,',ok:1},{t:'Como consequência,',ok:1}],
  contraste:[{t:'Além disso,',d:'“Além disso” junta uma ideia parecida. Aqui a ideia é contrária: a frase mostra como deveria ser, e a realidade ainda não é assim.'},{t:'No entanto,',ok:1},{t:'Entretanto,',ok:1},{t:'Porém,',ok:1}],
  dado:[{t:'No entanto,',d:'“No entanto” mostra uma ideia contrária. Aqui você quer explicar o que a frase da mochila mostra.'},{t:'Isso mostra que',ok:1},{t:'Isso revela que',ok:1}],
  tese:[{t:'Por exemplo,',d:'“Por exemplo” apresenta um exemplo. Aqui você vai dar a sua opinião.'},{t:'Nesse contexto,',ok:1},{t:'Nesse cenário,',ok:1}],
  retomada:[{t:'Portanto,',ok:1},{t:'Além disso,',d:'“Além disso” junta mais um argumento. Agora é hora de concluir.'},{t:'Diante disso,',ok:1},{t:'Em suma,',ok:1}]
};

/* proposta de intervenção: todo agente pode fazer toda ação, com todo meio e todo fim */
const AGENTES = [
  {t:'o Governo Federal',v:'deve'},
  {t:'o Governo Federal, junto com os estados e os municípios,',v:'deve'},
  {t:'os governos estaduais',v:'devem'},
  {t:'as prefeituras',v:'devem'},
  {t:'o Estado',v:'deve'}
];
const ACOES = [
  {t:'promover a educação para a cidadania nas escolas',det:['Os alunos poderiam debater situações do dia a dia, como o que fazer ao achar uma carteira perdida.','Os professores poderiam usar livros como “O Hobbit” para discutir as escolhas de Thorin e de Bilbo.']},
  {t:'criar campanhas que valorizem a honestidade e a solidariedade',det:['Essas campanhas poderiam passar na TV, no rádio e na internet, com uma linguagem simples e atual.','Nelas, cidadãos comuns poderiam contar como conquistaram os seus sonhos sem trapacear.']},
  {t:'ampliar a transparência dos gastos públicos',det:['Qualquer cidadão poderia ver na internet, em linguagem simples, como cada centavo arrecadado é usado.','Conselhos formados por moradores poderiam acompanhar as obras de cada cidade.']},
  {t:'fortalecer a fiscalização contra a corrupção',det:['Os órgãos de controle poderiam ter mais técnicos para analisar contratos e gastos.','A população poderia denunciar irregularidades de forma segura e anônima.']},
  {t:'promover debates sobre o uso consciente da internet',det:['Os estudantes poderiam aprender a identificar golpes e promessas de enriquecimento rápido.','Influenciadores digitais poderiam ajudar, mostrando o esforço que existe por trás dos resultados.']}
];
const DET_GERAL = ['Essas ações poderiam começar pelas escolas e pelos bairros com menos oportunidades.','Dessa maneira, as conquistas viriam do esforço, e não da esperteza.'];
const MEIOS = ['por meio de recursos do orçamento','por meio de parcerias com universidades e ONGs','por meio de um plano com metas e prazos','com a participação da comunidade','por meio de aplicativos e sites gratuitos'];
const FINS = ['a fim de que o sucesso não dependa de prejudicar os outros','para que agir certo volte a ser motivo de orgulho','com o objetivo de proteger o bem coletivo','para que a sociedade brasileira seja mais justa'];

const QUIZ = {
  tipo:{p:'Que tipo de texto você vai escrever?',ops:['Uma história com personagens','Uma carta para um amigo','Um texto que defende uma opinião com argumentos','Um poema com rimas'],c:2,
    ok:'Isso! Dissertativo-argumentativo é um texto que defende uma opinião e prova com argumentos.',
    dicas:{0:'História com personagens é narração. Aqui você precisa defender uma opinião.',1:'Carta não é o texto pedido. Volte e releia o cartão “O que escrever”.',3:'Poema não. O texto precisa defender uma opinião com argumentos.'}},
  tema:{p:'Qual destes assuntos está dentro do tema da redação?',ops:['A vida dos anões e dos dragões em “O Hobbit”','Até onde a vontade de ganhar pode ir sem passar por cima dos outros, no Brasil','Como ficar rico rápido','A importância do esporte na escola'],c:1,
    ok:'Isso! O tema fala dos limites entre a ambição e a ética na sociedade brasileira.',
    dicas:{0:'“O Hobbit” ajuda a pensar no tema, mas a redação é sobre a sociedade brasileira. Escrever só sobre a obra é sair do tema ou ficar só perto dele (tangenciar), e isso pode zerar a nota ou tirar muitos pontos.',2:'Isso não é o tema. O tema não pede dicas para ganhar dinheiro: ele pergunta até onde a ambição pode ir.',3:'Esse assunto foge do tema. No ENEM, fugir do tema dá nota zero!'}},
  dragao:{p:'Na proposta, o que é a “doença do dragão”, de “O Hobbit”?',ops:['Uma doença que os dragões passam para as pessoas','O medo que os anões sentem do dragão','O desejo incontrolável pelo ouro da Montanha Solitária'],c:2,
    ok:'Isso! É o desejo sem controle pelo ouro. Na obra, ele corrompe personagens, destrói alianças e testa a lealdade.',
    dicas:{0:'Não é uma doença de verdade. Volte à proposta, no 1º passo desta fase, e releia o 1º parágrafo.',1:'Não é medo. Volte à proposta, no 1º passo desta fase, e releia o 1º parágrafo.'}},
  ambicao:{p:'Qual destas frases combina com o tema e pode guiar a sua redação?',ops:['A ambição não é ruim por si só, mas não pode passar por cima da ética','Toda ambição é ruim e deve ser proibida','Para vencer na vida, vale tudo'],c:0,
    ok:'Isso! Querer crescer na vida não é errado. O problema começa quando a vontade de ganhar passa por cima das pessoas e das regras.',
    dicas:{1:'Cuidado: querer crescer e conquistar coisas não é errado. Volte e releia o cartão “Sobre o quê”.',2:'“Vale tudo” é justamente o que o tema critica: a ambição que passa por cima da ética.'}},
  final:{p:'O que precisa aparecer no último parágrafo?',ops:['Uma solução para o problema','Uma piada para animar quem lê','Seu nome e sua assinatura','Uma pergunta sem resposta'],c:0,
    ok:'Isso! Essa solução se chama proposta de intervenção e precisa respeitar os direitos humanos.',
    dicas:{1:'Piada não combina com um texto formal.',2:'Cuidado! No ENEM, redação com nome ou assinatura vale zero.',3:'O final precisa resolver o problema, não deixar dúvidas.'}},
  jonas:{p:'Segundo o texto, para Hans Jonas (1979), a ética de hoje é diferente da antiga porque…',ops:['cuida só das relações entre amigos e familiares','precisa regrar as ações que a tecnologia modificou','não tem mais importância'],c:1,
    ok:'Isso! A ética antiga se baseava nas relações próximas entre as pessoas. A de hoje precisa regrar as ações que a técnica mudou. Depois, o texto dá um exemplo: o debate sobre a ética dos robôs.',
    dicas:{0:'É o contrário: era a ética antiga que se baseava nas relações próximas. Volte ao texto e releia o 2º parágrafo.',2:'O texto não diz isso. Ele diz que a ética mudou, e não que perdeu a importância. Volte ao texto e releia o 2º parágrafo.'}},
  bauman:{p:'Segundo o texto, Bauman (2001) afirma que a política moderna, na maioria das vezes…',ops:['controla o dinheiro com facilidade','cede às regras da livre empresa, ou seja, do mercado','não tem nenhuma ligação com o dinheiro'],c:1,
    ok:'Isso! O dinheiro se movimenta muito rápido, e a política acaba cedendo às regras do mercado.',
    dicas:{0:'É o contrário: a política “peleja”, ou seja, luta com dificuldade contra a velocidade do dinheiro. Volte ao texto e releia o 3º parágrafo.',2:'O texto mostra uma ligação forte entre a política e o dinheiro. Volte ao texto e releia o 3º parágrafo.'}},
  vazio:{p:'Segundo o texto, o que a preocupação excessiva com o capital, isto é, com o dinheiro, gerou?',ops:['Mais solidariedade entre as pessoas','O fim da globalização','Um vazio ético'],c:2,
    ok:'Isso! Quando o dinheiro vira a maior preocupação, as necessidades humanas ficam de lado. Por isso, como diz Herrero (1999), é urgente recriar uma ética solidária e universal.',
    dicas:{0:'É o contrário: o texto diz que é urgente recriar uma ética solidária, porque a preocupação com o dinheiro deixou as necessidades humanas de lado. Volte ao texto e releia o fim do 3º parágrafo.',1:'O texto não fala no fim da globalização. Volte ao texto e releia o fim do 3º parágrafo.'}},
  weber:{p:'Por que o texto diz que não existe uma ética universal, igual para todos?',ops:['Porque ninguém tem valores','Porque a tecnologia acabou com a ética','Porque os valores nascem da cultura de cada comunidade'],c:2,
    ok:'Isso! Cada comunidade forma os seus valores. O texto lembra que, para Weber, nem a cristandade conseguiu unificar a ética.',
    dicas:{0:'Todas as pessoas têm valores, mas eles mudam de uma cultura para outra. Volte ao texto e releia o 4º parágrafo.',1:'O texto não diz isso. Volte ao texto e releia o 4º parágrafo.'}},
  dh:{p:'Qual destas soluções NÃO pode aparecer na redação, porque desrespeita os direitos humanos?',ops:['Promover a educação para a cidadania nas escolas','Divulgar nas redes sociais o rosto de quem furou a fila, para humilhar a pessoa','Mostrar na internet como o dinheiro público é gasto','Criar campanhas que valorizem a honestidade'],c:1,
    ok:'Isso! Expor e humilhar alguém em público desrespeita os direitos humanos. A solução deve educar e prevenir, e não castigar.',dica:'Essa solução educa ou previne. Procure a que expõe ou castiga alguém.'}
};

const GLOSS = {
  globalizacao:['Globalização','quando os países do mundo ficam cada vez mais ligados pelo comércio, pela internet e pela cultura.'],
  contemporaneidade:['Contemporaneidade','o tempo de hoje; a época atual.'],
  potencializacao:['Potencialização','quando algo fica mais forte e mais poderoso.'],
  principios:['Princípios éticos','ideias sobre o que é certo e o que é errado, que guiam as nossas atitudes.'],
  modernidade:['Modernidade','o mundo moderno, o mundo de hoje.'],
  normas:['Normas morais','regras sobre o que é certo e o que é errado.'],
  etnicamente:['Etnicamente heterogêneas','formadas por povos e culturas muito diferentes.'],
  pautados:['Pautados','baseados, apoiados.'],
  mutuas:['Mútuas','que acontecem dos dois lados, de um para o outro.'],
  tecnicamente:['Ações tecnicamente modificadas','ações humanas que a tecnologia mudou, como conversar e trabalhar pela internet.'],
  problematica:['Problemática','o problema; a questão difícil.'],
  adequacao:['Adequação','ajuste; fazer uma coisa combinar com outra.'],
  comvistas:['Com vistas a','com o objetivo de.'],
  genuinamente:['Genuinamente','de verdade; realmente.'],
  confrontados:['Confrontados','enfrentados.'],
  unificassem:['Unificassem','unissem; juntassem em um só grupo.'],
  regrar:['Regrar','criar regras para; controlar.'],
  nemsequer:['Nem sequer','nem mesmo.'],
  ceder:['Ceder','aceitar a vontade do outro, mesmo sem querer.'],
  amedida:['À medida em que','aqui, quer dizer “porque”.'],
  contemporaneas:['Contemporâneas','de hoje; atuais.'],
  acerca:['Acerca de','sobre.'],
  ambientacao:['Ambientação ética','preparar os robôs para agir de acordo com a ética.'],
  emface:['Em face de','diante de.'],
  frenetica:['Frenética','muito rápida e agitada.'],
  ia:['Inteligência Artificial','programas de computador que fazem tarefas que antes só as pessoas faziam, como conversar e escrever textos.'],
  cognitivas:['Capacidades cognitivas','capacidades de pensar, aprender e entender.'],
  berlim:['Muro de Berlim','muro que dividia a cidade de Berlim, na Alemanha. Ele caiu em 1989 e virou um símbolo de um mundo mais aberto.'],
  desenvoltura:['Desenvoltura','facilidade e rapidez para avançar.'],
  estado:['Estado','o governo e as instituições que comandam um país.'],
  aduz:['Aduz','afirma; apresenta como argumento.'],
  peleja:['Peleja','luta com dificuldade.'],
  capital:['Capital','aqui, quer dizer dinheiro: a riqueza usada para fazer mais dinheiro.'],
  livreempresa:['Livre empresa','o mercado: as empresas que buscam o lucro.'],
  vazio:['Vazio ético','falta de ética; quando as pessoas deixam de pensar no que é certo.'],
  cerceou:['Cerceou','limitou; deixou de lado.'],
  solidaria:['Ética solidária e universal','um jeito de agir certo que pense em todos e valha para todos.'],
  hegemonia:['Hegemonia','domínio; aqui, uma só ética valendo para todas as sociedades.'],
  subjetivos:['Subjetivos','que dependem de cada pessoa ou de cada grupo.'],
  simbolicas:['Construções simbólicas','ideias, crenças e costumes que um grupo cria ao longo do tempo.'],
  cristandade:['Cristandade','o conjunto dos cristãos, as pessoas que seguem o cristianismo.'],
  dissenso:['Dissenso','discordância; falta de acordo.'],
  vertentes:['Vertentes','grupos ou linhas diferentes dentro de uma mesma religião ou ideia.'],
  inexiste:['Inexiste','não existe.'],
  interconexao:['Interconexão','ligação entre muitas partes.'],
  interpessoais:['Relações interpessoais','as relações entre as pessoas.'],
  emmira:['Tendo em mira','levando em conta; pensando em.'],
  hegemonico:['Hegemônico unificador','que vale para todos e une todas as sociedades.'],
  aopasso:['Ao passo que','enquanto; à medida que.'],
  notadamente:['Notadamente','claramente; de um jeito bem visível.']
};

const FASES = [
  {id:'missao',titulo:'Entender a missão',sub:'O que a prova pede',unlock:['hobbit','arken','cf37','aristoteles'],
   steps:[{t:'proposta'},{t:'info',k:'missao'},{t:'quiz',q:'tipo'},{t:'quiz',q:'tema'},{t:'quiz',q:'dragao'},{t:'quiz',q:'ambicao'},{t:'quiz',q:'final'},{t:'reward'}]},
  {id:'texto',titulo:'Ler o texto de apoio',sub:'Pegar ideias para usar',unlock:['jonas','herrero','weber'],
   steps:[{t:'read',x:0},{t:'quiz',q:'jonas'},{t:'quiz',q:'bauman'},{t:'quiz',q:'vazio'},{t:'quiz',q:'weber'},{t:'reward'}]},
  {id:'causas',titulo:'Escolher os argumentos',sub:'Os 2 motivos do problema',unlock:['gerson','holanda','kant','cf5','anticorrupcao','ldb'],
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

const FONTE = 'https://www.jusbrasil.com.br/artigos/os-desafios-da-etica-na-contemporaneidade/1183587881';

(window.ATIVIDADES = window.ATIVIDADES || []).push({
  id: 'ambicao-etica', serie: '3', ordem: 3, rotulo: 'Texto 3',
  tipo: 'dissertativo', genero: 'Dissertativo-argumentativo',
  tema: 'Fronteiras entre ambição e ética na sociedade brasileira',
  temaRotulo: 'Tema da redação',
  obra: 'redação', obraGenero: 'f',
  folhaTitulo: 'Folha de redação', folhaCabecalho: 'Redação · O Hobbit',
  lead: 'Você vai montar uma redação sobre ambição e ética, ligando o livro “O Hobbit” à vida no Brasil. Cada escolha sua vira um pedaço do texto, e cada acerto vale XP.',
  trilhaTip: '7 fases. Nas 3 primeiras, você entende a proposta, lê o texto de apoio e escolhe os argumentos. Nas 4 últimas, monta os 4 parágrafos da redação.',
  proposta: {
    contexto: 'Neste trimestre, nossa viagem literária foi com o livro “O Hobbit”, de J.R.R. Tolkien. Ao longo da história, vimos como o desejo incontrolável pelo ouro da Montanha Solitária — a chamada “doença do dragão” — corrompeu personagens, destruiu alianças e testou os limites da lealdade.</p><p>A obra ilustra com precisão como a busca incessante por riquezas e poder pode cegar e destruir qualquer amizade. Fora da ficção, a realidade do Brasil hoje é bem parecida. Nesse cenário, o que está em jogo são os limites entre a ambição e a honestidade no nosso dia a dia, onde todo mundo parece pensar só em si mesmo, quando na verdade a gente precisa urgente voltar a olhar para o bem coletivo.',
    comando: 'A partir da leitura do texto motivador e com base nos conhecimentos construídos ao longo de sua formação, redija um TEXTO DISSERTATIVO-ARGUMENTATIVO em modalidade escrita formal da língua portuguesa sobre o Tema: “Fronteiras entre ambição e ética na sociedade brasileira”, apresentando proposta de intervenção que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para a defesa de seu ponto de vista.'
  },
  textos: [{
    rotulo: 'Texto de apoio 1',
    chamada: 'Leia o texto com calma, um parágrafo de cada vez',
    html: `
    <p>A [[globalizacao|globalização]] e a tecnologia têm contribuído intensamente para o progresso científico na [[contemporaneidade|contemporaneidade]]. As fronteiras não se impõem mais como bloqueios à informação, e a [[potencializacao|potencialização]] das ações humanas trouxeram impactos positivos na comunicação e na engenharia. Nesse contexto, questiona-se a respeito dos possíveis desafios [[confrontados|confrontados]] pelos [[principios|princípios éticos]] na [[modernidade|modernidade]] e, além disso, sobre a possibilidade de haver um conjunto de [[normas|normas morais]] de caráter geral, que [[unificassem|unificassem]] as sociedades [[etnicamente|etnicamente heterogêneas]].</p>
    <p>Segundo Hans Jonas (1979), os conceitos éticos da atualidade diferem-se dos antigos porque não estão [[pautados|pautados]] nas relações humanas íntimas e [[mutuas|mútuas]], mas se concentram em [[regrar|regrar]] [[tecnicamente|ações tecnicamente modificadas]] que alteram a própria natureza de agir do homem. Nessa linha, a [[problematica|problemática]] encontra-se, justamente, na [[adequacao|adequação]] da atividade científica às exigências éticas governantes [[comvistas|com vistas a]] torná-la [[genuinamente|“genuinamente”]] humana. Isso parece explicar o crescente debate [[acerca|acerca]] da [[ambientacao|ambientação ética]] dos robôs que, [[emface|em face]] da evolução [[frenetica|frenética]] da [[ia|Inteligência Artificial]], vêm desenvolvendo [[cognitivas|capacidades cognitivas]] cada vez mais próximas a do homem.</p>
    <p>A queda do [[berlim|muro de Berlim]] marcou a superação das barreiras culturais, o que impulsionou a [[desenvoltura|desenvoltura]] da globalização como fenômeno mundial. Porém, embora tenha trazido efeitos positivos, como a expansão do mercado econômico e a diminuição das distâncias e do tempo, esse processo modificou a natureza do [[estado|Estado]]. Bauman (2001), por exemplo, [[aduz|aduz]] que a política moderna [[peleja|peleja]] com a velocidade com que o [[capital|capital]] se movimenta e, na maioria das vezes, obriga-se a [[ceder|ceder]] às regras da [[livreempresa|livre empresa]]. Essa preocupação excessiva com o capital gerou um [[vazio|vazio ético]] porque [[cerceou|cerceou]] as necessidades humanas, tornando-se urgente, conforme menciona Herrero (1999), a recriação de uma [[solidaria|ética solidária e universal]].</p>
    <p>Nesse sentido, percebe-se que a globalização não contribuiu para a [[hegemonia|hegemonia]] ética das sociedades. Isso porque os princípios morais são [[subjetivos|subjetivos]] [[amedida|à medida em que]] são formados a partir de [[simbolicas|construções simbólicas]] e culturais de cada comunidade. Weber (2013) acreditava que [[nemsequer|nem sequer]] a [[cristandade|cristandade]] unificou a ética, pois até mesmo dentro de sua própria estrutura havia [[dissenso|dissenso]] entre suas [[vertentes|vertentes]] acerca de quais valores seriam os mais importantes. Por isso, torna-se correto afirmar que [[inexiste|inexiste]] uma ética universal, mesmo que a tendência atual seja a de [[interconexao|interconexão]] entre as mais variadas culturas.</p>
    <p>Desse modo, nota-se que a aplicação dos princípios morais às [[interpessoais|relações interpessoais]] modificadas pela tecnologia, bem como o equilíbrio entre o capital e as necessidades individuais são exemplos dos maiores desafios encontrados pela ética moderna. [[emmira|Tendo em mira]] o contexto social que cada sociedade se desenvolve, compreende-se que não há um código ético [[hegemonico|hegemônico unificador]]. No entanto, [[aopasso|ao passo que]] a globalização ganha cada vez mais espaço, alguns problemas tornam-se comuns às sociedades [[contemporaneas|contemporâneas]], apesar de [[notadamente|notadamente]] heterogêneas.</p>
    <p class="fonte">Referência:<br>BEZERRA, Tauã Santos. <i>Os Desafios da ética na contemporaneidade</i>. Jusbrasil, 2021. Disponível em: <a href="${FONTE}" target="_blank" rel="noopener">${FONTE}</a> Acesso em: 21 set. 2026.</p>`,
    facil: `
    <h3>O texto, parágrafo por parágrafo</h3>
    <ul class="facil">
      <li><b>1º parágrafo:</b> a globalização e a tecnologia trouxeram muito progresso, e hoje a informação passa pelas fronteiras sem barreiras. Nesse cenário, surgem duas perguntas: quais são os desafios da ética hoje? É possível ter regras de ética que valham para todos os povos?</li>
      <li><b>2º parágrafo:</b> para <b>Hans Jonas</b> (1979), a ética antiga se baseava nas relações próximas entre as pessoas. Já a ética de hoje se preocupa em criar regras para as ações que a <b>técnica</b> mudou. O desafio é fazer a ciência seguir a ética, para que a ciência seja humana de verdade.</li>
      <li>Ainda no 2º parágrafo: o texto diz que isso ajuda a explicar o debate sobre a ética dos <b>robôs</b>, que, com a Inteligência Artificial, estão cada vez mais parecidos com o ser humano na capacidade de pensar.</li>
      <li><b>3º parágrafo:</b> a queda do <b>Muro de Berlim</b> ajudou a globalização a crescer. Ela trouxe coisas boas, como mais comércio e distâncias menores, mas mudou o jeito de ser do <b>Estado</b>. Para <b>Bauman</b> (2001), a política luta com a velocidade do dinheiro e, na maioria das vezes, <b>cede às regras do mercado</b>.</li>
      <li>Ainda no 3º parágrafo: essa preocupação exagerada com o dinheiro criou um <b>vazio ético</b>, porque deixou de lado as necessidades das pessoas. Por isso, como diz <b>Herrero</b> (1999), é urgente recriar uma <b>ética solidária e universal</b>, que pense em todos.</li>
      <li><b>4º parágrafo:</b> a globalização não deu uma só ética a todas as sociedades, porque os valores nascem da <b>cultura de cada comunidade</b>. <b>Weber</b> acreditava que nem os cristãos conseguiram ter uma só ética, já que os próprios grupos cristãos discordavam sobre quais valores eram os mais importantes.</li>
      <li>Ainda no 4º parágrafo: por isso, o texto diz que <b>não existe uma ética universal</b>, mesmo com as culturas cada vez mais ligadas.</li>
      <li><b>5º parágrafo:</b> dois dos maiores desafios da ética hoje são usar a ética nas relações mudadas pela tecnologia e equilibrar o <b>dinheiro</b> com as <b>necessidades das pessoas</b>.</li>
      <li>Ainda no 5º parágrafo: como cada sociedade se desenvolve de um jeito, não existe uma ética única para todas. Mas, com a globalização, alguns problemas passam a ser <b>comuns a todas</b>.</li>
    </ul>`
  }],
  rep: REP, repOrdem: REP_ORDER, causas: CAUSAS, aberturas: ABERTURAS, ponte: PONTE,
  ponteRep: { contraste: { 2: 'gerson' } },
  aberturaDica: 'Uma boa introdução começa com um repertório: uma lei, a ideia de um filósofo, uma obra literária ou uma expressão conhecida. Escolha um da sua mochila.',
  ponteDicas: {
    contraste: 'A frase da mochila mostra como deveria ser. Agora mostre que, na prática, ainda não é assim.',
    dado: 'A frase da mochila mostra um problema. Agora diga o que ela revela.'
  },
  con: CON, agentes: AGENTES, acoes: ACOES, detGeral: DET_GERAL, meios: MEIOS, fins: FINS,
  quiz: QUIZ, gloss: GLOSS, fases: FASES,
  causasPergunta: 'Por que, no Brasil, a ambição muitas vezes passa por cima da ética?',
  teses: [
    (a, b) => `a ambição, que não é ruim por si só, ultrapassa as fronteiras da ética na sociedade brasileira devido, principalmente, ${a.tese} e ${b.tese}.`,
    (a, b) => `querer crescer na vida não é errado, mas, na sociedade brasileira, a ambição sem ética é alimentada, principalmente, ${a.por} e ${b.por}.`,
    (a, b) => `a ambição só se torna um problema quando ignora a ética, e dois fatores favorecem isso na sociedade brasileira: ${a.nom} e ${b.nom}.`
  ],
  retomadas: (a, b) => ['fica claro que a ambição precisa ser guiada pela ética.', 'é preciso equilibrar o desejo de crescer com o respeito ao próximo.', `enfrentar ${a.nom} e ${b.nom} é o caminho para unir ambição e ética.`],
  info: {
    temaCard: '<p><b>Fronteiras</b> = limites.<br><b>Ambição</b> = vontade de crescer e de conquistar coisas. Ela não é ruim por si só.<br><b>Ética</b> = agir certo, respeitando as pessoas e as regras.</p><p>Na sua redação, mostre que o problema não é querer crescer, e sim passar dos limites da ética.</p><p class="exmini">A pergunta do tema é: <b>na sociedade brasileira, até onde a vontade de ganhar pode ir sem passar por cima dos outros?</b></p>',
    repertorioTipos: 'Uma lei, a ideia de um filósofo, um livro ou uma expressão conhecida.',
    argumentoExemplo: { opiniao: 'no Brasil, a ambição muitas vezes passa por cima da ética.', argumento: 'porque quem desvia dinheiro público nem sempre é punido.' },
    introExemplo: 'A Constituição Federal de 1988, no artigo 37, determina que a administração pública obedeça ao princípio da moralidade. No entanto, na prática, a busca exagerada por dinheiro e poder frequentemente deixa a honestidade de lado. Nesse contexto, a ambição, que não é ruim por si só, ultrapassa as fronteiras da ética na sociedade brasileira devido, principalmente, ao individualismo e à impunidade.',
    solucaoExemplos: { agente: 'o Governo Federal', acao: 'criar campanhas que valorizem a honestidade', meio: 'por meio de um plano com metas e prazos', fim: 'para que agir certo volte a ser motivo de orgulho' }
  },
  checagem: {
    temaRegex: /ambi[cç][aã]o|ambicios|(^|[^a-zà-ú])(anti)?[ée]tic|honest|desonest|gan[aâ]ncia/i,
    temaDica: 'Use as palavras “ambição” e “ética” já no 1º parágrafo.',
    repRegex: /constitui[cç][aã]o|artigo 37|moralidade|arist[oó]teles|meio-termo|hobbit|tolkien|doen[cç]a do drag[aã]o|bilbo|pedra arken|g[eé]rson|levar vantagem em tudo|ra[ií]zes do brasil|buarque de holanda|homem cordial|kant|hans jonas|bauman|herrero|weber|texto de apoio|vazio [eé]tico|iguais perante a lei|12\.846|anticorrup[cç][aã]o|9\.394|\bldb\b|diretrizes e bases/i
  }
});
})();
