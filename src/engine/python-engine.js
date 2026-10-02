import { CODEMIRROR_CSS, CODEMIRROR_JS, PYTHON_MODE_JS } from './codemirror-source';
import skulptSource from './skulpt-source';

// Tema VS Code Dark+ para o CodeMirror
const THEME_CSS = `
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #0D1117;
}
#editor {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
#fallback {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 0;
  outline: none;
  resize: none;
  padding: 4px 12px;
  background: #0D1117;
  color: #D4D4D4;
  caret-color: #FF9600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 22px;
}
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

// Pré-ambulo Python: shim PySpark (DataFrame API principal) usado pelo playground.
const PRELUDE_PY = `
import math


def _value(v, row):
    if isinstance(v, Column):
        return v._fn(row)
    if callable(v):
        return v(row)
    return v


def _lift(v):
    if isinstance(v, Column):
        return v
    return Column(lambda row, x=v: x, label=repr(v))


def _label(x):
    if isinstance(x, Column):
        if x.label is not None:
            return x.label
        return "col"
    return repr(x)


def _copy(row):
    nr = {}
    for k in row:
        nr[k] = row[k]
    return nr


def _row_key(row, cols):
    return tuple([row.get(c) for c in cols])


def _merge(a, b):
    r = {}
    if a is not None:
        for k in a:
            r[k] = a[k]
    if b is not None:
        for k in b:
            r[k] = b[k]
    return r


def _round(v, scale=0):
    if v is None:
        return None
    m = math.pow(10, scale)
    v2 = float(v) * m
    if v2 >= 0:
        r = int(math.floor(v2 + 0.5))
    else:
        r = -int(math.floor(-v2 + 0.5))
    if scale <= 0:
        return int(r)
    return r / m


def _typeof(v):
    if isinstance(v, bool):
        return "boolean"
    if isinstance(v, int):
        return "long"
    if isinstance(v, float):
        return "double"
    if isinstance(v, dict):
        return "map<string, string>"
    if isinstance(v, list):
        return "array<string>"
    return "string"


def _stat(rows, col, kind):
    vals = []
    for r in rows:
        v = r.get(col)
        if v is not None:
            vals.append(v)
    if kind == "count":
        return len(vals)
    if kind == "min" or kind == "max":
        if not vals:
            return None
        try:
            if kind == "min":
                return min(vals)
            return max(vals)
        except Exception:
            return None
    nums = []
    for v in vals:
        if isinstance(v, bool):
            continue
        if isinstance(v, int) or isinstance(v, float):
            nums.append(float(v))
    if not nums:
        return None
    if kind == "mean":
        return sum(nums) / len(nums)
    if kind == "stddev":
        if len(nums) < 2:
            return None
        m = sum(nums) / len(nums)
        var = 0.0
        for v in nums:
            var = var + (v - m) * (v - m)
        return math.sqrt(var / (len(nums) - 1))
    return None


def _unary(x, name, op):
    if isinstance(x, Column):
        a = x._fn

        def fn(row):
            v = a(row)
            if v is None:
                return None
            return op(v)

        return Column(fn, label="%s(%s)" % (name, _label(x)))
    if x is None:
        return None
    return op(x)


def _binary(x, y, name, op):
    if isinstance(x, Column) or isinstance(y, Column):

        def fn(row):
            xv = _value(x, row)
            yv = _value(y, row)
            if xv is None or yv is None:
                return None
            return op(xv, yv)

        return Column(fn, label="%s(%s, %s)" % (name, _label(x), _label(y)))
    return op(_value(x, None), _value(y, None))


class Column:
    def __init__(self, fn, label=None, asc=True, aggfn=None):
        self._fn = fn
        self.label = label
        self._asc = asc
        self._aggfn = aggfn

    @staticmethod
    def field(name):
        return Column(lambda row: row.get(name), label=name)

    def alias(self, name):
        return Column(self._fn, label=name, asc=self._asc, aggfn=self._aggfn)

    def desc(self):
        return Column(self._fn, label=self.label, asc=False, aggfn=self._aggfn)

    def asc(self):
        return Column(self._fn, label=self.label, asc=True, aggfn=self._aggfn)

    def _bin(self, other, sym, op):
        a = self._fn
        if isinstance(other, Column):
            b = other._fn
            ol = other.label if other.label is not None else "col"
        else:
            b = lambda row, x=other: x
            ol = repr(other)
        lbl = "(%s %s %s)" % (self.label if self.label is not None else "col", sym, ol)

        def calc(row):
            xv = a(row)
            yv = b(row)
            if xv is None or yv is None:
                return None
            return op(xv, yv)

        return Column(calc, label=lbl)

    def __add__(self, other):
        return self._bin(other, "+", lambda x, y: x + y)

    def __radd__(self, other):
        return _lift(other)._bin(self, "+", lambda x, y: x + y)

    def __sub__(self, other):
        return self._bin(other, "-", lambda x, y: x - y)

    def __rsub__(self, other):
        return _lift(other)._bin(self, "-", lambda x, y: x - y)

    def __mul__(self, other):
        return self._bin(other, "*", lambda x, y: x * y)

    def __rmul__(self, other):
        return _lift(other)._bin(self, "*", lambda x, y: x * y)

    def __truediv__(self, other):
        return self._bin(other, "/", lambda x, y: x / y if y != 0 else None)

    def __rtruediv__(self, other):
        return _lift(other)._bin(self, "/", lambda x, y: x / y if y != 0 else None)

    def __mod__(self, other):
        return self._bin(other, "%", lambda x, y: x % y if y != 0 else None)

    def __pow__(self, other):
        return self._bin(other, "**", lambda x, y: x ** y)

    def __gt__(self, other):
        return self._bin(other, ">", lambda x, y: x > y)

    def __lt__(self, other):
        return self._bin(other, "<", lambda x, y: x < y)

    def __ge__(self, other):
        return self._bin(other, ">=", lambda x, y: x >= y)

    def __le__(self, other):
        return self._bin(other, "<=", lambda x, y: x <= y)

    def __eq__(self, other):
        return self._bin(other, "==", lambda x, y: x == y)

    def __ne__(self, other):
        return self._bin(other, "!=", lambda x, y: x != y)

    def __and__(self, other):
        return self._bin(other, "&", lambda x, y: bool(x) and bool(y))

    def __or__(self, other):
        return self._bin(other, "|", lambda x, y: bool(x) or bool(y))

    def __invert__(self):
        a = self._fn
        return Column(lambda row: (False if a(row) else True), label="~(%s)" % _label(self))

    def isNull(self):
        return Column(lambda row: self._fn(row) is None, label="isNull")

    def isNotNull(self):
        return Column(lambda row: self._fn(row) is not None, label="isNotNull")

    def isin(self, *opts):
        if len(opts) == 1 and isinstance(opts[0], (list, tuple)):
            vals = list(opts[0])
        else:
            vals = list(opts)
        return Column(lambda row: self._fn(row) in vals, label="isin")

    def between(self, a, b):
        fn_src = self._fn

        def fn(row):
            v = fn_src(row)
            if v is None:
                return None
            return v >= a and v <= b

        return Column(fn, label="between")

    def contains(self, s):
        fn_src = self._fn

        def fn(row):
            v = fn_src(row)
            if v is None:
                return None
            return s in str(v)

        return Column(fn, label="contains")

    def startswith(self, s):
        fn_src = self._fn

        def fn(row):
            v = fn_src(row)
            if v is None:
                return None
            return str(v).startswith(s)

        return Column(fn, label="startswith")

    def endswith(self, s):
        fn_src = self._fn

        def fn(row):
            v = fn_src(row)
            if v is None:
                return None
            return str(v).endswith(s)

        return Column(fn, label="endswith")

    def upper(self):
        return _unary(self, "upper", lambda v: str(v).upper())

    def lower(self):
        return _unary(self, "lower", lambda v: str(v).lower())

    def trim(self):
        return _unary(self, "trim", lambda v: str(v).strip())

    def getItem(self, key):
        fn_src = self._fn

        def fn(row):
            v = fn_src(row)
            if v is None:
                return None
            return v[key]

        return Column(fn, label="getItem")

    def cast(self, to):
        t = str(to).lower()

        def op(v):
            if t in ("int", "integer", "long"):
                return int(v)
            if t in ("double", "float", "decimal"):
                return float(v)
            if t == "string":
                return str(v)
            if t in ("bool", "boolean"):
                return bool(v)
            if t == "short":
                return int(v)
            return v

        return _unary(self, "cast", op)


class _When(Column):
    def __init__(self, cond, value):
        self._cases = [(cond, value)]
        Column.__init__(self, self._eval, label="when")

    def _eval(self, row):
        for cond, value in self._cases:
            if cond is None:
                return _value(value, row)
            if _value(cond, row):
                return _value(value, row)
        return None

    def when(self, cond, value):
        self._cases.append((cond, value))
        return self

    def otherwise(self, value):
        self._cases.append((None, value))
        return self


class Row(object):
    def __init__(self, data):
        self._data = data

    def __getitem__(self, key):
        if key in self._data:
            return self._data[key]
        raise KeyError(key)

    def __getattr__(self, name):
        d = self.__dict__.get("_data")
        if d is not None and name in d:
            return d[name]
        raise AttributeError("Row has no attribute '%s'" % name)

    def asDict(self):
        return _copy(self._data)

    def __repr__(self):
        parts = []
        for k in self._data:
            parts.append("%s=%r" % (k, self._data[k]))
        return "Row(%s)" % ", ".join(parts)


class functions(object):
    @staticmethod
    def col(name):
        if isinstance(name, Column):
            return name
        return Column.field(name)

    @staticmethod
    def lit(v):
        return _lift(v)

    @staticmethod
    def abs(x):
        return _unary(x, "abs", lambda v: abs(v))

    @staticmethod
    def round(x, scale=0):
        return _unary(x, "round", lambda v: _round(v, scale))

    @staticmethod
    def floor(x):
        return _unary(x, "floor", lambda v: int(math.floor(v)))

    @staticmethod
    def ceil(x):
        return _unary(x, "ceil", lambda v: int(math.ceil(v)))

    @staticmethod
    def sqrt(x):
        return _unary(x, "sqrt", lambda v: math.sqrt(v))

    @staticmethod
    def exp(x):
        return _unary(x, "exp", lambda v: math.exp(v))

    @staticmethod
    def log(x):
        return _unary(x, "log", lambda v: math.log(v))

    @staticmethod
    def pow(x, y):
        return _binary(x, y, "pow", lambda a, b: a ** b)

    @staticmethod
    def upper(x):
        return _unary(x, "upper", lambda v: str(v).upper())

    @staticmethod
    def lower(x):
        return _unary(x, "lower", lambda v: str(v).lower())

    @staticmethod
    def trim(x):
        return _unary(x, "trim", lambda v: str(v).strip())

    @staticmethod
    def length(x):
        return _unary(x, "length", lambda v: len(str(v)))

    @staticmethod
    def concat(*cols):

        def fn(row):
            parts = []
            for c in cols:
                v = _value(c, row)
                if v is None:
                    return None
                parts.append(str(v))
            return "".join(parts)

        return Column(fn, label="concat")

    @staticmethod
    def concat_ws(sep, *cols):

        def fn(row):
            parts = []
            for c in cols:
                v = _value(c, row)
                if v is not None:
                    parts.append(str(v))
            return sep.join(parts)

        return Column(fn, label="concat_ws")

    @staticmethod
    def coalesce(*cols):

        def fn(row):
            for c in cols:
                v = _value(c, row)
                if v is not None:
                    return v
            return None

        return Column(fn, label="coalesce")

    @staticmethod
    def when(cond, value):
        return _When(cond, value)

    @staticmethod
    def sum(x):
        field = functions._field(x)

        def agg(rows):
            t = 0
            for r in rows:
                v = r.get(field)
                if v is not None:
                    t = t + v
            return t

        return Column(lambda row: None, label="sum(%s)" % field, aggfn=agg)

    @staticmethod
    def avg(x):
        field = functions._field(x)

        def agg(rows):
            t = 0.0
            n = 0
            for r in rows:
                v = r.get(field)
                if v is not None:
                    t = t + float(v)
                    n = n + 1
            if n == 0:
                return None
            return t / n

        return Column(lambda row: None, label="avg(%s)" % field, aggfn=agg)

    @staticmethod
    def mean(x):
        return functions.avg(x)

    @staticmethod
    def min(x):
        field = functions._field(x)

        def agg(rows):
            vals = []
            for r in rows:
                v = r.get(field)
                if v is not None:
                    vals.append(v)
            if not vals:
                return None
            return min(vals)

        return Column(lambda row: None, label="min(%s)" % field, aggfn=agg)

    @staticmethod
    def max(x):
        field = functions._field(x)

        def agg(rows):
            vals = []
            for r in rows:
                v = r.get(field)
                if v is not None:
                    vals.append(v)
            if not vals:
                return None
            return max(vals)

        return Column(lambda row: None, label="max(%s)" % field, aggfn=agg)

    @staticmethod
    def count(x="*"):
        field = functions._field(x)

        def agg(rows):
            if field in ("*", "1"):
                return len(rows)
            n = 0
            for r in rows:
                if r.get(field) is not None:
                    n = n + 1
            return n

        return Column(lambda row: None, label="count(%s)" % field, aggfn=agg)

    @staticmethod
    def countDistinct(x):
        field = functions._field(x)

        def agg(rows):
            seen = []
            for r in rows:
                v = r.get(field)
                if v is not None and v not in seen:
                    seen.append(v)
            return len(seen)

        return Column(lambda row: None, label="count(DISTINCT %s)" % field, aggfn=agg)

    @staticmethod
    def _field(x):
        if isinstance(x, str):
            return x
        if isinstance(x, Column) and x.label is not None:
            return x.label
        return "*"

    @staticmethod
    def _resolve(spec, field):
        if isinstance(spec, Column):
            return spec
        name = str(spec).lower()
        if name == "sum":
            return functions.sum(field)
        if name in ("avg", "mean"):
            return functions.avg(field)
        if name == "min":
            return functions.min(field)
        if name == "max":
            return functions.max(field)
        if name == "count":
            return functions.count(field)
        if name in ("countdistinct", "count_distinct"):
            return functions.countDistinct(field)
        raise ValueError("Agregacao desconhecida: %s" % spec)


class GroupedData(object):
    def __init__(self, rows, keys):
        self._rows = rows
        self._keys = list(keys)

    def _groups(self):
        order = []
        groups = {}
        for r in self._rows:
            k = tuple([r.get(c) for c in self._keys])
            if k in groups:
                groups[k].append(r)
            else:
                groups[k] = [r]
                order.append(k)
        return order, groups

    def _run(self, specs, names):
        order, groups = self._groups()
        out = []
        for k in order:
            row = {}
            for i in range(len(self._keys)):
                row[self._keys[i]] = k[i]
            for i in range(len(specs)):
                row[names[i]] = specs[i](groups[k])
            out.append(row)
        return DataFrame(out, list(self._keys) + names)

    def count(self):
        order, groups = self._groups()
        out = []
        for k in order:
            row = {}
            for i in range(len(self._keys)):
                row[self._keys[i]] = k[i]
            row["count"] = len(groups[k])
            out.append(row)
        return DataFrame(out, list(self._keys) + ["count"])

    def agg(self, *exprs):
        specs = []
        names = []
        for e in exprs:
            if isinstance(e, dict):
                for f in e:
                    c = functions._resolve(e[f], f)
                    specs.append(c._aggfn)
                    names.append(c.label)
            elif isinstance(e, Column) and e._aggfn is not None:
                specs.append(e._aggfn)
                names.append(e.label if e.label is not None else "agg")
        return self._run(specs, names)

    def _multi(self, kind, cols):
        specs = []
        names = []
        for c in cols:
            fn = functions._resolve(kind, c)
            specs.append(fn._aggfn)
            names.append("%s(%s)" % (kind, c))
        return self._run(specs, names)

    def sum(self, *cols):
        return self._multi("sum", cols)

    def avg(self, *cols):
        return self._multi("avg", cols)

    def mean(self, *cols):
        return self._multi("mean", cols)

    def min(self, *cols):
        return self._multi("min", cols)

    def max(self, *cols):
        return self._multi("max", cols)


class DataFrame:
    def __init__(self, data, columns=None):
        self._data = list(data) if data else []
        if columns is not None:
            self._columns = list(columns)
        elif self._data:
            self._columns = list(self._data[0].keys())
        else:
            self._columns = []

    @property
    def columns(self):
        return list(self._columns)

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        if name in self._columns:
            return Column.field(name)
        raise AttributeError("DataFrame has no attribute '%s'" % name)

    def __getitem__(self, key):
        if isinstance(key, str):
            return Column.field(key)
        if isinstance(key, list):
            return [Column.field(k) for k in key]
        raise TypeError("Indice invalido para DataFrame")

    def count(self):
        return len(self._data)

    def show(self, n=20):
        cols = self._columns
        print(" | ".join(cols))
        print("-" * 30)
        for row in self._data[0:n]:
            print(" | ".join(str(row.get(c)) for c in cols))

    def display(self, n=20):
        self.show(n)

    def collect(self):
        return [Row(r) for r in self._data]

    def first(self):
        if self._data:
            return Row(self._data[0])
        return None

    def head(self, n=None):
        if n is None:
            return self.first()
        return [Row(r) for r in self._data[0:n]]

    def take(self, n):
        return [Row(r) for r in self._data[0:n]]

    def select(self, *cols):
        if len(cols) == 1:
            if cols[0] == "*":
                cols = tuple(self._columns)
            elif isinstance(cols[0], list):
                cols = tuple(cols[0])
        names = []
        fns = []
        for c in cols:
            if isinstance(c, str):
                names.append(c)
                fns.append(lambda row, k=c: row.get(k))
            elif isinstance(c, Column):
                names.append(c.label if c.label is not None else "col")
                fns.append(c._fn)
            elif callable(c):
                names.append("col")
                fns.append(c)
            else:
                raise TypeError("select aceita nomes de coluna ou Column")
        out = []
        for row in self._data:
            nr = {}
            for i in range(len(names)):
                nr[names[i]] = fns[i](row)
            out.append(nr)
        return DataFrame(out, names)

    def filter(self, cond):
        if isinstance(cond, Column):
            return DataFrame([r for r in self._data if cond._fn(r)], self._columns)
        if callable(cond):
            return DataFrame([r for r in self._data if cond(r)], self._columns)
        return DataFrame(list(self._data), self._columns)

    def where(self, cond):
        return self.filter(cond)

    def drop(self, *cols):
        if len(cols) == 1 and isinstance(cols[0], list):
            cols = tuple(cols[0])
        names = []
        for c in cols:
            if isinstance(c, Column) and c.label is not None:
                names.append(c.label)
            else:
                names.append(c)
        remaining = [c for c in self._columns if c not in names]
        out = []
        for r in self._data:
            nr = {}
            for c in remaining:
                nr[c] = r.get(c)
            out.append(nr)
        return DataFrame(out, remaining)

    def withColumn(self, name, col):
        if isinstance(col, Column):
            fn = col._fn
        elif callable(col):
            fn = col
        else:
            fn = lambda row, v=col: v
        cols = list(self._columns)
        if name not in cols:
            cols.append(name)
        out = []
        for row in self._data:
            nr = _copy(row)
            nr[name] = fn(row)
            out.append(nr)
        return DataFrame(out, cols)

    def withColumnRenamed(self, old, new):
        cols = []
        for c in self._columns:
            if c == old:
                cols.append(new)
            else:
                cols.append(c)
        out = []
        for row in self._data:
            nr = {}
            for i in range(len(self._columns)):
                if self._columns[i] == old:
                    if old in row:
                        nr[new] = row.get(old)
                else:
                    nr[cols[i]] = row.get(self._columns[i])
            out.append(nr)
        return DataFrame(out, cols)

    def distinct(self):
        seen = []
        out = []
        for r in self._data:
            k = _row_key(r, self._columns)
            if k not in seen:
                seen.append(k)
                out.append(r)
        return DataFrame(out, self._columns)

    def dropDuplicates(self, *cols):
        if len(cols) == 1 and isinstance(cols[0], list):
            cols = tuple(cols[0])
        keycols = list(cols) if cols else list(self._columns)
        seen = []
        out = []
        for r in self._data:
            k = _row_key(r, keycols)
            if k not in seen:
                seen.append(k)
                out.append(r)
        return DataFrame(out, self._columns)

    def limit(self, n):
        return DataFrame(self._data[0:n], self._columns)

    def orderBy(self, *cols, **kwargs):
        return self.sort(*cols, **kwargs)

    def sort(self, *cols, **kwargs):
        ascending = True
        if "ascending" in kwargs:
            ascending = kwargs["ascending"]
        rows = list(self._data)
        keys = []
        for c in cols:
            if isinstance(c, Column):
                keys.append((c._fn, c._asc))
            else:
                keys.append((lambda row, k=c: row.get(k), ascending))
        for i in range(len(keys) - 1, -1, -1):
            fn = keys[i][0]
            rev = not keys[i][1]
            rows = sorted(rows, key=fn, reverse=rev)
        return DataFrame(rows, self._columns)

    def join(self, other, on=None, how="inner"):
        h = str(how if how is not None else "inner").lower().replace("_", "")
        if h in ("leftouter", "left"):
            h = "left"
        elif h in ("rightouter", "right"):
            h = "right"
        elif h in ("fullouter", "full", "outer"):
            h = "full"
        cols = list(self._columns)
        for c in other._columns:
            if c not in cols:
                cols.append(c)
        if on is None or h == "cross":
            out = []
            for a in self._data:
                for b in other._data:
                    out.append(_merge(a, b))
            return DataFrame(out, cols)
        cond = None
        keys = []
        if isinstance(on, str):
            keys = [on]
        elif isinstance(on, list):
            keys = list(on)
        else:
            cond = on
        out = []
        used = []
        for i in range(len(other._data)):
            used.append(False)
        for a in self._data:
            matches = []
            for i in range(len(other._data)):
                b = other._data[i]
                ok = False
                if cond is not None:
                    ok = bool(_value(cond, _merge(a, b)))
                else:
                    ok = True
                    for k in keys:
                        if a.get(k) != b.get(k):
                            ok = False
                if ok:
                    matches.append(i)
                    used[i] = True
            if len(matches) > 0:
                for i in matches:
                    out.append(_merge(a, other._data[i]))
            elif h == "left" or h == "full":
                out.append(_merge(a, None))
        if h == "right" or h == "full":
            for i in range(len(other._data)):
                if not used[i]:
                    out.append(_merge(None, other._data[i]))
        return DataFrame(out, cols)

    def union(self, other):
        return DataFrame(list(self._data) + list(other._data), self._columns)

    def unionByName(self, other, allowMissingColumns=False):
        return self.union(other)

    def unionAll(self, other):
        return self.union(other)

    def intersect(self, other):
        other_keys = []
        for r in other._data:
            other_keys.append(_row_key(r, other._columns))
        out = []
        seen = []
        for r in self._data:
            k = _row_key(r, self._columns)
            if k in other_keys and k not in seen:
                seen.append(k)
                out.append(r)
        return DataFrame(out, self._columns)

    def subtract(self, other):
        other_keys = []
        for r in other._data:
            other_keys.append(_row_key(r, other._columns))
        out = []
        seen = []
        for r in self._data:
            k = _row_key(r, self._columns)
            if k not in other_keys and k not in seen:
                seen.append(k)
                out.append(r)
        return DataFrame(out, self._columns)

    def groupBy(self, *cols):
        if len(cols) == 1 and isinstance(cols[0], list):
            cols = tuple(cols[0])
        return GroupedData(self._data, cols)

    def agg(self, *exprs):
        specs = []
        names = []
        for e in exprs:
            if isinstance(e, dict):
                for f in e:
                    c = functions._resolve(e[f], f)
                    specs.append(c._aggfn)
                    names.append(c.label)
            elif isinstance(e, Column) and e._aggfn is not None:
                specs.append(e._aggfn)
                names.append(e.label if e.label is not None else "agg")
        row = {}
        for i in range(len(specs)):
            row[names[i]] = specs[i](self._data)
        return DataFrame([row], names)

    def describe(self, *cols):
        if len(cols) == 0:
            cols = tuple(self._columns)
        names = ["summary"]
        for c in cols:
            names.append(c)
        out = []
        for kind in ["count", "mean", "stddev", "min", "max"]:
            row = {"summary": kind}
            for c in cols:
                row[c] = _stat(self._data, c, kind)
            out.append(row)
        return DataFrame(out, names)

    def printSchema(self):
        print("root")
        for c in self._columns:
            val = None
            for r in self._data:
                if r.get(c) is not None:
                    val = r.get(c)
                    break
            print(" |-- %s: %s" % (c, _typeof(val)))

    def fillna(self, value):
        out = []
        for r in self._data:
            nr = _copy(r)
            for c in self._columns:
                if nr.get(c) is None:
                    if isinstance(value, dict):
                        if c in value:
                            nr[c] = value[c]
                    else:
                        nr[c] = value
            out.append(nr)
        return DataFrame(out, self._columns)

    def dropna(self, subset=None, how="any"):
        keycols = list(subset) if subset else list(self._columns)
        out = []
        for r in self._data:
            missing = 0
            for c in keycols:
                if r.get(c) is None:
                    missing = missing + 1
            if how == "all":
                if missing < len(keycols):
                    out.append(r)
            else:
                if missing == 0:
                    out.append(r)
        return DataFrame(out, self._columns)

    def cache(self):
        return self

    def persist(self, *args, **kwargs):
        return self

    def unpersist(self):
        return self

    def repartition(self, *args):
        return self

    def coalesce(self, n):
        return self

    def createOrReplaceTempView(self, name):
        return None

    def createTempView(self, name):
        return None

    def registerTempTable(self, name):
        return None


class _Spark:
    def createDataFrame(self, data, schema=None):
        rows = list(data) if data else []
        if len(rows) > 0 and not isinstance(rows[0], dict):
            names = []
            if isinstance(schema, (list, tuple)):
                names = list(schema)
            else:
                for i in range(len(rows[0])):
                    names.append("col%d" % (i + 1))
            out = []
            for r in rows:
                d = {}
                for i in range(len(names)):
                    if i < len(r):
                        d[names[i]] = r[i]
                out.append(d)
            return DataFrame(out, names)
        if isinstance(schema, (list, tuple)):
            return DataFrame(rows, list(schema))
        return DataFrame(rows)

    def range(self, start, end=None, step=1):
        if end is None:
            end = start
            start = 0
        out = []
        v = start
        while v < end:
            out.append({"id": v})
            v = v + step
        return DataFrame(out, ["id"])


F = functions


def display(dataframe):
    dataframe.show()


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

  var editor = null;
  if (typeof CodeMirror !== 'undefined') {
    try {
      editor = CodeMirror(document.getElementById('editor'), {
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
    } catch (e) {
      editor = null;
    }
  }

  if (!editor) {
    // fallback editável caso o CodeMirror não inicialize
    var host = document.getElementById('editor');
    var textarea = document.createElement('textarea');
    textarea.id = 'fallback';
    textarea.spellcheck = false;
    textarea.value = INITIAL_CODE;
    host.appendChild(textarea);
  }

  function getCode() {
    if (editor) return editor.getValue();
    var ta = document.getElementById('fallback');
    return ta ? ta.value : '';
  }

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
    var userCode = getCode();
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
  <style>${CODEMIRROR_CSS}</style>
  <style>${THEME_CSS}</style>
</head>
<body>
  <div id="editor"></div>
${scriptTags}
</body>
</html>
`;
