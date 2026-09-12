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
const CODE_COLOR = '#F59E0B';

// Exemplos de código interativos por categoria
const EXAMPLES = [
  {
    id: 'list',
    label: 'Via Lista / Tuplas',
    description: 'Criação manual a partir de dados locais em memória:',
    code: `data = [("Ana", 28), ("Bruno", 34)]\ncolumns = ["Nome", "Idade"]\n\ndf = spark.createDataFrame(data, columns)\ndf.show()`,
  },
  {
    id: 'csv',
    label: 'Via Arquivo CSV',
    description: 'Leitura de dados estruturados com cabeçalho:',
    code: `df = spark.read.csv(\n  "path/usuarios.csv",\n  header=True,\n  inferSchema=True\n)\ndf.show()`,
  },
  {
    id: 'json',
    label: 'Via Formato JSON',
    description: 'Carregamento de dados semi-estruturados:',
    code: `df = spark.read.json("path/dados.json")\ndf.printSchema()`,
  },
];

export default function TheoryConceptScreen() {
  const [activeTab, setActiveTab] = useState(EXAMPLES[0]);

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
                    onPress={() => setActiveTab(item)}>
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
                <Text style={styles.codeText}>{activeTab.code}</Text>
              </View>
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
  },
  codeText: {
    color: CODE_COLOR,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: BACKGROUND,
  },
  continueButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#059669',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});