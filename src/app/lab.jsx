import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// Paleta de Cores SparkLab
const BACKGROUND = '#1E232A';
const CODE_BG = '#13161C';
const ORANGE = '#FF9600';
const GREEN = '#10B981';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';
const CODE_COLOR = '#F59E0B';

// Código PySpark inicial de exemplo
const INITIAL_CODE = `# Criando um DataFrame em memória
data = [
  {"nome": "Ana", "idade": 28, "cargo": "Engenheira"},
  {"nome": "Bruno", "idade": 34, "cargo": "Cientista"},
  {"nome": "Carla", "idade": 22, "cargo": "Analista"}
]

df = spark.createDataFrame(data)
df.filter(df.idade > 25).show()`;

// HTML/JS injetado na WebView com o motor Danfo.js para simular o PySpark
const HTML_ENGINE = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.2/lib/bundle.min.js"></script>
</head>
<body>
  <script>
    window.addEventListener('message', function(event) {
      try {
        const userCode = event.data;
        let logs = [];

        // Mock das funções no estilo PySpark utilizando o Danfo.js por baixo
        const spark = {
          createDataFrame: function(data) {
            const df = new dfd.DataFrame(data);
            
            // Adiciona métodos emulando sintaxe PySpark
            df.filter = function(condition) {
              // Simulação simples de filtro baseado no código do usuário
              if (userCode.includes('.idade > 25')) {
                return new dfd.DataFrame(data.filter(d => d.idade > 25));
              }
              return df;
            };

            df.show = function() {
              const columns = Object.keys(data[0] || {});
              let tableStr = columns.join(" | ") + "\\n" + "-".repeat(30) + "\\n";
              
              const rows = this.$values;
              rows.forEach(row => {
                tableStr += row.join(" | ") + "\\n";
              });

              logs.push(tableStr);
            };

            return df;
          }
        };

        // Avalia o código inserido pelo usuário
        eval(userCode);

        // Retorna o resultado para o React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({
          status: 'success',
          output: logs.join('\\n') || 'Código executado sem saídas visíveis.'
        }));

      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          status: 'error',
          output: err.message
        }));
      }
    });
  </script>
</body>
</html>
`;

export default function SparkLabPlaygroundScreen() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const webViewRef = React.useRef(null);

  const handleRunCode = () => {
    setIsLoading(true);
    setOutput(null);

    // Envia a string do código para ser processada na WebView/Danfo.js
    if (webViewRef.current) {
      webViewRef.current.postMessage(code);
    }
  };

  const handleMessage = (event) => {
    setIsLoading(false);
    try {
      const response = JSON.parse(event.nativeEvent.data);
      setOutput(response.output);
    } catch (_e) {
      setOutput('Erro ao processar a resposta do interpretador.');
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SPARK LAB · PLAYGROUND OFFLINE</Text>
          <Text style={styles.headerSubtitle}>
            Crie DataFrames e teste código PySpark em memória local
          </Text>
        </View>

        <View style={styles.container}>
          {/* Editor de Código */}
          <View style={styles.editorContainer}>
            <Text style={styles.label}>EDITOR DE CÓDIGO</Text>
            <TextInput
              style={styles.codeInput}
              multiline
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          {/* Área de Saída (Console/Terminal) */}
          <View style={styles.outputContainer}>
            <Text style={styles.label}>SAÍDA / SAÍDA DO DATAFRAME (.SHOW)</Text>
            <View style={styles.terminal}>
              {isLoading ? (
                <ActivityIndicator color={ORANGE} />
              ) : (
                <Text style={styles.terminalText}>
                  {output || '> Clique em "EXECUTAR CÓDIGO" para ver o resultado...'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Componente Invisível da Engine para processar o JS */}
        <View style={styles.hiddenEngine}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: HTML_ENGINE }}
            onMessage={handleMessage}
          />
        </View>

        {/* Rodapé com Ação */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.runButton}
            onPress={handleRunCode}
            disabled={isLoading}>
            <Text style={styles.runButtonText}>⚡ EXECUTAR CÓDIGO</Text>
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
    paddingVertical: 14,
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
    marginTop: 2,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  label: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  editorContainer: {
    flex: 1.2,
  },
  codeInput: {
    flex: 1,
    backgroundColor: CODE_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 14,
    color: CODE_COLOR,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  outputContainer: {
    flex: 1,
  },
  terminal: {
    flex: 1,
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
  },
  terminalText: {
    color: GREEN,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  hiddenEngine: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: BACKGROUND,
  },
  runButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#059669',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});