import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  LayoutAnimation,
  StyleSheet,
  ScrollView,
  UIManager,
  View,
} from "react-native";

import CustomText from "./CustomText";
import Icons from "./Icons";

import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const CustomDropdown = ({
  data,
  value,
  setValue,
  showIcon,
  placeholder,
  error,
  withLabel,
  borderColor = "#98A2B3",
  marginBottom = 20,
  iconName,
  iconFamily = "Feather",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setText(value || "");
  }, [value]);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const selectOption = (option) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (option?._id) {
      setValue(option);
      setText(option.title);
    } else {
      setValue(option);
      setText(option);
    }
    setIsOpen(false);
  };

  const displayText = text || value || placeholder;
  const hasValue = Boolean(text || value);

  return (
    <>
      {withLabel && (
        <CustomText
          label={withLabel}
          fontFamily={fonts.medium}
          marginBottom={8}
          color={COLORS.black}
        />
      )}
      <View
        style={[
          styles.dropdownMainContainer,
          {
            marginBottom: error ? 5 : marginBottom,
            borderColor: error ? COLORS.red : isOpen ? COLORS.primaryColor : borderColor,
            backgroundColor: "#FFFFFF",
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.container}
          onPress={toggleDropdown}
        >
          <View style={styles.leftContent}>
            {iconName ? (
              <Icons
                name={iconName}
                family={iconFamily}
                color={COLORS.primaryColor}
                size={20}
                style={styles.leftIcon}
              />
            ) : null}
            <CustomText
              label={displayText}
              fontFamily={fonts.regular}
              fontSize={14}
              color={hasValue ? COLORS.black : COLORS.inputLabel}
              textStyle={styles.valueText}
            />
          </View>
          {!showIcon ? (
            <Icons
              style={styles.chevron}
              family="Feather"
              name={isOpen ? "chevron-up" : "chevron-down"}
              color={COLORS.primaryColor}
              size={20}
            />
          ) : (
            <View />
          )}
        </TouchableOpacity>

        {isOpen && data?.length > 0 && (
          <View style={styles.listContainer}>
            <ScrollView
              scrollEnabled
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {data?.map((option, i) => {
                const label = option?._id ? option.title : option;
                const selected = hasValue && (text === label || value === label);

                return (
                  <TouchableOpacity
                    style={[styles.list, selected && styles.listSelected]}
                    key={option?._id || i}
                    onPress={() => selectOption(option)}
                  >
                    <CustomText
                      label={label}
                      fontSize={14}
                      fontFamily={selected ? fonts.semiBold : fonts.regular}
                      color={selected ? COLORS.primaryColor : COLORS.black}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
        />
      )}
    </>
  );
};

export default CustomDropdown;
const styles = StyleSheet.create({
  dropdownMainContainer: {
    width: "100%",
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    width: "100%",
    height: 58,
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 10,
  },
  valueText: {
    flex: 1,
  },
  chevron: {
    alignSelf: "center",
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: "#EAECF0",
    maxHeight: 140,
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  listSelected: {
    backgroundColor: "#F9F5FF",
  },
});
