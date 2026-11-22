import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { CarouselSlide } from './types';

/**
 * Slide de reserva para layouts que ainda não têm componente próprio.
 * Garante que um documento novo na coleção `carrossel` (slide 2, 3, 4...)
 * apareça no pager em vez de quebrar a tela.
 */
export function GenericSlide({ data, width }: { data: CarouselSlide; width: number }) {
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.header}>
        {!!data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}
        <Text style={styles.title}>{data.title}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles-outline" size={30} color="#FF6B00" />
        </View>
        <Text style={styles.cardText}>
          {data.body ?? 'Este slide ainda não tem conteúdo cadastrado.'}
        </Text>
      </View>

      {!!data.badgeText && (
        <View style={styles.highlightBadge}>
          <Ionicons name="flash" size={16} color="#FF6B00" />
          <Text style={styles.highlightText}>{data.badgeText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  subtitle: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#14171F',
    borderWidth: 1,
    borderColor: '#232834',
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 18,
  },
  highlightText: {
    color: '#FDBA74',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
