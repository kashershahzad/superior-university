import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  Platform,
} from "react-native";

import ImageFast from "./ImageFast";

import { COLORS } from "../utils/COLORS";

const { width, height } = Dimensions.get("window");

const FocusAwareStatusBar = (props) => {
  const isFocused = useIsFocused();
  return isFocused ? <StatusBar {...props} /> : null;
};

const ScreenWrapper = ({
  children,
  statusBarColor = COLORS.mainBg,
  translucent = false,
  scrollEnabled = false,
  backgroundImage,
  backgroundColor = COLORS.mainBg,
  headerUnScrollable = () => null,
  footerUnScrollable = () => null,
  barStyle = "dark-content",
  refreshControl,
  paddingBottom,
  nestedScrollEnabled,
  paddingHorizontal = 16,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = translucent ? insets.top : Platform.OS === "ios" ? insets.top : 0;

  const content = () => {
    return (
      <View
        style={[
          styles.container,
          {
            paddingBottom: paddingBottom
              ? paddingBottom
              : Platform.OS == "android"
              ? 0
              : 20,
            backgroundColor: backgroundImage ? "transparent" : backgroundColor,
          },
        ]}
      >
        <FocusAwareStatusBar
          barStyle={barStyle}
          backgroundColor={translucent ? "transparent" : statusBarColor}
          translucent={translucent}
        />
        <View style={[styles.container, { paddingTop: topInset }]}>
          {headerUnScrollable()}

          {scrollEnabled ? (
            <KeyboardAwareScrollView
              nestedScrollEnabled={nestedScrollEnabled}
              refreshControl={refreshControl}
              style={[
                styles.container,
                {
                  backgroundColor,
                  paddingHorizontal,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </KeyboardAwareScrollView>
          ) : (
            <View style={{ paddingHorizontal, flex: 1 }}>{children}</View>
          )}
          {footerUnScrollable()}
        </View>
      </View>
    );
  };
  return backgroundImage ? (
    <View style={{ width, height: height + 70, zIndex: 999 }}>
      {content()}
      <ImageFast
        source={backgroundImage}
        style={{
          width,
          height: height + 70,
          position: "absolute",
          zIndex: -1,
        }}
        resizeMode="cover"
      />
    </View>
  ) : (
    content()
  );
};

export default ScreenWrapper;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
