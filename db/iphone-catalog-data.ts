// Reference data for the global iPhone catalog (iphone_catalog_models /
// iphone_catalog_variants) — seeded by db/seed-iphone-catalog.ts. Covers the
// generations a used/seminovo reseller realistically stocks (iPhone 11
// through the current 17/Air lineup). Descriptions and specs are based on
// Apple's own published specs; exact color names for the most recent
// generations (17 series, Air, 16e) are worth double-checking against
// apple.com since Apple renames finishes every year and this was written
// close to those launches.
//
// storageOptions lists every capacity Apple actually sold for that model —
// a lojista importing a model from the catalog gets one variant row per
// capacity (times however many colors they pick), price and photos left
// blank for them to fill in.

import type { ProductLine } from "@/lib/iphone-models";

export interface IphoneCatalogModelData {
  name: string;
  /** Omitido = "iphone" — todo modelo escrito antes da linha de produto
   * existir é iPhone, então só as entradas de Watch/AirPods/iPad/Mac abaixo
   * precisam declarar isso. */
  productLine?: ProductLine;
  description: string;
  specsText: string;
  colors: string[];
  /** Pra AirPods (sem capacidade/tamanho) usa um único item — mantém a
   * estrutura "preço por opção × cores" da importação em lote funcionando
   * sem precisar de uma coluna nullable em iphone_catalog_variants. */
  storageOptions: string[];
}

export const IPHONE_CATALOG_DATA: IphoneCatalogModelData[] = [
  {
    name: "iPhone Duo",
    description: "O primeiro iPhone dobrável da Apple: tela de 7,6\" ao abrir, corpo em titânio e Touch ID no lugar do Face ID.",
    specsText: [
      "Chip A20 Pro",
      "Design dobrável em titânio (formato livro)",
      "Tela externa de 5,4\" e tela interna dobrável de 7,6\"",
      "Câmera dupla de 48MP (principal e ultra grande angular)",
      "Touch ID (sem Face ID)",
      "Sistema de bateria dupla — até 24h de uso misto",
      "Conector USB-C, 5G, Wi-Fi 7",
    ].join("\n"),
    colors: ["Branco Estelar", "Céu Noturno"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "iPhone 18 Pro Max",
    description: "O novo topo de linha da Apple: câmera com abertura variável e a maior autonomia de bateria já vista num iPhone.",
    specsText: [
      "Chip A20 Pro",
      "Tela de 6,9\"",
      "Câmera Pro Fusion de 48MP com abertura variável",
      "Dynamic Island",
      "Ceramic Shield 2",
      "Bateria: até 45h de reprodução de vídeo",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Prateado", "Glacial", "Bordô"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "iPhone 18 Pro",
    description: "Toda a nova geração Pro — câmera com abertura variável e chip A20 Pro — num tamanho mais compacto.",
    specsText: [
      "Chip A20 Pro",
      "Tela de 6,3\"",
      "Câmera Pro Fusion de 48MP com abertura variável",
      "Dynamic Island",
      "Ceramic Shield 2",
      "Bateria: até 36h de reprodução de vídeo",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Prateado", "Glacial", "Bordô"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "iPhone 17 Pro Max",
    description: "O topo de linha da Apple: desempenho máximo, câmeras profissionais e autonomia para o dia inteiro.",
    specsText: [
      "Chip A19 Pro",
      "Tela Super Retina XDR ProMotion de 6,9\"",
      "Câmera tripla de 48MP (principal, ultra grande angular e telefoto)",
      "Câmera frontal com Face ID",
      "Corpo em alumínio unibody",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Prateado", "Azul Profundo", "Laranja Cósmico"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "iPhone 17 Pro",
    description: "Toda a linha Pro em um tamanho mais compacto — câmeras profissionais e desempenho de ponta.",
    specsText: [
      "Chip A19 Pro",
      "Tela Super Retina XDR ProMotion de 6,3\"",
      "Câmera tripla de 48MP (principal, ultra grande angular e telefoto)",
      "Câmera frontal com Face ID",
      "Corpo em alumínio unibody",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Prateado", "Azul Profundo", "Laranja Cósmico"],
    storageOptions: ["256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 17",
    description: "Equilíbrio perfeito entre tamanho, câmera e desempenho pra quem quer o iPhone mais atual sem pagar pelo Pro.",
    specsText: [
      "Chip A19",
      "Tela Super Retina XDR de 6,3\"",
      "Câmera dupla de 48MP",
      "Câmera frontal com Face ID",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco", "Névoa Azul", "Sálvia", "Lavanda"],
    storageOptions: ["256GB", "512GB"],
  },
  {
    name: "iPhone 17e",
    description: "A porta de entrada mais moderna pra linha iPhone — desempenho atual por um preço mais acessível.",
    specsText: [
      "Chip A19",
      "Tela Super Retina XDR de 6,1\" com Dynamic Island",
      "Câmera única de 48MP",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Estelar", "Meia-noite", "Rosa"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone Air",
    description: "O iPhone mais fino já feito pela Apple, com bateria e câmera de topo de linha em um corpo ultraleve.",
    specsText: [
      "Chip A19",
      "Design ultrafino em titânio",
      "Tela Super Retina XDR ProMotion de 6,5\"",
      "Câmera única de 48MP (Fusion)",
      "Apenas eSIM (sem bandeja de chip físico)",
      "Conector USB-C, 5G, Wi-Fi 7",
    ].join("\n"),
    colors: ["Preto Sideral", "Branco Nuvem", "Dourado Claro", "Azul Céu"],
    storageOptions: ["256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 16 Pro Max",
    description: "Câmeras profissionais, tela grande e o Botão de Controle de Câmera — feito pra quem exige o máximo.",
    specsText: [
      "Chip A18 Pro",
      "Tela Super Retina XDR ProMotion de 6,9\"",
      "Câmera tripla de 48MP",
      "Botão de Controle de Câmera",
      "Corpo em titânio",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Titânio Preto", "Titânio Branco", "Titânio Natural", "Titânio Deserto"],
    storageOptions: ["256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 16 Pro",
    description: "Toda a experiência Pro em titânio, num tamanho que cabe melhor na mão.",
    specsText: [
      "Chip A18 Pro",
      "Tela Super Retina XDR ProMotion de 6,3\"",
      "Câmera tripla de 48MP",
      "Botão de Controle de Câmera",
      "Corpo em titânio",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Titânio Preto", "Titânio Branco", "Titânio Natural", "Titânio Deserto"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 16 Plus",
    description: "Tela grande, ótima câmera e bateria que dura o dia inteiro — o queridinho de quem curte tela grande.",
    specsText: [
      "Chip A18",
      "Tela Super Retina XDR de 6,7\"",
      "Câmera dupla de 48MP",
      "Botão de Controle de Câmera",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco", "Rosa", "Verde-Cisne (Teal)", "Ultramarino"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 16",
    description: "O iPhone mais equilibrado da linha atual — câmera excelente, ótimo desempenho e tamanho compacto.",
    specsText: [
      "Chip A18",
      "Tela Super Retina XDR de 6,1\"",
      "Câmera dupla de 48MP",
      "Botão de Controle de Câmera",
      "Conector USB-C, 5G, Wi-Fi 7",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco", "Rosa", "Verde-Cisne (Teal)", "Ultramarino"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 16e",
    description: "A porta de entrada mais moderna pra linha iPhone — desempenho atual por um preço mais acessível.",
    specsText: [
      "Chip A18",
      "Tela Super Retina XDR de 6,1\" com Dynamic Island",
      "Câmera única de 48MP",
      "Conector USB-C, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 15 Pro Max",
    description: "Titânio, zoom óptico estendido e USB-C — a geração que trouxe a linha Pro pra um novo patamar.",
    specsText: [
      "Chip A17 Pro",
      "Tela Super Retina XDR ProMotion de 6,7\"",
      "Câmera tripla de 48MP com zoom óptico estendido",
      "Corpo em titânio",
      "Conector USB-C, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Titânio Natural", "Titânio Azul", "Titânio Branco", "Titânio Preto"],
    storageOptions: ["256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 15 Pro",
    description: "Titânio e câmeras profissionais num tamanho mais compacto.",
    specsText: [
      "Chip A17 Pro",
      "Tela Super Retina XDR ProMotion de 6,1\"",
      "Câmera tripla de 48MP",
      "Corpo em titânio",
      "Conector USB-C, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Titânio Natural", "Titânio Azul", "Titânio Branco", "Titânio Preto"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 15 Plus",
    description: "Dynamic Island, ótima câmera e tela grande — com o conforto do USB-C.",
    specsText: [
      "Chip A16",
      "Tela Super Retina XDR de 6,7\" com Dynamic Island",
      "Câmera dupla de 48MP",
      "Conector USB-C, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Azul", "Verde", "Amarelo", "Rosa"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 15",
    description: "Dynamic Island, ótima câmera e o conforto do USB-C — um dos mais procurados no seminovo.",
    specsText: [
      "Chip A16",
      "Tela Super Retina XDR de 6,1\" com Dynamic Island",
      "Câmera dupla de 48MP",
      "Conector USB-C, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Azul", "Verde", "Amarelo", "Rosa"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 14 Pro Max",
    description: "A geração que estreou a Dynamic Island, com câmeras profissionais e tela enorme.",
    specsText: [
      "Chip A16",
      "Tela Super Retina XDR ProMotion de 6,7\" com Dynamic Island",
      "Câmera tripla de 48MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Roxo-profundo", "Prateado", "Dourado", "Preto-espacial"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 14 Pro",
    description: "Dynamic Island e câmeras profissionais num tamanho mais compacto.",
    specsText: [
      "Chip A16",
      "Tela Super Retina XDR ProMotion de 6,1\" com Dynamic Island",
      "Câmera tripla de 48MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Roxo-profundo", "Prateado", "Dourado", "Preto-espacial"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 14 Plus",
    description: "A bateria mais longa da linha 14 em uma tela grande — ótimo custo-benefício em seminovo.",
    specsText: [
      "Chip A15",
      "Tela Super Retina XDR de 6,7\"",
      "Câmera dupla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Azul", "Roxo", "Meia-noite", "Estelar", "PRODUCT RED", "Amarelo"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 14",
    description: "Câmera ótima e desempenho confiável num tamanho compacto — um clássico do seminovo.",
    specsText: [
      "Chip A15",
      "Tela Super Retina XDR de 6,1\"",
      "Câmera dupla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Azul", "Roxo", "Meia-noite", "Estelar", "PRODUCT RED", "Amarelo"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 13 Pro Max",
    description: "Tela ProMotion e câmeras profissionais num corpo grande — muito procurado até hoje.",
    specsText: [
      "Chip A15",
      "Tela Super Retina XDR ProMotion de 6,7\"",
      "Câmera tripla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Grafite", "Prateado", "Dourado", "Azul-Sierra", "Verde-Alpino"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 13 Pro",
    description: "Tela ProMotion e câmeras profissionais num tamanho mais compacto.",
    specsText: [
      "Chip A15",
      "Tela Super Retina XDR ProMotion de 6,1\"",
      "Câmera tripla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Grafite", "Prateado", "Dourado", "Azul-Sierra", "Verde-Alpino"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPhone 13",
    description: "O queridinho do custo-benefício: câmera dupla ótima e bateria que dura o dia inteiro.",
    specsText: [
      "Chip A15",
      "Tela Super Retina XDR de 6,1\"",
      "Câmera dupla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Meia-noite", "Estelar", "Rosa", "Azul", "PRODUCT RED", "Verde"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 13 mini",
    description: "Toda a potência do iPhone 13 num corpo compacto pra quem gosta de aparelho pequeno.",
    specsText: [
      "Chip A15",
      "Tela Super Retina XDR de 5,4\"",
      "Câmera dupla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Meia-noite", "Estelar", "Rosa", "Azul", "PRODUCT RED", "Verde"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone SE (3ª geração)",
    description: "Design clássico com Touch ID e desempenho atual — ótimo custo-benefício em corpo compacto.",
    specsText: [
      "Chip A15",
      "Tela Retina HD de 4,7\" com Touch ID",
      "Câmera única de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP67",
    ].join("\n"),
    colors: ["Meia-noite", "Estelar", "PRODUCT RED"],
    storageOptions: ["64GB", "128GB", "256GB"],
  },
  {
    name: "iPhone 12",
    description: "Design em bordas retas que virou marca registrada da Apple, com ótima câmera dupla.",
    specsText: [
      "Chip A14",
      "Tela Super Retina XDR de 6,1\"",
      "Câmera dupla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco", "Verde", "Azul", "PRODUCT RED", "Roxo"],
    storageOptions: ["64GB", "128GB", "256GB"],
  },
  {
    name: "iPhone 12 Pro Max",
    description: "Câmera tripla com LiDAR e tela grande — uma opção robusta pra quem busca seminovo com qualidade.",
    specsText: [
      "Chip A14",
      "Tela Super Retina XDR de 6,7\"",
      "Câmera tripla de 12MP com sensor LiDAR",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Grafite", "Prateado", "Dourado", "Azul-Pacífico"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 12 Pro",
    description: "Câmera tripla com LiDAR no tamanho mais popular da linha — a mesma câmera do Pro Max, mais compacto.",
    specsText: [
      "Chip A14",
      "Tela Super Retina XDR de 6,1\"",
      "Câmera tripla de 12MP com sensor LiDAR",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Grafite", "Prateado", "Dourado", "Azul-Pacífico"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 12 mini",
    description: "Todo o desempenho do iPhone 12 no corpo mais compacto que a Apple já fez.",
    specsText: [
      "Chip A14",
      "Tela Super Retina XDR de 5,4\"",
      "Câmera dupla de 12MP",
      "Conector Lightning, 5G",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco", "Verde", "Azul", "PRODUCT RED", "Roxo"],
    storageOptions: ["64GB", "128GB", "256GB"],
  },
  {
    name: "iPhone 11 Pro Max",
    description: "Câmera tripla profissional e a maior bateria que a linha Pro já teve até então.",
    specsText: [
      "Chip A13",
      "Tela Super Retina XDR de 6,5\"",
      "Câmera tripla de 12MP",
      "Conector Lightning",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Cinza-Espacial", "Prateado", "Dourado", "Verde-meia-noite"],
    storageOptions: ["64GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 11 Pro",
    description: "A primeira câmera tripla da Apple, num tamanho mais compacto que o Pro Max.",
    specsText: [
      "Chip A13",
      "Tela Super Retina XDR de 5,8\"",
      "Câmera tripla de 12MP",
      "Conector Lightning",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Cinza-Espacial", "Prateado", "Dourado", "Verde-meia-noite"],
    storageOptions: ["64GB", "256GB", "512GB"],
  },
  {
    name: "iPhone 11",
    description: "Um dos seminovos mais vendidos do mercado — câmera dupla confiável e ótima bateria.",
    specsText: [
      "Chip A13",
      "Tela Liquid Retina HD de 6,1\"",
      "Câmera dupla de 12MP",
      "Conector Lightning",
      "Resistência a água e poeira IP68",
    ].join("\n"),
    colors: ["Preto", "Branco", "Verde", "Amarelo", "Roxo", "PRODUCT RED"],
    storageOptions: ["64GB", "128GB", "256GB"],
  },

  // ---------------------------------------------------------------------
  // Apple Watch
  // ---------------------------------------------------------------------
  {
    name: "Apple Watch Series 10",
    productLine: "watch",
    description: "O Apple Watch mais fino já feito, com tela maior de bordas quase invisíveis e sensor de apneia do sono.",
    specsText: [
      "Caixa em alumínio, 42mm ou 46mm",
      "Tela Retina LTPO OLED always-on",
      "Sensor de temperatura, oxigênio no sangue e apneia do sono",
      "Resistência à água até 50 metros",
      "Carregamento rápido — 80% em 30 minutos",
      "Conectividade GPS ou GPS + Cellular",
    ].join("\n"),
    colors: ["Preto", "Prateado", "Rosé"],
    storageOptions: ["42mm", "46mm"],
  },
  {
    name: "Apple Watch Ultra 2",
    productLine: "watch",
    description: "O mais resistente da linha — caixa em titânio, tela mais brilhante da Apple e bateria para até 3 dias.",
    specsText: [
      "Caixa em titânio, 49mm",
      "Tela Retina LTPO OLED always-on — até 3.000 nizes de brilho",
      "Botão de Ação personalizável",
      "Resistência à água até 100 metros, certificado para mergulho",
      "GPS de dupla frequência",
      "Bateria: até 36h no uso normal, até 72h no modo economia",
    ].join("\n"),
    colors: ["Titânio Natural", "Titânio Preto"],
    storageOptions: ["49mm"],
  },
  {
    name: "Apple Watch SE",
    productLine: "watch",
    description: "Os recursos essenciais do Apple Watch — atividade, notificações e detecção de queda — no preço mais acessível da linha.",
    specsText: [
      "Caixa em alumínio, 40mm ou 44mm",
      "Tela Retina OLED",
      "Detecção de acidente de carro e de queda",
      "Resistência à água até 50 metros",
      "Conectividade GPS ou GPS + Cellular",
    ].join("\n"),
    colors: ["Meia-noite", "Estelar", "Prateado"],
    storageOptions: ["40mm", "44mm"],
  },

  // ---------------------------------------------------------------------
  // AirPods — sem capacidade/tamanho, "Único" representa a única opção de
  // SKU pra manter o fluxo de preço por variação da importação em lote.
  // ---------------------------------------------------------------------
  {
    name: "AirPods 4",
    productLine: "airpods",
    description: "O AirPods de entrada com o design mais novo — case USB-C e melhor ajuste no ouvido.",
    specsText: [
      "Chip H2",
      "Áudio espacial personalizado",
      "Resistência a suor e água (IP54)",
      "Case de recarga USB-C",
      "Bateria: até 5h de escuta, até 30h com o case",
    ].join("\n"),
    colors: ["Branco"],
    storageOptions: ["Único"],
  },
  {
    name: "AirPods 4 (ANC)",
    productLine: "airpods",
    description: "A versão do AirPods 4 com cancelamento ativo de ruído e áudio espacial adaptativo.",
    specsText: [
      "Chip H2",
      "Cancelamento ativo de ruído e modo ambiente",
      "Áudio espacial personalizado adaptativo",
      "Resistência a suor e água (IP54)",
      "Case de recarga USB-C com localização precisa",
      "Bateria: até 4h de escuta com ANC, até 20h com o case",
    ].join("\n"),
    colors: ["Branco"],
    storageOptions: ["Único"],
  },
  {
    name: "AirPods Pro 2",
    productLine: "airpods",
    description: "O topo de linha in-ear da Apple — cancelamento de ruído até 2x mais forte que o modelo anterior e áudio adaptativo.",
    specsText: [
      "Chip H2",
      "Cancelamento ativo de ruído e modo transparência",
      "Áudio adaptativo e Audição Assistida",
      "Resistência a suor e água (IP54)",
      "Case de recarga USB-C com alto-falante de localização",
      "Bateria: até 6h de escuta com ANC, até 30h com o case",
    ].join("\n"),
    colors: ["Branco"],
    storageOptions: ["Único"],
  },
  {
    name: "AirPods Max",
    productLine: "airpods",
    description: "O fone over-ear da Apple — som de alta fidelidade, cancelamento de ruído e Áudio Espacial com rastreamento de cabeça.",
    specsText: [
      "Driver dinâmico de 40mm",
      "Cancelamento ativo de ruído e modo transparência",
      "Áudio Espacial com rastreamento dinâmico de cabeça",
      "Haste digital para controle de volume",
      "Case de recarga USB-C",
      "Bateria: até 20h de escuta",
    ].join("\n"),
    colors: ["Cinza-espacial", "Prateado", "Azul", "Roxo", "Laranja"],
    storageOptions: ["Único"],
  },

  // ---------------------------------------------------------------------
  // iPad
  // ---------------------------------------------------------------------
  {
    name: "iPad Pro",
    productLine: "ipad",
    description: "O iPad mais potente da Apple — tela Ultra Retina XDR e o desempenho de um Mac num corpo ultrafino.",
    specsText: [
      "Chip M4",
      "Tela Ultra Retina XDR (OLED) de 11\" ou 13\"",
      "Câmera traseira de 12MP + LiDAR",
      "Compatível com Apple Pencil Pro e Magic Keyboard",
      "Conector USB-C (Thunderbolt)",
      "Wi-Fi 6E ou Wi-Fi + 5G",
    ].join("\n"),
    colors: ["Prateado", "Cinza-espacial"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "iPad Air",
    productLine: "ipad",
    description: "Leve, rápido e versátil — o meio-termo ideal entre o iPad básico e o Pro.",
    specsText: [
      "Chip M2 ou M3",
      "Tela Liquid Retina de 11\" ou 13\"",
      "Câmera traseira de 12MP",
      "Compatível com Apple Pencil Pro",
      "Conector USB-C",
      "Wi-Fi ou Wi-Fi + 5G",
    ].join("\n"),
    colors: ["Cinza-espacial", "Azul", "Roxo", "Estelar"],
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "iPad",
    productLine: "ipad",
    description: "O iPad mais popular — leve, acessível e pronto pra estudo, trabalho e entretenimento no dia a dia.",
    specsText: [
      "Chip A16",
      "Tela Liquid Retina de 10,9\"",
      "Câmera traseira de 12MP",
      "Compatível com Apple Pencil (USB-C) e Smart Folio",
      "Conector USB-C",
      "Wi-Fi ou Wi-Fi + celular",
    ].join("\n"),
    colors: ["Azul", "Rosa", "Amarelo", "Prateado"],
    storageOptions: ["128GB", "256GB"],
  },
  {
    name: "iPad mini",
    productLine: "ipad",
    description: "Todo o poder do iPad num corpo compacto — cabe numa mão e numa bolsa pequena.",
    specsText: [
      "Chip A17 Pro",
      "Tela Liquid Retina de 8,3\"",
      "Câmera traseira de 12MP",
      "Compatível com Apple Pencil Pro",
      "Conector USB-C",
      "Wi-Fi ou Wi-Fi + 5G",
    ].join("\n"),
    colors: ["Cinza-espacial", "Estelar", "Roxo", "Azul"],
    storageOptions: ["128GB", "256GB", "512GB"],
  },

  // ---------------------------------------------------------------------
  // Mac
  // ---------------------------------------------------------------------
  {
    name: "MacBook Air 13\"",
    productLine: "mac",
    description: "O notebook mais leve da Apple — silencioso (sem ventoinha) e com bateria para o dia inteiro.",
    specsText: [
      "Chip M4",
      "Tela Liquid Retina de 13,6\"",
      "Sem ventoinha — operação silenciosa",
      "Câmera FaceTime HD 12MP",
      "Bateria: até 18h",
      "2 portas USB-C (Thunderbolt)",
    ].join("\n"),
    colors: ["Meia-noite", "Estelar", "Cinza-espacial", "Prateado"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "MacBook Air 15\"",
    productLine: "mac",
    description: "A tela grande do Air — mais espaço pra trabalhar, mesma leveza e silêncio da linha.",
    specsText: [
      "Chip M4",
      "Tela Liquid Retina de 15,3\"",
      "Sem ventoinha — operação silenciosa",
      "Câmera FaceTime HD 12MP",
      "Bateria: até 18h",
      "2 portas USB-C (Thunderbolt)",
    ].join("\n"),
    colors: ["Meia-noite", "Estelar", "Cinza-espacial", "Prateado"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "MacBook Pro 14\"",
    productLine: "mac",
    description: "Desempenho profissional em corpo compacto — tela Liquid Retina XDR e até 24h de bateria.",
    specsText: [
      "Chip M4, M4 Pro ou M4 Max",
      "Tela Liquid Retina XDR (mini-LED) de 14,2\"",
      "Câmera FaceTime HD 12MP com Center Stage",
      "Bateria: até 24h",
      "Portas Thunderbolt 4/5, HDMI, leitor de cartão SD",
    ].join("\n"),
    colors: ["Cinza-espacial", "Prateado"],
    storageOptions: ["512GB", "1TB", "2TB", "4TB"],
  },
  {
    name: "MacBook Pro 16\"",
    productLine: "mac",
    description: "O maior e mais potente MacBook — feito pra edição de vídeo pesada e cargas de trabalho profissionais.",
    specsText: [
      "Chip M4 Pro ou M4 Max",
      "Tela Liquid Retina XDR (mini-LED) de 16,2\"",
      "Câmera FaceTime HD 12MP com Center Stage",
      "Bateria: até 24h",
      "Portas Thunderbolt 4/5, HDMI, leitor de cartão SD",
    ].join("\n"),
    colors: ["Cinza-espacial", "Prateado"],
    storageOptions: ["512GB", "1TB", "2TB", "4TB", "8TB"],
  },
  {
    name: "iMac",
    productLine: "mac",
    description: "O desktop tudo-em-um da Apple — tela de 24\" fina e colorida, pronto pra usar assim que tira da caixa.",
    specsText: [
      "Chip M4",
      "Tela Retina 4.5K de 24\"",
      "Câmera 12MP com Center Stage",
      "4 alto-falantes com Áudio Espacial",
      "2 ou 4 portas USB-C (Thunderbolt)",
      "Teclado, mouse ou Trackpad sem fio inclusos",
    ].join("\n"),
    colors: ["Azul", "Verde", "Rosa", "Roxo", "Prateado", "Amarelo", "Laranja"],
    storageOptions: ["256GB", "512GB", "1TB"],
  },
  {
    name: "Mac mini",
    productLine: "mac",
    description: "O desktop mais compacto e acessível da Apple — cabe na palma da mão, desempenho de sobra pro dia a dia.",
    specsText: [
      "Chip M4 ou M4 Pro",
      "Até 3 monitores externos simultâneos",
      "Portas Thunderbolt 4/5, HDMI, USB-A",
      "Wi-Fi 6E, Bluetooth 5.3",
    ].join("\n"),
    colors: ["Prateado"],
    storageOptions: ["256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "Mac Studio",
    productLine: "mac",
    description: "Estação de trabalho compacta pra quem precisa do máximo de desempenho — vídeo 8K, IA e cargas profissionais pesadas.",
    specsText: [
      "Chip M4 Max ou M3 Ultra",
      "Até 6 monitores externos simultâneos",
      "Portas Thunderbolt 4/5, HDMI, leitor de cartão SD, USB-A",
      "Wi-Fi 6E, Bluetooth 5.3",
    ].join("\n"),
    colors: ["Prateado"],
    storageOptions: ["512GB", "1TB", "2TB", "4TB", "8TB"],
  },
];
