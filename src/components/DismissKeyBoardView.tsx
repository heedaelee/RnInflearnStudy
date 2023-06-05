import React from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';
const DismissKeyboardView = ({children, ...props}) => (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <KeyboardAwareScrollView {...props} style={props.style}>
      {children}
    </KeyboardAwareScrollView>
  </TouchableWithoutFeedback>
);

export default DismissKeyboardView;
