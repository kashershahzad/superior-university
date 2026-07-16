import { StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import React from "react";
import { BlurView } from "@react-native-community/blur";
import { View } from "react-native";

const CustomModal = ({
  isVisible,
  transparent = true,
  onDisable,
  backdropOpacity,
  mainMargin,
  marginTop,
  marginBottom,
  marginVertical,
  marginHorizontal,
  borderRadius,
  overflow,
  children,
  isChange,
  animationIn = "fadeIn",
  animationOut = "fadeOut",
  statusBarTranslucent = false,
  withBlur = false,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn={animationIn}
      animationOut={animationOut}
      transparent={transparent}
      onBackdropPress={onDisable}
      onBackButtonPress={onDisable}
      onDismiss={onDisable}
      backdropOpacity={backdropOpacity || 0.6}
      statusBarTranslucent={statusBarTranslucent}
      style={[
        {
          margin: mainMargin,
          marginTop,
          marginBottom,
          marginVertical,
          marginHorizontal,
          borderRadius,
          overflow,
        },
      ]}
      customBackdrop={
        withBlur ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={onDisable}
            style={StyleSheet.absoluteFill}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={15}
              overlayColor="#2D2D2D"
              reducedTransparencyFallbackColor="rgba(24, 24, 24, 0.6)"
            />
            <View style={styles.blurTint} />
          </TouchableOpacity>
        ) : undefined
      }
    >
      <TouchableOpacity
        style={isChange ? styles.mainContainer1 : styles.mainContainer}
        activeOpacity={1}
        onPress={onDisable}
      >
        <TouchableOpacity style={styles.container} activeOpacity={1}>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer1: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  container: {
    width: "100%",
  },
  blurTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
