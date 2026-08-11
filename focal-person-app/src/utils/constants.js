import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionsAndroid, Platform} from 'react-native';
import axios from 'axios';

import {setUserData} from '../store/reducer/usersSlice';
import {ToastMessage} from './ToastMessage';
import {get, put} from '../services/ApiRequest';
import {endPoints} from '../services/ENV';

export const regEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const passwordRegex =
  /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

export const uploadAndGetUrl = async file => {
  try {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', {
      uri: file.path || file.fileCopyUri || '',
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    const res = await axios.post(
      `${endPoints.BASE_URL}image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      },
    );

    // console.log('res----', res.data?.image);
    return res?.data?.image;
  } catch (err) {
    console.log('=======er', err);
    ToastMessage('Upload Again');
  }
};

export const getProfile = () => async dispatch => {
  try {
    const response = await get('users/me');
    dispatch(setUserData(response.data?.user));
  } catch (error) {}
};
