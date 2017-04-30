/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    TouchableOpacity,
    AsyncStorage,
    Image,
    Text,
    View
} from 'react-native';


export default class Account extends Component {

    render() {
        return (
            <View style={styles.container}>
                <Text>Account</Text>
            </View>
            )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },


});

