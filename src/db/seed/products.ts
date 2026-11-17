export interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  featured?: boolean;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "amendoim-caramelizado",
    name: "Amendoim Caramelizado",
    description:
      "Massa de chocolate meio amargo com cobertura de ganache, finalizada com amendoins caramelizados e um fio de caramelo salgado.",
    category: "Chocolate",
    priceCents: 1490,
    featured: true,
  },
  {
    slug: "morango-silvestre",
    name: "Morango Silvestre",
    description:
      "Massa amanteigada com recheio de geleia de morango caseira, coberta com farofa crocante e morango fresco.",
    category: "Frutados",
    priceCents: 1390,
  },
  {
    slug: "mini-arco-iris",
    name: "Mini Arco-Íris",
    description:
      "Bolinhos de baunilha cobertos com fondant colorido e confeitos crocantes. Perfeitos para festas infantis.",
    category: "Temáticos",
    priceCents: 790,
  },
  {
    slug: "borboleta-de-baunilha",
    name: "Borboleta de Baunilha",
    description:
      "Clássico australiano: massa de baunilha com 'asas' de bolo recheadas com chantilly e geleia de framboesa.",
    category: "Clássicos",
    priceCents: 1090,
  },
  {
    slug: "banana-com-nozes",
    name: "Banana com Nozes",
    description:
      "Massa úmida de banana-prata com nozes picadas e cobertura de cream cheese com toque de canela.",
    category: "Frutados",
    priceCents: 1290,
  },
  {
    slug: "limao-siciliano",
    name: "Limão Siciliano",
    description:
      "Massa leve de limão siciliano com recheio de curd cítrico e cobertura de merengue suíço.",
    category: "Frutados",
    priceCents: 1350,
    featured: true,
  },
  {
    slug: "rosa-azul",
    name: "Rosa Azul",
    description:
      "Massa de baunilha com buttercream azul confeitado em formato de rosa. Ideal para presentear.",
    category: "Temáticos",
    priceCents: 1590,
  },
  {
    slug: "maracuja-em-flor",
    name: "Maracujá em Flor",
    description:
      "Massa de maracujá com recheio de mousse da fruta e flor delicada de pasta americana no topo.",
    category: "Frutados",
    priceCents: 1490,
  },
  {
    slug: "chocolate-com-framboesa",
    name: "Chocolate com Framboesa",
    description:
      "Massa de cacau 50% recheada com framboesas frescas e cobertura cremosa de chocolate ao leite.",
    category: "Chocolate",
    priceCents: 1590,
  },
  {
    slug: "chai-com-chocolate-branco",
    name: "Chai com Chocolate Branco",
    description:
      "Massa aromatizada com especiarias do chai (canela, cardamomo e gengibre) e cobertura de chocolate branco.",
    category: "Especiais",
    priceCents: 1690,
  },
  {
    slug: "creme-de-framboesa",
    name: "Creme de Framboesa",
    description:
      "Massa de baunilha com buttercream de framboesa e finalização com framboesas inteiras.",
    category: "Frutados",
    priceCents: 1450,
  },
  {
    slug: "jardim-florido",
    name: "Jardim Florido",
    description:
      "Seleção de cupcakes com flores de buttercream em várias cores, confeitadas à mão uma a uma.",
    category: "Temáticos",
    priceCents: 1890,
    featured: true,
  },
  {
    slug: "pintinho-de-pascoa",
    name: "Pintinho de Páscoa",
    description:
      "Cupcake de baunilha com cobertura amarela e carinha de pintinho. Edição divertida de Páscoa.",
    category: "Temáticos",
    priceCents: 990,
  },
  {
    slug: "coco-nuvem",
    name: "Coco Nuvem",
    description:
      "Massa aerada estilo angel food com cobertura de chantilly e coco ralado fresco, em forminhas listradas.",
    category: "Clássicos",
    priceCents: 1190,
  },
  {
    slug: "especiarias-e-mascavo",
    name: "Especiarias e Mascavo",
    description:
      "Massa de coco com especiarias e buttercream de açúcar mascavo em espiral generosa.",
    category: "Especiais",
    priceCents: 1390,
  },
  {
    slug: "coco-tostado-com-caramelo",
    name: "Coco Tostado com Caramelo",
    description: "Inspirado no cookie samoa: coco tostado, caramelo e fios de chocolate amargo.",
    category: "Especiais",
    priceCents: 1590,
  },
  {
    slug: "festa-de-confeitos",
    name: "Festa de Confeitos",
    description:
      "Cupcakes coloridos com confeitos de chocolate e granulado. Alegria garantida em qualquer festa.",
    category: "Temáticos",
    priceCents: 1190,
  },
  {
    slug: "paleta-de-cores",
    name: "Paleta de Cores",
    description:
      "Massa de baunilha com coberturas de buttercream em cores vibrantes e decorações temáticas.",
    category: "Temáticos",
    priceCents: 1290,
  },
  {
    slug: "cookies-and-cream",
    name: "Cookies & Cream",
    description:
      "Massa de chocolate com pedaços de biscoito recheado e buttercream de baunilha com biscoito triturado.",
    category: "Chocolate",
    priceCents: 1490,
    featured: true,
  },
  {
    slug: "glaceado-com-granulado",
    name: "Glaceado com Granulado",
    description: "Massa amanteigada com glacê real escorrido e granulado colorido crocante.",
    category: "Clássicos",
    priceCents: 890,
  },
  {
    slug: "banana-com-chocolate",
    name: "Banana com Chocolate",
    description:
      "Massa de banana caramelizada com cobertura de chocolate e lascas de chocolate crocante.",
    category: "Chocolate",
    priceCents: 1350,
  },
  {
    slug: "chocolate-e-pasta-de-amendoim",
    name: "Chocolate e Pasta de Amendoim",
    description:
      "Massa de chocolate recheada com pasta de amendoim cremosa e buttercream de amendoim com gotas de chocolate.",
    category: "Chocolate",
    priceCents: 1690,
    featured: true,
  },
  {
    slug: "rosa-delicado",
    name: "Rosa Delicado",
    description:
      "Massa de baunilha com cobertura de buttercream de morango e decoração com corações de açúcar.",
    category: "Clássicos",
    priceCents: 1190,
  },
  {
    slug: "manga-tropical",
    name: "Manga Tropical",
    description: "Massa leve com recheio de manga e cobertura amarela de buttercream de manga.",
    category: "Frutados",
    priceCents: 1290,
  },
  {
    slug: "baunilha-confete",
    name: "Baunilha Confete",
    description:
      "O clássico de aniversário: massa de baunilha com cobertura branca e muito granulado colorido.",
    category: "Clássicos",
    priceCents: 990,
  },
  {
    slug: "chocolate-com-canela",
    name: "Chocolate com Canela",
    description:
      "Massa de chocolate intensa com cobertura de chantilly e canela polvilhada na hora.",
    category: "Chocolate",
    priceCents: 1190,
  },
  {
    slug: "trio-pastel",
    name: "Trio Pastel",
    description: "Cupcakes de baunilha com coberturas em tons pastel de limão, lavanda e pêssego.",
    category: "Clássicos",
    priceCents: 1390,
  },
  {
    slug: "gotas-de-chocolate",
    name: "Gotas de Chocolate",
    description:
      "Bolinho caseiro de baunilha com gotas de chocolate. Simples, fofinho e irresistível.",
    category: "Clássicos",
    priceCents: 690,
  },
  {
    slug: "menta-refrescante",
    name: "Menta Refrescante",
    description: "Massa de chocolate branco com buttercream de menta e um toque de limão.",
    category: "Especiais",
    priceCents: 1290,
  },
  {
    slug: "sortido-da-casa",
    name: "Sortido da Casa",
    description:
      "Seleção do dia com sabores sortidos: red velvet, chocolate, cenoura e baunilha. Varia conforme a fornada.",
    category: "Especiais",
    priceCents: 1990,
  },
  {
    slug: "chocolate-branco-e-framboesa",
    name: "Chocolate Branco e Framboesa",
    description:
      "Massa de chocolate branco com cobertura cremosa e framboesas frescas. Sucesso da nossa vitrine.",
    category: "Frutados",
    priceCents: 1590,
  },
  {
    slug: "flor-turquesa",
    name: "Flor Turquesa",
    description:
      "Cupcake elegante com cobertura turquesa e flores de pasta americana. Perfeito para casamentos.",
    category: "Temáticos",
    priceCents: 1790,
  },
  {
    slug: "halloween-doce",
    name: "Halloween Doce",
    description:
      "Massa de chocolate com cobertura laranja e balinhas de milho. Edição especial de Halloween.",
    category: "Temáticos",
    priceCents: 1190,
  },
  {
    slug: "lavanda-com-coracao",
    name: "Lavanda com Coração",
    description:
      "Massa de baunilha com buttercream de lavanda e um coração de açúcar vermelho no topo.",
    category: "Especiais",
    priceCents: 1390,
  },
  {
    slug: "gemada-natalina",
    name: "Gemada Natalina",
    description:
      "Massa de gemada com noz-moscada, cobertura de cream cheese e biscoito de gengibre no topo.",
    category: "Especiais",
    priceCents: 1490,
  },
  {
    slug: "red-velvet",
    name: "Red Velvet",
    description:
      "Massa aveludada vermelha com toque de cacau e a tradicional cobertura de cream cheese.",
    category: "Clássicos",
    priceCents: 1290,
    featured: true,
  },
  {
    slug: "pistache",
    name: "Pistache",
    description: "Massa de baunilha com buttercream de pistache em espiral e pistaches picados.",
    category: "Especiais",
    priceCents: 1890,
  },
];
