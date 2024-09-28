import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../hooks/useI18n";

export default function NotFoundScreen() {
  const i18n = useI18n();

  return (
    <View>
      <Text style={styles.title}>{i18n.t("core.errors.screenNotFound")}</Text>
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
