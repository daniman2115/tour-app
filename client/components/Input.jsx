import { TextInput, View } from "react-native";

const Input = ({placeholder}) => {
  return (
    <View>
      <TextInput
        placeholder={placeholder}
        className="py-[14px]  text-lg bg-gray-100 rounded-md mb-4 h-14 pl-8"
      ></TextInput>
    </View>
  );
};

export default Input;
