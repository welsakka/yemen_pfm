import React from "react";
import { View, Text, TextInput, Button } from "react-native";
import SendSMS from 'react-native-sms'

class App extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            name: "",
            favColor: "",
            address: "",
            messageOutput: {
                text: "",
                style: {
                    color: "black"
                }
            }
        }
    }

    changeName = (text) => {
        this.setState({
            name: text
        })
    }

    changeFavColor = (text) => {
        this.setState({
            favColor: text
        })
    }

    changeAddress = (text) => {
        this.setState({
            address: text
        })
    }

    showText = () => {
        if(this.state.name === "") {
            this.setState({
                messageOutput: {
                    text: "Please input a name",
                    style: {
                        color: "red"
                    }
                }})
        }
        else if(this.state.favColor === "") {
            this.setState({
                messageOutput: {
                    text: "Please input a favorite color",
                    style: {
                        color: "red"
                    }
                }})
        }
        else if(this.state.address === "") {
            this.setState({
                messageOutput: {
                    text: "Please input an address",
                    style: {
                        color: "red"
                    }
                }})
        }
        else {
            this.setState({
                messageOutput: {
                    text: "name: " + this.state.name + ", color: " + this.state.favColor + ", address: " + this.state.address,
                    style: {
                        color: "black"
                    }
                }})
        }
    }

    someFunction() {
        SendSMS.send({
            body: 'The default body of the SMS!',
            recipients: [''],
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true
        }, (completed, cancelled, error) => {
     
            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
     
        });
    }

    render(){
        return(
            <View>
                <Text style={{color: "skyblue" ,fontSize: 50, justifyContent: "center"}}>Input your info</Text>
                <TextInput placeholder="enter your name" onChangeText={this.changeName}></TextInput>
                <TextInput placeholder="enter your favorite color" onChangeText={this.changeFavColor}></TextInput>
                <TextInput placeholder="enter your address" onChangeText={this.changeAddress}></TextInput>
                <Button
                color="skyblue"
                title="See results"
                onPress={this.someFunction}></Button>
                <Text style={this.state.messageOutput.style}>{this.state.messageOutput.text}</Text>
            </View>
        )
    }
}

export default App