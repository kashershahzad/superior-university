import {StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import React, {useEffect} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import UploadImage from '../../../components/UploadImage';
import CustomText from '../../../components/CustomText';

import {setLocation} from '../../../store/reducer/usersSlice';
import GetLocation from '../../../utils/GetLocation';

const Home = () => {
  const dispatch = useDispatch();
  const locationData = GetLocation();
  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  return (
    <ScreenWrapper>
      <View>
        <Text>Home</Text>
        <UploadImage
          handleChange={async img => {
            console.log('==========img', img);
          }}
          renderButton={onPress => (
            <CustomText onPress={onPress} label="Open Camera & Gallery" />
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
