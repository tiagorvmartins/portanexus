import { View, Pressable, Text, StyleSheet } from "react-native"
import { Layers, Server, Box, Activity, Slack as Stack } from "lucide-react-native"
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from 'src/store/useEndpoints';
interface BottomNavProps {
  activeTab: "Endpoints" | "Containers" | "Stacks" | "Settings"
}

export function BottomNav({navigation, activeTab, isSwarm} : any) {
    const { theme } = useAuth()
    const { endpoints, selectedEndpointId } = useEndpoints();
    const styles = createStyles(theme);

    let endpointSelectedType = "docker"
    if (endpoints && endpoints.length && selectedEndpointId && endpoints.find(p => p.Id === selectedEndpointId)?.Snapshots[0].Swarm) {
        endpointSelectedType = "swarm"
    }

    const tabsDockerType = [
        { id: "Endpoints" as const, label: "Endpoints", icon: Server },
        { id: "Containers" as const, label: "Containers", icon: Box },
        { id: "Stacks" as const, label: "Stacks", icon: Stack },
        { id: "Settings" as const, label: "Settings", icon: Activity },
    ]

    const tabsDockerSwarmType = [
        { id: "Endpoints" as const, label: "Endpoints", icon: Server },
        { id: "Cluster" as const, label: "Cluster", icon: Layers },
        { id: "Containers" as const, label: "Containers", icon: Box },
        { id: "Stacks" as const, label: "Stacks", icon: Stack },
        { id: "Settings" as const, label: "Settings", icon: Activity },
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
            const isActive = activeTab === tab.id

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