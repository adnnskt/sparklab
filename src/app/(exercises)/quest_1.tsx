import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const BACKGROUND = '#1E232A';
const CARD_BG = '#2A303C';
const CODE_BG = '#0D1117';
const ACCENT_GREEN = '#10B981';
const ACCENT_ORANGE = '#FF9600';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';
const ACCENT_RED = '#EF4444';

const SYN = {
  keyword:   '#569CD6',
  string:    '#CE9178',
  number:    '#B5CEA8',
  method:    '#DCDCAA',
  variable:  '#9CDCFE',
  operator:  '#D4D4D4',
  text:      '#D4D4D4',
  comment:   '#6A9955',
  builtin:   '#4EC9B0',
  param:     '#9CDCFE',
} as const;

const KEYWORDS = new Set([
  'True','False','None','def','class','if','else','elif','return',
  'import','from','as','in','for','while','with','try','except',
]);

const BUILTINS = new Set(['print','len','range','type','str','int','float','list','dict']);

const PYSPARK_METHODS = new Set([
  'show','read','csv','json','parquet','option','options',
  'format','load','save','createDataFrame','toDF',
  'printSchema','select','filter','where','groupBy',
  'agg','join','withColumn','drop','distinct','count','sort','orderBy',
]);

type TokenType = keyof typeof SYN;
type Token = { text: string; type: TokenType };

function tokenize(code: string): Token[] {
  const TOKEN_RE = /(#.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?|[a-zA-Z_]\w*|[^\s\w"#]+|\s+)/g;
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(code)) !== null) {
    const raw = match[0];
    if (raw.startsWith('#')) {
      tokens.push({ text: raw, type: 'comment' });
    } else if (raw.startsWith('"') || raw.startsWith("'")) {
      tokens.push({ text: raw, type: 'string' });
    } else if (/^\d/.test(raw)) {
      tokens.push({ text: raw, type: 'number' });
    } else if (/^[a-zA-Z_]/.test(raw)) {
      if (KEYWORDS.has(raw)) tokens.push({ text: raw, type: 'keyword' });
      else if (BUILTINS.has(raw)) tokens.push({ text: raw, type: 'builtin' });
      else {
        const next = code[match.index + raw.length];
        tokens.push({ text: raw, type: next === '(' ? 'method' : 'variable' });
      }
    } else if (/^[=\+\-\*\/<>!&|^~%]$/.test(raw) || raw === '=>') {
      tokens.push({ text: raw, type: 'operator' });
    } else {
      tokens.push({ text: raw, type: 'text' });
    }
  }
  return tokens;
}

function CodeLine({ text, lineNum }: { text: string; lineNum: number }) {
  const tokens = tokenize(text);
  return (
    <View style={styles.codeLine}>
      <Text style={styles.lineNumber}>{lineNum}</Text>
      <Text style={styles.codeLineText}>
        {tokens.map((t, i) => (
          <Text key={i} style={{ color: SYN[t.type] }}>{t.text}</Text>
        ))}
      </Text>
    </View>
  );
}

const SOLUTION = {
  0: '/user/data/sales.csv',
  1: 'inferSchema',
  2: 'load',
};

const INITIAL_OPTIONS = [
  'header', 'inferSchema', 'schema', 'path',
  'infer', 'load', 'save', 'options', '/user/data/sales.csv',
];

type Status = 'idle' | 'correct' | 'wrong';

export default function SparkExerciseScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [selectedSlots, setSelectedSlots] = useState<Record<number, string | null>>({
    0: null, 1: null, 2: null,
  });
  const [availableOptions, setAvailableOptions] = useState<string[]>(INITIAL_OPTIONS);

  const handleSelectOption = (option: string) => {
    if (status !== 'idle') return;
    const firstEmptyIndex = [0, 1, 2].find((idx) => selectedSlots[idx] === null);
    if (firstEmptyIndex !== undefined) {
      setSelectedSlots((prev) => ({ ...prev, [firstEmptyIndex]: option }));
      setAvailableOptions((prev) => prev.filter((item) => item !== option));
    }
  };

  const handleRemoveSlot = (slotIndex: number) => {
    if (status !== 'idle') return;
    const itemToRemove = selectedSlots[slotIndex];
    if (itemToRemove) {
      setSelectedSlots((prev) => ({ ...prev, [slotIndex]: null }));
      setAvailableOptions((prev) => [...prev, itemToRemove]);
    }
  };

  const handleVerify = () => {
    const isCorrect =
      selectedSlots[0] === SOLUTION[0] &&
      selectedSlots[1] === SOLUTION[1] &&
      selectedSlots[2] === SOLUTION[2];
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setTimeout(() => router.push('/(exercises)/matching'), 1200);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setSelectedSlots({ 0: null, 1: null, 2: null });
    setAvailableOptions(INITIAL_OPTIONS);
  };

  const slot0 = selectedSlots[0] || '              ';
  const slot1 = selectedSlots[1] || '          ';
  const slot2 = selectedSlots[2] || '    ';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>EXERCÍCIO · SINTAXE & TIPOS</Text>
          <Text style={styles.headerSubtitle}>Complete o código Spark</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              Complete o código para carregar um arquivo CSV do HDFS. O arquivo
              está em <Text style={styles.highlightText}>'/user/data/sales.csv'</Text>, tem cabeçalho
              e usa delimitador ';'. O esquema deve ser inferido.
            </Text>
          </View>

          <View style={styles.codeCard}>
            <View style={styles.codeBlock}>
              <CodeLine text='spark = SparkSession.builder.appName("CSV Reader").getOrCreate()' lineNum={1} />
              <CodeLine text='' lineNum={2} />
              <CodeLine text='opts = {' lineNum={3} />
              <CodeLine text="    'header': 'true'," lineNum={4} />
              <CodeLine text="    'delimiter': ';'" lineNum={5} />
              <CodeLine text='}' lineNum={6} />
              <CodeLine text='' lineNum={7} />
              <CodeLine text='# Código Spark a completar:' lineNum={8} />
              <CodeLine text='' lineNum={9} />
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>10</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.variable }}>df</Text>
                  <Text style={{ color: SYN.text }}> = (</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>11</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    spark</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>12</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    .read</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>13</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    .format(</Text>
                  <Text style={{ color: SYN.string }}>"csv"</Text>
                  <Text style={{ color: SYN.text }}>)</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>14</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    .options(**opts)</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>15</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    .option(</Text>
                  <Text style={{ color: SYN.string }}>"path"</Text>
                  <Text style={{ color: SYN.text }}>, </Text>
                  <TouchableOpacity style={styles.inlineBlank} onPress={() => handleRemoveSlot(0)}>
                    <Text style={styles.blankText}>{slot0}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: SYN.text }}>)</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>16</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    .option(</Text>
                  <TouchableOpacity style={styles.inlineBlank} onPress={() => handleRemoveSlot(1)}>
                    <Text style={styles.blankText}>{slot1}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: SYN.text }}>, </Text>
                  <Text style={{ color: SYN.string }}>"true"</Text>
                  <Text style={{ color: SYN.text }}>)</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>17</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>    .</Text>
                  <TouchableOpacity style={styles.inlineBlank} onPress={() => handleRemoveSlot(2)}>
                    <Text style={styles.blankText}>{slot2}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: SYN.text }}>()</Text>
                </Text>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.lineNumber}>18</Text>
                <Text style={styles.codeLineText}>
                  <Text style={{ color: SYN.text }}>)</Text>
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.optionsSection}>
            <Text style={styles.optionsLabel}>OPÇÕES</Text>
            <View style={styles.optionsContainer}>
              {availableOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionChip}
                  onPress={() => handleSelectOption(option)}>
                  <Text style={styles.optionChipText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {status === 'wrong' && (
            <View style={styles.feedbackArea}>
              <Text style={styles.wrongText}>Resposta incorreta</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>TENTAR NOVAMENTE</Text>
              </TouchableOpacity>
            </View>
          )}
          {status === 'correct' && (
            <Text style={styles.correctText}>Correto! Avançando...</Text>
          )}
          {status === 'idle' && (
            <TouchableOpacity
              style={[styles.verifyButton, Object.values(selectedSlots).some(v => v === null) && styles.verifyButtonDisabled]}
              disabled={Object.values(selectedSlots).some(v => v === null)}
              onPress={handleVerify}>
              <Text style={styles.verifyButtonText}>VERIFICAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  headerTitle: {
    color: ACCENT_ORANGE,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  instructionCard: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  instructionText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 22,
  },
  highlightText: {
    color: ACCENT_ORANGE,
    fontWeight: '700',
  },
  codeCard: {
    backgroundColor: CODE_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  codeBlock: {
    padding: 12,
    gap: 2,
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lineNumber: {
    color: '#4B5563',
    fontFamily: 'monospace',
    fontSize: 11,
    width: 28,
    textAlign: 'right',
    marginRight: 12,
    paddingTop: 2,
  },
  codeLineText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
    flex: 1,
  },
  inlineBlank: {
    borderWidth: 1.5,
    borderColor: ACCENT_GREEN,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 0,
    backgroundColor: '#161B22',
    marginHorizontal: 2,
  },
  blankText: {
    color: ACCENT_GREEN,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  optionsSection: {
    gap: 8,
  },
  optionsLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: ACCENT_ORANGE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipText: {
    color: ACCENT_ORANGE,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: ACCENT_ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#4B5563',
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  feedbackArea: {
    alignItems: 'center',
    gap: 8,
  },
  wrongText: {
    color: ACCENT_RED,
    fontSize: 14,
    fontWeight: '700',
  },
  correctText: {
    color: ACCENT_GREEN,
    fontSize: 14,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: ACCENT_RED,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
