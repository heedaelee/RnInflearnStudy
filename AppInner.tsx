import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Alert} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import useSocket from './src/hooks/useSocket';
import Delivery from './src/pages/Delivery';
import Orders from './src/pages/Orders';
import Settings from './src/pages/Settings';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import orderSlice from './src/slices/order';
import userSlice from './src/slices/user';
import {useAppDispatch} from './src/store';
import {RootState} from './src/store/reducer';

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined;
  Delivery: undefined;
  Complete: {orderId: string};
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppInner() {
  const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
  const dispatch = useAppDispatch();
  const [socket, disconnect] = useSocket();

  useEffect(() => {
    const callback = (data: any) => {
      console.log(data);
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      socket.emit('acceptOrder', 'hello');
      socket.on('order', callback);
    }
    return () => {
      if (socket) {
        socket.off('order', callback);
      }
    };
  }, [dispatch, isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('!isLoggedIn', !isLoggedIn);
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

  // 앱 실행 시 토큰 있으면 로그인하는 코드
  useEffect(() => {
    const getTokenAndRefresh = async () => {
      try {
        const token = await EncryptedStorage.getItem('refreshToken');
        if (!token) {
          SplashScreen.hide();
          return;
        }
        const response = await axios.post(
          `${Config.API_URL}/refreshToken`,
          {},
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken,
          }),
        );
      } catch (error) {
        console.error(error);
        if ((error as AxiosError).response?.data.code === 'expired') {
          Alert.alert('알림', '다시 로그인 해주세요.');
        }
      } finally {
        SplashScreen.hide();
      }
    };
    getTokenAndRefresh();
  }, [dispatch]);

  useEffect(() => {
    axios.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const {
          config,
          response: {status},
        } = error;

        if (status === 419) {
          if (error.response.data.code === 'expired') {
            const originalRequest = config;
            const refreshToken = await EncryptedStorage.getItem('refreshToken');
            // token refresh 요청
            const {data} = await axios.post(
              `${Config.API_URL}/refreshToken`, // token refresh api
              {},
              {headers: {authorization: `Bearer ${refreshToken}`}},
            );
            // 새로운 토큰 저장
            dispatch(userSlice.actions.setAccessToken(data.data.accesToken));
            originalRequest.headers.authorization = `Bearer ${data.data.accessToken}`;
            //419로 요청 실패했던 요청 새로운 토큰으로 재요청
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      },
    );
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Orders"
            component={Orders}
            options={{
              title: '오더 목록',
              tabBarIcon: () => <FontAwesome5Icon name="list" size={20} />,
            }}
          />
          <Tab.Screen
            name="Delivery"
            component={Delivery}
            options={{
              headerShown: false,
              tabBarIcon: () => <FontAwesome5Icon name="map" size={20} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              title: '내 정보',
              unmountOnBlur: true,
              tabBarIcon: () => <FontAwesomeIcon name="gear" size={20} />,
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '로그인'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '회원가입'}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default AppInner;
