import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
function SignUp({navigation}: SignUpScreenProps) {
  return (
    <View>
      <Text>회원가입페이지</Text>
    </View>
  );
}

export default SignUp;
