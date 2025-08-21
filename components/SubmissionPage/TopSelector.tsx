import { Text, TouchableOpacity, View } from "react-native";
import { getStatusEmoji } from "../Utils/FrontEndContanstsAndUtils";
export const TopSelector = ({
  options,
  selected,
  setSelected,
}: {
  options: string[];
  selected: string;
  setSelected: (val: string) => void;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
      }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelected(option)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            backgroundColor: selected === option ? "#007AFF" : "#E0E0E0",
          }}
        >
          <Text
            style={{
              color: selected === option ? "white" : "black",
              fontWeight: "bold",
            }}
          >
            {option} {getStatusEmoji(option)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
