export type ComparisonCard = {
  label: string;
  status: string;
  metric: string;
  barPercent: number;
};

export type DriverInfo = {
  role: string;
  tag: string;
  description: string;
  icon: string;
};

export type ExecutorsInfo = {
  role: string;
  tag: string;
  description: string;
  count: number;
  labelPrefix: string;
  icon: string;
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
  driver?: DriverInfo;
  executors?: ExecutorsInfo;
};

export type ComparisonRamSlideData = CarouselSlide & {
  subtitle: string;
  body: string;
  badgeText: string;
  leftCard: ComparisonCard;
  rightCard: ComparisonCard;
};

export type ArchitectureMapSlideData = CarouselSlide & {
  subtitle: string;
  body: string;
  badgeText: string;
  driver: DriverInfo;
  executors: ExecutorsInfo;
};
