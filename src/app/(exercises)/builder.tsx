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

// Paleta de Cores SparkLab
const BACKGROUND = '#1E232A';
const CARD_BG = '#2A303C';
const CODE_BG = '#13161C';
const ORANGE = '#FF9600';
const GREEN = '#10B981';
const RED = '#EF4444';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';
const CODE_COLOR = '#F59E0B';

// Blocos de código para a solução (em ordem correta esperada)
const SOLUTION = [
  'df = spark',
  '.read.csv("data.csv")',
  '.show()',
];

// Banco de blocos de código disponível (incluindo distratores/errados)
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

  // Adiciona bloco ao editor
  const handleSelectBlock = (block: { id: string; code: string }) => {
    if (status !== 'idle') setStatus('idle');
    setEditorBlocks((prev) => [...prev, block]);
    setAvailableBlocks((prev) => prev.filter((b) => b.id !== block.id));
  };

  // Remove bloco do editor e devolve ao banco
  const handleRemoveBlock = (block: { id: string; code: string }) => {
    if (status !== 'idle') setStatus('idle');
    setEditorBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setAvailableBlocks((prev) => [...prev, block]);
  };

  // Validação da resposta
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

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MONTE O CÓDIGO</Text>
          <Text style={styles.headerSubtitle}>
            Crie o código para ler um arquivo CSV ("data.csv") e exibir os dados na tela.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Editor de Código (Área de montagem) */}
          <View
            style={[
              styles.editorArea,
              status === 'correct' && styles.editorCorrect,
              status === 'wrong' && styles.editorWrong,
            ]}>
            <Text style={styles.editorLabel}># Resposta do aluno</Text>

            {editorBlocks.length === 0 ? (
              <Text style={styles.placeholderText}>
                Toque nos blocos abaixo para construir o código...
              </Text>
            ) : (
              <View style={styles.codeStack}>
                {editorBlocks.map((block) => (
                  <TouchableOpacity
                    key={block.id}
                    style={styles.codeLineCard}
                    onPress={() => handleRemoveBlock(block)}>
                    <Text style={styles.codeLineText}>{block.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Banco de Blocos de Código (Disponíveis) */}
          <Text style={styles.sectionTitle}>OPÇÕES DISPONÍVEIS</Text>
          <View style={styles.blocksPool}>
            {availableBlocks.map((block) => (
              <TouchableOpacity
                key={block.id}
                style={styles.blockChip}
                onPress={() => handleSelectBlock(block)}>
                <Text style={styles.blockChipText}>{block.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Feedback visual de erro ou acerto + Botão */}
        <View
          style={[
            styles.footer,
            status === 'correct' && styles.footerCorrect,
            status === 'wrong' && styles.footerWrong,
          ]}>
          {status !== 'idle' && (
            <Text style={styles.feedbackText}>
              {status === 'correct' ? '🎉 Excelente! Código Spark correto.' : '❌ Ops! A ordem ou os comandos estão incorretos.'}
            </Text>
          )}

          <TouchableOpacity
            disabled={editorBlocks.length === 0}
            style={[
              styles.verifyButton,
              editorBlocks.length > 0 && styles.verifyButtonActive,
              status === 'correct' && styles.btnSuccess,
              status === 'wrong' && styles.btnError,
            ]}
            onPress={handleVerify}>
            <Text style={styles.verifyButtonText}>
              {status === 'idle' ? 'VERIFICAR' : 'TENTAR NOVAMENTE'}
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
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 22,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 60,
  },
  editorArea: {
    backgroundColor: CODE_BG,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 16,
    minHeight: 180,
  },
  editorCorrect: {
    borderColor: GREEN,
  },
  editorWrong: {
    borderColor: RED,
  },
  editorLabel: {
    color: TEXT_SECONDARY,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#4B5563',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 30,
  },
  codeStack: {
    gap: 8,
  },
  codeLineCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#B36500',
  },
  codeLineText: {
    color: CODE_COLOR,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
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
    color: TEXT_PRIMARY,
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
    gap: 8,
    alignItems: 'center',
  },
  footerCorrect: {
    backgroundColor: '#064E3B',
  },
  footerWrong: {
    backgroundColor: '#7F1D1D',
  },
  feedbackText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonActive: {
    backgroundColor: ORANGE,
  },
  btnSuccess: {
    backgroundColor: GREEN,
  },
  btnError: {
    backgroundColor: RED,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});