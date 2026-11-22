export type ComparisonCard = {
  label: string;
  status: string;
  metric: string;
  barPercent: number;
};

/**
 * Documento da coleção `carrossel` no Firestore.
 * Cada documento é um slide; `layout` decide qual componente o renderiza.
 */
export type CarouselSlide = {
  id: string;
  layout: string;
  title: string;
  subtitle?: string;
  body?: string;
  badgeText?: string;
  leftCard?: ComparisonCard;
  rightCard?: ComparisonCard;
};

export type ComparisonRamSlideData = CarouselSlide & {
  subtitle: string;
  body: string;
  badgeText: string;
  leftCard: ComparisonCard;
  rightCard: ComparisonCard;
};
