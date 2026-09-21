// "Ramo de atividade" picked at store creation — drives (a) the short
// category tag shown under the wordmark on catalog-family templates (the
// "Bebidas & Tabacaria" line in the Adega MM reference) and (b) which
// templates get recommended first in the template picker.

export interface BusinessCategory {
  id: string;
  label: string;
  /** Short tag shown under the store name on the public page (catalog-family
   * templates only) — mirrors "Bebidas & Tabacaria" in the reference. */
  subMark: string | null;
  recommendedTemplateSlugs: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: "bar_adega",
    label: "Bar / Adega / Tabacaria",
    subMark: "Bebidas & Tabacaria",
    recommendedTemplateSlugs: ["adega-mm"],
  },
  {
    id: "restaurante_lanchonete",
    label: "Restaurante / Lanchonete",
    subMark: "Cardápio & Delivery",
    recommendedTemplateSlugs: ["adega-mm"],
  },
  {
    id: "doceria_confeitaria",
    label: "Doceria / Confeitaria",
    subMark: "Doces & Encomendas",
    recommendedTemplateSlugs: ["adega-mm"],
  },
  {
    id: "mercado_conveniencia",
    label: "Mercado / Conveniência",
    subMark: "Produtos & Ofertas",
    recommendedTemplateSlugs: ["adega-mm"],
  },
  {
    id: "moda_acessorios",
    label: "Moda / Acessórios",
    subMark: "Coleção & Novidades",
    recommendedTemplateSlugs: ["adega-mm"],
  },
  {
    id: "eletronicos_celulares",
    label: "Eletrônicos / Celulares",
    subMark: "Aparelhos & Acessórios",
    recommendedTemplateSlugs: ["iphone-store"],
  },
  {
    id: "barbearia_salao",
    label: "Barbearia / Salão de Beleza",
    subMark: "Cortes & Cuidados",
    recommendedTemplateSlugs: ["barbearia-tnt"],
  },
  {
    id: "estetica_clinica",
    label: "Clínica de Estética",
    subMark: "Tratamentos & Resultados",
    recommendedTemplateSlugs: ["clinica"],
  },
  {
    id: "servicos_gerais",
    label: "Serviços Gerais",
    subMark: "Serviços & Orçamentos",
    recommendedTemplateSlugs: ["barbearia-tnt", "clinica"],
  },
  {
    id: "outro",
    label: "Outro",
    subMark: null,
    recommendedTemplateSlugs: [],
  },
];

export function findBusinessCategory(id: string | null | undefined): BusinessCategory | undefined {
  return BUSINESS_CATEGORIES.find((category) => category.id === id);
}
