import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ArchitectureMapSlideData } from './types';

const MIN_EXECUTORS = 1;
const MAX_EXECUTORS = 6;
const DEFAULT_EXECUTORS = 3;

/**
 * Slide "architecture_map": mostra o Driver (maestro) no topo e os Executors
 * (orquestra) rodando em paralelo embaixo, ligados por um barramento desenhado
 * com Views. O infográfico é 100% shapes + ícones do Expo.
 *
 * `width` vem do pager (largura da janela) em vez de Dimensions, para o slide
 * acompanhar rotação de tela e redimensionamento da janela no web.
 */
export function ArchitectureMapSlide({
  data,
  width,
}: {
  data: ArchitectureMapSlideData;
  width: number;
}) {
  const executorCount = clampCount(data.executors.count);
  const workerList = Array.from({ length: executorCount }, (_, idx) => idx + 1);

  return (
    <View style={[styles.container, { width }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>{data.subtitle}</Text>
        <Text style={styles.title}>{data.title}</Text>
      </View>

      {/* Infográfico de Arquitetura (Shapes + Ícones Expo) */}
      <View style={styles.diagramCard}>
        {/* Bloco Superior: DRIVER */}
        <View style={styles.driverBox}>
          <View style={styles.driverTopRow}>
            <View style={styles.driverIconBadge}>
              <Ionicons
                name={data.driver.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color="#FF6B00"
              />
            </View>
            <View style={styles.driverTitleGroup}>
              <Text style={styles.driverRole}>{data.driver.role}</Text>
              <Text style={styles.driverTag}>{data.driver.tag}</Text>
            </View>
          </View>
          <Text style={styles.driverDesc}>{data.driver.description}</Text>
        </View>

        {/* Conectores (Linhas e Barramento feitos com View) */}
        <View style={styles.treeConnector}>
          <View style={styles.stemTop} />
          <View style={styles.horizontalBus} />
          <View style={styles.stemsBottomRow}>
            {workerList.map((n) => (
              <View key={n} style={styles.stemBottom} />
            ))}
          </View>
        </View>

        {/* Bloco Inferior: EXECUTORS */}
        <View style={styles.executorsContainer}>
          <View style={styles.executorsHeader}>
            <Text style={styles.executorsRole}>{data.executors.role}</Text>
            <View style={styles.parallelPill}>
              <Text style={styles.parallelPillText}>{data.executors.tag}</Text>
            </View>
          </View>

          <View style={styles.workersGrid}>
            {workerList.map((num) => (
              <View key={num} style={styles.workerCard}>
                <MaterialCommunityIcons
                  name={data.executors.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                  color="#FF8C38"
                />
                <Text style={styles.workerLabel}>
                  {data.executors.labelPrefix} {num}
                </Text>
                <View style={styles.activeDot} />
              </View>
            ))}
          </View>

          <Text style={styles.executorsDesc}>{data.executors.description}</Text>
        </View>
      </View>

      {/* Badge de Destaque */}
      <View style={styles.highlightBadge}>
        <Ionicons name="layers-outline" size={16} color="#FF6B00" />
        <Text style={styles.highlightText}>{data.badgeText}</Text>
      </View>

      {/* Explicação Curta */}
      <Text style={styles.bodyText}>{data.body}</Text>
    </View>
  );
}

// Protege o grid contra um `count` inválido vindo do Firestore.
function clampCount(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_EXECUTORS;
  return Math.max(MIN_EXECUTORS, Math.min(MAX_EXECUTORS, Math.round(value)));
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
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
  diagramCard: {
    backgroundColor: '#14171F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#232834',
    padding: 14,
  },
  // Driver
  driverBox: {
    backgroundColor: '#1C1714',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.45)',
    padding: 12,
  },
  driverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  driverIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverRole: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '800',
  },
  driverTag: {
    color: '#FF8C38',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  driverDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 17,
  },
  // Linhas de conexão
  treeConnector: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  stemTop: {
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 107, 0, 0.55)',
  },
  horizontalBus: {
    width: '72%',
    height: 2,
    backgroundColor: 'rgba(255, 107, 0, 0.45)',
    borderRadius: 1,
  },
  stemsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '72%',
  },
  stemBottom: {
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 107, 0, 0.55)',
  },
  // Executors
  executorsContainer: {
    backgroundColor: '#181C26',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#282F3E',
    padding: 12,
  },
  executorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  executorsRole: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '700',
  },
  parallelPill: {
    backgroundColor: 'rgba(255, 107, 0, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  parallelPillText: {
    color: '#FF8C38',
    fontSize: 11,
    fontWeight: '700',
  },
  workersGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  workerCard: {
    flex: 1,
    backgroundColor: '#12151C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2B3242',
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  workerLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B00',
  },
  executorsDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 17,
  },
  // Rodapé do slide
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
    marginTop: 14,
  },
  highlightText: {
    color: '#FDBA74',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  bodyText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 6,
  },
});
