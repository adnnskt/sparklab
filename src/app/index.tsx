import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';

const BACKGROUND = '#1A1D22';
const PANEL = '#23272F';
const PANEL_DARK = '#101216';
const PAPER = '#FFF9F0';
const PAPER_LINE = '#FFE1BC';
const ORANGE = '#FF9600';
const ORANGE_DARK = '#E07F00';
const ORANGE_LIGHT = '#FFC266';
const INK = '#3A3A3A';
const WHITE = '#FFFFFF';

const CODE_LINES = [
  { head: 'from pyspark.sql import SparkSession', tail: '' },
  { head: 'spark = SparkSession.builder.appName("sparklab").getOrCreate()', tail: '' },
  { head: 'df = spark.read.csv("data/usuarios.csv", header=True, inferSchema=True)', tail: '' },
  { head: 'df.show()', tail: '  # display' },
  { head: 'df.printSchema()', tail: '  # schema' },
];

const TABLE = {
  columns: ['id', 'nome', 'cargo', 'salario'],
  rows: [
    ['1', 'Ana Souza', 'Engenheiro de Dados', 'R$ 9.200'],
    ['2', 'Bruno Lima', 'Analista de Dados', 'R$ 5.800'],
  ],
};

function NotebookRing() {
  return <View style={styles.ring} />;
}

function TableCell({ value, isHeader }: { value: string; isHeader?: boolean }) {
  return (
    <Text style={[styles.cellText, isHeader && styles.cellHeaderText]} numberOfLines={1}>
      {value}
    </Text>
  );
}

function DataRow({ values, isHeader }: { values: string[]; isHeader?: boolean }) {
  return (
    <View style={[styles.tableRow, isHeader && styles.tableHeaderRow]}>
      {values.map((value, index) => (
        <TableCell key={index} value={value} isHeader={isHeader} />
      ))}
    </View>
  );
}

function Notebook() {
  return (
    <View style={styles.notebook}>
      <View style={styles.notebookHeader}>
        <Text style={styles.notebookTitle} numberOfLines={1}>
          sparklab · leitura de arquivo
        </Text>
        <View style={styles.windowDot} />
      </View>

      <View style={styles.notebookBody}>
        <View style={styles.gutter}>
          <NotebookRing />
          <NotebookRing />
          <NotebookRing />
          <NotebookRing />
          <NotebookRing />
          <NotebookRing />
          <NotebookRing />
        </View>

        <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
          <Text style={styles.filePrompt}>$ head -3 data/usuarios.csv</Text>
          <View style={styles.tableCard}>
            <DataRow values={TABLE.columns} isHeader />
            {TABLE.rows.map((row, index) => (
              <DataRow key={index} values={row} />
            ))}
          </View>
          <Text style={styles.filePrompt}>$ wc -l data/usuarios.csv</Text>
          <View style={styles.resultLine}>
            <Text style={styles.resultNumber}>4</Text>
            <Text style={styles.resultLabel}>linhas carregadas · pronto para o Spark</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.notebookFooter} />
    </View>
  );
}

function CommandsPanel() {
  return (
    <View style={styles.commands}>
      <View style={styles.commandsTitleRow}>
        <View style={styles.commandsBadge}>
          <Text style={styles.commandsBadgeText}>pyspark</Text>
        </View>
        <Text style={styles.commandsTitle}>Comandos necessários</Text>
      </View>

      <View style={styles.codeBlock}>
        {CODE_LINES.map((item, index) => (
          <View key={index} style={styles.codeRow}>
            <Text style={styles.codePrompt}>›</Text>
            <Text style={[styles.codeText, index === 0 && styles.codeTextHead]}>
              {item.head}
              {item.tail ? <Text style={styles.codeComment}>{item.tail}</Text> : null}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.runButton}>
        <Text style={styles.runButtonText}>Executar teste</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>SparkLab</Text>
          <Text style={styles.appSubtitle}>exercícios de spark · engenharia de dados</Text>
        </View>

        <Notebook />

        <CommandsPanel />
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  appTitle: {
    color: WHITE,
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    color: ORANGE_LIGHT,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  notebook: {
    flex: 7,
    backgroundColor: PAPER,
    borderWidth: 4,
    borderColor: ORANGE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  notebookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  notebookTitle: {
    color: WHITE,
    fontFamily: Fonts.mono,
    fontSize: 13,
    fontWeight: 700,
  },
  windowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PAPER,
    borderWidth: 2,
    borderColor: ORANGE_DARK,
  },
  notebookBody: {
    flex: 1,
    flexDirection: 'row',
  },
  gutter: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRightWidth: 1,
    borderRightColor: PAPER_LINE,
  },
  ring: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    backgroundColor: PAPER,
  },
  page: {
    flex: 1,
    padding: Spacing.three,
  },
  filePrompt: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: 700,
    color: ORANGE_DARK,
    marginBottom: Spacing.two,
  },
  tableCard: {
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: PAPER_LINE,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: PAPER_LINE,
  },
  tableHeaderRow: {
    backgroundColor: ORANGE_LIGHT,
  },
  cellText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 600,
    color: INK,
    fontFamily: Fonts.mono,
  },
  cellHeaderText: {
    color: '#7A4A00',
    fontWeight: 800,
  },
  resultLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    backgroundColor: '#FFF3DC',
    borderRadius: 10,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  resultNumber: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    fontWeight: 800,
    color: ORANGE_DARK,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: INK,
  },
  notebookFooter: {
    height: 6,
    backgroundColor: ORANGE,
  },

  commands: {
    flex: 3,
    backgroundColor: PANEL,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  commandsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  commandsBadge: {
    backgroundColor: ORANGE,
    borderRadius: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  commandsBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  commandsTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: 700,
  },
  codeBlock: {
    flex: 1,
    backgroundColor: PANEL_DARK,
    borderRadius: 12,
    padding: Spacing.two,
    justifyContent: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  codePrompt: {
    color: ORANGE,
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: 700,
    marginRight: Spacing.one,
  },
  codeText: {
    flex: 1,
    color: '#E8E6E1',
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 18,
  },
  codeTextHead: {
    color: ORANGE_LIGHT,
    fontWeight: 700,
  },
  codeComment: {
    color: '#7E8AA0',
  },
  runButton: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: ORANGE_DARK,
  },
  runButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
});