export type AngleClassification = 'reto' | 'nao-reto-agudo' | 'nao-reto-obtuso';

export interface PolygonVertexData {
  id: string;
  label: string;
  /** Local 2D coordinates (x, y) in meters around origin (0,0) */
  x: number;
  y: number;
  angleDeg: number;
  isRight: boolean;
  classification: AngleClassification;
  adjacentSidesLabel: string;
  esquadroTip: string;
  dobraduraTip: string;
}

export interface PolygonChallenge {
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface IslandPolygonData {
  id: string;
  name: string;
  sidesCount: number;
  categoryLabel: string;
  colorHex: string;
  worldPos: [number, number]; // [x, z] on the island
  description: string;
  foldingConcept: string;
  vertices: PolygonVertexData[];
  challenge: PolygonChallenge;
}

export interface IslandLevelData {
  id: number;
  title: string;
  subtitle: string;
  biomeName: string;
  bnccFocus: string;
  skyColor: string;
  fogColor: string;
  groundColor: string;
  groundSecondaryColor: string;
  waterColor: string;
  portalColor: string;
  accentColor: string;
  guardianGreeting: string;
  neblinoTaunt: string;
  portalPosition: [number, number];
  polygons: IslandPolygonData[];
}

export const ISLAND_LEVELS: IslandLevelData[] = [
  {
    id: 1,
    title: 'Ilha da Aurora Quadrada',
    subtitle: 'Fase 1 · Os Cantos Perfeitos de 90°',
    biomeName: 'Pradaria Esmeralda & Rio Cristalino',
    bnccFocus: 'EF04MA18 · Reconhecer ângulos retos (90°) usando o esquadro e dobraduras em quadrados, retângulos e triângulos.',
    skyColor: '#0c192c',
    fogColor: '#132842',
    groundColor: '#22c55e',
    groundSecondaryColor: '#15803d',
    waterColor: '#06b6d4',
    portalColor: '#f59e0b',
    accentColor: '#10b981',
    guardianGreeting:
      'Bem-vindo, Guardião! O vilão Neblino apagou o Portal da Aurora. Use o Esquadro Mágico e a Dobradura de Papel para inspecionar os vértices das 3 figuras desta ilha!',
    neblinoTaunt:
      'Haha! Misturei os cantos das pontes! Duvido você descobrir quais vértices formam um canto reto de 90 graus!',
    portalPosition: [0, -10.5],
    polygons: [
      {
        id: 'quadrado-real',
        name: 'Quadrado Guardião',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero Regular · 4 lados iguais',
        colorHex: '#3b82f6',
        worldPos: [-6.5, -2.5],
        description:
          'Um polígono de 4 lados iguais (4 cm cada). Observe como todos os seus 4 cantos se encaixam perfeitamente no canto reto do esquadro!',
        foldingConcept:
          'Dobradura: Se dobrarmos uma folha qualquer duas vezes, fazendo coincidir a primeira dobra sobre ela mesma, criamos um canto reto igual aos 4 cantos deste quadrado!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A',
            x: -1.6,
            y: -1.6,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Encaixe perfeito! Os dois lados seguem exatamente as bordas de 90° do esquadro.',
            dobraduraTip: 'Coincide exatamente com uma folha dobrada duas vezes em cruz (ângulo reto).'
          },
          {
            id: 'B',
            label: 'Vértice B',
            x: 1.6,
            y: -1.6,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Canto reto confirmado! Forma um L perfeito de 90°.',
            dobraduraTip: 'Dobra de 90° exata na base direita.'
          },
          {
            id: 'C',
            label: 'Vértice C',
            x: 1.6,
            y: 1.6,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Mais um ângulo reto de 90° no topo direito!',
            dobraduraTip: 'Canto de folha retangular sem sobras.'
          },
          {
            id: 'D',
            label: 'Vértice D',
            x: -1.6,
            y: 1.6,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Canto reto de 90°! Todos os 4 vértices do quadrado são ângulos retos.',
            dobraduraTip: 'Simetria total com a dobradura em ângulo reto.'
          }
        ],
        challenge: {
          question: 'Ao testar os 4 vértices do Quadrado Guardião com o Esquadro de 90°, o que descobrimos?',
          options: [
            {
              id: 'a',
              text: 'Todos os 4 vértices possuem ângulos retos (90°).',
              isCorrect: true,
              feedback: 'Perfeito! No quadrado, todos os 4 ângulos internos são retos (medem exatamente 90°).'
            },
            {
              id: 'b',
              text: 'Apenas 2 vértices são retos e 2 são não retos.',
              isCorrect: false,
              feedback: 'Observe novamente com o esquadro: todos os 4 cantos do quadrado formam um L perfeito de 90°!'
            },
            {
              id: 'c',
              text: 'Nenhum vértice possui ângulo reto.',
              isCorrect: false,
              feedback: 'Olhe o símbolo quadrado verde nos 4 cantos: todos têm exatamente 90°!'
            }
          ]
        }
      },
      {
        id: 'triangulo-ponte',
        name: 'Triângulo Retângulo da Ponte',
        sidesCount: 3,
        categoryLabel: 'Triângulo Retângulo · 3 lados',
        colorHex: '#10b981',
        worldPos: [0, 2.2],
        description:
          'Este triângulo sustenta a ponte sobre o rio! Ele possui 1 canto em forma de L (90°) e 2 pontas mais fechadas (ângulos não retos agudos).',
        foldingConcept:
          'Dobradura: Quando você pega um quadrado de papel e o dobra na diagonal (juntando dois cantos opostos), surge este triângulo com 1 ângulo reto e 2 ângulos não retos de 45°!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base Esquerda)',
            x: -1.8,
            y: -1.4,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,0 cm (base) × 3,0 cm (altura)',
            esquadroTip: 'Canto Reto (90°)! Os dois catetos formam um L perfeito com o esquadro.',
            dobraduraTip: 'Este é o canto original da folha quadrada antes da dobra diagonal!'
          },
          {
            id: 'B',
            label: 'Vértice B (Ponta Direita)',
            x: 1.8,
            y: -1.4,
            angleDeg: 45,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,0 cm × 4,2 cm (diagonal)',
            esquadroTip: 'Ângulo NÃO RETO (45° - Agudo)! A abertura é menor que o canto de 90° do esquadro.',
            dobraduraTip: 'Este canto foi dobrado exatamente ao meio: metade de 90° é 45°!'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo)',
            x: -1.8,
            y: 1.8,
            angleDeg: 45,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,0 cm × 4,2 cm (diagonal)',
            esquadroTip: 'Ângulo NÃO RETO (45° - Agudo)! Mais fechado que o canto reto do esquadro.',
            dobraduraTip: 'Também surgiu da dobra diagonal que dividiu o ângulo reto ao meio.'
          }
        ],
        challenge: {
          question: 'Quantos ângulos retos e quantos ângulos não retos existem no Triângulo Retângulo da Ponte?',
          options: [
            {
              id: 'a',
              text: '1 ângulo reto (no Vértice A) e 2 ângulos não retos (nos Vértices B e C).',
              isCorrect: true,
              feedback: 'Isso mesmo! Um triângulo retângulo tem exatamente 1 ângulo reto (90°) e 2 ângulos não retos (agudos).'
            },
            {
              id: 'b',
              text: '3 ângulos retos de 90°.',
              isCorrect: false,
              feedback: 'Um triângulo nunca pode ter 3 ângulos retos! Teste os vértices B e C com o esquadro.'
            },
            {
              id: 'c',
              text: '3 ângulos não retos.',
              isCorrect: false,
              feedback: 'Inspecione o Vértice A na base esquerda: ele encaixa perfeitamente no esquadro de 90°!'
            }
          ]
        }
      },
      {
        id: 'retangulo-portal',
        name: 'Retângulo Real da Estrada',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero · Lados opostos iguais',
        colorHex: '#f59e0b',
        worldPos: [6.5, -2.5],
        description:
          'Mesmo tendo dois lados compridos (6 cm) e dois lados mais curtos (3 cm), todos os seus cantos têm a mesma abertura de uma folha de caderno!',
        foldingConcept:
          'Dobradura: Uma folha de caderno ou sulfite A4 tem o formato de um retângulo: seus 4 cantos são ângulos retos de 90°.',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A',
            x: -2.1,
            y: -1.2,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '6,0 cm × 3,0 cm',
            esquadroTip: 'Ângulo Reto (90°)! O tamanho dos lados mudou, mas a abertura continua 90°.',
            dobraduraTip: 'Igual ao canto inferior esquerdo de uma folha de papel sulfite.'
          },
          {
            id: 'B',
            label: 'Vértice B',
            x: 2.1,
            y: -1.2,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '6,0 cm × 3,0 cm',
            esquadroTip: 'Ângulo Reto (90°)! Encaixe exato no esquadro.',
            dobraduraTip: 'Canto reto perfeito na base direita.'
          },
          {
            id: 'C',
            label: 'Vértice C',
            x: 2.1,
            y: 1.2,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '6,0 cm × 3,0 cm',
            esquadroTip: 'Ângulo Reto (90°)! Não importa se o lado é longo ou curto, o canto mede 90°.',
            dobraduraTip: 'Canto reto superior direito.'
          },
          {
            id: 'D',
            label: 'Vértice D',
            x: -2.1,
            y: 1.2,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '6,0 cm × 3,0 cm',
            esquadroTip: 'Ângulo Reto (90°)! Quarto canto reto confirmado.',
            dobraduraTip: 'Canto reto superior esquerdo.'
          }
        ],
        challenge: {
          question: 'O Retângulo Real tem lados de tamanhos diferentes (6 cm e 3 cm). Isso muda os ângulos dos seus 4 cantos?',
          options: [
            {
              id: 'a',
              text: 'Não! Todos os 4 vértices continuam sendo ângulos retos de 90°.',
              isCorrect: true,
              feedback: 'Brilhante! O comprimento dos lados não altera a medida do ângulo: todo retângulo tem 4 ângulos retos!'
            },
            {
              id: 'b',
              text: 'Sim, os lados maiores têm ângulos maiores que 90°.',
              isCorrect: false,
              feedback: 'Cuidado com a pegadinha do Neblino! O ângulo mede a abertura do canto, e os 4 cantos medem 90°.'
            },
            {
              id: 'c',
              text: 'Sim, ele não tem nenhum ângulo reto.',
              isCorrect: false,
              feedback: 'A palavra "Retângulo" vem justamente de "ângulos retos"! Teste qualquer vértice com o esquadro.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    title: 'Arquipélago dos Cristais Agudos',
    subtitle: 'Fase 2 · Ângulos Não Retos: Mais Fechados ou Mais Abertos',
    biomeName: 'Ilha de Cristal Azul & Lagoa Celeste',
    bnccFocus: 'EF04MA18 · Diferenciar ângulos retos de ângulos não retos (menores ou maiores que 90°) em triângulos, losangos e trapézios.',
    skyColor: '#0f172a',
    fogColor: '#1e1b4b',
    groundColor: '#0ea5e9',
    groundSecondaryColor: '#0369a1',
    waterColor: '#38bdf8',
    portalColor: '#06b6d4',
    accentColor: '#38bdf8',
    guardianGreeting:
      'Chegamos ao Arquipélago dos Cristais! Aqui nem todo canto encaixa no esquadro. Veja quais vértices são mais fechados (< 90°) ou mais abertos (> 90°) que o ângulo reto!',
    neblinoTaunt:
      'Inclinei as paredes das figuras! Quero ver você não confundir um losango com um quadrado!',
    portalPosition: [0, -10.5],
    polygons: [
      {
        id: 'losango-cristal',
        name: 'Losango Luminoso',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero · 4 lados iguais inclinados',
        colorHex: '#06b6d4',
        worldPos: [-6.5, -2.2],
        description:
          'Este losango tem 4 lados iguais de 3,5 cm, assim como o quadrado! Mas observe seus vértices com o esquadro: será que algum deles é reto?',
        foldingConcept:
          'Dobradura: Se dobrarmos o losango ao meio na vertical e na horizontal, vemos 2 pontas bem fechadas (60°) e 2 cantos bem abertos (120°).',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base)',
            x: 0,
            y: -2.0,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,5 cm × 3,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! É mais fechado que o canto de 90° do esquadro.',
            dobraduraTip: 'A ponta inferior é mais estreita que uma dobra em ângulo reto.'
          },
          {
            id: 'B',
            label: 'Vértice B (Direita)',
            x: 1.3,
            y: 0,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '3,5 cm × 3,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Abre muito além da borda de 90° do esquadro.',
            dobraduraTip: 'A abertura lateral ultrapassa a dobra de 90° da folha.'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo)',
            x: 0,
            y: 2.0,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,5 cm × 3,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! Menor que 90°.',
            dobraduraTip: 'Simétrico ao vértice A quando dobramos ao meio.'
          },
          {
            id: 'D',
            label: 'Vértice D (Esquerda)',
            x: -1.3,
            y: 0,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '3,5 cm × 3,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Simétrico ao vértice B: abertura ampla de 120°.'
          }
        ],
        challenge: {
          question: 'O Losango Luminoso tem 4 lados iguais. Quando medimos seus vértices com o esquadro, o que notamos?',
          options: [
            {
              id: 'a',
              text: 'Todos os seus 4 ângulos são NÃO RETOS (2 menores que 90° e 2 maiores que 90°).',
              isCorrect: true,
              feedback: 'Excelente! Ter 4 lados iguais não garante ter ângulos retos: neste losango, todos os 4 ângulos são não retos!'
            },
            {
              id: 'b',
              text: 'Todos os 4 ângulos são retos de 90° como no quadrado.',
              isCorrect: false,
              feedback: 'Coloque o esquadro nos vértices A e B: nenhum deles forma um canto de 90°!'
            },
            {
              id: 'c',
              text: 'Ele tem 2 ângulos retos e 2 ângulos não retos.',
              isCorrect: false,
              feedback: 'Observe as medidas: 60° (agudo) e 120° (obtuso). Nenhum mede 90°!'
            }
          ]
        }
      },
      {
        id: 'trapezio-retangulo',
        name: 'Trapézio Retângulo da Torre',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero · Trapézio Retângulo',
        colorHex: '#a855f7',
        worldPos: [0, 2.3],
        description:
          'Este trapézio tem uma parede vertical reta à esquerda e uma rampa inclinada à direita. Inspecione cada vértice para achar onde estão os ângulos retos!',
        foldingConcept:
          'Dobradura: Se pegarmos um retângulo de papel e dobrarmos apenas uma ponta lateral para dentro, um lado continua com 2 cantos retos e o outro ganha 2 cantos não retos!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base Esquerda)',
            x: -2.0,
            y: -1.4,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '4,5 cm (base) × 2,8 cm (altura)',
            esquadroTip: 'Ângulo RETO (90°)! A parede esquerda sobe perpendicular à base.',
            dobraduraTip: 'Coincide perfeitamente com o canto reto da folha.'
          },
          {
            id: 'B',
            label: 'Vértice B (Base Direita)',
            x: 2.2,
            y: -1.4,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,5 cm × 3,2 cm (rampa)',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! A rampa inclina para dentro do esquadro.',
            dobraduraTip: 'Mais fechado que a dobra de 90°.'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo Direito)',
            x: 0.6,
            y: 1.4,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,6 cm (topo) × 3,2 cm (rampa)',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! A abertura entre o topo e a rampa é maior que 90°.',
            dobraduraTip: 'Mais aberto que a dobra de 90°.'
          },
          {
            id: 'D',
            label: 'Vértice D (Topo Esquerdo)',
            x: -2.0,
            y: 1.4,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '2,6 cm (topo) × 2,8 cm (altura)',
            esquadroTip: 'Ângulo RETO (90°)! O topo também forma 90° com a parede esquerda.',
            dobraduraTip: 'Segundo canto reto confirmado!'
          }
        ],
        challenge: {
          question: 'Quais vértices do Trapézio Retângulo da Torre possuem ângulos retos (90°)?',
          options: [
            {
              id: 'a',
              text: 'Os vértices A e D (na parede vertical esquerda).',
              isCorrect: true,
              feedback: 'Muito bem! O Trapézio Retângulo tem 2 ângulos retos (A e D, com 90°) e 2 ângulos não retos (B com 60° e C com 120°).'
            },
            {
              id: 'b',
              text: 'Os vértices B e C (na rampa inclinada direita).',
              isCorrect: false,
              feedback: 'Na rampa inclinada, o Vértice B mede 60° e o Vértice C mede 120° — ambos são não retos!'
            },
            {
              id: 'c',
              text: 'Todos os 4 vértices são retos.',
              isCorrect: false,
              feedback: 'Apenas o lado esquerdo é vertical; o lado direito é inclinado!'
            }
          ]
        }
      },
      {
        id: 'triangulo-equilatero',
        name: 'Triângulo de Cristal Equilátero',
        sidesCount: 3,
        categoryLabel: 'Triângulo Equilátero · 3 lados iguais',
        colorHex: '#ec4899',
        worldPos: [6.5, -2.2],
        description:
          'Um cristal triangular com 3 lados exatamente iguais (4 cm cada). Teste o esquadro nos 3 vértices para ver se existe algum ângulo reto!',
        foldingConcept:
          'Dobradura: Todos os 3 cantos deste triângulo têm a mesma medida (60°), que é mais fechada do que o canto reto de 90° da folha.',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Esquerda)',
            x: -1.9,
            y: -1.3,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! Fica por dentro do canto de 90° do esquadro.',
            dobraduraTip: 'Abertura menor que 90°.'
          },
          {
            id: 'B',
            label: 'Vértice B (Direita)',
            x: 1.9,
            y: -1.3,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! Também mede 60°.',
            dobraduraTip: 'Igual ao vértice A quando dobramos ao meio.'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo)',
            x: 0,
            y: 1.9,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,0 cm × 4,0 cm',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! Nenhum canto deste triângulo chega a 90°.',
            dobraduraTip: 'As 3 pontas coincidem se dobradas até o centro.'
          }
        ],
        challenge: {
          question: 'Ao comparar os 3 vértices do Triângulo Equilátero com o esquadro de 90°, concluímos que:',
          options: [
            {
              id: 'a',
              text: 'Os 3 ângulos são NÃO RETOS e menores que 90° (medem 60° cada).',
              isCorrect: true,
              feedback: 'Acertou em cheio! No triângulo equilátero, todos os 3 ângulos são não retos agudos (60°).'
            },
            {
              id: 'b',
              text: 'O vértice C do topo é um ângulo reto de 90°.',
              isCorrect: false,
              feedback: 'Coloque o esquadro no Vértice C: ele mede 60°, portanto é mais fechado que 90°!'
            },
            {
              id: 'c',
              text: 'Os 3 ângulos são maiores que 90°.',
              isCorrect: false,
              feedback: 'Eles são mais fechados (menores) que o canto reto de 90° do esquadro!'
            }
          ]
        }
      }
    ]
  },
  {
    id: 3,
    title: 'Vale das Dobraduras Douradas',
    subtitle: 'Fase 3 · Pentágonos, Paralelogramos e Origami',
    biomeName: 'Jardim Outonal de Origami & Pontes Douradas',
    bnccFocus: 'EF04MA18 · Investigar polígonos de 4 e 5 lados combinando ângulos retos e não retos por meio de dobraduras.',
    skyColor: '#1c1026',
    fogColor: '#2e1638',
    groundColor: '#f59e0b',
    groundSecondaryColor: '#b45309',
    waterColor: '#38bdf8',
    portalColor: '#ec4899',
    accentColor: '#fbbf24',
    guardianGreeting:
      'Bem-vindo ao Vale das Dobraduras! Aqui os antigos artesãos criavam polígonos dobrando pergaminhos mágicos. Descubra onde estão os cantos retos de cada dobradura!',
    neblinoTaunt:
      'Haha! Essa casinha de 5 lados parece ter todos os cantos iguais... ou será que não?',
    portalPosition: [0, -10.5],
    polygons: [
      {
        id: 'pentagono-casinha',
        name: 'Pentágono da Casinha',
        sidesCount: 5,
        categoryLabel: 'Pentágono Irregular · 5 lados',
        colorHex: '#f97316',
        worldPos: [-6.5, -2.2],
        description:
          'Um polígono de 5 lados feito dobrando as duas pontas superiores de um papel! Ele tem cantos retos na base e no topo do telhado, mas cantos largos nas laterais do telhado!',
        foldingConcept:
          'Dobradura Clássica: Pegue um quadrado de papel e dobre os dois cantos de cima até se encontrarem no meio. Você acabou de criar o Pentágono da Casinha!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base Esquerda)',
            x: -1.6,
            y: -1.7,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,2 cm (base) × 2,0 cm (parede)',
            esquadroTip: 'Ângulo RETO (90°)! A base esquerda manteve o canto original da folha.',
            dobraduraTip: 'Canto inferior da folha sem dobra: 90°.'
          },
          {
            id: 'B',
            label: 'Vértice B (Base Direita)',
            x: 1.6,
            y: -1.7,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,2 cm (base) × 2,0 cm (parede)',
            esquadroTip: 'Ângulo RETO (90°)! A base direita também forma um L perfeito.',
            dobraduraTip: 'Canto inferior direito da folha: 90°.'
          },
          {
            id: 'C',
            label: 'Vértice C (Ombro Direito)',
            x: 1.6,
            y: 0.3,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,0 cm × 2,3 cm (telhado)',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! A parede e o telhado abrem mais que 90°.',
            dobraduraTip: 'Onde o papel foi dobrado a 45°, sobrou um ângulo aberto de 135°!'
          },
          {
            id: 'D',
            label: 'Vértice D (Cumeeira / Topo)',
            x: 0,
            y: 1.9,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '2,3 cm × 2,3 cm (telhado)',
            esquadroTip: 'Surpresa! Ângulo RETO (90°) no topo do telhado! As duas rampas a 45° formam 90° entre si!',
            dobraduraTip: 'Mesmo inclinado, o topo do telhado encaixa perfeitamente no esquadro girado!'
          },
          {
            id: 'E',
            label: 'Vértice E (Ombro Esquerdo)',
            x: -1.6,
            y: 0.3,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,0 cm × 2,3 cm (telhado)',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que o canto de 90° do esquadro.',
            dobraduraTip: 'Simétrico ao vértice C: mede 135°.'
          }
        ],
        challenge: {
          question: 'Inspecionando todos os 5 vértices do Pentágono da Casinha com o esquadro (inclusive o topo D!), quantos ângulos retos encontramos?',
          options: [
            {
              id: 'a',
              text: '3 ângulos retos (A, B e o topo D) e 2 ângulos não retos (C e E com 135°).',
              isCorrect: true,
              feedback: 'Olho de mestre! O topo D também mede 90° (mesmo virado!), somando 3 ângulos retos e 2 não retos!'
            },
            {
              id: 'b',
              text: 'Todos os 5 vértices são não retos.',
              isCorrect: false,
              feedback: 'Teste a base (A e B) e o topo (D) com o esquadro: eles medem exatamente 90°!'
            },
            {
              id: 'c',
              text: 'Apenas 1 ângulo reto.',
              isCorrect: false,
              feedback: 'Tanto os dois cantos da base (A e B) quanto a ponta do telhado (D) medem 90°!'
            }
          ]
        }
      },
      {
        id: 'paralelogramo-vento',
        name: 'Paralelogramo do Vento',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero · Lados opostos paralelos',
        colorHex: '#14b8a6',
        worldPos: [0, 2.3],
        description:
          'Parece um retângulo que o vento do Neblino empurrou para o lado! Seus lados opostos são paralelos, mas veja o que aconteceu com os cantos.',
        foldingConcept:
          'Dobradura: Quando inclinamos um retângulo, dois cantos ficam mais fechados (70°) e dois cantos ficam mais abertos (110°).',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base Esquerda)',
            x: -2.2,
            y: -1.2,
            angleDeg: 70,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,0 cm × 2,6 cm',
            esquadroTip: 'Ângulo NÃO RETO (70° - Agudo)! A parede inclinou para a direita, ficando menor que 90°.',
            dobraduraTip: 'Não coincide com o canto reto da folha.'
          },
          {
            id: 'B',
            label: 'Vértice B (Base Direita)',
            x: 1.4,
            y: -1.2,
            angleDeg: 110,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '4,0 cm × 2,6 cm',
            esquadroTip: 'Ângulo NÃO RETO (110° - Obtuso)! Abre para fora do esquadro de 90°.',
            dobraduraTip: 'Mais aberto que o canto reto de 90°.'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo Direito)',
            x: 2.2,
            y: 1.2,
            angleDeg: 70,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,0 cm × 2,6 cm',
            esquadroTip: 'Ângulo NÃO RETO (70° - Agudo)! Igual ao vértice oposto A.',
            dobraduraTip: 'Mais fechado que 90°.'
          },
          {
            id: 'D',
            label: 'Vértice D (Topo Esquerdo)',
            x: -1.4,
            y: 1.2,
            angleDeg: 110,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '4,0 cm × 2,6 cm',
            esquadroTip: 'Ângulo NÃO RETO (110° - Obtuso)! Igual ao vértice oposto B.',
            dobraduraTip: 'Mais aberto que 90°.'
          }
        ],
        challenge: {
          question: 'Ao usar o esquadro nos 4 vértices do Paralelogramo do Vento, descobrimos que:',
          options: [
            {
              id: 'a',
              text: 'Nenhum dos 4 vértices é reto (todos são ângulos não retos: 70° e 110°).',
              isCorrect: true,
              feedback: 'Exatamente! Ao inclinar o retângulo, os 4 ângulos deixaram de ser retos (2 ficaram com 70° e 2 com 110°).'
            },
            {
              id: 'b',
              text: 'Todos os 4 vértices continuam retos de 90°.',
              isCorrect: false,
              feedback: 'Olhe o esquadro nos cantos: as paredes inclinadas não formam 90° com a base!'
            },
            {
              id: 'c',
              text: 'Os vértices A e C são retos.',
              isCorrect: false,
              feedback: 'Os vértices A e C medem 70°, portanto são menores que 90° (não retos).'
            }
          ]
        }
      },
      {
        id: 'pipa-deltoide',
        name: 'Pipa Real (Deltoide)',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero · Pipa Geométrica',
        colorHex: '#8b5cf6',
        worldPos: [6.5, -2.2],
        description:
          'Uma pipa de papel dobrado! Embora esteja girada, observe com atenção os vértices laterais B e D usando o esquadro!',
        foldingConcept:
          'Dobradura de Pipa: Dobrando dois lados de uma folha para encontrar a linha central, formamos cantos laterais que medem exatamente 90°!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Ponta Inferior)',
            x: 0,
            y: -2.1,
            angleDeg: 60,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,0 cm × 3,0 cm',
            esquadroTip: 'Ângulo NÃO RETO (60° - Agudo)! A rabeta da pipa tem ponta fina menor que 90°.',
            dobraduraTip: 'Ponta inferior dobrada a 60°.'
          },
          {
            id: 'B',
            label: 'Vértice B (Asa Direita)',
            x: 1.5,
            y: 0.4,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,0 cm × 1,7 cm',
            esquadroTip: 'Ângulo RETO (90°)! Mesmo girado no espaço, o canto da asa direita mede exatos 90°!',
            dobraduraTip: 'Encaixa perfeitamente no canto reto do esquadro girado!'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo)',
            x: 0,
            y: 1.3,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,7 cm × 1,7 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! O topo da pipa é bem aberto.',
            dobraduraTip: 'Maior que o canto de 90° da dobradura.'
          },
          {
            id: 'D',
            label: 'Vértice D (Asa Esquerda)',
            x: -1.5,
            y: 0.4,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,0 cm × 1,7 cm',
            esquadroTip: 'Ângulo RETO (90°)! A asa esquerda também forma um canto reto perfeito!',
            dobraduraTip: 'Espelho exato da asa direita: 90°.'
          }
        ],
        challenge: {
          question: 'Um ângulo reto continua sendo reto mesmo quando a figura está girada? Quais vértices da Pipa Real são ângulos retos?',
          options: [
            {
              id: 'a',
              text: 'Sim! Os vértices laterais B e D medem 90° e são ângulos retos.',
              isCorrect: true,
              feedback: 'Sensacional! Um ângulo reto depende apenas da abertura de 90°, mesmo que a figura esteja girada! B e D são retos.'
            },
            {
              id: 'b',
              text: 'Não, figuras giradas nunca têm ângulos retos.',
              isCorrect: false,
              feedback: 'Quando giramos o esquadro junto com o vértice B ou D, vemos que a abertura é exatamente 90°!'
            },
            {
              id: 'c',
              text: 'Apenas o vértice C (120°) é reto.',
              isCorrect: false,
              feedback: 'O vértice C mede 120° (obtuso). Os ângulos de 90° estão nas asas B e D!'
            }
          ]
        }
      }
    ]
  },
  {
    id: 4,
    title: 'Forte das Rochas Hexagonais',
    subtitle: 'Fase 4 · Polígonos de 6 Lados e Cantos em L',
    biomeName: 'Cânion de Pedra Antiga & Rio Dourado',
    bnccFocus: 'EF04MA18 · Comparar hexágonos regulares (todos os ângulos não retos) com hexágonos irregulares em formato de L (com cantos retos).',
    skyColor: '#1f1218',
    fogColor: '#331c24',
    groundColor: '#d97706',
    groundSecondaryColor: '#92400e',
    waterColor: '#f59e0b',
    portalColor: '#10b981',
    accentColor: '#f59e0b',
    guardianGreeting:
      'Estamos quase na Cidadela Central! Neste cânion, duas figuras têm 6 lados (hexágonos), mas uma não tem nenhum ângulo reto e a outra é cheia deles!',
    neblinoTaunt:
      'Haha! Dois hexágonos de 6 lados! Aposto que você acha que todo hexágono tem os mesmos ângulos!',
    portalPosition: [0, -10.5],
    polygons: [
      {
        id: 'hexagono-favo',
        name: 'Hexágono Regular Real',
        sidesCount: 6,
        categoryLabel: 'Hexágono Regular · 6 lados iguais',
        colorHex: '#eab308',
        worldPos: [-6.5, -2.2],
        description:
          'Igual aos favos de mel das abelhas! Possui 6 lados iguais de 2,5 cm. Use o esquadro em seus 6 vértices para observar a abertura de cada canto.',
        foldingConcept:
          'Dobradura: Todos os 6 cantos do hexágono regular são mais abertos (120°) do que o canto reto de 90° do nosso esquadro!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A',
            x: -1.0,
            y: -1.73,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,5 cm × 2,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Abre além dos 90° do esquadro.',
            dobraduraTip: 'Mais aberto que uma dobra em ângulo reto.'
          },
          {
            id: 'B',
            label: 'Vértice B',
            x: 1.0,
            y: -1.73,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,5 cm × 2,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura de 120°.'
          },
          {
            id: 'C',
            label: 'Vértice C',
            x: 2.0,
            y: 0,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,5 cm × 2,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura de 120°.'
          },
          {
            id: 'D',
            label: 'Vértice D',
            x: 1.0,
            y: 1.73,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,5 cm × 2,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura de 120°.'
          },
          {
            id: 'E',
            label: 'Vértice E',
            x: -1.0,
            y: 1.73,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,5 cm × 2,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura de 120°.'
          },
          {
            id: 'F',
            label: 'Vértice F',
            x: -2.0,
            y: 0,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,5 cm × 2,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Todos os 6 vértices medem 120°.',
            dobraduraTip: 'Nenhum canto coincide com 90°.'
          }
        ],
        challenge: {
          question: 'Quantos ângulos retos existem no Hexágono Regular Real (formato de favo de mel)?',
          options: [
            {
              id: 'a',
              text: 'Nenhum (0 ângulos retos)! Todos os 6 vértices são não retos de 120°.',
              isCorrect: true,
              feedback: 'Perfeito! No hexágono regular, todos os 6 ângulos medem 120° (são ângulos não retos obtusos).'
            },
            {
              id: 'b',
              text: '6 ângulos retos.',
              isCorrect: false,
              feedback: 'Teste qualquer vértice com o esquadro: todos os 6 cantos são mais abertos (120°) que 90°!'
            },
            {
              id: 'c',
              text: '2 ângulos retos nas laterais.',
              isCorrect: false,
              feedback: 'Os vértices laterais C e F também medem 120°, portanto não são retos!'
            }
          ]
        }
      },
      {
        id: 'muralha-em-l',
        name: 'Hexágono em L da Fortaleza',
        sidesCount: 6,
        categoryLabel: 'Hexágono Irregular · 6 lados em L',
        colorHex: '#10b981',
        worldPos: [0, 2.3],
        description:
          'Esta muralha em forma de letra L também tem 6 lados e 6 vértices! Mas todas as suas paredes seguem direções horizontais e verticais como uma folha dobrada!',
        foldingConcept:
          'Dobradura: Se dobrarmos um canto retangular de uma folha para trás, criamos um polígono de 6 lados cheio de quinas de 90°!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base Esquerda)',
            x: -1.8,
            y: -1.8,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,6 cm × 3,6 cm',
            esquadroTip: 'Ângulo RETO (90°)! Quina externa da muralha em L.',
            dobraduraTip: 'Dobra em ângulo reto de 90°.'
          },
          {
            id: 'B',
            label: 'Vértice B (Base Direita)',
            x: 1.8,
            y: -1.8,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,6 cm × 1,8 cm',
            esquadroTip: 'Ângulo RETO (90°)! Encaixe perfeito no esquadro.',
            dobraduraTip: 'Canto reto inferior direito.'
          },
          {
            id: 'C',
            label: 'Vértice C (Degrau Direito)',
            x: 1.8,
            y: 0,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo RETO (90°)! Canto do degrau horizontal.',
            dobraduraTip: 'Canto reto de 90°.'
          },
          {
            id: 'D',
            label: 'Vértice D (Canto Interno)',
            x: 0,
            y: 0,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Canto em L de 90°! O esquadro encaixa perfeitamente no degrau da muralha (ângulo interno reflexo de 270° / quina perpendicular de 90°).',
            dobraduraTip: 'As duas paredes do degrau se encontram formando 90° no esquadro!'
          },
          {
            id: 'E',
            label: 'Vértice E (Topo Direito)',
            x: 0,
            y: 1.8,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo RETO (90°)! Topo da torre da muralha.',
            dobraduraTip: 'Canto reto de 90°.'
          },
          {
            id: 'F',
            label: 'Vértice F (Topo Esquerdo)',
            x: -1.8,
            y: 1.8,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '1,8 cm × 3,6 cm',
            esquadroTip: 'Ângulo RETO (90°)! Sexta quina perpendicular!',
            dobraduraTip: 'Canto reto superior esquerdo.'
          }
        ],
        challenge: {
          question: 'Comparando o Hexágono Regular com o Hexágono em L da Fortaleza (ambos de 6 lados), o que descobrimos?',
          options: [
            {
              id: 'a',
              text: 'Polígonos com o mesmo número de lados (6) podem ter ângulos diferentes: o formato em L tem cantos retos de 90°!',
              isCorrect: true,
              feedback: 'Incrível! Ambos têm 6 lados, mas o Hexágono em L possui paredes perpendiculares que formam cantos retos de 90°!'
            },
            {
              id: 'b',
              text: 'Nenhuma figura de 6 lados pode ter ângulo reto.',
              isCorrect: false,
              feedback: 'Olhe o Hexágono em L da Fortaleza: todas as suas paredes se encontram formando quinas de 90°!'
            },
            {
              id: 'c',
              text: 'O Hexágono em L tem apenas ângulos agudos de 45°.',
              isCorrect: false,
              feedback: 'Teste os vértices com o esquadro: todas as paredes do L formam cantos de 90°!'
            }
          ]
        }
      },
      {
        id: 'trapezio-escudo',
        name: 'Trapézio Isósceles do Escudo',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero · Trapézio Simétrico',
        colorHex: '#ef4444',
        worldPos: [6.5, -2.2],
        description:
          'Diferente do Trapézio Retângulo da Fase 2, este escudo tem as DUAS laterais inclinadas! Verifique com o esquadro se sobrou algum ângulo reto.',
        foldingConcept:
          'Dobradura: Se dobrarmos os dois cantos superiores de um retângulo inclinados até a base, criamos 2 ângulos agudos (65°) embaixo e 2 obtusos (115°) em cima.',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Base Esquerda)',
            x: -2.2,
            y: -1.3,
            angleDeg: 65,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,4 cm × 2,9 cm',
            esquadroTip: 'Ângulo NÃO RETO (65° - Agudo)! A lateral esquerda é inclinada.',
            dobraduraTip: 'Menor que o canto reto de 90°.'
          },
          {
            id: 'B',
            label: 'Vértice B (Base Direita)',
            x: 2.2,
            y: -1.3,
            angleDeg: 65,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '4,4 cm × 2,9 cm',
            esquadroTip: 'Ângulo NÃO RETO (65° - Agudo)! A lateral direita também é inclinada.',
            dobraduraTip: 'Simétrico ao vértice A: 65°.'
          },
          {
            id: 'C',
            label: 'Vértice C (Topo Direito)',
            x: 1.0,
            y: 1.3,
            angleDeg: 115,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,0 cm × 2,9 cm',
            esquadroTip: 'Ângulo NÃO RETO (115° - Obtuso)! Mais aberto que 90°.',
            dobraduraTip: 'Maior que a dobra de 90°.'
          },
          {
            id: 'D',
            label: 'Vértice D (Topo Esquerdo)',
            x: -1.0,
            y: 1.3,
            angleDeg: 115,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '2,0 cm × 2,9 cm',
            esquadroTip: 'Ângulo NÃO RETO (115° - Obtuso)! Simétrico ao vértice C.',
            dobraduraTip: 'Nenhum canto deste trapézio mede 90°.'
          }
        ],
        challenge: {
          question: 'Todo trapézio tem ângulos retos? O que observamos no Trapézio Isósceles do Escudo?',
          options: [
            {
              id: 'a',
              text: 'Nem todo trapézio tem ângulo reto! Neste escudo, os 4 ângulos são não retos (dois de 65° e dois de 115°).',
              isCorrect: true,
              feedback: 'Correto! Enquanto o Trapézio Retângulo tinha 2 ângulos retos, o Trapézio Isósceles tem as duas laterais inclinadas e 0 ângulos retos!'
            },
            {
              id: 'b',
              text: 'Sim, todo trapézio tem pelo menos 2 ângulos retos.',
              isCorrect: false,
              feedback: 'Teste os 4 vértices do escudo com o esquadro: como as duas laterais são inclinadas, nenhum canto mede 90°!'
            },
            {
              id: 'c',
              text: 'Os vértices C e D no topo são ângulos retos.',
              isCorrect: false,
              feedback: 'C e D medem 115°, ou seja, são maiores que 90° (obtusos)!'
            }
          ]
        }
      }
    ]
  },
  {
    id: 5,
    title: 'Cidadela do Portal Central',
    subtitle: 'Fase Final · O Desafio Mestre contra Neblino',
    biomeName: 'Santuário Celeste Estelar & Anéis de Luz',
    bnccFocus: 'EF04MA18 · Domínio completo: identificar ângulos retos e não retos em polígonos compostos e rotacionados.',
    skyColor: '#090d16',
    fogColor: '#111827',
    groundColor: '#6366f1',
    groundSecondaryColor: '#4338ca',
    waterColor: '#818cf8',
    portalColor: '#fbbf24',
    accentColor: '#f43f5e',
    guardianGreeting:
      'Chegamos à Cidadela Central! Neblino colocou seus 3 enigmas finais ao redor do Grande Portal do Reino. Use tudo o que aprendeu com o esquadro e as dobraduras!',
    neblinoTaunt:
      'Impossível! Você chegou até aqui?! Girei um quadrado como diamante e criei a Seta Real! Você jamais ativará o Portal Central!',
    portalPosition: [0, -10.5],
    polygons: [
      {
        id: 'quadrado-diamante',
        name: 'Diamante Real (Quadrado Rotacionado)',
        sidesCount: 4,
        categoryLabel: 'Quadrilátero Regular Girado a 45°',
        colorHex: '#f43f5e',
        worldPos: [-6.5, -2.2],
        description:
          'Neblino girou um quadrado perfeito de lados iguais (3,4 cm) para parecer um losango! Use o Esquadro Mágico nos vértices A, B, C e D para descobrir a verdade!',
        foldingConcept:
          'Dobradura: Girar a folha de papel na mesa muda a posição dela, mas NUNCA muda a medida dos seus cantos de 90°!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Ponta Inferior)',
            x: 0,
            y: -1.9,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,4 cm × 3,4 cm',
            esquadroTip: 'Ângulo RETO (90°)! Quando encaixamos o esquadro na ponta inferior, vemos um L perfeito de 90°!',
            dobraduraTip: 'É um quadrado apenas girado na mesa: mede exatos 90°!'
          },
          {
            id: 'B',
            label: 'Vértice B (Ponta Direita)',
            x: 1.9,
            y: 0,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,4 cm × 3,4 cm',
            esquadroTip: 'Ângulo RETO (90°)! Encaixe perfeito no esquadro!',
            dobraduraTip: 'Segundo canto reto de 90°.'
          },
          {
            id: 'C',
            label: 'Vértice C (Ponta Superior)',
            x: 0,
            y: 1.9,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,4 cm × 3,4 cm',
            esquadroTip: 'Ângulo RETO (90°)! O topo também mede exatos 90°.',
            dobraduraTip: 'Terceiro canto reto de 90°.'
          },
          {
            id: 'D',
            label: 'Vértice D (Ponta Esquerda)',
            x: -1.9,
            y: 0,
            angleDeg: 90,
            isRight: true,
            classification: 'reto',
            adjacentSidesLabel: '3,4 cm × 3,4 cm',
            esquadroTip: 'Ângulo RETO (90°)! Todos os 4 vértices medem 90°!',
            dobraduraTip: 'Quarto canto reto confirmado!'
          }
        ],
        challenge: {
          question: 'Neblino girou um quadrado para ficar "de ponta" (como um diamante). O que aconteceu com seus 4 ângulos?',
          options: [
            {
              id: 'a',
              text: 'Todos os 4 continuam sendo ângulos retos (90°), pois girar a figura não altera seus ângulos!',
              isCorrect: true,
              feedback: 'Pegadinha do Neblino derrotada! Um quadrado girado a 45° continua sendo um quadrado com 4 ângulos retos de 90°!'
            },
            {
              id: 'b',
              text: 'Eles viraram ângulos não retos porque a figura está de ponta.',
              isCorrect: false,
              feedback: 'Coloque o esquadro em qualquer vértice: ele gira junto e mostra que todos os 4 cantos medem exatamente 90°!'
            },
            {
              id: 'c',
              text: 'Apenas os vértices laterais B e D são retos.',
              isCorrect: false,
              feedback: 'Todos os 4 vértices (A, B, C e D) têm exatamente 90°!'
            }
          ]
        }
      },
      {
        id: 'triangulo-obtusangulo',
        name: 'Asa Estelar (Triângulo Obtusângulo)',
        sidesCount: 3,
        categoryLabel: 'Triângulo Obtusângulo · 1 ângulo > 90°',
        colorHex: '#06b6d4',
        worldPos: [0, 2.3],
        description:
          'Este triângulo estelar tem uma base bem aberta no Vértice A (120°) e duas pontas bem finas nos Vértices B e C (30° cada).',
        foldingConcept:
          'Dobradura: Em qualquer triângulo, se um canto já é maior que o ângulo reto (120°), os outros dois cantos precisam ser bem fechados (agudos)!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A (Centro Aberto)',
            x: -0.6,
            y: -1.2,
            angleDeg: 120,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '3,2 cm × 3,2 cm',
            esquadroTip: 'Ângulo NÃO RETO (120° - Obtuso)! Muito mais aberto que o canto de 90° do esquadro.',
            dobraduraTip: 'Ultrapassa a dobra de 90°.'
          },
          {
            id: 'B',
            label: 'Vértice B (Ponta Direita)',
            x: 2.2,
            y: -1.2,
            angleDeg: 30,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,2 cm × 5,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (30° - Agudo)! Ponta bem fininha, muito menor que 90°.',
            dobraduraTip: 'Três vezes menor que um canto reto de 90°!'
          },
          {
            id: 'C',
            label: 'Vértice C (Ponta Superior)',
            x: -2.0,
            y: 1.5,
            angleDeg: 30,
            isRight: false,
            classification: 'nao-reto-agudo',
            adjacentSidesLabel: '3,2 cm × 5,5 cm',
            esquadroTip: 'Ângulo NÃO RETO (30° - Agudo)! Também mede 30°.',
            dobraduraTip: 'Ponta aguda menor que 90°.'
          }
        ],
        challenge: {
          question: 'Ao analisar os 3 vértices da Asa Estelar com o esquadro, como classificamos seus ângulos?',
          options: [
            {
              id: 'a',
              text: 'Todos os 3 são NÃO RETOS: 1 maior que 90° (120°) e 2 menores que 90° (30°).',
              isCorrect: true,
              feedback: 'Perfeito! Nenhum vértice mede 90°: temos 1 ângulo não reto obtuso (120°) e 2 ângulos não retos agudos (30°).'
            },
            {
              id: 'b',
              text: 'O vértice A é reto (90°) e os outros dois são não retos.',
              isCorrect: false,
              feedback: 'Veja o esquadro no Vértice A: a abertura mede 120°, passando bastante do canto reto de 90°!'
            },
            {
              id: 'c',
              text: 'Todos os 3 ângulos são maiores que 90°.',
              isCorrect: false,
              feedback: 'As pontas B e C medem apenas 30° (são bem mais fechadas que 90°).'
            }
          ]
        }
      },
      {
        id: 'octogono-portal',
        name: 'Octógono da Coroa Solar',
        sidesCount: 8,
        categoryLabel: 'Octógono Regular · 8 lados iguais',
        colorHex: '#fbbf24',
        worldPos: [6.5, -2.2],
        description:
          'A última peça do Grande Portal! Um polígono de 8 lados iguais criado cortando ou dobrando os 4 cantos de um quadrado. Teste seus vértices!',
        foldingConcept:
          'Dobradura Final: Se pegarmos um quadrado de papel e dobrarmos suas 4 pontas de 90° para dentro, surgem 8 vértices com ângulos abertos de 135°!',
        vertices: [
          {
            id: 'A',
            label: 'Vértice A',
            x: -0.75,
            y: -1.8,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Mais aberto que o canto de 90° do esquadro.',
            dobraduraTip: 'Criado ao dobrar a ponta de 90° do quadrado.'
          },
          {
            id: 'B',
            label: 'Vértice B',
            x: 0.75,
            y: -1.8,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura constante de 135°.'
          },
          {
            id: 'C',
            label: 'Vértice C',
            x: 1.8,
            y: -0.75,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura constante de 135°.'
          },
          {
            id: 'D',
            label: 'Vértice D',
            x: 1.8,
            y: 0.75,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura constante de 135°.'
          },
          {
            id: 'E',
            label: 'Vértice E',
            x: 0.75,
            y: 1.8,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura constante de 135°.'
          },
          {
            id: 'F',
            label: 'Vértice F',
            x: -0.75,
            y: 1.8,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura constante de 135°.'
          },
          {
            id: 'G',
            label: 'Vértice G',
            x: -1.8,
            y: 0.75,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Maior que 90°.',
            dobraduraTip: 'Abertura constante de 135°.'
          },
          {
            id: 'H',
            label: 'Vértice H',
            x: -1.8,
            y: -0.75,
            angleDeg: 135,
            isRight: false,
            classification: 'nao-reto-obtuso',
            adjacentSidesLabel: '1,8 cm × 1,8 cm',
            esquadroTip: 'Ângulo NÃO RETO (135° - Obtuso)! Todos os 8 cantos medem 135°.',
            dobraduraTip: 'Abertura constante de 135°.'
          }
        ],
        challenge: {
          question: 'Quando dobramos os 4 cantos retos de um quadrado de papel para formar este Octógono Regular de 8 lados, como ficam seus 8 ângulos?',
          options: [
            {
              id: 'a',
              text: 'Todos os 8 ângulos são NÃO RETOS e maiores que 90° (medem 135° cada).',
              isCorrect: true,
              feedback: 'VITÓRIA SUPREMA! Você dominou a habilidade EF04MA18 e reativou todos os portais do Reino da Geometria!'
            },
            {
              id: 'b',
              text: 'Ele passa a ter 8 ângulos retos de 90°.',
              isCorrect: false,
              feedback: 'Veja o esquadro em qualquer um dos 8 vértices: a abertura de 135° é bem maior que 90°!'
            },
            {
              id: 'c',
              text: 'Todos os 8 ângulos são agudos (menores que 90°).',
              isCorrect: false,
              feedback: 'Eles abrem para fora do canto reto do esquadro, medindo 135° (portanto maiores que 90°)!'
            }
          ]
        }
      }
    ]
  }
];
