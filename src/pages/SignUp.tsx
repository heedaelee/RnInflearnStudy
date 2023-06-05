import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Text, View} from 'react-native';
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
