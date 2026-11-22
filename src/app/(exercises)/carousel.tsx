import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';

import { ComparisonRamSlide } from '@/components/carousel/comparison-ram-slide';
import { GenericSlide } from '@/components/carousel/generic-slide';
import type {
  CarouselSlide,
  ComparisonCard,
  ComparisonRamSlideData,
} from '@/components/carousel/types';
import { db } from '@/lib/firebase';

// Paleta SparkLab
const BACKGROUND = '#0D0F14';
const ORANGE = '#FF6B00';
const ORANGE_MUTED = '#B85E00';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#2D3545';
const DOT_IDLE = '#3A4150';

const CAROUSEL_COLLECTION = 'carrossel';
// Próxima etapa do módulo 1 depois do carrossel.
const NEXT_ROUTE = '/(exercises)/theory';

type CarouselState =
  | { status: 'ready'; slides: CarouselSlide[] }
  | { status: 'error'; message: string };

export default function CarouselScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<CarouselSlide>>(null);

  const [result, setResult] = useState<{ key: number; state: CarouselState } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  const updateIndex = useCallback((next: number) => {
    indexRef.current = next;
    setIndex(next);
  }, []);

  useEffect(() => {
    let active = true;

    getDocs(collection(db, CAROUSEL_COLLECTION))
      .then((snapshot) => {
        if (!active) return;

        const slides = snapshot.docs
          .map((docSnap) => normalizeSlide(docSnap.id, docSnap.data()))
          .filter((slide): slide is CarouselSlide => slide !== null)
          .sort(compareSlides);

        if (slides.length === 0) {
          setResult({
            key: reloadKey,
            state: {
              status: 'error',
              message: `Nenhum slide encontrado na coleção "${CAROUSEL_COLLECTION}". Rode "npm run db:carrossel" para enviar os JSONs.`,
            },
          });
          return;
        }

        setResult({ key: reloadKey, state: { status: 'ready', slides } });
        updateIndex(0);
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setResult({
          key: reloadKey,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Falha ao carregar o carrossel.',
          },
        });
      });

    return () => {
      active = false;
    };
  }, [reloadKey, updateIndex]);

  // Mantém o slide atual alinhado quando a janela muda de largura (rotação/web).
  useEffect(() => {
    if (!result || result.state.status !== 'ready') return;
    listRef.current?.scrollToOffset({ offset: indexRef.current * width, animated: false });
  }, [width, result]);

  const carouselState = result?.key === reloadKey ? result.state : null;
  const slides = carouselState?.status === 'ready' ? carouselState.slides : [];
  const isLastSlide = index >= slides.length - 1;

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    if (clamped !== indexRef.current) updateIndex(clamped);
  };

  const goToSlide = (next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    listRef.current?.scrollToOffset({ offset: clamped * width, animated: true });
    updateIndex(clamped);
  };

  const handlePrimaryAction = () => {
    if (isLastSlide) {
      router.push(NEXT_ROUTE);
      return;
    }
    goToSlide(index + 1);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {carouselState === null && (
          <View style={styles.stateContainer}>
            <ActivityIndicator color={ORANGE} size="large" />
            <Text style={styles.stateTitle}>Carregando...</Text>
            <Text style={styles.stateText}>Buscando os slides no Firebase.</Text>
          </View>
        )}

        {carouselState?.status === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.stateTitle}>Não foi possível carregar</Text>
            <Text style={styles.stateText}>{carouselState.message}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setReloadKey((key) => key + 1)}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {slides.length > 0 && (
          <>
            <FlatList
              ref={listRef}
              data={slides}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumEnd}
              getItemLayout={(_, itemIndex) => ({
                length: width,
                offset: width * itemIndex,
                index: itemIndex,
              })}
              renderItem={({ item }) => (
                <ScrollView
                  style={{ width }}
                  contentContainerStyle={styles.slideScroll}
                  showsVerticalScrollIndicator={false}>
                  {renderSlide(item, width)}
                </ScrollView>
              )}
            />

            <View style={styles.footer}>
              <View style={styles.dotsRow}>
                {slides.map((slide, dotIndex) => {
                  const isActive = dotIndex === index;
                  return (
                    <TouchableOpacity
                      key={slide.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Ir para o slide ${dotIndex + 1} de ${slides.length}`}
                      onPress={() => goToSlide(dotIndex)}
                      hitSlop={8}
                      style={[styles.dot, isActive && styles.dotActive]} />
                  );
                })}
              </View>

              <Text style={styles.counter}>
                {`${index + 1} de ${slides.length}`}
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePrimaryAction}
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>
                  {isLastSlide ? 'ENTENDI, IR PARA TEORIA' : 'PRÓXIMO'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function renderSlide(slide: CarouselSlide, width: number) {
  if (isComparisonRamSlide(slide)) {
    return <ComparisonRamSlide data={slide} width={width} />;
  }
  return <GenericSlide data={slide} width={width} />;
}

function isComparisonRamSlide(slide: CarouselSlide): slide is ComparisonRamSlideData {
  return (
    slide.layout === 'comparison_ram' &&
    !!slide.leftCard &&
    !!slide.rightCard &&
    typeof slide.subtitle === 'string' &&
    typeof slide.body === 'string' &&
    typeof slide.badgeText === 'string'
  );
}

function normalizeSlide(id: string, data: Record<string, unknown>): CarouselSlide | null {
  const title = asString(data.title);
  if (!title) return null;

  return {
    id: asString(data.id, id) || id,
    layout: asString(data.layout, 'generic') || 'generic',
    title,
    subtitle: asString(data.subtitle) || undefined,
    body: asString(data.body) || undefined,
    badgeText: asString(data.badgeText) || undefined,
    leftCard: asCard(data.leftCard),
    rightCard: asCard(data.rightCard),
  };
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asCard(value: unknown): ComparisonCard | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const card = value as Record<string, unknown>;
  const rawPercent = typeof card.barPercent === 'number' ? card.barPercent : Number(card.barPercent);

  return {
    label: asString(card.label),
    status: asString(card.status),
    metric: asString(card.metric),
    barPercent: Number.isFinite(rawPercent) ? rawPercent : 0,
  };
}

// Ordena por sufixo numérico do id (slide_1, slide_2, ... slide_10),
// com fallback alfabético para ids sem número.
function compareSlides(a: CarouselSlide, b: CarouselSlide) {
  const rankA = slideRank(a.id);
  const rankB = slideRank(b.id);
  if (rankA !== rankB) return rankA - rankB;
  return a.id.localeCompare(b.id);
}

function slideRank(id: string) {
  const match = /(\d+)\s*$/.exec(id);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  safeArea: {
    flex: 1,
  },
  slideScroll: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    gap: 10,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DOT_IDLE,
  },
  dotActive: {
    width: 22,
    backgroundColor: ORANGE,
  },
  counter: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryButton: {
    alignSelf: 'stretch',
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: ORANGE_MUTED,
  },
  primaryButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  stateEmoji: {
    fontSize: 32,
  },
  stateTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
    borderBottomWidth: 3,
    borderBottomColor: ORANGE_MUTED,
  },
  retryButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '800',
  },
});
