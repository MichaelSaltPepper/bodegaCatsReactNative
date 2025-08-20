import React, { useState } from "react";
import { Button, StyleSheet, Switch, View } from "react-native";

type DoubleSwitchProps = {
  onBothEnabled: () => void;
  title: string;
};

const DoubleSwitch: React.FC<DoubleSwitchProps> = ({
  onBothEnabled,
  title,
}) => {
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(false);

  const bothEnabled = switch1 && switch2;

  return (
    <View style={styles.container}>
      <View style={styles.switchRow}>
        <Switch value={switch1} onValueChange={setSwitch1} />
        <Switch value={switch2} onValueChange={setSwitch2} />
      </View>
      <Button
        title={title}
        onPress={onBothEnabled}
        disabled={!bothEnabled}
        color={bothEnabled ? "#007AFF" : "#aaa"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
    marginBottom: 20,
  },
});

export default DoubleSwitch;
