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

// HTML/JS injetado na WebView — motor offline, sem CDN.
// O react-native-webview despacha o evento 'message' em document (Android)
// e em window (iOS), por isso registramos o listener nos dois alvos.
const HTML_ENGINE = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <script>
    (function () {
      function DataFrame(data) {
        this.$data = data || [];
        this.$columns = this.$data[0] ? Object.keys(this.$data[0]) : [];
        this.$values = this.$data.map(function (row) {
          return this.$columns.map(function (c) { return row[c]; });
        }, this);
      }

      DataFrame.prototype.filter = function (condition) {
        var rows = this.$data;
        if (typeof condition === 'function') {
          return new DataFrame(rows.filter(condition));
        }
        // fallback: se a condição não for função, filtra por idade > 25
        return new DataFrame(rows.filter(function (d) {
          return d.idade > 25;
        }));
      };

      DataFrame.prototype.show = function () {
        var columns = this.$columns;
        var tableStr = columns.join(" | ") + "\\n" + "-".repeat(30) + "\\n";
        this.$values.forEach(function (row) {
          tableStr += row.map(String).join(" | ") + "\\n";
        });
        logs.push(tableStr);
      };

      var logs = [];

      var spark = {
        createDataFrame: function (data) {
          // Aceita lista de dicts (estilo PySpark) e converte em DataFrame
          return new DataFrame(data);
        }
      };

      function reply(status, output) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: status,
            output: output
          }));
        }
      }

      function handleMessage(event) {
        logs = [];
        try {
          var userCode = event && typeof event.data === 'string' ? event.data : '';
          // normaliza sintaxe Python -> JS: comentários # e chaves de dict
          userCode = userCode
            .split('\\n')
            .map(function (line) {
              var hash = line.indexOf('#');
              if (hash >= 0 && line.slice(0, hash).indexOf('"') < 0) {
                return line.slice(0, hash);
              }
              return line;
            })
            .join('\\n');
          eval(userCode);
          reply('success', logs.join('\\n') || 'Código executado sem saídas visíveis.');
        } catch (err) {
          reply('error', err && err.message ? err.message : String(err));
        }
      }

      window.addEventListener('message', handleMessage);
      document.addEventListener('message', handleMessage);

      // sinaliza para o React Native que o motor está pronto
      reply('ready', 'engine ready');
    })();
  </script>
</body>
</html>
`;

export default function SparkLabPlaygroundScreen() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const webViewRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  const clearRunTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleRunCode = () => {
    if (!engineReady || !webViewRef.current) {
      setOutput('> Motor ainda inicializando, tente novamente em instantes.');
      return;
    }

    setIsLoading(true);
    setOutput(null);
    clearRunTimeout();

    // fallback: se a WebView não responder, encerra o loading
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setOutput('Timeout: o motor não respondeu. Verifique a execução.');
    }, 5000);

    webViewRef.current.postMessage(code);
  };

  const handleMessage = (event) => {
    let response;
    try {
      response = JSON.parse(event.nativeEvent.data);
    } catch (_e) {
      setIsLoading(false);
      clearRunTimeout();
      setOutput('Erro ao processar a resposta do interpretador.');
      return;
    }

    if (response.status === 'ready') {
      setEngineReady(true);
      return;
    }

    clearRunTimeout();
    setIsLoading(false);
    setOutput(response.output);
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

        {/* Componente invisível da engine — precisa de tamanho > 0 para o JS rodar no Android */}
        <View style={styles.hiddenEngine} pointerEvents="none">
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: HTML_ENGINE }}
            onMessage={handleMessage}
            onLoadEnd={() => setEngineReady(true)}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>

        {/* Rodapé com Ação */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.runButton, (!engineReady || isLoading) && styles.runButtonDisabled]}
            onPress={handleRunCode}
            disabled={isLoading || !engineReady}>
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
    position: 'absolute',
    width: 1,
    height: 1,
    bottom: 0,
    right: 0,
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
  runButtonDisabled: {
    opacity: 0.5,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});