import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mapeamento dos módulos da trilha com ícones vetoriais limpos
const SKILL_TREE = [
  { id: '1', title: 'Sintaxe & Tipos', icon: 'code-braces', library: 'MaterialCommunityIcons', status: 'completed' },
  { id: '2', title: 'Variáveis & Val/Var', icon: 'variable', library: 'Octicons', status: 'completed' },
  { id: '3', title: 'Classes & Objetos', icon: 'cube-outline', library: 'MaterialCommunityIcons', status: 'active' },
  { id: '4', title: 'Funções & Lambdas', icon: 'function-variant', library: 'MaterialCommunityIcons', status: 'locked' },
  { id: '5', title: 'Métodos Avançados', icon: 'code', library: 'Feather', status: 'locked' },
];

function SkillNode({ node }) {
  const isCompleted = node.status === 'completed';
  const isActive = node.status === 'active';
  const isLocked = node.status === 'locked';

  return (
    <View style={styles.nodeWrapper}>
      <TouchableOpacity 
        style={[
          styles.circleNode, 
          isActive && styles.circleActive,
          isCompleted && styles.circleCompleted,
          isLocked && styles.circleLocked
        ]}
        disabled={isLocked}
      >
        {/* Renderiza o ícone de acordo com o estado do nó */}
        {isLocked ? (
          <Feather name="lock" size={28} color="#6B7280" />
        ) : (
          <MaterialCommunityIcons 
            name={node.icon} 
            size={32} 
            color={isActive || isCompleted ? '#FFFFFF' : '#FF9600'} 
          />
        )}
      </TouchableOpacity>
      
      <Text style={[styles.nodeTitle, isLocked && styles.textLocked]}>
        {node.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nodeWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  circleNode: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#23272F',
    borderWidth: 4,
    borderColor: '#3A3F4D',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra estilo botão 3D do Duolingo
    borderBottomWidth: 8,
  },
  circleCompleted: {
    backgroundColor: '#E07F00',
    borderColor: '#FF9600',
    borderBottomColor: '#B36500',
  },
  circleActive: {
    backgroundColor: '#FF9600',
    borderColor: '#FFC266',
    borderBottomColor: '#E07F00',
  },
  circleLocked: {
    backgroundColor: '#1A1D22',
    borderColor: '#2D323C',
    borderBottomColor: '#101216',
  },
  nodeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  textLocked: {
    color: '#6B7280',
  },
});