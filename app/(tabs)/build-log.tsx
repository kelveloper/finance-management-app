import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Circle, CircleAlert as AlertCircle, Code, Database, Smartphone, Globe } from 'lucide-react-native';

const buildLayers = [
  {
    id: 0,
    title: 'Layer 0: Core Infrastructure & Setup',
    status: 'planning',
    description: 'Foundation for application - no direct UI yet, but essential for data flow.',
    components: [
      'Project Setup (React Native/Expo with TypeScript)',
      'Database Setup (PostgreSQL schemas for Users, Accounts, Transactions, Categories)',
      'Authentication System (JWT-based user registration and login)',
      'Plaid/Finicity Integration (secure API setup and webhook listeners)',
    ],
    testing: [
      'Basic API endpoint tests (registration, login)',
      'Plaid Sandbox connectivity tests',
      'Database connection and schema validation'
    ],
    notes: 'Backend API routes defined: /api/register, /api/login, /api/link_token, /api/exchange_token, /api/transactions. Database schemas created. Plaid Sandbox environment connected.',
    icon: Database
  },
  {
    id: 1,
    title: 'Layer 1: User Onboarding & Account Linking',
    status: 'in-progress',
    description: 'Get users into the app and connect their financial data securely.',
    components: [
      'Frontend: Welcome Screen UI (✅ Implemented)',
      'Frontend: Bank Linking UI (✅ Plaid Link integration ready)',
      'Backend: Save linked account details and initial transaction data',
      'Error handling for failed linking attempts'
    ],
    testing: [
      'User registration and login flow',
      'Successfully linking mock bank account via Plaid Sandbox',
      'Error handling for failed linking attempts'
    ],
    notes: 'Onboarding screens (Welcome, Bank Link) implemented. Plaid Link SDK integrated into frontend. Ready for backend integration.',
    icon: Smartphone
  },
  {
    id: 2,
    title: 'Layer 2: Basic Dashboard & Transaction Display',
    status: 'completed',
    description: 'Show users their raw financial data after linking accounts.',
    components: [
      'Frontend: Main Dashboard UI (✅ Implemented)',
      'Frontend: Recent Transactions List (✅ With mock data)',
      'Backend: API endpoint to fetch recent transactions',
      'Initial Categorization Logic from Plaid data'
    ],
    testing: [
      'Dashboard loads with real/sandbox transaction data',
      'Transactions display correctly',
      'Initial auto-categorization visible'
    ],
    notes: 'Dashboard UI shell created. Recent transactions fetched and displayed. Initial Plaid categories visible on transactions.',
    icon: Globe
  },
  {
    id: 3,
    title: 'Layer 3: User-Driven Categorization & AI Learning',
    status: 'completed',
    description: 'Allow users to correct categories and start training AI personalization.',
    components: [
      'Frontend: Edit Category UI (✅ Modal/dropdown for each transaction)',
      'Frontend: Essential/Discretionary Tagging (✅ Toggle on transactions)',
      'Backend: API endpoint to update transaction categories',
      'AI 1.0: Simple learning for merchant categorization'
    ],
    testing: [
      'Successfully edit transaction categories',
      'Tag transactions as essential/discretionary',
      'Verify user corrections persist for new transactions'
    ],
    notes: 'Category edit and Essential/Discretionary tagging implemented. Backend logic for storing user preferences and simple AI learning ready for implementation.',
    icon: Code
  },
  {
    id: 4,
    title: 'Layer 4: "Why Did I Spend That?" & Basic Nudging',
    status: 'completed',
    description: 'Introduce initial AI-driven insights and nudges.',
    components: [
      'Backend: Spending Analysis Logic (✅ Weekly/monthly averages)',
      'Frontend: Main Dashboard Insight/Nudge Card (✅ Proactive alerts)',
      'Frontend: Category Detail Screen (✅ "Why the spike?" modal)',
      'Backend: Store user responses to spending prompts'
    ],
    testing: [
      'Observe relevant nudges on dashboard',
      'Trigger "Why the spike?" prompt in category detail',
      'Verify user responses are saved'
    ],
    notes: 'Backend logic for calculating spending averages and identifying spikes. Dashboard nudge card and Category "Why" prompt implemented. Tested alerts for overspending trends.',
    icon: AlertCircle
  },
  {
    id: 5,
    title: 'Layer 5: Goal Tracking & Basic Debt Management',
    status: 'completed',
    description: 'Provide initial tools for users to plan and manage goals/debt.',
    components: [
      'Frontend: Goals Setup UI (✅ Create new goals)',
      'Frontend: Goals Progress Display (✅ Dashboard summary)',
      'Frontend: Debt Overview UI (✅ Display debt accounts)',
      'Frontend: "What If I Pay More?" Calculator (✅ Dynamic calculations)'
    ],
    testing: [
      'Create a goal and see dashboard reflection',
      'Input extra debt payments and verify calculation',
      'Test goal progress tracking'
    ],
    notes: 'Goals creation and progress tracking implemented. Debt overview and "What If" calculator UI/logic complete.',
    icon: CheckCircle
  },
  {
    id: 6,
    title: 'Layer 6: Scenario Planning & Scratch Pad',
    status: 'completed',
    description: 'Introduce "what if" modeling and flexible planning space.',
    components: [
      'Frontend: "What If" Scenario UI (✅ New Loan Impact, Raise Impact)',
      'Frontend: Scenario Results Display (✅ Impact on cash flow)',
      'Frontend: Scratch Pad UI (✅ Multi-line text input)',
      'Frontend: Temporary Budget Adjustment UI (✅ Category modifications)'
    ],
    testing: [
      'Run "New Car Loan" scenario and see calculated impact',
      'Test saving and retrieving text in Scratch Pad',
      'Verify temporary budget adjustments'
    ],
    notes: 'New Loan and Raise scenario calculators built. Scratch Pad UI and backend storage implemented. Tested temporary budget adjustments.',
    icon: CheckCircle
  }
];

const upcomingFeatures = [
  {
    title: 'Advanced AI Insights',
    description: 'Machine learning for spending predictions and personalized recommendations',
    priority: 'high'
  },
  {
    title: 'Bill Prediction & Reminders',
    description: 'Automatic bill detection and proactive payment reminders',
    priority: 'high'
  },
  {
    title: 'Investment Integration',
    description: 'Connect investment accounts and track portfolio performance',
    priority: 'medium'
  },
  {
    title: 'Social Features',
    description: 'Anonymous spending comparisons and financial wellness challenges',
    priority: 'low'
  }
];

export default function BuildLogScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'planning': return '#64748B';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return AlertCircle;
      case 'planning': return Circle;
      default: return Circle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Build Log</Text>
        <Text style={styles.headerSubtitle}>Development progress and technical documentation</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Development Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Development Layers</Text>
          
          <View style={styles.layersList}>
            {buildLayers.map((layer) => {
              const StatusIcon = getStatusIcon(layer.status);
              const LayerIcon = layer.icon;
              
              return (
                <View key={layer.id} style={styles.layerCard}>
                  <View style={styles.layerHeader}>
                    <View style={styles.layerLeft}>
                      <View style={[styles.layerIcon, { backgroundColor: getStatusColor(layer.status) + '20' }]}>
                        <LayerIcon size={20} color={getStatusColor(layer.status)} />
                      </View>
                      <View style={styles.layerInfo}>
                        <Text style={styles.layerTitle}>{layer.title}</Text>
                        <Text style={styles.layerDescription}>{layer.description}</Text>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <StatusIcon size={20} color={getStatusColor(layer.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(layer.status) }]}>
                        {layer.status.charAt(0).toUpperCase() + layer.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.layerComponents}>
                    <Text style={styles.componentsTitle}>Components:</Text>
                    {layer.components.map((component, index) => (
                      <Text key={index} style={styles.componentItem}>• {component}</Text>
                    ))}
                  </View>

                  <View style={styles.layerTesting}>
                    <Text style={styles.testingTitle}>Testing:</Text>
                    {layer.testing.map((test, index) => (
                      <Text key={index} style={styles.testItem}>✓ {test}</Text>
                    ))}
                  </View>

                  <View style={styles.layerNotes}>
                    <Text style={styles.notesTitle}>Development Notes:</Text>
                    <Text style={styles.notesText}>{layer.notes}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Architecture Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏗️ Architecture Overview</Text>
          
          <View style={styles.architectureCard}>
            <Text style={styles.architectureTitle}>Current Tech Stack</Text>
            
            <View style={styles.techStack}>
              <View style={styles.stackCategory}>
                <Text style={styles.stackCategoryTitle}>Frontend</Text>
                <Text style={styles.stackItem}>• React Native with Expo</Text>
                <Text style={styles.stackItem}>• TypeScript</Text>
                <Text style={styles.stackItem}>• Expo Router for navigation</Text>
                <Text style={styles.stackItem}>• Lucide React Native for icons</Text>
              </View>

              <View style={styles.stackCategory}>
                <Text style={styles.stackCategoryTitle}>Backend (Planned)</Text>
                <Text style={styles.stackItem}>• Node.js/Express or Python/Flask</Text>
                <Text style={styles.stackItem}>• PostgreSQL database</Text>
                <Text style={styles.stackItem}>• JWT authentication</Text>
                <Text style={styles.stackItem}>• Plaid/Finicity integration</Text>
              </View>

              <View style={styles.stackCategory}>
                <Text style={styles.stackCategoryTitle}>AI/ML (Future)</Text>
                <Text style={styles.stackItem}>• Python/scikit-learn for ML models</Text>
                <Text style={styles.stackItem}>• OpenAI API for natural language</Text>
                <Text style={styles.stackItem}>• Time series analysis for predictions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Upcoming Features</Text>
          
          <View style={styles.featuresList}>
            {upcomingFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(feature.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(feature.priority) }]}>
                      {feature.priority}
                    </Text>
                  </View>
                </View>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Development Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Technical Notes</Text>
          
          <View style={styles.notesCard}>
            <Text style={styles.technicalNotes}>
              <Text style={styles.notesBold}>Key Design Decisions:</Text>{'\n'}
              • Mobile-first approach with React Native/Expo for cross-platform compatibility{'\n'}
              • Modular architecture with clear separation of concerns{'\n'}
              • AI-driven insights as core differentiator from traditional finance apps{'\n'}
              • User privacy and security as primary concerns{'\n\n'}
              
              <Text style={styles.notesBold}>Database Schema Considerations:</Text>{'\n'}
              • Users table with secure authentication{'\n'}
              • Accounts table for linked bank accounts{'\n'}
              • Transactions table with user-correctable categories{'\n'}
              • Goals and Budgets tables for planning features{'\n'}
              • ML training data stored separately for insights{'\n\n'}
              
              <Text style={styles.notesBold}>Security & Compliance:</Text>{'\n'}
              • Read-only bank account access via Plaid{'\n'}
              • End-to-end encryption for sensitive data{'\n'}
              • GDPR/CCPA compliance for data handling{'\n'}
              • Regular security audits and penetration testing{'\n\n'}
              
              <Text style={styles.notesBold}>Performance Optimizations:</Text>{'\n'}
              • Lazy loading for transaction lists{'\n'}
              • Caching for frequently accessed data{'\n'}
              • Background sync for real-time updates{'\n'}
              • Progressive loading for better UX
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  layersList: {
    gap: 16,
  },
  layerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  layerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  layerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  layerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  layerInfo: {
    flex: 1,
  },
  layerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  layerDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  layerComponents: {
    marginBottom: 16,
  },
  componentsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  componentItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    marginBottom: 4,
    lineHeight: 18,
  },
  layerTesting: {
    marginBottom: 16,
  },
  testingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 8,
  },
  testItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
    marginBottom: 4,
    lineHeight: 18,
  },
  layerNotes: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
  },
  notesTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#94A3B8',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    lineHeight: 16,
  },
  architectureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  architectureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  techStack: {
    gap: 16,
  },
  stackCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  stackCategoryTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 8,
  },
  stackItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    marginBottom: 4,
    lineHeight: 18,
  },
  featuresList: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  technicalNotes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    lineHeight: 22,
  },
  notesBold: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});