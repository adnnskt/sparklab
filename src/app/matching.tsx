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
const ORANGE = '#FF9600';
const ORANGE_DARK = '#E07F00';
const GREEN = '#10B981';
const RED = '#EF4444';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';

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
                      {item.code}
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
            style={[styles.verifyButton, isCompleted && styles.verifyButtonActive]}>
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: BACKGROUND,
  },
  verifyButton: {
    backgroundColor: CARD_BG,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  verifyButtonActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
    borderBottomWidth: 4,
    borderBottomColor: '#059669',
  },
  verifyButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});