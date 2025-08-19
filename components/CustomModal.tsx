import React from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backgroundColor?: string; // optional custom background
};

const CustomModal = ({
  visible,
  onClose,
  children,
  backgroundColor,
}: CustomModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[
          styles.modalBackground,
          { backgroundColor: backgroundColor || "rgba(0,0,0,0.5)" },
        ]}
        onPress={onClose}
      >
        <View style={styles.modalContent}>{children}</View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: Dimensions.get("window").width * 0.9,
    maxHeight: Dimensions.get("window").height * 0.9,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
});

export default CustomModal;
