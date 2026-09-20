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
const PYSPARK_METHODS = new Set(['show','read','csv','json','parquet','option','options','format','load','save','write','display','groupBy','filter','where','printSchema','select','dropna','withColumn','drop','distinct','count','sort','orderBy','limit','head','first','take','collect','toPandas','rdd','dtypes','columns','join','agg','createDataFrame','toDF','createOrReplaceTempView','describe','summary']);

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

function CodeText({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <Text>
      {tokens.map((t, i) => (
        <Text key={i} style={{ color: SYN[t.type] }}>{t.text}</Text>
      ))}
    </Text>
  );
}

// Dados do Exercício de Associação
const LEFT_ACTIONS = [
  { id: 'a', text: 'Leitura de dados' },
  { id: 'b', text: 'Filtrar linhas' },
  { id: 'c', text: 'Agrupar dados' },
  { id: 'd', text: 'Exibir esquema' },
];

const RIGHT_COMMANDS = [
  { id: 'c', code: '.groupBy()' },
  { id: 'a', code: '.read' },
  { id: 'd', code: '.printSchema()' },
  { id: 'b', code: '.filter()' },
];

export default function MatchingExerciseScreen() {
  const router = useRouter();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // { actionId: commandId }
  const [wrongMatch, setWrongMatch] = useState<{ left: string; right: string } | null>(null);

  const handleSelectLeft = (id: string) => {
    if (wrongMatch) setWrongMatch(null);
    setSelectedLeft(id);
  };

  const handleSelectRight = (rightId: string) => {
    if (!selectedLeft) return;

    if (wrongMatch) setWrongMatch(null);

    // Se o par estiver correto
    if (selectedLeft === rightId) {
      setMatches((prev) => ({ ...prev, [selectedLeft]: rightId }));
      setSelectedLeft(null);
    } else {
      // Se estiver incorreto, marca temporariamente como erro
      setWrongMatch({ left: selectedLeft, right: rightId });
    }
  };

  const isCompleted = Object.keys(matches).length === LEFT_ACTIONS.length;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Barra de Progresso Superior */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>EXERCÍCIO DE ASSOCIAÇÃO</Text>
          <Text style={styles.headerSubtitle}>
            Conecte a ação de engenharia com o comando Spark correto
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.matchingGrid}>
            {/* Coluna Esquerda: Ações */}
            <View style={styles.column}>
              <Text style={styles.columnTitle}>AÇÃO</Text>
              {LEFT_ACTIONS.map((item) => {
                const isMatched = !!matches[item.id];
                const isSelected = selectedLeft === item.id;
                const isWrong = wrongMatch?.left === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    disabled={isMatched}
                    style={[
                      styles.card,
                      isSelected && styles.cardSelected,
                      isMatched && styles.cardCorrect,
                      isWrong && styles.cardWrong,
                    ]}
                    onPress={() => handleSelectLeft(item.id)}>
                    <Text
                      style={[
                        styles.actionText,
                        (isMatched || isSelected) && styles.textWhite,
                        isWrong && styles.textWhite,
                      ]}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Coluna Direita: Comandos Spark */}
            <View style={styles.column}>
              <Text style={styles.columnTitle}>COMANDO SPARK</Text>
              {RIGHT_COMMANDS.map((item) => {
                const isMatched = Object.values(matches).includes(item.id);
                const isWrong = wrongMatch?.right === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    disabled={isMatched}
                    style={[
                      styles.card,
                      isMatched && styles.cardCorrect,
                      isWrong && styles.cardWrong,
                    ]}
                    onPress={() => handleSelectRight(item.id)}>
                    <Text
                      style={[
                        styles.codeText,
                        isMatched && styles.textWhite,
                        isWrong && styles.textWhite,
                      ]}>
                      <CodeText code={item.code} />
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Rodapé / Botão de Ação */}
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={!isCompleted}
            style={[styles.verifyButton, isCompleted && styles.verifyButtonActive]}
            onPress={() => isCompleted && router.push('/(exercises)/builder')}>
            <Text style={styles.verifyButtonText}>
              {isCompleted ? 'CONTINUAR' : 'COMBINE OS PARES'}
            </Text>
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
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  matchingGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  columnTitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 14,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    // Efeito de elevação estilo Duolingo
    borderBottomWidth: 5,
  },
  cardSelected: {
    borderColor: ORANGE,
    backgroundColor: '#382818',
  },
  cardCorrect: {
    borderColor: GREEN,
    backgroundColor: '#064E3B',
    borderBottomColor: '#047857',
  },
  cardWrong: {
    borderColor: RED,
    backgroundColor: '#7F1D1D',
    borderBottomColor: '#991B1B',
  },
  actionText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  codeText: {
    color: ORANGE,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  textWhite: {
    color: '#FFFFFF',
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
  verifyButton: {
    backgroundColor: CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  verifyButtonActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  verifyButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});