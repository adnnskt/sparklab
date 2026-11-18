import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Acento usado em textos e bordas finas (contraste ~7:1 sobre o fundo, ok para texto)
const ORANGE = '#F5820A';
// Preenchimento dos nós: laranja queimado, ~30% menos luminoso que o acento.
// Áreas grandes e chapadas em #F5820A ofuscam sobre #12151A.
const NODE_FILL = '#B86E12';
const NODE_FILL_RIM = '#D08C3F';
const NODE_FILL_DARK = '#7A470A';
const BG = '#12151A';
const CIRCLE_BG = '#1E232E';
const CIRCLE_BORDER = '#2D3545';
const CIRCLE_LOCKED = '#181C24';
const TEXT_PRIMARY = '#F3F4F6';
const TEXT_SECONDARY = '#9CA3AF';

// Trilha de lições, com ícone do MaterialCommunityIcons por nó
const SKILL_TREE = [
  { id: '1', title: 'Sintaxe & Tipos', icon: 'code-braces', status: 'completed', route: '/(exercises)/theory' },
  { id: '2', title: 'Variáveis & Val/Var', icon: 'variable', status: 'completed' },
  { id: '3', title: 'Classes & Objetos', icon: 'cube-outline', status: 'active' },
  { id: '4', title: 'Funções & Lambdas', icon: 'function-variant', status: 'locked' },
  { id: '5', title: 'Métodos Avançados', icon: 'code-tags', status: 'locked' },
  { id: '6', title: 'Streaming de Dados', icon: 'flash', status: 'locked' },
  { id: '7', title: 'Deploy em Nuvem', icon: 'cloud-outline', status: 'locked' },
];

// Deslocamento horizontal em zigue-zague (padrão Duolingo): curva senoidal
// suave ao longo da lista, com amplitude de 90px para cada lado do centro.
const getPositionOffset = (index) => Math.sin(index * 1.2) * 90;

function SkillNode({ node, index }) {
  const router = useRouter();
  const isCompleted = node.status === 'completed';
  const isActive = node.status === 'active';
  const isLocked = node.status === 'locked';
  const hasRoute = !!node.route;

  return (
    <View style={styles.nodeWrapper}>
      <View style={[styles.nodeCenterer, { transform: [{ translateX: getPositionOffset(index) }] }]}>
        <TouchableOpacity
          style={[
            styles.circleNode,
            isCompleted && styles.circleCompleted,
            isActive && styles.circleActive,
            isLocked && styles.circleLocked,
          ]}
          disabled={isLocked || !hasRoute}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={node.title}
          onPress={() => hasRoute && router.push(node.route)}>
          {isLocked ? (
            <Feather name="lock" size={24} color="#6B7280" />
          ) : isCompleted ? (
            <MaterialCommunityIcons name="check" size={28} color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons
              name={node.icon || 'code-braces'}
              size={28}
              color={isActive ? '#FFFFFF' : TEXT_SECONDARY}
            />
          )}
        </TouchableOpacity>

        <View style={[styles.titleBadge, isActive && styles.titleBadgeActive]}>
          <Text style={[styles.nodeTitle, isLocked && styles.textLocked]}>{node.title}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SparkLab</Text>
          <Text style={styles.headerSubtitle}>Trilha de Engenharia de Dados</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.trailContainer}>
            {SKILL_TREE.map((node, index) => (
              <SkillNode key={node.id} node={node} index={index} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: CIRCLE_BORDER,
    backgroundColor: BG,
    zIndex: 10,
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  scrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  trailContainer: {
    alignItems: 'center',
    width: '100%',
  },
  nodeWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 24,
  },
  nodeCenterer: {
    alignItems: 'center',
    width: 140,
  },
  circleNode: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: CIRCLE_BG,
    borderWidth: 3,
    borderColor: CIRCLE_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    // Profundidade 3D: borda inferior mais espessa e escura
    borderBottomWidth: 6,
    borderBottomColor: '#15181F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  circleCompleted: {
    backgroundColor: NODE_FILL,
    borderColor: NODE_FILL_RIM,
    borderBottomColor: NODE_FILL_DARK,
  },
  circleActive: {
    backgroundColor: NODE_FILL,
    borderColor: '#F3F4F6',
    borderBottomColor: NODE_FILL_DARK,
    transform: [{ scale: 1.08 }],
  },
  circleLocked: {
    backgroundColor: CIRCLE_LOCKED,
    borderColor: CIRCLE_BG,
    borderBottomColor: '#0D0F12',
  },
  titleBadge: {
    marginTop: 10,
    backgroundColor: CIRCLE_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CIRCLE_BORDER,
    maxWidth: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  titleBadgeActive: {
    borderColor: NODE_FILL_RIM,
    backgroundColor: '#1E222A',
  },
  nodeTitle: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  textLocked: {
    color: TEXT_SECONDARY,
    opacity: 0.7,
  },
});
