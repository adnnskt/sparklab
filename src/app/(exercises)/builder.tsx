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
const ORANGE = '#FF9600';
const GREEN = '#10B981';
const RED = '#EF4444';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';

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
} as const;

const KEYWORDS = new Set(['def','class','if','else','return','import','from','as','in','for','while','with','True','False','None']);
const BUILTINS = new Set(['print','len','range','type','str','int','float','list','dict']);
const PYSPARK_METHODS = new Set(['show','read','csv','json','parquet','option','options','format','load','save','write','display']);

type TokenType = keyof typeof SYN;
type Token = { text: string; type: TokenType };

function tokenize(code: string): Token[] {
  const TOKEN_RE = /(#.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+(?:\.\d+)?|[a-zA-Z_]\w*|[^\s\w"#]+|\s+)/g;
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
    } else if (/^[=\+\-\*\/<>!&|^~%]$/.test(raw)) {
      tokens.push({ text: raw, type: 'operator' });
    } else {
      tokens.push({ text: raw, type: 'text' });
    }
  }
  return tokens;
}

const SOLUTION = [
  'df = spark',
  '.read.csv("data.csv")',
  '.show()',
];

const INITIAL_BLOCKS = [
  { id: '1', code: '.read.csv("data.csv")' },
  { id: '2', code: 'df.display()' },
  { id: '3', code: 'df = spark' },
  { id: '4', code: '.write.parquet()' },
  { id: '5', code: '.show()' },
];

export default function CodeBuilderScreen() {
  const router = useRouter();
  const [editorBlocks, setEditorBlocks] = useState<{ id: string; code: string }[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState(INITIAL_BLOCKS);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleSelectBlock = (block: { id: string; code: string }) => {
    if (status !== 'idle') setStatus('idle');
    setEditorBlocks((prev) => [...prev, block]);
    setAvailableBlocks((prev) => prev.filter((b) => b.id !== block.id));
  };

  const handleRemoveBlock = (block: { id: string; code: string }) => {
    if (status !== 'idle') setStatus('idle');
    setEditorBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setAvailableBlocks((prev) => [...prev, block]);
  };

  const handleVerify = () => {
    const userSolution = editorBlocks.map((b) => b.code);
    const isCorrect =
      userSolution.length === SOLUTION.length &&
      userSolution.every((val, index) => val === SOLUTION[index]);
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setTimeout(() => router.push('/(exercises)/flashcard'), 1500);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setEditorBlocks([]);
    setAvailableBlocks(INITIAL_BLOCKS);
  };

  const allPrefix = ['df = spark', '.read', '.write', '.show', '.display', '.option', '.format', '.csv', '.json', '.parquet'];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MONTE O CÓDIGO</Text>
          <Text style={styles.headerSubtitle}>
            Monte o código para ler um CSV e exibir os dados.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={[
            styles.editorArea,
            status === 'correct' && styles.editorCorrect,
            status === 'wrong' && styles.editorWrong,
          ]}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorFilename}>main.py</Text>
            </View>

            {editorBlocks.length === 0 ? (
              <View style={styles.editorEmpty}>
                <Text style={styles.placeholderText}>
                  Toque nos blocos abaixo para construir o código...
                </Text>
              </View>
            ) : (
              <View style={styles.codeBlock}>
                {editorBlocks.map((block, idx) => {
                  const tokens = tokenize(block.code);
                  return (
                    <TouchableOpacity
                      key={block.id}
                      style={styles.codeLine}
                      onPress={() => handleRemoveBlock(block)}>
                      <Text style={styles.lineNumber}>{idx + 1}</Text>
                      <Text style={styles.codeLineText}>
                        {tokens.map((t, i) => (
                          <Text key={i} style={{ color: SYN[t.type] }}>{t.text}</Text>
                        ))}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>OPÇÕES DISPONÍVEIS</Text>
          <View style={styles.blocksPool}>
            {availableBlocks.map((block) => {
              const tokens = tokenize(block.code);
              return (
                <TouchableOpacity
                  key={block.id}
                  style={styles.blockChip}
                  onPress={() => handleSelectBlock(block)}>
                  <Text style={styles.blockChipText}>
                    {tokens.map((t, i) => (
                      <Text key={i} style={{ color: SYN[t.type] }}>{t.text}</Text>
                    ))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {status === 'wrong' && (
            <View style={styles.feedbackArea}>
              <Text style={styles.wrongText}>Ordem ou comandos incorretos</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>TENTAR NOVAMENTE</Text>
              </TouchableOpacity>
            </View>
          )}
          {status === 'correct' && (
            <Text style={styles.correctText}>Código correto! Avançando...</Text>
          )}
          {status === 'idle' && (
            <TouchableOpacity
              disabled={editorBlocks.length === 0}
              style={[styles.verifyButton, editorBlocks.length > 0 && styles.verifyButtonActive]}
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
    color: ORANGE,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 22,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  editorArea: {
    backgroundColor: CODE_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 180,
  },
  editorCorrect: {
    borderColor: GREEN,
  },
  editorWrong: {
    borderColor: RED,
  },
  editorHeader: {
    backgroundColor: '#161B22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  editorFilename: {
    color: TEXT_SECONDARY,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
  },
  editorEmpty: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  placeholderText: {
    color: '#4B5563',
    fontSize: 13,
    fontStyle: 'italic',
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
  sectionTitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  blocksPool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  blockChip: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 4,
    borderBottomColor: '#1A1D24',
  },
  blockChipText: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
  },
  feedbackArea: {
    alignItems: 'center',
    gap: 8,
  },
  wrongText: {
    color: RED,
    fontSize: 14,
    fontWeight: '700',
  },
  correctText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: RED,
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
  verifyButton: {
    backgroundColor: '#4B5563',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonActive: {
    backgroundColor: ORANGE,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
