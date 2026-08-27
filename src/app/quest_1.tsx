import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Paleta de Cores — Dark Theme + Laranja Spark (escolhas/botão) + Verde (input)
const BACKGROUND = '#1E232A';
const CARD_BG = '#2A303C';
const CODE_BG = '#191D24';
const ACCENT_GREEN = '#10B981';
const ACCENT_GREEN_DARK = '#059669';
const ACCENT_ORANGE = '#FF9600';
const ACCENT_ORANGE_DARK = '#E07F00';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const CODE_YELLOW = '#F59E0B';
const CODE_BLUE = '#60A5FA';
const CODE_COMMENT = '#6B7280';
const BLANK_BORDER = '#10B981';

// Palavras de opção para o usuário selecionar
const INITIAL_OPTIONS = [
  'header',
  'inferSchema',
  'schema',
  'path',
  'infer',
  'load',
  'save',
  'options',
  '/user/data/sales.csv',
];

export default function SparkExerciseScreen() {
  const [selectedSlots, setSelectedSlots] = useState< Record<number, string | null> >({
    0: null, // Slot 1: Path
    1: null, // Slot 2: Option Key (inferSchema)
    2: null, // Slot 3: Method (load)
  });

  const [availableOptions, setAvailableOptions] = useState<string[]>(INITIAL_OPTIONS);

  const handleSelectOption = (option: string) => {
    // Encontra o primeiro slot vazio e preenche
    const firstEmptyIndex = [0, 1, 2].find((idx) => selectedSlots[idx] === null);
    if (firstEmptyIndex !== undefined) {
      setSelectedSlots((prev) => ({ ...prev, [firstEmptyIndex]: option }));
      setAvailableOptions((prev) => prev.filter((item) => item !== option));
    }
  };

  const handleRemoveSlot = (slotIndex: number) => {
    const itemToRemove = selectedSlots[slotIndex];
    if (itemToRemove) {
      setSelectedSlots((prev) => ({ ...prev, [slotIndex]: null }));
      setAvailableOptions((prev) => [...prev, itemToRemove]);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header / Barra de Status */}
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>🔥 15 dias</Text>
          <Text style={styles.statusText}>💎 500</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>NÍVEL 1</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Instruções do Exercício */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              Complete o código para carregar um arquivo CSV do HDFS para um DataFrame. O arquivo
              está em <Text style={styles.highlightText}>'/user/data/sales.csv'</Text>, tem cabeçalho
              e usa delimitador ';'. O esquema deve ser inferido.
            </Text>
          </View>

          {/* Card do Código (Notebook Style) */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeComment}>
              # Definição das opções{'\n'}
              <Text style={{ color: CODE_YELLOW }}>spark</Text> = SparkSession.builder.appName("CSV Reader").getOrCreate()
            </Text>

            <View style={styles.codeBlock}>
              <Text style={styles.codeLine}>
                <Text style={{ color: CODE_YELLOW }}>opts</Text> = {'{\n'}
                {'  '}<Text style={{ color: CODE_BLUE }}>'header'</Text>: 'true',{'\n'}
                {'  '}<Text style={{ color: CODE_BLUE }}>'delimiter'</Text>: ';'{'\n'}
                {'}'}
              </Text>

              <Text style={styles.codeComment}>{'\n'}# Código Spark a completar:</Text>
              
              <Text style={styles.codeLine}>
                <Text style={{ color: CODE_YELLOW }}>df</Text> = ({'\n'}
                {'  '}spark{'\n'}
                {'  '}.read{'\n'}
                {'  '}.format(<Text style={{ color: CODE_BLUE }}>"csv"</Text>){'\n'}
                {'  '}.options(**opts){'\n'}
                {'  '}.option(<Text style={{ color: CODE_BLUE }}>"path"</Text>, "
                
                {/* Slot 1: Path */}
                <TouchableOpacity
                  style={styles.inlineBlank}
                  onPress={() => handleRemoveSlot(0)}>
                  <Text style={styles.blankText}>{selectedSlots[0] || '           '}</Text>
                </TouchableOpacity>
                ")
              </Text>

              <Text style={styles.codeLine}>
                {'  '}.option("
                
                {/* Slot 2: inferSchema */}
                <TouchableOpacity
                  style={styles.inlineBlank}
                  onPress={() => handleRemoveSlot(1)}>
                  <Text style={styles.blankText}>{selectedSlots[1] || '       '}</Text>
                </TouchableOpacity>
                ", <Text style={{ color: CODE_BLUE }}>"true"</Text>)
              </Text>

              <Text style={styles.codeLine}>
                {'  '}.
                
                {/* Slot 3: load */}
                <TouchableOpacity
                  style={styles.inlineBlank}
                  onPress={() => handleRemoveSlot(2)}>
                  <Text style={styles.blankText}>{selectedSlots[2] || '   '}</Text>
                </TouchableOpacity>
                ()
              </Text>

              <Text style={styles.codeLine}>)</Text>
            </View>
          </View>

          {/* Grade de Botões de Opção */}
          <View style={styles.optionsContainer}>
            {availableOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionChip}
                onPress={() => handleSelectOption(option)}>
                <Text style={styles.optionChipText}>[{option}]</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Botão Inferior de Verificação */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>VERIFICAR</Text>
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#16191E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  statusText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: ACCENT_GREEN_DARK,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    color: TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '800',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  instructionCard: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  instructionText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
  },
  highlightText: {
    color: CODE_YELLOW,
    fontWeight: '600',
  },
  codeContainer: {
    backgroundColor: CODE_BG,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  codeBlock: {
    marginTop: 8,
  },
  codeLine: {
    fontFamily: 'monospace',
    color: TEXT_PRIMARY,
    fontSize: 13,
    lineHeight: 22,
  },
  codeComment: {
    fontFamily: 'monospace',
    color: CODE_COMMENT,
    fontSize: 12,
  },
  inlineBlank: {
    borderWidth: 1.5,
    borderColor: BLANK_BORDER,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: '#0D1117',
    alignSelf: 'center',
  },
  blankText: {
    color: ACCENT_GREEN,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
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
    padding: 16,
    backgroundColor: BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  verifyButton: {
    backgroundColor: ACCENT_ORANGE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: ACCENT_ORANGE_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});