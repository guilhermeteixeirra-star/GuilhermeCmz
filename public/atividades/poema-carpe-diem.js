/* Missão Redação · atividade da 1ª Série, Texto 1 (poema).
   © 2026 Professor Guilherme Camozzato Teixeira. Todos os direitos reservados. */
(function(){
'use strict';

/* ---------- a imagem central do poema ----------
   Cada imagem tem os versos que mudam com ela:
   e1v1 = a cena de hoje; e1v3 = comparação (vem depois de “Como”);
   e2v1 = a cena do tempo passando; e2v3 = antítese (vem depois de “Ontem”, tem “hoje”);
   e3v1 = a virada para o futuro (vem depois de “Mas”); e3v3 = uma atitude de hoje pelo amanhã. */
const IMG = {
  semente: {
    nome: 'A plantação', desc: 'Plantar hoje para colher amanhã: a semente, a chuva e a colheita.',
    e1v1: ['O sol da manhã acorda a roça.', 'O galo canta no terreiro.', 'O orvalho brilha nas folhas.'],
    e1v3: ['a chuva, a alegria chega.', 'o broto, o coração se abre.', 'o feijão, a esperança brota.'],
    e2v1: ['O milho cresce depressa.', 'A lua muda a cada semana.', 'O verde da lavoura vira dourado.'],
    e2v3: ['grão, hoje espiga.', 'chão vazio, hoje plantação.', 'criança, hoje jovem.'],
    e3v1: [{t:'a semente é uma promessa.', tag:'Metáfora'}, 'a colheita vai chegar.', 'quem planta, um dia colhe.'],
    e3v3: ['Cultive a roça com paciência.', 'Escolha bem o que vai plantar.', 'Trabalhe a terra com amor.'],
    titulos: ['O tempo da semente', 'Plantar e colher', 'Do grão ao pão'],
    dica: {e1v1:'Terreiro é o pátio de terra perto da casa. Orvalho são as gotinhas de água que aparecem nas folhas de manhã.', e2v1:'Lavoura é o mesmo que plantação.', e2v3:'Espiga é a parte do milho onde ficam os grãos.'}
  },
  flor: {
    nome: 'A flor', desc: 'A flor se abre, enfeita o dia e murcha. Lembra os “florescentes dias” de Gonzaga.',
    e1v1: ['O jardim amanheceu florido.', 'O quintal está cheio de flores.', 'As flores enfeitam a manhã.'],
    e1v3: ['a borboleta, eu danço.', 'a rosa, o coração se abre.', 'o mel, o amor é doce.'],
    e2v1: ['As pétalas caem com o vento.', 'Até a rosa mais bela murcha.', 'O perfume das rosas dura pouco.'],
    e2v3: ['botão, hoje flor.', 'semente, hoje jardim.', 'criança, hoje jovem.'],
    e3v1: ['a flor deixa a semente.', 'depois da flor vem o fruto.', 'outra flor vai nascer.'],
    e3v3: ['Regue as plantas com paciência.', 'Não esqueça as raízes.', 'Plante o que você quer colher.'],
    titulos: ['Florescentes dias', 'A flor do tempo', 'Enquanto há flores'],
    dica: {e2v3:'Botão é a flor ainda fechada.'}
  },
  rio: {
    nome: 'O rio', desc: 'A água corre e não volta. O tempo também é assim.',
    e1v1: ['O rio brilha com o sol da manhã.', 'A água canta entre as pedras.', 'O rio corre limpo e calmo.'],
    e1v3: ['o peixe, o coração é livre.', 'a canoa, eu vou devagar.', 'a brisa, eu fico leve.'],
    e2v1: ['A água que se vai não volta mais.', 'O rio desce sem olhar para trás.', 'O rio nunca é o mesmo.'],
    e2v3: ['nascente, hoje correnteza.', 'gota, hoje cachoeira.', 'criança, hoje jovem.'],
    e3v1: ['o rio sempre encontra o mar.', 'o rio não para na curva.', 'o rio sabe aonde vai.'],
    e3v3: ['Siga em frente com coragem.', 'Mantenha a água limpa.', {t:'Seja ponte para quem precisa.', tag:'Metáfora'}],
    titulos: ['O rio do tempo', 'Rio abaixo', 'Correnteza'],
    dica: {e2v1:'A opção C lembra uma frase do filósofo grego Heráclito: ninguém entra duas vezes no mesmo rio, porque a água está sempre mudando.', e2v3:'Nascente é o lugar onde o rio começa.'}
  },
  sol: {
    nome: 'O sol do dia', desc: 'O sol nasce, brilha e se põe. Cada dia tem a sua luz.',
    e1v1: ['O sol aparece no horizonte.', 'A manhã entra pela porta.', 'O céu amanhece azul e limpo.'],
    e1v3: ['o girassol, eu sigo a luz.', 'o sabiá, a alegria canta.', 'o fogo, o abraço aquece.'],
    e2v1: ['O sol já vai se pondo.', 'A sombra cresce no quintal.', 'A tarde pinta o céu de laranja.'],
    e2v3: ['frio, hoje calor.', 'eu brincava, hoje trabalho.', 'criança, hoje jovem.'],
    e3v1: ['o sol vai nascer de novo.', 'a noite traz outra manhã.', 'o sol promete voltar.'],
    e3v3: ['Faça a sua parte enquanto é dia.', 'Plante árvores para quem virá.', {t:'Seja luz na vida de alguém.', tag:'Metáfora'}],
    titulos: ['O sol de cada dia', 'Do nascer ao pôr do sol', 'Um novo amanhecer'],
    dica: {e1v1:'Horizonte é a linha onde o céu parece encontrar a terra.', e1v3:'Sabiá é um passarinho que canta muito bonito.'}
  },
  estrada: {
    nome: 'A estrada', desc: 'Cada passo de hoje leva você a um lugar novo amanhã.',
    e1v1: ['A estrada de terra brilha ao sol.', 'O caminho começa em casa.', 'O caminho da escola está florido.'],
    e1v3: ['um viajante, vejo o mundo.', 'o vento, eu sigo livre.', 'no domingo, ando devagar.'],
    e2v1: ['A paisagem muda a cada curva.', 'As pegadas somem na poeira.', 'Os quilômetros ficam para trás.'],
    e2v3: ['no colo, hoje na estrada.', 'mato, hoje caminho.', 'criança, hoje jovem.'],
    e3v1: ['a estrada continua.', 'cada passo conta.', 'toda estrada tem um destino.'],
    e3v3: ['Escolha bem a direção.', 'Ande firme, mesmo na subida.', 'Ajude quem caminha ao seu lado.'],
    titulos: ['A estrada do tempo', 'Passo a passo', 'Pé na estrada'],
    dica: {e2v3:'Estar no colo é ser carregado, como um bebê.'}
  }
};
const IMG_ORDEM = ['semente', 'flor', 'rio', 'sol', 'estrada'];

/* ---------- versos que valem para qualquer imagem ----------
   V2 = o verso 2 de cada estrofe; RIMA[i] = o verso 4 que rima com V2[i];
   FIXO = os outros 2 versos 4 (sem rima); SEM_V2 = o verso 4 quando o aluno escreveu o verso 2 do seu jeito. */
const V2 = {
  1: [{t:'Cada dia é um presente.', tag:'Metáfora'}, 'Hoje é o tempo de viver.', 'O melhor momento é agora.'],
  2: [{t:'O tempo voa.', tag:'Metáfora'}, {t:'A vida é um sopro, um instante.', tag:'Metáfora'}, 'O tempo não espera.'],
  3: ['O amanhã pede responsabilidade.', 'Proteja o corpo e a mente.', 'Sonhe com o futuro sem medo.']
};
const RIMA = {
  1: ['Aproveite com a alma contente!', 'Abra os olhos: há tanto para ver!', 'Abra a janela e olhe lá fora!'],
  2: ['E o relógio não perdoa.', 'E o relógio segue adiante.', 'E logo passa a primavera.'],
  3: ['E o hoje pede felicidade.', 'E o amanhã sorri para a gente.', 'E prepare o amanhã desde cedo.']
};
const FIXO = {
  1: ['Não guarde o sorriso para depois.', 'Fique perto de quem você ama.'],
  2: ['O que passou fica na lembrança.', {t:'As horas escorrem pelos dedos.', tag:'Metáfora'}],
  3: [{t:'Hoje e amanhã, de mãos dadas.', tag:'Antítese'}, 'Viva o hoje e cuide do amanhã.']
};
const SEM_V2 = {1: 'Aproveite cada momento!', 2: 'Cada hora acontece uma só vez.', 3: 'O equilíbrio une hoje e amanhã.'};

/* ---------- desafios (a palavra certa entra no começo do verso) ---------- */
const CONS = {
  como: [{t:'Mas', d:'“Mas” mostra uma ideia contrária. Para comparar, use “como”.'},
         {t:'Como', ok:1},
         {t:'Porque', d:'“Porque” explica uma causa. Para comparar duas coisas, use “como”.'}],
  ontem: [{t:'Amanhã', d:'“Amanhã” fala do futuro. Este verso compara o passado com o hoje.'},
          {t:'Ontem', ok:1},
          {t:'Sempre', d:'“Sempre” não mostra mudança. A antítese precisa do contrário de “hoje”: uma palavra do passado.'}],
  mas: [{t:'Como', d:'“Como” serve para comparar. Aqui você quer mostrar uma virada, uma ideia contrária.'},
        {t:'Ontem', d:'“Ontem” fala do passado. Esta estrofe olha para o futuro.'},
        {t:'Mas', ok:1}]
};

const txt = o => (o && typeof o === 'object') ? o.t : o;
const comTag = (lista, tag) => lista.map(o => typeof o === 'string' ? {t:o, tag} : o);
const imgDe = H => IMG[((H && H.escolha && H.escolha('imagem')) || {}).id] || IMG.semente;
const ultimaPalavra = s => (String(s || '').match(/([A-Za-zÀ-ÿ]+)[^A-Za-zÀ-ÿ]*$/) || ['', ''])[1];

const PAPEL = {
  1: [['A cena', 'Mostre o hoje com a sua imagem'], ['O valor do hoje', 'Diga por que o hoje vale tanto'], ['Comparação', 'Faça uma comparação'], ['O convite', 'Convide o leitor a aproveitar o dia']],
  2: [['A cena', 'Mostre o tempo passando'], ['O tempo passa', 'Diga como o tempo passa'], ['Antítese', 'Junte o ontem e o hoje'], ['O fecho', 'Feche a estrofe']],
  3: [['A virada', 'Vire o poema para o amanhã'], ['Responsabilidade', 'Diga como cuidar do futuro'], ['O cuidado', 'O que fazer hoje pelo amanhã?'], ['O fim', 'Termine o poema com equilíbrio']]
};

function blockDef(id, H){
  const img = imgDe(H);
  if(id === 'titulo') return {n:'O título', q:'Dê um nome ao seu poema', verso:true,
    tip:`O título é a primeira coisa que o leitor vê. Estes combinam com a sua imagem: ${img.nome.toLowerCase()}.`, opts:img.titulos.slice()};
  const m = /^e([123])_v([1234])$/.exec(id);
  if(!m) return null;
  const e = +m[1], v = +m[2], [papel, q] = PAPEL[e][v - 1];
  const d = {n:`Verso ${v} de 4 · ${papel}`, q, verso:true};
  const extra = (img.dica && img.dica[`e${e}v${v}`]) ? ' ' + img.dica[`e${e}v${v}`] : '';
  if(v === 2){
    d.tip = e === 1 ? 'Escolha uma ideia sobre o presente. A última palavra deste verso pode rimar com o verso 4.'
      : e === 2 ? 'Escolha uma ideia sobre o tempo que passa. Sopro é um ar rápido, que passa logo. A última palavra deste verso pode rimar com o verso 4.'
      : 'Viver o hoje com responsabilidade é não esquecer o que vem depois. A última palavra pode rimar com o verso 4.';
    d.opts = V2[e].slice();
    return d;
  }
  if(v === 4){
    const ant = H && H.opcao ? H.opcao(`e${e}_v2`) : null;
    const i = ant ? V2[e].findIndex(o => txt(o) === txt(ant)) : -1;
    const fim = e === 1 ? 'Chame o leitor para aproveitar o dia. ' : e === 2 ? 'O fecho termina a estrofe do tempo que passa. ' : 'O último verso fecha o poema. Pense no equilíbrio entre o hoje e o amanhã: é o tema do seu poema. ';
    d.tip = fim + (i >= 0 ? `A opção marcada com “Rima” termina com o mesmo som de “${ultimaPalavra(txt(V2[e][i]))}”, a última palavra do verso 2. Rimar é opcional: você decide.`
      : 'Se quiser rimar com o verso 2 que você escreveu, escreva este verso do seu jeito também.');
    d.opts = [i >= 0 ? {t:RIMA[e][i], tag:'Rima'} : SEM_V2[e], ...FIXO[e]];
    return d;
  }
  if(e === 1 && v === 1){ d.tip = `A sua imagem é ${img.nome.toLowerCase()}. Este verso abre o poema e mostra a cena de hoje.` + extra; d.opts = img.e1v1.slice(); return d; }
  if(e === 1 && v === 3){
    return Object.assign(d, {tip:'A comparação liga duas coisas com a palavra “como”. Primeiro, resolva o desafio.' + extra, opts:comTag(img.e1v3, 'Comparação'),
      cons:CONS.como, consEyebrow:'Desafio · comparação', consQ:'Este verso vai comparar duas coisas. Qual palavra faz a comparação?', consHint:'Resolva o desafio: escolha a palavra que compara.'});
  }
  if(e === 2 && v === 1){ d.tip = `Mostre a sua imagem mudando com o tempo. A sua imagem é ${img.nome.toLowerCase()}.` + extra; d.opts = img.e2v1.slice(); return d; }
  if(e === 2 && v === 3){
    return Object.assign(d, {tip:'Antítese é juntar ideias contrárias no mesmo verso: aqui, o passado e o hoje.' + extra, opts:comTag(img.e2v3, 'Antítese'),
      cons:CONS.ontem, consEyebrow:'Desafio · antítese', consQ:'O verso vai mostrar o passado e o “hoje” lado a lado. Qual palavra começa o verso?', consHint:'Resolva o desafio: escolha a palavra contrária de “hoje”.'});
  }
  if(e === 3 && v === 1){
    return Object.assign(d, {tip:'Até aqui, o poema falou do hoje e do tempo que passa. Agora ele olha para o futuro.', opts:img.e3v1.slice(),
      cons:CONS.mas, consEyebrow:'Desafio · palavra de ligação', consQ:'O poema vai mudar de rumo e olhar para o amanhã. Qual palavra mostra essa virada (uma ideia contrária)?', consHint:'Resolva o desafio: escolha a palavra da virada.'});
  }
  d.tip = `Escolha uma atitude de hoje que ajuda o amanhã. A sua imagem é ${img.nome.toLowerCase()}.`;
  d.opts = img.e3v3.slice();
  return d;
}

/* ---------- lista de conferência da folha ---------- */
const BLOCOS = ['e1_v1','e1_v2','e1_v3','e1_v4','e2_v1','e2_v2','e2_v3','e2_v4','e3_v1','e3_v2','e3_v3','e3_v4','titulo'];
const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// palavra inteira, também com acento (o \b do JavaScript não entende “á”, “ã”…)
const LETRA = 'A-Za-zÀ-ÿ';
const temPalavra = (lista, s) => new RegExp(`(^|[^${LETRA}])(${lista})(?![${LETRA}])`, 'i').test(s);
// o som da rima: da vogal forte até o fim (presente/contente → “ente”; voa/perdoa → “oa”; viver/ver → “er”)
function somDaRima(palavra){
  const w = String(palavra || '').toLowerCase();
  if(w.length < 2) return '';
  let i = -1;
  for(let k = w.length - 1; k >= 0; k--) if('áéíóúâêô'.includes(w[k])){ i = k; break; }
  if(i < 0) i = w.search(/[ãõ]/);
  if(i < 0){
    const nuc = []; let pv = false;
    for(let k = 0; k < w.length; k++){
      const c = w[k];
      if(!'aeiouü'.includes(c) || (c === 'u' && /[qg]/.test(w[k - 1] || '') && /[ei]/.test(w[k + 1] || ''))){ pv = false; continue; }
      if(!(pv && (c === 'i' || c === 'u'))) nuc.push(k);
      pv = true;
    }
    if(!nuc.length) return '';
    const oxitona = nuc.length === 1 || /(?:[rlzx]|[iu]s?|[iu][mn]s?)$/.test(w);
    i = nuc[nuc.length - (oxitona ? 1 : 2)];
  }
  return semAcento(w.slice(i));
}
function rimam(x, y){
  const a = ultimaPalavra(x), b = ultimaPalavra(y), ka = somDaRima(a), kb = somDaRima(b);
  return !!ka && ka === kb && semAcento(a) !== semAcento(b);
}
const CONTRARIOS = [['ontem','hoje'],['hoje','amanhã'],['passado','futuro'],['dia','noite'],['perto','longe'],['alegria','tristeza'],['frio','calor'],['começo','fim'],['nascer','morrer'],['velho','novo'],['chorei|choro|chorar','sorrio|sorri|sorrir']];
function checks(ctx){
  const ps = (ctx.paras || []).map(p => String(p || ''));
  const versos = ps.map(p => p.split('\n').map(x => x.trim()).filter(Boolean));
  const tudo = ps.join('\n'), low = tudo.toLowerCase();
  const est = versos.length === 3 && versos.every(v => v.length === 4);
  const hoje = temPalavra('hoje|agora|presente|momento|instante|dia', tudo);
  const amanha = temPalavra('amanhã|futuro|depois|virá|amanhãs', tudo);
  const figs = new Set();
  BLOCOS.forEach(b => {
    const o = ctx.opcao ? ctx.opcao(b) : null;
    if(o && typeof o === 'object' && o.tag && o.tag !== 'Rima' && low.includes(o.t.slice(1).toLowerCase())) figs.add(o.tag.toLowerCase());
  });
  if(temPalavra('como', tudo)) figs.add('comparação');
  if(versos.some(est => est.some(l => CONTRARIOS.some(([a, b]) => temPalavra(a, l) && temPalavra(b, l))))) figs.add('antítese');
  if(versos.some(v => v.some((l, i) => v.some((m, j) => j > i && rimam(l, m))))) figs.add('rima');
  const ab = (tudo.match(/\b(vc|vcs|pq|tb|tbm|blz|mt|mto|mta|msm|hj|kk+|q)\b/gi) || []).map(x => x.toLowerCase());
  const titulo = String(ctx.titulo || '').trim();
  const contagem = versos.map((v, i) => `${i + 1}ª estrofe: ${v.length}`).join(' · ');
  return [
    {id:'estrofes', ok:est, t:'3 estrofes com 4 versos cada', d:est ? '12 versos ao todo, como pede o comando.' : `Cada estrofe precisa de 4 versos, um em cada linha. Agora: ${contagem}.`},
    {id:'titulo', ok:!!titulo, t:'Tem título', d:titulo ? `“${titulo}”.` : 'Dê um nome ao seu poema.'},
    {id:'tema', ok:hoje && amanha, t:'Fala do hoje e do amanhã', d:hoje && amanha ? 'O poema fala do presente e do futuro, como pede o tema.' : (!hoje && !amanha) ? 'O tema pede as duas coisas: viver o hoje e pensar no amanhã.' : !hoje ? 'Fale também do presente (hoje, agora).' : 'Fale também do futuro (amanhã, futuro).'},
    {id:'figuras', ok:figs.size > 0, t:'Usa figuras de linguagem', d:figs.size ? `Você usou: ${[...figs].join(', ')}.` : 'Use uma metáfora, uma comparação (com “como”), uma antítese ou uma rima.'},
    {id:'formal', ok:!ab.length, t:'Sem abreviações de internet', d:ab.length ? `Troque as abreviações: ${[...new Set(ab)].join(', ')}.` : 'Escreva as palavras inteiras, sem “vc”, “pq” ou “hj”.'}
  ];
}

const QUIZ = {
  estrofes: {p:'Como o seu poema precisa ser?', ops:['3 estrofes, com 4 versos em cada uma', '4 estrofes, com 3 versos em cada uma', '1 estrofe só, com 12 versos', 'Um texto em parágrafos, sem versos'], c:0,
    ok:'Isso! São 3 estrofes de 4 versos: 12 versos ao todo. E não esqueça o título.',
    dicas:{1:'Releia o comando: são TRÊS estrofes, com QUATRO versos em cada uma.', 2:'O comando pede 3 estrofes, ou seja, 3 grupos de versos.', 3:'Parágrafo é de texto em prosa. O poema é escrito em versos.'}},
  carpe: {p:'O que quer dizer “carpe diem”?', ops:['Aproveite o dia', 'Esqueça o amanhã', 'Trabalhe sem parar', 'O tempo não passa'], c:0,
    ok:'Isso! Carpe diem é latim e quer dizer “aproveite o dia”.',
    dicas:{1:'Não. Aproveitar o dia não quer dizer esquecer o amanhã.', 2:'Não. A expressão fala de aproveitar o tempo, e não de trabalhar sem parar.', 3:'É o contrário: o tempo passa, e por isso é preciso aproveitá-lo.'}},
  tema: {p:'Qual destas ideias combina com o tema do seu poema?', ops:['Só a festa importa: o amanhã não existe', 'Devemos viver bem o hoje, sem esquecer o futuro', 'Devemos pensar só no futuro e esquecer o hoje', 'O tempo para e espera por nós'], c:1,
    ok:'Isso! O tema pede equilíbrio: aproveitar o hoje e também cuidar do amanhã.',
    dicas:{0:'Cuidado! O tema diz “sem deixar de pensar no futuro”. Só festa não é o tema.', 2:'Cuidado! O tema começa com “viver o hoje”. Não dá para esquecer o presente.', 3:'O tempo não para. A proposta diz que os momentos da vida são passageiros.'}},
  lira2: {p:'Na Lira II, o que acontece quando o poeta vê o rosto perfeito?', ops:['Ele suspira e se apaixona', 'Ele fica com raiva', 'Ele sente medo e foge', 'Ele dorme e sonha'], c:0,
    ok:'Isso! O “estrago no coração” é a paixão: o poeta ficou apaixonado.',
    dica:'Releia os 4 primeiros versos: “Dei logo um suspiro” e “estrago no coração”.'},
  pedido: {p:'Na Lira XIV, o que o poeta pede a Marília?', ops:['Que ela aproveite o tempo', 'Que ela espere muitos anos', 'Que ela vá embora', 'Que ela esqueça o poeta'], c:0,
    ok:'Isso! “Aproveite o tempo” é o carpe diem: viver o hoje, porque os dias passam.',
    dicas:{1:'É o contrário! Ele pergunta: “Que havemos de esperar?”. Ele não quer esperar.', 2:'Não. Releia o verso “Ah! não, minha Marília, aproveite o tempo”.', 3:'Não. Releia o verso “Ah! não, minha Marília, aproveite o tempo”.'}},
  frias: {p:'O que quer dizer o verso “As glórias que vêm tarde já vêm frias”?', ops:['As alegrias que chegam tarde demais já não têm a mesma graça', 'No inverno, as pessoas ficam mais felizes', 'Quem chega atrasado sente frio', 'As coisas boas sempre chegam na hora certa'], c:0,
    ok:'Isso! Aqui “frias” quer dizer sem graça, sem o calor da alegria. Por isso, não vale a pena esperar demais.',
    dicas:{1:'O verso não fala de temperatura. Aqui “frias” tem outro sentido: sem graça, sem alegria.', 2:'O verso não fala de temperatura. Aqui “frias” tem outro sentido: sem graça, sem alegria.', 3:'O verso diz o contrário: a glória que demora perde a graça.'}},
  figura: {p:'Leia o verso: “A vida passa como o vento.” Qual figura de linguagem aparece nele?', ops:['Comparação', 'Antítese', 'Rima'], c:0,
    ok:'Isso! A palavra “como” liga a vida ao vento. Isso é comparação.',
    dicas:{1:'Antítese junta ideias contrárias, como “ontem” e “hoje”. Aqui, procure a palavra “como”.', 2:'Rima é o som igual no fim de dois versos. Aqui há um verso só. Procure a palavra “como”.'}},
  flores: {p:'Gonzaga escreveu “florescentes dias”. Que imagem ele usou para falar dos dias da juventude?', ops:['Flores que se abrem', 'O gelo do inverno', 'Pedras pesadas'], c:0,
    ok:'Isso! Os dias da juventude são bonitos e cheios de vida, como flores. E as flores não duram para sempre. Gonzaga não usou “como”: por isso, é uma metáfora.',
    dica:'Olhe bem a palavra: “florescentes” vem de “flor”.'},
  antitese: {p:'Em qual destes versos há uma antítese (ideias contrárias)?', ops:['O dia está bonito e azul.', 'Perto ou longe, eu penso em você.', 'A vida é doce como mel.'], c:1,
    ok:'Isso! “Perto” e “longe” são contrários. Juntar contrários é antítese.',
    dicas:{0:'Aqui não há contrários. Procure duas palavras de sentido oposto.', 2:'Esse verso tem uma comparação (“como”), e não uma antítese.'}},
  revisar: {p:'O comando pede para revisar o poema no final. O que você deve conferir?', ops:['As estrofes, a clareza das ideias e a linguagem', 'Só se a letra está bonita', 'Se o poema tem muitas palavras difíceis'], c:0,
    ok:'Isso! Confira as 3 estrofes de 4 versos, se as ideias estão claras e se a linguagem combina com um poema. Na folha, você pode mudar qualquer palavra.',
    dicas:{1:'A letra importa, mas o comando pede mais: estrofes, ideias e linguagem.', 2:'Palavra difícil não deixa o poema melhor. O importante é ser claro e expressivo.'}}
};

const GLOSS = {
  marilia: ['Marília de Dirceu', 'livro de poemas de Tomás Antônio Gonzaga. Nos poemas, o poeta se chama Dirceu, e a mulher amada se chama Marília.'],
  lira: ['Lira', 'nome de cada poema do livro Marília de Dirceu. A lira era um instrumento musical antigo, de cordas.'],
  suspiro: ['Suspiro', 'respiração longa e funda, de quem está apaixonado, triste ou aliviado.'],
  conheceu: ['Conheceu haver-me feito', 'percebeu que tinha feito.'],
  estrago: ['Estrago', 'dano, destruição. Na Lira II, “estrago no coração” é a paixão. Na Lira XIV, é o estrago que o tempo faz no corpo e no rosto.'],
  punha: ['Punha em mim os olhos', 'olhava para mim.'],
  entendia: ['Entendia', 'percebia, notava.'],
  modesta: ['Modesta vista', 'olhar tímido, envergonhado. “Baixava a modesta vista ao chão” = olhava para o chão, com vergonha.'],
  havemos: ['Havemos de esperar', 'vamos esperar. O poeta pergunta: para que esperar, se os dias estão passando?'],
  florescentes: ['Florescentes dias', 'dias cheios de flores, bonitos como a juventude.'],
  glorias: ['Glórias', 'alegrias, conquistas, momentos felizes.'],
  frias: ['Frias', 'aqui não é temperatura: quer dizer sem graça, sem o calor da alegria.'],
  enfim: ['Enfim', 'por fim, afinal.'],
  estrela: ['Estrela', 'aqui quer dizer sorte, destino. “Mudar-se a nossa estrela” = a nossa sorte pode mudar.'],
  roubar: ['Roubar ao corpo as forças', 'tirar a força do corpo. É o que o tempo faz quando a gente envelhece.'],
  semblante: ['Semblante', 'rosto, cara.'],
  graca: ['Graça', 'beleza, encanto.']
};

const planta = (itens) => `<ol class="planta">${itens.map(([c, b, s, x], i) => `<li class="${c}"><b>${b}</b><div><strong>${s}</strong><span>${x}</span></div></li>`).join('')}</ol>`;
const INFO = {
  poema: {titulo:'Traduzindo a proposta', html:`
    <div class="cards three">
      <div class="card"><p class="eyebrow">O que escrever</p><h3>Um poema</h3><p>Um texto escrito em <b>versos</b>, com linguagem bonita e figuras de linguagem.</p></div>
      <div class="card"><p class="eyebrow">Sobre o quê</p><h3>O tempo</h3><p>Viver bem o <b>hoje</b>, sem esquecer o <b>amanhã</b>.</p></div>
      <div class="card"><p class="eyebrow">Para quem</p><h3>A comunidade escolar</h3><p>O poema vai para o mural do projeto e vai ser lido em voz alta.</p></div>
    </div>
    <h3>Palavras do poema</h3>
    <ul class="facil">
      <li><b>Verso</b> = cada linha do poema.</li>
      <li><b>Estrofe</b> = um grupo de versos. Entre uma estrofe e outra, fica uma linha em branco.</li>
      <li><b>Rima</b> = som igual no fim de dois versos, como <i>presente</i> e <i>contente</i>. No seu poema, a rima é opcional: você decide.</li>
      <li><b>Título</b> = o nome do poema.</li>
    </ul>
    <h3>A planta do seu poema</h3>
    ${planta([['hl0','Título','O nome do poema','Você escolhe no final.'],['hl1','1ª','Estrofe do hoje','4 versos sobre viver o presente.'],['hl3','2ª','Estrofe do tempo que passa','4 versos sobre os momentos que não voltam.'],['hl2','3ª','Estrofe do amanhã','4 versos sobre pensar no futuro.']])}`},
  carpe: {titulo:'O que é carpe diem?', html:`
    <div class="card"><p><b>Carpe diem</b> é uma expressão em <b>latim</b>, a língua dos antigos romanos. Quer dizer <b>“aproveite o dia”</b>.</p>
      <p>Ela vem de um poema de <b>Horácio</b>, um poeta romano que viveu há mais de 2 mil anos.</p></div>
    <h3>O tema do seu poema</h3>
    <p class="exmini">“Carpe diem: a importância de viver o hoje sem deixar de pensar no futuro.”</p>
    <ul class="facil">
      <li><b>Viver o hoje</b> = aproveitar o momento: as pessoas, a natureza e as coisas boas de agora.</li>
      <li><b>Sem deixar de pensar no futuro</b> = cuidar do amanhã com <b>responsabilidade</b>: estudar, trabalhar, cuidar de si e dos outros.</li>
      <li>Ou seja, o tema pede <b>equilíbrio</b>: nem só festa, nem só preocupação.</li>
    </ul>`},
  figuras: {titulo:'Figuras de linguagem', html:`
    <p>Figuras de linguagem são jeitos especiais de dizer as coisas. Elas deixam o poema mais bonito e mais forte. A proposta pede estas quatro:</p>
    <div class="cards">
      <div class="card"><p class="eyebrow">Metáfora</p><p>Dizer que uma coisa <b>é</b> outra, sem usar “como”.</p><p class="exmini">“Cada dia é um presente.”</p></div>
      <div class="card"><p class="eyebrow">Comparação</p><p>Comparar duas coisas usando a palavra <b>“como”</b>.</p><p class="exmini">“O tempo corre como um rio.”</p></div>
      <div class="card"><p class="eyebrow">Antítese</p><p>Juntar ideias <b>contrárias</b>.</p><p class="exmini">“Ontem chorei, hoje sorrio.”</p></div>
      <div class="card"><p class="eyebrow">Rima</p><p>Som igual no <b>fim</b> de dois versos.</p><p class="exmini">Na Lira XIV: “Marília <b>bela</b>” e “nossa <b>estrela</b>”; “florescentes <b>dias</b>” e “vêm <b>frias</b>”.</p></div>
    </div>`},
  imagem: {titulo:'A imagem do tempo', html:`
    <p>O tempo não dá para ver nem pegar. Por isso, os poetas transformam o tempo em uma <b>imagem</b>: uma coisa que a gente vê.</p>
    <p class="exmini">Gonzaga chamou os dias da juventude de <b>“florescentes dias”</b>.</p>
    <p>Daqui a pouco, você vai escolher a imagem do <b>seu</b> poema. Ela vai aparecer nas 3 estrofes e no título.</p>`},
  estrofe1: {titulo:'1ª estrofe: o hoje', html: H => `
    <p>A 1ª estrofe fala do <b>hoje</b>: o que está acontecendo agora e por que vale a pena viver este momento.</p>
    <p class="exmini">A sua imagem: <b>${imgDe(H).nome}</b></p>
    ${planta([['hl1','1','A cena','O que a sua imagem mostra hoje.'],['hl3','2','O valor do hoje','Por que este momento é importante.'],['hl4','3','Comparação','Um verso com “como”.'],['hl5','4','O convite','Chame o leitor para aproveitar o dia.']])}
    <p class="tip">Os versos 2 e 4 podem rimar. Rimar é opcional: você decide.</p>`},
  estrofe2: {titulo:'2ª estrofe: o tempo passa', html: H => `
    <p>A 2ª estrofe mostra que o <b>tempo passa</b>: os momentos da vida não voltam.</p>
    <p>Aqui você vai usar uma <b>antítese</b>: juntar ideias contrárias no mesmo verso, como <b>ontem</b> e <b>hoje</b>.</p>
    <p class="exmini">A sua imagem: <b>${imgDe(H).nome}</b></p>
    ${planta([['hl1','1','A cena','A sua imagem mudando com o tempo.'],['hl3','2','O tempo passa','Uma ideia sobre a passagem do tempo.'],['hl4','3','Antítese','O passado e o hoje no mesmo verso.'],['hl5','4','O fecho','Um verso para fechar a estrofe.']])}`},
  estrofe3: {titulo:'3ª estrofe: o amanhã', html: H => `
    <p>A 3ª estrofe vira o poema para o <b>amanhã</b>. Aproveitar o hoje não é esquecer o futuro.</p>
    <p>Pensar no futuro com <b>responsabilidade</b> é cuidar hoje do que vem depois: de você, das pessoas e da natureza.</p>
    <p class="exmini">A sua imagem: <b>${imgDe(H).nome}</b></p>
    ${planta([['hl1','1','A virada','Uma palavra muda o rumo do poema.'],['hl3','2','Responsabilidade','Como cuidar do futuro.'],['hl4','3','O cuidado','Uma atitude de hoje que ajuda o amanhã.'],['hl5','4','O fim','O último verso fecha o poema com equilíbrio.']])}`},
  titulo: {titulo:'O título', html: H => `
    <p>O título é o nome do poema. É a primeira coisa que o leitor vê no mural.</p>
    <p>Um bom título é curto e combina com a imagem do poema: <b>${imgDe(H).nome.toLowerCase()}</b>.</p>
    <p class="exmini">Os poemas de Gonzaga que você leu se chamam “Lira II” e “Lira XIV”: são números. O seu poema vai ter um nome.</p>`}
};

const FASES = [
  {id:'missao', titulo:'Entender a proposta', sub:'O que o projeto pede',
   steps:[{t:'proposta'},{t:'info',k:'poema'},{t:'quiz',q:'estrofes'},{t:'info',k:'carpe'},{t:'quiz',q:'carpe'},{t:'quiz',q:'tema'},{t:'reward'}]},
  {id:'leitura', titulo:'Ler os poemas', sub:'Marília de Dirceu',
   steps:[{t:'read'},{t:'quiz',q:'lira2'},{t:'quiz',q:'pedido'},{t:'quiz',q:'frias'},{t:'info',k:'figuras'},{t:'quiz',q:'figura'},{t:'reward'}]},
  {id:'ideia', titulo:'A ideia do poema', sub:'A imagem do tempo',
   steps:[{t:'info',k:'imagem'},{t:'quiz',q:'flores'},{t:'escolha',k:'imagem'},{t:'reward'}]},
  {id:'e1', titulo:'1ª estrofe', sub:'O hoje', para:0,
   steps:[{t:'info',k:'estrofe1'},{t:'monte',id:'e1_v1'},{t:'monte',id:'e1_v2'},{t:'monte',id:'e1_v3'},{t:'monte',id:'e1_v4'},{t:'review',p:0},{t:'reward'}]},
  {id:'e2', titulo:'2ª estrofe', sub:'O tempo passa', para:1,
   steps:[{t:'info',k:'estrofe2'},{t:'quiz',q:'antitese'},{t:'monte',id:'e2_v1'},{t:'monte',id:'e2_v2'},{t:'monte',id:'e2_v3'},{t:'monte',id:'e2_v4'},{t:'review',p:1},{t:'reward'}]},
  {id:'e3', titulo:'3ª estrofe', sub:'O amanhã', para:2,
   steps:[{t:'info',k:'estrofe3'},{t:'monte',id:'e3_v1'},{t:'monte',id:'e3_v2'},{t:'monte',id:'e3_v3'},{t:'monte',id:'e3_v4'},{t:'review',p:2},{t:'reward'}]},
  {id:'nome', titulo:'Título', sub:'O nome do poema',
   steps:[{t:'info',k:'titulo'},{t:'monte',id:'titulo'},{t:'quiz',q:'revisar'},{t:'reward'}]}
];

(window.ATIVIDADES = window.ATIVIDADES || []).push({
  id: 'poema-carpe-diem', serie: '1', ordem: 1, rotulo: 'Texto 1',
  tipo: 'poema', genero: 'Poema',
  tema: 'Carpe diem: a importância de viver o hoje sem deixar de pensar no futuro',
  temaRotulo: 'Tema do poema',
  obra: 'poema', obraGenero: 'm',
  folhaTitulo: 'Folha do poema', folhaCabecalho: 'Poema · Projeto “Versos para o Tempo”',
  lead: 'Você vai montar um poema jogando. Cada verso que você escolhe vira uma linha do seu poema, e cada acerto vale XP.',
  trilhaTip: '7 fases. Nas 3 primeiras, você entende a proposta, lê os poemas e escolhe a imagem do seu poema. Depois, monta o poema estrofe por estrofe e escolhe o título.',
  proposta: {
    contexto: 'Sua turma participará do projeto “Versos para o Tempo”, uma iniciativa da escola que busca incentivar a leitura, a interpretação e a produção de poemas. Ao final do projeto, os textos produzidos pelos estudantes serão reunidos em um mural literário e apresentados em um momento de leitura poética para a comunidade escolar. A 1ª série irá produzir poemas inspirando-se nos poemas lidos e na ideia do carpe diem (“aproveite o dia”). Você deverá escrever um poema que leve o leitor a refletir sobre a importância de valorizar o tempo, viver o presente com responsabilidade e reconhecer que os momentos da vida são passageiros.',
    comando: 'Escreva um POEMA com três estrofes, contendo quatro versos em cada estrofe. Você decide se os versos irão conter rimas. Lembre de dar um título para seu poema. Antes de escrever, pense em como irá abordar o seguinte tema: <b>Carpe diem: a importância de viver o hoje sem deixar de pensar no futuro.</b><br><br>Ao escrever, utilize uma linguagem poética, explorando recursos expressivos e figuras de linguagem (metáforas, comparações, antíteses e rimas) que tornem seu poema mais criativo e expressivo. Após concluir a escrita, revise o texto, verificando a organização das estrofes, a clareza das ideias e a adequação da linguagem.'
  },
  textos: [{
    rotulo: 'Texto de apoio 1',
    chamada: 'Leia os dois poemas com calma',
    html: `
    <h3>[[marilia|Marília de Dirceu]]</h3>
    <p><i>Tomás Antônio Gonzaga</i></p>
    <p><b>[[lira|Lira]] II</b><br>(Parte I)</p>
    <p class="verso">“Mal vi seu rosto perfeito<br>Dei logo um [[suspiro|suspiro]], e ele<br>[[conheceu|Conheceu haver-me feito]]<br>[[estrago|Estrago]] no coração.<br>[[punha|Punha em mim os olhos]], quando<br>[[entendia|Entendia]] eu não olhava:<br>Vendo o que via, baixava<br>A [[modesta|modesta vista]] ao chão.”</p>
    <p><b>[[lira|Lira]] XIV</b></p>
    <p class="verso">“Que [[havemos|havemos de esperar]], Marília bela,<br>Que vão passando os [[florescentes|florescentes dias]]?<br>As [[glorias|glórias]] que vêm tarde já vêm [[frias|frias]],<br>E pode, [[enfim|enfim]], mudar-se a nossa [[estrela|estrela]].<br>Ah! não, minha Marília, aproveite o tempo,<br>Antes que faça o [[estrago|estrago]]<br>De [[roubar|roubar ao corpo as forças]],<br>e ao [[semblante|semblante]] a [[graca|graça]]!”</p>
    <p class="fonte">GONZAGA, Tomás Antônio. [Textos escolhidos]. Rio de Janeiro: Academia Brasileira de Letras, [2026?]. Disponível em: <a href="https://www.academia.org.br/academicos/tomas-antonio-gonzaga/textos-escolhidos" target="_blank" rel="noopener">https://www.academia.org.br/academicos/tomas-antonio-gonzaga/textos-escolhidos</a> Acesso em: 6 jul. 2026.</p>`,
    facil: `
    <h3>Os dois poemas em poucas palavras</h3>
    <ul class="facil">
      <li>Os dois poemas são do livro <b>Marília de Dirceu</b>, de Tomás Antônio Gonzaga. Nos poemas, ele se chama <b>Dirceu</b>, e a amada se chama <b>Marília</b>.</li>
      <li><b>Lira II:</b> o poeta vê um rosto perfeito e suspira. Ele se apaixona: é o “estrago no coração”.</li>
      <li>Quem tinha esse rosto olhava para o poeta quando ele não estava olhando. Quando percebia que era visto, baixava os olhos, com vergonha.</li>
      <li><b>Lira XIV:</b> o poeta pergunta a Marília: para que esperar, se os dias bonitos da juventude estão passando?</li>
      <li>As alegrias que chegam tarde já não têm a mesma graça. E a nossa sorte (a “estrela”) pode mudar.</li>
      <li>Por isso, ele pede: <b>aproveite o tempo</b>, antes que o tempo tire a força do corpo e a beleza do rosto.</li>
      <li>A Lira XIV é um poema <b>carpe diem</b>: ela convida a aproveitar o hoje, porque a vida passa.</li>
    </ul>`
  }],
  gloss: GLOSS, quiz: QUIZ, info: INFO, fases: FASES,
  niveis: [[0,'Leitor de poemas'],[60,'Caçador de rimas'],[130,'Construtor de versos'],[200,'Aprendiz de poeta'],[280,'Poeta']],
  partes: [
    {nome:'A sua 1ª estrofe', curto:'1ª estrofe', campo:'1ª estrofe', blocos:['e1_v1','e1_v2','e1_v3','e1_v4'], rotulos:['A cena','O valor do hoje','Comparação','O convite']},
    {nome:'A sua 2ª estrofe', curto:'2ª estrofe', campo:'2ª estrofe', blocos:['e2_v1','e2_v2','e2_v3','e2_v4'], rotulos:['A cena','O tempo passa','Antítese','O fecho']},
    {nome:'A sua 3ª estrofe', curto:'3ª estrofe', campo:'3ª estrofe', blocos:['e3_v1','e3_v2','e3_v3','e3_v4'], rotulos:['A virada','Responsabilidade','O cuidado','O fim']}
  ],
  juntar: 'verso',
  tituloBloco: 'titulo',
  escolhas: {
    imagem: {
      eyebrow: 'Escolha · a imagem do poema',
      titulo: 'Que imagem vai mostrar o tempo no seu poema?',
      tip: 'Toque em um cartão. Os versos e os títulos que você vai ver depois combinam com a imagem escolhida.',
      cards: IMG_ORDEM.map(id => ({id, nome: IMG[id].nome, desc: IMG[id].desc})),
      reseta: ['e1_v1','e1_v3','e2_v1','e2_v3','e3_v1','e3_v3','titulo']
    }
  },
  blockDef: blockDef,
  checks: checks
});
})();
