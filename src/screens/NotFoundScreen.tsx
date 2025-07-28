import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View>
      <Text style={styles.title}>Screen Not Found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
});
