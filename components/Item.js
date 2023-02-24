import React from "react";
import { getMessage, getAllMessages } from "../utilities/datastorage/messages.js";
import { View, Text, FlatList, TouchableHighlight } from "react-native";

class Item extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <TouchableHighlight style={{
                padding: 20,
                backgroundColor: 'skyblue',
                outlineStyle: 'solid',
                outlineColor: 'green'
            }}
            onPress={console.log("Nice")}>
                <Text>{this.props.title}</Text>
            </TouchableHighlight>
        )
    }
}