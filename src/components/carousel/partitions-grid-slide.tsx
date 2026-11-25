import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { PartitionsGridSlideData } from './types';

const DEFAULT_GRID = 3;
const MAX_GRID = 6;
const DEFAULT_ACCENT = '#FF6B00';
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Slide "partitions_grid": mostra o DataFrame como uma visão lógica única
 * (snippet PySpark) que é fatiada em partições, cada uma com sua mini-grade
 * de células. O infográfico é 100% shapes + ícones do Expo.
 *
 * `width` vem do pager (largura da janela) em vez de Dimensions, para o slide
 * acompanhar rotação de tela e redimensionamento da janela no web.
 */
export function PartitionsGridSlide({
  data,
  width,
}: {
  data: PartitionsGridSlideData;
  width: number;
}) {
  const partitions = data.partitions ?? [];

  return (
    <View style={[styles.container, { width }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>{data.subtitle}</Text>
        <Text style={styles.title}>{data.title}</Text>
      </View>

      {/* Card Central: Snippet + Partições em Grade */}
      <View style={styles.diagramCard}>
        {/* Bloco de Código (Visão Lógica Única) */}
        <View style={styles.codeBox}>
          <View style={styles.codeHeader}>
            <MaterialCommunityIcons name="code-tags" size={14} color="#FF8C38" />
            <Text style={styles.codeLabel}>PySpark • 1 DataFrame</Text>
          </View>
          <Text style={styles.codeText} numberOfLines={1}>
            {data.codeSnippet}
          </Text>
        </View>

        {/* Conectores de Fatiamento (View) */}
        <View style={styles.splitConnector}>
          <View style={styles.stemTop} />
          <View style={styles.horizontalBus} />
          <View style={styles.stemsBottomRow}>
            {partitions.map((p) => (
              <View key={p.id} style={styles.stemBottom} />
            ))}
          </View>
        </View>

        {/* Partições (Shapes em Grade) */}
        <View style={styles.partitionsRow}>
          {partitions.map((part) => {
            const borderColor = sanitizeAccent(part.accent);
            const rowsArr = Array.from({ length: clampGrid(part.rows) }, (_, r) => r);
            const colsArr = Array.from({ length: clampGrid(part.cols) }, (_, c) => c);

            return (
              <View
                key={part.id}
                style={[styles.partitionCard, { borderColor: `${borderColor}66` }]}>
                <Text style={styles.partitionTitle}>{part.label}</Text>

                {/* Grade de células feita com View */}
                <View style={styles.gridWrapper}>
                  {rowsArr.map((rIdx) => (
                    <View key={rIdx} style={styles.gridRow}>
                      {colsArr.map((cIdx) => (
                        <View
                          key={cIdx}
                          style={[
                            styles.gridCell,
                            {
                              backgroundColor:
                                (rIdx + cIdx) % 2 === 0
                                  ? `${borderColor}33`
                                  : `${borderColor}18`,
                              borderColor: `${borderColor}55`,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>

                <View style={[styles.statusPill, { backgroundColor: `${borderColor}22` }]}>
                  <Text style={[styles.statusPillText, { color: borderColor }]}>Paralelo</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Badge de Destaque */}
      <View style={styles.highlightBadge}>
        <Ionicons name="grid-outline" size={16} color="#FF6B00" />
        <Text style={styles.highlightText}>{data.badgeText}</Text>
      </View>

      {/* Explicação Curta */}
      <Text style={styles.bodyText}>{data.body}</Text>
    </View>
  );
}

// Evita que um valor inválido no Firestore gere uma grade gigante (ou zero células).
function clampGrid(value: number) {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_GRID;
  return Math.min(MAX_GRID, Math.round(value));
}

// As cores são usadas com sufixo de alpha ("#RRGGBB66"), então só aceita hex de 6 dígitos.
function sanitizeAccent(value: string) {
  return HEX_COLOR.test(value) ? value : DEFAULT_ACCENT;
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
  codeBox: {
    backgroundColor: '#0E1016',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#272D3B',
    padding: 10,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  codeText: {
    color: '#FDBA74',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  splitConnector: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  stemTop: {
    width: 2,
    height: 9,
    backgroundColor: 'rgba(255, 107, 0, 0.55)',
  },
  horizontalBus: {
    width: '74%',
    height: 2,
    backgroundColor: 'rgba(255, 107, 0, 0.45)',
    borderRadius: 1,
  },
  stemsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '74%',
  },
  stemBottom: {
    width: 2,
    height: 9,
    backgroundColor: 'rgba(255, 107, 0, 0.55)',
  },
  partitionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  partitionCard: {
    flex: 1,
    backgroundColor: '#181C26',
    borderRadius: 12,
    borderWidth: 1,
    padding: 9,
    alignItems: 'center',
    gap: 8,
  },
  partitionTitle: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '700',
  },
  gridWrapper: {
    gap: 3,
    paddingVertical: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  gridCell: {
    width: 14,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.8,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
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
