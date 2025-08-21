import { Text, View } from "react-native";
import CustomModal from "./CustomModal";
type UserHintProps = {
  setLocationHintModalVisible: (val: boolean) => void;
  locationHintModalVisible: boolean;
};

export const UserHint: React.FC<UserHintProps> = ({
  setLocationHintModalVisible,
  locationHintModalVisible,
}) => {
  return (
    <CustomModal
      visible={locationHintModalVisible}
      onClose={() => setLocationHintModalVisible(false)}
    >
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 5 }}>
          Tip from Whiskers!
        </Text>
        <View>
          <Text style={{ fontSize: 18 }}>☝️</Text>
          <Text style={{ fontSize: 18 }}>{" ".repeat(3)}\🐱</Text>
          <Text style={{ fontSize: 18 }}>{" ".repeat(5)} |\</Text>
          <Text style={{ fontSize: 18, marginBottom: 35 }}>
            {" ".repeat(5)}/\
          </Text>
        </View>
        <Text style={{ fontSize: 18 }}>
          Press and hold on the blue marker to drag it
        </Text>
      </View>
    </CustomModal>
  );
};
