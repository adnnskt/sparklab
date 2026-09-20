import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const ORANGE = '#FF9600';
const ORANGE_LIGHT = '#FFC266';
const BG = '#1A1D22';
const CIRCLE_BG = '#2A2E37';
const CIRCLE_BORDER = '#3A3F4D';
const CIRCLE_LOCKED = '#1E2127';

const SKILL_TREE = [
  { id: '1', title: 'Sintaxe & Tipos', status: 'completed', route: '/(exercises)/theory' },
  { id: '2', title: 'Variáveis & Val/Var', status: 'completed' },
  { id: '3', title: 'Classes & Objetos', status: 'active' },
  { id: '4', title: 'Funções & Lambdas', status: 'locked' },
  { id: '5', title: 'Métodos Avançados', status: 'locked' },
];

function SkillNode({ node, index, isLast }) {
  const router = useRouter();
  const isCompleted = node.status === 'completed';
  const isActive = node.status === 'active';
  const isLocked = node.status === 'locked';
  const hasRoute = !!node.route;

  return (
    <View style={styles.nodeRow}>
      {/* Linha conectora */}
      <View style={styles.nodeColumn}>
        <View style={[styles.line, isLast && styles.lineHidden]} />
      </View>

      {/* Círculo */}
      <View style={styles.nodeColumn}>
        <TouchableOpacity
          style={[
            styles.circle,
            isCompleted && styles.circleCompleted,
            isActive && styles.circleActive,
            isLocked && styles.circleLocked,
          ]}
          disabled={isLocked || !hasRoute}
          activeOpacity={0.7}
          onPress={() => hasRoute && router.push(node.route)}>
          <Text style={[
            styles.circleNumber,
            isCompleted && styles.circleNumberLight,
            isActive && styles.circleNumberLight,
          ]}>
            {index + 1}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Título */}
      <View style={styles.titleColumn}>
        <Text style={[styles.nodeTitle, isLocked && styles.textLocked]}>
          {node.title}
        </Text>
        {isCompleted && <Text style={styles.checkMark}>✓</Text>}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SparkLab</Text>
            <Text style={styles.headerSubtitle}>trilha de spark</Text>
          </View>

          <View style={styles.trail}>
            {SKILL_TREE.map((node, index) => (
              <SkillNode
                key={node.id}
                node={node}
                index={index}
                isLast={index === SKILL_TREE.length - 1}
              />
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
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  trail: {
    paddingLeft: 24,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 40,
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: ORANGE,
  },
  lineHidden: {
    backgroundColor: 'transparent',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CIRCLE_BG,
    borderWidth: 2,
    borderColor: CIRCLE_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  circleActive: {
    backgroundColor: CIRCLE_BG,
    borderColor: ORANGE,
  },
  circleLocked: {
    backgroundColor: CIRCLE_LOCKED,
    borderColor: '#252830',
  },
  circleNumber: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  circleNumberLight: {
    color: '#FFFFFF',
  },
  titleColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingVertical: 12,
  },
  nodeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  textLocked: {
    color: '#4B5563',
  },
  checkMark: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
});
