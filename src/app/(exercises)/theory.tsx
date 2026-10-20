import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

// Paleta de Cores SparkLab
const BACKGROUND = '#1E232A';
const CARD_BG = '#2A303C';
const CODE_BG = '#13161C';
const ORANGE = '#FF9600';
const GREEN = '#10B981';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';

// Cores de Syntax Highlighting (VS Code Dark+)
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
  'finally','raise','pass','break','continue','and','or','not','is',
]);

const BUILTINS = new Set(['print','len','range','type','str','int','float','list','dict','set','tuple']);

const PYSPARK_METHODS = new Set([
  'show','read','csv','json','parquet','orc','text','option','options',
  'format','load','save','createDataFrame','toDF','createOrReplaceTempView',
  'printSchema','describe','summary','select','filter','where','groupBy',
  'agg','join','withColumn','drop','distinct','count','sort','orderBy',
  'limit','head','first','take','collect','toPandas','rdd','dtypes','columns',
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
      if (KEYWORDS.has(raw)) {
        tokens.push({ text: raw, type: 'keyword' });
      } else if (BUILTINS.has(raw)) {
        tokens.push({ text: raw, type: 'builtin' });
      } else {
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

function CodeHighlight({ code, style }: { code: string; style?: object }) {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const tokens = tokenize(line);
        return (
          <View key={lineIdx} style={styles.codeLine}>
            <Text style={styles.lineNumber}>{lineIdx + 1}</Text>
            <Text style={[styles.codeLineText, style]}>
              {tokens.map((token, tIdx) => (
                <Text key={tIdx} style={{ color: SYN[token.type] }}>
                  {token.text}
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
    </>
  );
}

type LessonExample = {
  id: string;
  label: string;
  description: string;
  code: string;
  outputType?: 'table' | 'schema';
  columns?: string[];
  rows?: string[][];
  schema?: { name: string; type: string; indent: number }[];
};

type Lesson = {
  id: string;
  type?: string;
  title: string;
  subtitle: string;
  conceptTitle?: string;
  conceptText?: string;
  examples: LessonExample[];
};

const LESSON_COLLECTION = 'lessons';
const DEFAULT_LESSON_ID = 'lesson_theory_01';


function DataFrameTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {columns.map((col, i) => (
          <Text key={i} style={styles.tableHeaderText}>
            {col}
          </Text>
        ))}
      </View>
      {/* Rows */}
      {rows.map((row, rIdx) => (
        <View key={rIdx} style={[styles.tableRow, rIdx % 2 === 0 && styles.tableRowEven]}>
          {row.map((cell, cIdx) => (
            <Text key={cIdx} style={styles.tableCell}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function SchemaTree({ schema }: { schema: { name: string; type: string; indent: number }[] }) {
  return (
    <View style={styles.schemaContainer}>
      {schema.map((field, i) => (
        <View key={i} style={[styles.schemaRow, { paddingLeft: 8 + field.indent * 16 }]}>
          <Text style={styles.schemaTree}>
            {field.indent > 0 ? (i === schema.length - 1 ? '└─ ' : '├─ ') : ''}
          </Text>
          <Text style={styles.schemaName}>{field.name}</Text>
          <Text style={styles.schemaType}> : {field.type}</Text>
        </View>
      ))}
    </View>
  );
}

type LessonState =
  | { status: 'ready'; lesson: Lesson }
  | { status: 'error'; message: string };

export default function TheoryConceptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const lessonId = typeof params.id === 'string' && params.id ? params.id : DEFAULT_LESSON_ID;

  const [result, setResult] = useState<{ key: string; state: LessonState } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [outputKey, setOutputKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const requestKey = `${lessonId}:${reloadKey}`;

    getDoc(doc(db, LESSON_COLLECTION, lessonId))
      .then((snapshot) => {
        if (!active) return;

        if (!snapshot.exists()) {
          setResult({
            key: requestKey,
            state: {
              status: 'error',
              message: `Aula "${lessonId}" não encontrada na coleção "${LESSON_COLLECTION}".`,
            },
          });
          return;
        }

        const data = snapshot.data() ?? {};
        setResult({
          key: requestKey,
          state: {
            status: 'ready',
            lesson: {
              id: snapshot.id,
              type: data.type,
              title: data.title ?? '',
              subtitle: data.subtitle ?? '',
              conceptTitle: data.conceptTitle,
              conceptText: data.conceptText,
              examples: Array.isArray(data.examples) ? data.examples : [],
            },
          },
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setResult({
          key: requestKey,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Falha ao carregar a aula.',
          },
        });
      });

    return () => {
      active = false;
    };
  }, [lessonId, reloadKey]);

  const requestKey = `${lessonId}:${reloadKey}`;
  const lessonState: LessonState | null = result?.key === requestKey ? result.state : null;

  const lesson = lessonState?.status === 'ready' ? lessonState.lesson : null;
  const examples = lesson?.examples ?? [];
  const activeTab =
    examples.find((item) => item.id === activeExampleId) ?? examples[0] ?? null;

  const outputTargetKey = activeTab ? `${lessonId}:${activeTab.id}` : null;
  const showOutput = outputTargetKey !== null && outputKey === outputTargetKey;

  const handleRun = () => {
    if (!outputTargetKey) return;
    const key = outputTargetKey;
    setIsRunning(true);
    setOutputKey(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutputKey(key);
    }, 1200);
  };

  const handleReset = () => {
    setOutputKey(null);
  };

  const hasOutput =
    !!activeTab &&
    ((activeTab.outputType === 'table' && !!activeTab.columns?.length && !!activeTab.rows?.length) ||
      (activeTab.outputType === 'schema' && !!activeTab.schema?.length));

  const outputRows = activeTab?.rows?.length ?? 0;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{lesson?.subtitle ?? ''}</Text>
          <Text style={styles.headerSubtitle}>{lesson?.title ?? ''}</Text>
        </View>

        {lessonState === null && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateEmoji}>⏳</Text>
            <Text style={styles.stateTitle}>Carregando aula...</Text>
            <Text style={styles.stateText}>{`Buscando "${lessonId}" no Firebase.`}</Text>
          </View>
        )}

        {lessonState?.status === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.stateTitle}>Não foi possível carregar</Text>
            <Text style={styles.stateText}>{lessonState.message}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setReloadKey((key) => key + 1)}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {lesson && (
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* Card Teórico / Explicação Simples */}
            {(lesson.conceptTitle || lesson.conceptText) && (
              <View style={styles.conceptCard}>
                {!!lesson.conceptTitle && (
                  <Text style={styles.conceptTitle}>{lesson.conceptTitle}</Text>
                )}
                {!!lesson.conceptText && <Text style={styles.conceptText}>{lesson.conceptText}</Text>}
              </View>
            )}

            {/* Seção Interativa */}
            {examples.length > 0 && activeTab && (
              <View style={styles.interactiveSection}>
                <Text style={styles.sectionTitle}>EXEMPLOS PRÁTICOS DE CRIAÇÃO</Text>
                <Text style={styles.sectionSubtitle}>
                  Selecione uma opção abaixo para ver o código correspondente:
                </Text>

                {/* Abas Selecionáveis */}
                <View style={styles.tabsContainer}>
                  {examples.map((item) => {
                    const isActive = activeTab.id === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.tabButton, isActive && styles.tabButtonActive]}
                        onPress={() => {
                          setActiveExampleId(item.id);
                          setOutputKey(null);
                          setIsRunning(false);
                        }}>
                        <Text style={[styles.tabButtonText, isActive && styles.tabTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Exibição do Código Selecionado */}
                <View style={styles.codeCard}>
                  <Text style={styles.codeDescription}>{activeTab.description}</Text>
                  <View style={styles.codeBlock}>
                    <CodeHighlight code={activeTab.code} />
                  </View>

                  {/* Botão Executar */}
                  {!showOutput && (
                    <TouchableOpacity
                      style={[styles.runButton, isRunning && styles.runButtonLoading]}
                      disabled={isRunning}
                      onPress={handleRun}>
                      <Text style={styles.runButtonText}>
                        {isRunning ? '⏳ Executando...' : '▶  Executar Código'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Saída do Jupyter Notebook */}
                  {showOutput && (
                    <View style={styles.outputContainer}>
                      <View style={styles.outputHeader}>
                        <Text style={styles.outputLabel}>
                          📄 Output{outputRows > 0 ? ` [${outputRows} rows]` : ''}
                        </Text>
                        <TouchableOpacity onPress={handleReset}>
                          <Text style={styles.outputReset}>Limpar</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.outputBlock}>
                        {!hasOutput && (
                          <Text style={styles.outputEmpty}>
                            Código executado sem saída estruturada para exibir.
                          </Text>
                        )}
                        {activeTab.outputType === 'table' &&
                          !!activeTab.columns?.length &&
                          !!activeTab.rows?.length && (
                            <DataFrameTable columns={activeTab.columns} rows={activeTab.rows} />
                          )}
                        {activeTab.outputType === 'schema' && !!activeTab.schema?.length && (
                          <SchemaTree schema={activeTab.schema} />
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Rodapé de Conclusão */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/(exercises)/quest_1')}>
            <Text style={styles.continueButtonText}>ENTENDI, IR PARA EXERCÍCIOS</Text>
          </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  container: {
    padding: 16,
    gap: 20,
    paddingBottom: 60,
  },
  conceptCard: {
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 14,
    padding: 18,
    gap: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#1A1D24',
  },
  conceptTitle: {
    color: ORANGE,
    fontSize: 15,
    fontWeight: '800',
  },
  conceptText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 22,
  },
  highlightText: {
    color: ORANGE,
    fontWeight: '700',
  },
  interactiveSection: {
    gap: 12,
  },
  sectionTitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    color: TEXT_PRIMARY,
    fontSize: 13,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tabButton: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#1A1D24',
  },
  tabButtonActive: {
    backgroundColor: '#382818',
    borderColor: ORANGE,
    borderBottomColor: '#B36500',
  },
  tabButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabTextActive: {
    color: ORANGE,
    fontWeight: '800',
  },
  codeCard: {
    backgroundColor: CODE_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    gap: 10,
  },
  codeDescription: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontStyle: 'italic',
  },
  codeBlock: {
    backgroundColor: '#0D1117',
    padding: 12,
    borderRadius: 8,
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
    width: 24,
    textAlign: 'right',
    marginRight: 12,
    paddingTop: 1,
  },
  codeLineText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  // Botão Executar
  runButton: {
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
  },
  runButtonLoading: {
    backgroundColor: '#6B7280',
    borderBottomColor: '#4B5563',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Saída Jupyter
  outputContainer: {
    marginTop: 10,
    gap: 8,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outputLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outputReset: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '700',
  },
  outputBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Tabela DataFrame
  table: {
    gap: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: '#1F2937',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    color: '#374151',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  // Schema Tree
  schemaContainer: {
    gap: 2,
  },
  schemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemaTree: {
    color: '#9CA3AF',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  schemaName: {
    color: '#1F2937',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  schemaType: {
    color: '#6B7280',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // Estados de carregamento / erro
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
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
    borderBottomColor: '#B36500',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  outputEmpty: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});