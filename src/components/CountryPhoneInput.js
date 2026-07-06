import PhoneInput from "react-native-phone-number-input";
import { StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";

import CustomText from "./CustomText";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CountryPhoneInput = ({
  value = "+92",
  setValue,
  withLabel,
  onEndEditing,
  error,
  borderColor = "#98A2B3",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef();
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  const inputBorderColor = error ? COLORS.red : isFocused ? "#98A2B3" : borderColor;
  const inputBackgroundColor = isFocused ? "#FAFAFA" : "#FFFFFF";

  return (
    <View style={{ marginBottom: error ? 0 : 20 }}>
      {withLabel && (
        <CustomText
          label={withLabel}
          fontFamily={fonts.medium}
          marginBottom={8}
          color={COLORS.inputLabel}
        />
      )}
      <PhoneInput
        ref={ref}
        defaultValue={value}
        defaultCode="PK"
        layout="second"
        flagSize={20}
        placeholder="Phone Number"
        textInputStyle={[
          styles.phoneInput,
          { backgroundColor: inputBackgroundColor },
        ]}
        textInputProps={{
          placeholderTextColor: COLORS.inputLabel,
          maxLength: 12,
          onFocus: handleFocus,
          onBlur: handleBlur,
          onEndEditing,
        }}
        flagButtonStyle={styles.flagButton}
        countryPickerButtonStyle={[
          styles.flagButton,
          { backgroundColor: inputBackgroundColor },
        ]}
        codeTextStyle={styles.codeText}
        containerStyle={[
          styles.phoneInputContainer,
          {
            borderColor: inputBorderColor,
            backgroundColor: inputBackgroundColor,
          },
        ]}
        textContainerStyle={[
          styles.textContainerStyle,
          { backgroundColor: inputBackgroundColor },
        ]}
        onChangeFormattedText={(formattedValue) => setValue(formattedValue)}
      />
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
          marginTop={5}
        />
      )}
    </View>
  );
};
export default CountryPhoneInput;
const styles = StyleSheet.create({
  phoneInput: {
    flex: 1,
    height: "100%",
    padding: 0,
    margin: 0,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: COLORS.black,
  },
  phoneInputContainer: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  flagButton: {
    width: 76,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 2,
  },
  textContainerStyle: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    paddingLeft: 4,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  codeText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: COLORS.black,
    marginRight: 4,
    marginLeft: 2,
  },
});
