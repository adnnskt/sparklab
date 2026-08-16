# SparkLab — Documentação do Projeto

Aplicativo mobile desenvolvido com **React Native + Expo** (SDK 57), escrito em **TypeScript**, com navegação por abas baseada em rotas de arquivos (**Expo Router**).

---

## 1. Estrutura de Pastas

### Raiz do projeto

| Pasta / Arquivo            | Finalidade |
| -------------------------- | ---------- |
| `src/`                     | Todo o código-fonte da aplicação. |
| `assets/`                  | Recursos estáticos: imagens (`icon.png`, `splash-icon.png`, ícones adaptativos do Android, favicon, etc.). |
| `scripts/`                 | Scripts utilitários do template, como `reset-project.js` (apaga o código de exemplo para começar do zero). |
| `app.json`                 | Configuração central do Expo: nome, slug, ícones, scheme, plugins (`expo-router`, `expo-splash-screen`), experimentos. |
| `package.json`             | Lista de dependências do projeto e scripts de execução (`start`, `android`, `ios`, `web`, `lint`). |
| `package-lock.json`        | Trava as versões exatas de todas as dependências instaladas. |
| `tsconfig.json`            | Configuração do TypeScript (caminhos, JSX, strict mode). |
| `.gitignore`               | Arquivos ignorados pelo Git (node_modules, .expo, etc.). |
| `expo-env.d.ts`            | Tipos gerados automaticamente para as rotas tipadas do Expo Router. |
| `node_modules/`            | Dependências instaladas pelo npm (gerado, não versionar). |
| `.expo/`                   | Cache e configurações locais do Expo (gerado, não versionar). |
| `.vscode/`                 | Configurações do editor VS Code para o projeto. |
| `.claude/` / `CLAUDE.md` / `AGENTS.md` | Instruções de contexto para assistentes de IA (ex.: documentação do Expo). |

### `src/`

| Pasta / Arquivo      | Finalidade |
| -------------------- | ---------- |
| `src/app/`           | Rotas da aplicação (file-based routing do Expo Router). Cada arquivo aqui é uma tela: `index.tsx` (tela inicial), `explore.tsx` e `_layout.tsx` (layout raiz com tema e tabs). |
| `src/components/`    | Componentes reutilizáveis de UI: textos/telas temáticas, ícones animados, links externos, tabs da navegação, etc. |
| `src/components/ui/` | Componentes de UI específicos, como `collapsible.tsx`. |
| `src/hooks/`         | Hooks customizados, ex.: `use-color-scheme` (detecta tema claro/escuro) e `use-theme`. |
| `src/constants/`     | Constantes do projeto, ex.: `theme.ts` (cores e estilo do tema). |
| `src/global.css`     | Estilos globais (usados na versão web). |

> A estrutura usa o padrão **file-based routing**: criar um arquivo dentro de `src/app/` cria automaticamente uma rota/página.

---

## 2. Tecnologias Utilizadas

### Plataforma e linguagem

| Tecnologia | Problema que resolve |
| ---------- | -------------------- |
| **React Native** (0.86) | Permite criar apps nativos para Android e iOS usando JavaScript/React, sem precisar escrever código nativo separado para cada plataforma. |
| **TypeScript** (6.0) | Adiciona tipagem estática ao JavaScript, prevenindo erros de tipo em tempo de desenvolvimento e melhorando autocompletar/manutenção. |
| **React** (19.2) | Biblioteca base para construir interfaces reativas por componentes. |

### Framework Expo

| Tecnologia | Problema que resolve |
| ---------- | -------------------- |
| **Expo** (SDK 57) | Conjunto de ferramentas que simplifica todo o ciclo de vida do app: build, configuração de módulos nativos, atualizações OTA e rodar no dispositivo sem configurar Android Studio/Xcode na mão. |
| **Expo Router** | Navegação **baseada em arquivos** — o sistema de telas é definido pela estrutura de pastas, eliminando a configuração manual de stacks/tabs de navegação. |
| **Expo Splash Screen** | Controla a tela de abertura do app (mantém exibida até a interface carregar). |
| **Expo Status Bar** | Gerencia a barra de status do sistema em conformidade com o tema. |
| **Expo Font / Image / Symbols / Glass Effect / Web Browser / Linking / Constants / Device / System UI** | APIs prontas para fontes, imagens otimizadas, ícones de sistema (SF Symbols), efeito vidro, abrir links no navegador, deep linking, informações do dispositivo e tema do sistema — sem código nativo manual. |

### Complementos de UI e navegação

| Tecnologia | Problema que resolve |
| ---------- | -------------------- |
| **react-native-safe-area-context** | Garante que o conteúdo não fique atrás de *notches* ou barras de navegação do aparelho. |
| **react-native-screens** | Otimiza a navegação nativa (menos consumo de memória/processamento ao alternar telas). |
| **react-native-gesture-handler** | Torna gestos (swipe, tap, etc.) nativos e fluidos. |
| **react-native-reanimated** | Animações de alto desempenho executadas na thread nativa. |
| **react-native-web** | Permite que o mesmo código rode também no navegador (versão web). |
| **@expo/ui** | Componentes de interface nativos do iOS/Android expostos via Expo. |

---

## 3. Ambiente de Desenvolvimento

| Ferramenta | Versão | Finalidade |
| ---------- | ------ | ---------- |
| Node.js (via nvm) | v24 LTS | Runtime do JavaScript/npm. |
| npm | v11 | Gerenciador de pacotes. |
| JDK | 17 (OpenJDK) | Necessário para compilar o app Android. |
| Android SDK | `~/Android/Sdk` | Ferramentas de build e `adb` para rodar no Android. |
| Emulador Android | AVD `sparklab_avd` (Pixel 7) | Dispositivo virtual para testar o app. |
| Expo Go | app no celular | Alternativa para testar via QR code, sem emulador. |

### Scripts disponíveis (`package.json`)

| Comando            | O que faz |
| ------------------ | --------- |
| `npm start`        | Inicia o servidor de desenvolvimento do Expo. |
| `npm run android`  | Inicia e abre o app no emulador/dispositivo Android. |
| `npm run ios`      | Abre no simulador iOS (requer macOS). |
| `npm run web`      | Abre no navegador (via react-native-web). |
| `npm run lint`     | Roda o ESLint no projeto. |
| `npm run reset-project` | Remove o código de exemplo e cria uma base limpa. |

---

## 4. Como rodar

```bash
cd ~/react-native/sparklab
npm install          # primeira vez
npm run android      # emulador Android já configurado (sparklab_avd)
```

Ou, com o celular físico, instale o **Expo Go** e escaneie o QR code exibido pelo `npm start`.