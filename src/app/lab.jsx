import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { HTML_ENGINE } from '../engine/python-engine';

// Paleta de Cores SparkLab
const BACKGROUND = '#1E232A';
const CODE_BG = '#0D1117';
const TAB_BG = '#161B22';
const ORANGE = '#FF9600';
const GREEN = '#10B981';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';
const BORDER_COLOR = '#374151';

export default function SparkLabPlaygroundScreen() {
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

    webViewRef.current.postMessage(JSON.stringify({ type: 'run' }));
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
          {/* Editor de Código — CodeMirror dentro da WebView (render nítido, tema VS Code) */}
          <View style={styles.editorContainer}>
            <Text style={styles.label}>EDITOR DE CÓDIGO</Text>
            <View style={styles.editorArea}>
              <View style={styles.editorHeader}>
                <Text style={styles.editorFilename}>main.py</Text>
              </View>
              <View style={styles.editorWebWrap}>
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: HTML_ENGINE }}
                  onMessage={handleMessage}
                  onLoadEnd={() => setEngineReady(true)}
                  javaScriptEnabled
                  domStorageEnabled
                  style={styles.editorWeb}
                />
              </View>
            </View>
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
  editorArea: {
    flex: 1,
    backgroundColor: CODE_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editorHeader: {
    backgroundColor: TAB_BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  editorFilename: {
    color: TEXT_SECONDARY,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
  },
  editorWebWrap: {
    flex: 1,
  },
  editorWeb: {
    flex: 1,
    backgroundColor: CODE_BG,
  },
  outputContainer: {
    flex: 1,
  },
  terminal: {
    flex: 1,
    backgroundColor: CODE_BG,
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
