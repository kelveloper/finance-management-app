import { Tabs } from 'expo-router';
import { Chrome as Home, ChartPie as PieChart, Target, Calculator, FileText, Code } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111827', // Darker background
          borderTopColor: '#1F2937',
          height: 90,
        },
        tabBarActiveTintColor: '#34D399', // Brighter green for active
        tabBarInactiveTintColor: '#6B7280', // Muted grey for inactive
        tabBarShowLabel: false,
        tabBarIcon: ({ size, color, focused }) => {
          const icons: { [key: string]: React.ElementType } = {
            index: Home,
            categories: PieChart,
            goals: Target,
            scenarios: Calculator,
            scratchpad: FileText,
          };
          const Icon = icons[route.name];
          return <Icon size={focused ? size * 1.2 : size} color={color} />;
        },
        // Apply dark background to all screens in the layout
        sceneContainerStyle: {
            backgroundColor: '#111827'
        }
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
        }}
      />
      <Tabs.Screen
        name="scenarios"
        options={{
          title: 'What If',
        }}
      />
      <Tabs.Screen
        name="scratchpad"
        options={{
          title: 'Notes',
        }}
      />
    </Tabs>
  );
}