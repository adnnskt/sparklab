import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

// Exemplos de código interativos por categoria
const EXAMPLES = [
  {
    id: 'list',
    label: 'Via Lista / Tuplas',
    description: 'Criação manual a partir de dados locais em memória:',
    code: `data = [("Ana", 28), ("Bruno", 34)]\ncolumns = ["Nome", "Idade"]\n\ndf = spark.createDataFrame(data, columns)\ndf.show()`,
    outputType: 'table' as const,
    columns: ['Nome', 'Idade'],
    rows: [
      ['Ana', '28'],
      ['Bruno', '34'],
    ],
  },
  {
    id: 'csv',
    label: 'Via Arquivo CSV',
    description: 'Leitura de dados estruturados com cabeçalho:',
    code: `df = spark.read.csv(\n  "path/usuarios.csv",\n  header=True,\n  inferSchema=True\n)\ndf.show()`,
    outputType: 'table' as const,
    columns: ['id', 'nome', 'cargo', 'salario'],
    rows: [
      ['1', 'Ana Souza', 'Engenheiro de Dados', '9200'],
      ['2', 'Bruno Lima', 'Analista de Dados', '5800'],
      ['3', 'Carlos Silva', 'Data Scientist', '11500'],
    ],
  },
  {
    id: 'json',
    label: 'Via Formato JSON',
    description: 'Carregamento de dados semi-estruturados:',
    code: `df = spark.read.json("path/dados.json")\ndf.printSchema()`,
    outputType: 'schema' as const,
    schema: [
      { name: 'root', type: 'struct', indent: 0 },
      { name: 'id', type: 'long', indent: 1 },
      { name: 'nome', type: 'string', indent: 1 },
      { name: 'email', type: 'string', indent: 1 },
      { name: 'endereco', type: 'struct', indent: 1 },
      { name: 'rua', type: 'string', indent: 2 },
      { name: 'cidade', type: 'string', indent: 2 },
      { name: 'estado', type: 'string', indent: 2 },
    ],
  },
];

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

export default function TheoryConceptScreen() {
  const [activeTab, setActiveTab] = useState(EXAMPLES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setShowOutput(false);
    setTimeout(() => {
      setIsRunning(false);
      setShowOutput(true);
    }, 1200);
  };

  const handleReset = () => {
    setShowOutput(false);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CONCEITO · INTRODUÇÃO</Text>
          <Text style={styles.headerSubtitle}>O que é um DataFrame no Spark?</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Card Teórico / Explicação Simples */}
          <View style={styles.conceptCard}>
            <Text style={styles.conceptTitle}>💡 Em palavras simples</Text>
            <Text style={styles.conceptText}>
              Um <Text style={styles.highlightText}>DataFrame</Text> é uma coleção distribuída de dados organizados em colunas nomeadas, equivalente a uma tabela de banco de dados relacional ou uma planilha do Excel, mas otimizada para processar petabytes de dados em paralelo.
            </Text>
          </View>

          {/* Seção Interativa */}
          <View style={styles.interactiveSection}>
            <Text style={styles.sectionTitle}>EXEMPLOS PRÁTICOS DE CRIAÇÃO</Text>
            <Text style={styles.sectionSubtitle}>
              Selecione uma opção abaixo para ver o código correspondente:
            </Text>

            {/* Abas Selecionáveis */}
            <View style={styles.tabsContainer}>
              {EXAMPLES.map((item) => {
                const isActive = activeTab.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    onPress={() => { setActiveTab(item); setShowOutput(false); setIsRunning(false); }}>
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
                    <Text style={styles.outputLabel}>📄 Output [{activeTab.id === 'list' ? '2' : activeTab.id === 'csv' ? '3' : '1'} rows]</Text>
                    <TouchableOpacity onPress={handleReset}>
                      <Text style={styles.outputReset}>Limpar</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.outputBlock}>
                    {activeTab.outputType === 'table' && activeTab.columns && activeTab.rows && (
                      <DataFrameTable columns={activeTab.columns} rows={activeTab.rows} />
                    )}
                    {activeTab.outputType === 'schema' && activeTab.schema && (
                      <SchemaTree schema={activeTab.schema} />
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Rodapé de Conclusão */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton}>
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
});