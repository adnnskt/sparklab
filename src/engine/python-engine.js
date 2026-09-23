import { CODEMIRROR_JS, PYTHON_MODE_JS } from './codemirror-source';
import skulptSource from './skulpt-source';

// Tema VS Code Dark+ para o CodeMirror
const THEME_CSS = `
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #0D1117;
}
#editor { height: 100%; }
.CodeMirror {
  height: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 22px;
  color: #D4D4D4;
  background: #0D1117;
}
.CodeMirror-gutters {
  background: #0D1117;
  border-right: 1px solid #374151;
  min-width: 36px;
}
.CodeMirror-linenumber {
  color: #4B5563;
  font-size: 11px;
  padding: 0 8px 0 4px;
}
.CodeMirror-cursor { border-left: 2px solid #FF9600; }
.CodeMirror-activeline-background { background: #2A2A2A; }
div.CodeMirror-selected { background: #264F78; }
.CodeMirror-focused div.CodeMirror-selected { background: #264F78; }
.CodeMirror-line::selection,
.CodeMirror-line > span::selection,
.CodeMirror-line > span > span::selection { background: #264F78; }
.cm-s-sparklab span.cm-keyword,
.cm-s-sparklab span.cm-atom { color: #569CD6; }
.cm-s-sparklab span.cm-number { color: #B5CEA8; }
.cm-s-sparklab span.cm-def,
.cm-s-sparklab span.cm-variable,
.cm-s-sparklab span.cm-variable-2,
.cm-s-sparklab span.cm-property,
.cm-s-sparklab span.cm-qualifier { color: #9CDCFE; }
.cm-s-sparklab span.cm-operator,
.cm-s-sparklab span.cm-punctuation,
.cm-s-sparklab span.cm-bracket { color: #D4D4D4; }
.cm-s-sparklab span.cm-comment { color: #6A9955; font-style: normal; }
.cm-s-sparklab span.cm-string,
.cm-s-sparklab span.cm-string-2 { color: #CE9178; }
.cm-s-sparklab span.cm-builtin { color: #4EC9B0; }
.cm-s-sparklab span.cm-meta { color: #C586C0; }
.cm-s-sparklab span.cm-tag { color: #569CD6; }
.cm-s-sparklab span.cm-attribute { color: #9CDCFE; }
.cm-s-sparklab span.cm-header { color: #569CD6; font-weight: bold; }
.cm-s-sparklab span.cm-link { color: #CE9178; }
.cm-s-sparklab span.cm-error { color: #F44747; }
.CodeMirror-matchingbracket {
  color: #569CD6 !important;
  text-decoration: underline;
  outline: none;
}
`;

// Código PySpark inicial de exemplo
const INITIAL_CODE = `# Criando um DataFrame em memória
data = [
  {"nome": "Ana", "idade": 28, "cargo": "Engenheira"},
  {"nome": "Bruno", "idade": 34, "cargo": "Cientista"},
  {"nome": "Carla", "idade": 22, "cargo": "Analista"}
]

df = spark.createDataFrame(data)
df.filter(df.idade > 25).show()`;

// Pré-ambulo Python: shim PySpark usado pelo playground (DataFrame, filter, show).
const PRELUDE_PY = `
class Column:
    def __init__(self, field):
        self.field = field

    def __gt__(self, other):
        f = self.field
        return lambda row: row[f] > other

    def __lt__(self, other):
        f = self.field
        return lambda row: row[f] < other

    def __ge__(self, other):
        f = self.field
        return lambda row: row[f] >= other

    def __le__(self, other):
        f = self.field
        return lambda row: row[f] <= other


class DataFrame:
    def __init__(self, data):
        self._data = data or []
        self._columns = list(self._data[0].keys()) if self._data else []

    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        return Column(name)

    def filter(self, cond):
        if callable(cond):
            return DataFrame([row for row in self._data if cond(row)])
        return DataFrame(self._data)

    def show(self):
        cols = self._columns
        print(' | '.join(cols))
        print('-' * 30)
        for row in self._data:
            print(' | '.join(str(row[c]) for c in cols))


class _Spark:
    def createDataFrame(self, data):
        return DataFrame(data)


spark = _Spark()
`;

const RUNNER = `
(function () {
  var logs = '';
  var running = false;

  Sk.configure({
    output: function (text) {
      logs += text;
    },
    read: function (fname) {
      if (Sk.builtinFiles && Sk.builtinFiles.files[fname] !== undefined) {
        return Sk.builtinFiles.files[fname];
      }
      throw "File not found: '" + fname + "'";
    },
    __future__: Sk.python3
  });

  var PRELUDE = ${JSON.stringify(PRELUDE_PY)};
  var INITIAL_CODE = ${JSON.stringify(INITIAL_CODE)};
  var PRELUDE_LINES = PRELUDE.split('\\n').length;

  var editor = CodeMirror(document.getElementById('editor'), {
    value: INITIAL_CODE,
    mode: 'python',
    theme: 'sparklab',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: {
      Tab: function (cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection('add');
        } else {
          cm.replaceSelection('    ', 'end');
        }
      }
    }
  });

  function reply(status, output) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        status: status,
        output: output
      }));
    }
  }

  function fixLineNumbers(message) {
    return String(message).replace(/on line (\\d+)/g, function (all, n) {
      var adjusted = parseInt(n, 10) - PRELUDE_LINES;
      return adjusted > 0 ? 'on line ' + adjusted : all;
    });
  }

  function run() {
    if (running) return;
    running = true;
    logs = '';
    var userCode = editor.getValue();
    Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody('<stdin>', false, PRELUDE + '\\n' + userCode, true);
    }).then(function () {
      running = false;
      reply('success', logs || 'Código executado sem saídas visíveis.');
    }, function (err) {
      running = false;
      reply('error', fixLineNumbers(err && err.toString ? err.toString() : String(err)));
    });
  }

  function handleMessage(event) {
    var data = event && typeof event.data === 'string' ? event.data : '';
    var msg = null;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      return;
    }
    if (msg && msg.type === 'run') {
      run();
    }
  }

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);

  reply('ready', 'engine ready');
})();
`;

const escapeScript = (source) => source.replace(/<\/script/gi, '<\\/script');

const scriptTags = [CODEMIRROR_JS, PYTHON_MODE_JS, skulptSource, RUNNER]
  .map((source) => `  <script>${escapeScript(source)}</script>`)
  .join('\n');

export const HTML_ENGINE = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>${THEME_CSS}</style>
</head>
<body>
  <div id="editor"></div>
${scriptTags}
</body>
</html>
`;
