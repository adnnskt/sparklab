import { useEffect, useState } from 'react';
import {
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
const GREEN = '#10B981';
const RED = '#EF4444';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';

// Pergunta e opções do Flashcard
const QUESTION = {
  title: 'Qual método é usado para remover valores nulos de um DataFrame em PySpark?',
  correctAnswer: '.dropna()',
  options: ['.dropna()', '.removeNulls()', '.clear()', '.isna()'],
};

export default function FlashcardScreen() {
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Lógica do Cronômetro de 10 segundos
  useEffect(() => {
    if (timeLeft === 0 || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  // Processa a resposta do usuário
  const handleSelectOption = (option: string) => {
    if (isAnswered || timeLeft === 0) return;
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const isTimeOut = timeLeft === 0 && !isAnswered;
  const isCorrect = selectedOption === QUESTION.correctAnswer;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Barra de Tempo Animada/Contador */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SPEED RUN · FLASHCARD</Text>
          <View style={styles.timerBadge}>
            <Text
              style={[
                styles.timerText,
                timeLeft <= 3 && styles.timerTextWarning,
              ]}>
              ⏱️ {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Barra de Progresso Visual do Tempo */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(timeLeft / 15) * 100}%` },
              timeLeft <= 3 && styles.progressBarWarning,
            ]}
          />
        </View>

        <View style={styles.container}>
          {/* Cartão de Pergunta */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{QUESTION.title}</Text>
          </View>

          {/* Lista de Opções de Resposta */}
          <View style={styles.optionsContainer}>
            {QUESTION.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isRightAnswer = option === QUESTION.correctAnswer;

              const cardStyle = [
                styles.optionCard,
                isAnswered || isTimeOut
                  ? isRightAnswer
                    ? styles.optionCorrect
                    : isSelected && !isCorrect
                      ? styles.optionWrong
                      : null
                  : null,
              ];

              const textStyle = [
                styles.codeOptionText,
                (isAnswered || isTimeOut) &&
                  (isRightAnswer || (isSelected && !isCorrect))
                    ? styles.textWhite
                    : null,
              ];

              return (
                <TouchableOpacity
                  key={index}
                  disabled={isAnswered || isTimeOut}
                  style={cardStyle}
                  onPress={() => handleSelectOption(option)}>
                  <Text style={textStyle}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Rodapé de Feedback de Tempo ou Resposta */}
        <View
          style={[
            styles.footer,
            isAnswered && isCorrect && styles.footerCorrect,
            (isAnswered && !isCorrect) || isTimeOut ? styles.footerWrong : null,
          ]}>
          {isTimeOut && (
            <Text style={styles.feedbackText}>⏳ O tempo acabou!</Text>
          )}

          {isAnswered && (
            <Text style={styles.feedbackText}>
              {isCorrect ? '⚡ Resposta Rápida e Correta!' : '❌ Ops, opção incorreta!'}
            </Text>
          )}

          <TouchableOpacity
            disabled={!isAnswered && !isTimeOut}
            style={[
              styles.nextButton,
              (isAnswered || isTimeOut) && styles.nextButtonActive,
            ]}>
            <Text style={styles.nextButtonText}>PRÓXIMO FLASHCARD</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timerBadge: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  timerText: {
    color: TEXT_PRIMARY,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
  },
  timerTextWarning: {
    color: RED,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: CARD_BG,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ORANGE,
  },
  progressBarWarning: {
    backgroundColor: RED,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 20,
  },
  questionCard: {
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: '#1A1D24',
  },
  questionText: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#1A1D24',
  },
  optionCorrect: {
    backgroundColor: '#064E3B',
    borderColor: GREEN,
    borderBottomWidth: 4,
    borderBottomColor: '#047857',
  },
  optionWrong: {
    backgroundColor: '#7F1D1D',
    borderColor: RED,
    borderBottomWidth: 4,
    borderBottomColor: '#991B1B',
  },
  optionText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  codeOptionText: {
    color: ORANGE,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 15,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.5,
  },
  nextButtonActive: {
    backgroundColor: ORANGE,
    opacity: 1,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});