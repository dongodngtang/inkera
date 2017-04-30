/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Platform,
    ListView,
    ActivityIndicator,
    RefreshControl,
    View,
    Image
} from 'react-native';


export default class List extends Component {



    render() {
        return (
            <View style={styles.container}>
                <Text>list</Text> 
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
  
});

