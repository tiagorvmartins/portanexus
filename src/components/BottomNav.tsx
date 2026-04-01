import { View, Pressable, Text, StyleSheet } from "react-native"
import { Layers, Box, Activity, Boxes, Settings, SquareChartGantt, Cpu, Workflow } from "lucide-react-native"
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from 'src/store/useEndpoints';
import { useRoute } from '@react-navigation/native';
interface BottomNavProps {
  activeTab: "Dashboard" | "Containers" | "Stacks" | "Settings"
}

export function BottomNav({navigation, activeTab, isSwarm} : any) {
    const { theme } = useAuth()
    const { endpoints, selectedEndpointId } = useEndpoints();
    const route = useRoute();
    const styles = createStyles(theme);
    
    // Get current route name from navigation - use route.name first, fallback to activeTab prop
    const currentRouteName = route?.name || activeTab;
    const effectiveActiveTab = currentRouteName || activeTab;

    let endpointSelectedType = "docker"
    const selectedEndpoint = endpoints?.find(p => Number(p.Id) === selectedEndpointId);
    if (selectedEndpoint?.IsSwarm) {
        endpointSelectedType = "swarm"
    }

    const tabsDockerType = [
        { id: "Dashboard" as const, label: "Dashboard", icon: Activity },
        { id: "Containers" as const, label: "Containers", icon: Box },
        { id: "Stacks" as const, label: "Stacks", icon: Layers },
        { id: "Settings" as const, label: "Settings", icon: Settings },
    ]

    const tabsDockerSwarmType = [
        { id: "Dashboard" as const, label: "Dashboard", icon: Activity },
        { id: "Cluster" as const, label: "Cluster", icon: Boxes },
        { id: "Nodes" as const, label: "Nodes", icon: Cpu },
        { id: "Services" as const, label: "Services", icon: SquareChartGantt },
        { id: "Tasks" as const, label: "Tasks", icon: Workflow },
        { id: "Containers" as const, label: "Containers", icon: Box },
        { id: "Stacks" as const, label: "Stacks", icon: Layers },
        { id: "Settings" as const, label: "Settings", icon: Settings },
    ]


    let tabs = []
    if (endpointSelectedType === 'docker') {
      tabs = tabsDockerType
    } else {
      tabs = tabsDockerSwarmType
    }
    
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = effectiveActiveTab === tab.id

            return (
              <Pressable
                key={tab.id}
                onPress={() => navigation.navigate(tab.id)}
                style={[styles.tab, isActive && styles.activeTab]}
              >
                <Icon width={20} height={20} color={theme === 'dark' ? "white" : "black"} />
                <Text style={styles.label}>{tab.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    )
}

const createStyles = (theme: string) => {
  return StyleSheet.create({
      container: {
        borderTopWidth: 1,
        position: 'relative',
        paddingTop: 6,
        paddingBottom: 16,
        backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
        borderTopColor: theme === 'dark' ? '#444' : '#ccc',
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingVertical: 2,
      },
      tab: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 2,
        color: "#FFFFFF"
      },
      activeTab: {
        backgroundColor: "#05E6F2",
      },
      label: {
        fontSize: 12,
        marginTop: 4,
        color: theme === 'dark' ? '#FFF' : '#000'
      },
    })
}