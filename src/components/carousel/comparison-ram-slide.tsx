import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ComparisonRamSlideData } from './types';

/**
 * Slide "comparison_ram": compara 1 máquina só (gargalo) com um cluster Spark
 * (paralelo). O infográfico é feito 100% com shapes + ícones do Expo.
 *
 * `width` vem do pager (largura da janela) em vez de Dimensions, para o slide
 * acompanhar rotação de tela e redimensionamento da janela no web.
 */
export function ComparisonRamSlide({
  data,
  width,
}: {
  data: ComparisonRamSlideData;
  width: number;
}) {
  const leftPercent = clampPercent(data.leftCard.barPercent);
  const rightPercent = clampPercent(data.rightCard.barPercent);

  return (
    <View style={[styles.container, { width }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>{data.subtitle}</Text>
        <Text style={styles.title}>{data.title}</Text>
      </View>

      {/* Área Visual (Infográfico 100% Shapes + Ícones Expo) */}
      <View style={styles.diagramContainer}>
        {/* LADO ESQUERDO: 1 Máquina Só (Gargalo) */}
        <View style={[styles.compareBox, styles.boxMuted]}>
          <Text style={styles.boxLabelMuted}>{data.leftCard.label}</Text>

          {/* Shape: Torre de arquivos pesados + ícone */}
          <View style={styles.singleNodeWrapper}>
            <View style={styles.dataStack}>
              <View style={[styles.stackBlock, { width: 38, opacity: 0.4 }]} />
              <View style={[styles.stackBlock, { width: 44, opacity: 0.7 }]} />
              <View style={[styles.stackBlock, { width: 50, backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.iconCircleMuted}>
              <Ionicons name="laptop-outline" size={26} color="#9CA3AF" />
              <View style={styles.alertDot}>
                <Ionicons name="warning" size={11} color="#FFF" />
              </View>
            </View>
          </View>

          {/* Barra de uso (Gargalo) */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${leftPercent}%`, backgroundColor: '#EF4444' },
              ]}
            />
          </View>
          <Text style={styles.statusTextMuted}>{data.leftCard.status}</Text>
        </View>

        {/* Divisor Central "VS" */}
        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* LADO DIREITO: Cluster Spark (Distribuído) */}
        <View style={[styles.compareBox, styles.boxActive]}>
          <Text style={styles.boxLabelActive}>{data.rightCard.label}</Text>

          {/* Shape: Rede de 3 Nós conectados */}
          <View style={styles.clusterWrapper}>
            {/* Nó Principal (Driver/Hub) */}
            <View style={styles.nodeHub}>
              <Ionicons name="flash" size={18} color="#FF6B00" />
            </View>

            {/* Linhas de conexão feitas com View */}
            <View style={styles.connectorRow}>
              <View style={[styles.connectorLine, { transform: [{ rotate: '-25deg' }] }]} />
              <View style={styles.connectorLineVertical} />
              <View style={[styles.connectorLine, { transform: [{ rotate: '25deg' }] }]} />
            </View>

            {/* 3 Executors em paralelo */}
            <View style={styles.workersRow}>
              {[1, 2, 3].map((node) => (
                <View key={node} style={styles.workerNode}>
                  <MaterialCommunityIcons name="memory" size={15} color="#FF8C38" />
                </View>
              ))}
            </View>
          </View>

          {/* Barra de uso (Folga na RAM) */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${rightPercent}%`, backgroundColor: '#FF6B00' },
              ]}
            />
          </View>
          <Text style={styles.statusTextActive}>{data.rightCard.status}</Text>
        </View>
      </View>

      {/* Badge de Destaque */}
      <View style={styles.highlightBadge}>
        <Ionicons name="flash" size={16} color="#FF6B00" />
        <Text style={styles.highlightText}>{data.badgeText}</Text>
      </View>

      {/* Explicação Curta */}
      <Text style={styles.bodyText}>{data.body}</Text>
    </View>
  );
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
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
  diagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    position: 'relative',
  },
  compareBox: {
    flex: 1,
    height: 220,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  boxMuted: {
    backgroundColor: '#14171F',
    borderColor: '#232834',
  },
  boxActive: {
    backgroundColor: '#1A1614',
    borderColor: 'rgba(255, 107, 0, 0.45)',
  },
  boxLabelMuted: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  boxLabelActive: {
    color: '#FF8C38',
    fontSize: 13,
    fontWeight: '700',
  },
  // Shapes Lado Esquerdo
  singleNodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataStack: {
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  stackBlock: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6B7280',
  },
  iconCircleMuted: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1F2430',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  alertDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Shapes Lado Direito
  clusterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  nodeHub: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorRow: {
    flexDirection: 'row',
    width: 76,
    height: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectorLine: {
    width: 1.5,
    height: 16,
    backgroundColor: 'rgba(255, 107, 0, 0.4)',
  },
  connectorLineVertical: {
    width: 1.5,
    height: 14,
    backgroundColor: 'rgba(255, 107, 0, 0.4)',
  },
  workersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  workerNode: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#241B15',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Barras de Progresso
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#252A36',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusTextMuted: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#FDBA74',
    fontSize: 11,
    fontWeight: '600',
  },
  vsBadge: {
    position: 'absolute',
    left: '50%',
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D0F14',
    borderWidth: 1,
    borderColor: '#2E3442',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  vsText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
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
  bodyText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 6,
  },
});
