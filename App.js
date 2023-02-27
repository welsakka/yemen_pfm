import React, { cloneElement } from "react";
import { View, Text, TextInput, Button, Image, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import SendSMS from 'react-native-sms'
import SmsAndroid from 'react-native-get-sms-android';
import {SERVER_PHONE_NUMBER, AES_PASSWORD, AES_SALT} from "@env";
import {putMessage, getAllMessages} from "./utilities/datastorage/messages.js";
import {NavigationContainer} from '@react-navigation/native';
import Notifications from "./components/Notifications.js"
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import bell from './static/bellOutline.png'
import bellBadge from './static/bellBadgeOutline.png'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateKey, encryptData } from "./utilities/encryption/encryption.js";
import { ListItem } from '@rneui/themed';
import { Dropdown } from "./components/Dropdown.js"


class Home extends React.Component{
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
            },
            newNotifications: false,
            output: ""
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
        console.log(text)
    }

    checkText = async () => {
        if(this.state.name === "") {
            this.setState({
                messageOutput: {
                    text: "Please input a name",
                    style: {
                        color: "red"
                    }
                }})
            throw new Error(this.state.messageOutput.text)
        }
        else if(this.state.favColor === "") {
            this.setState({
                messageOutput: {
                    text: "Please input a favorite color",
                    style: {
                        color: "red"
                    }
                }})
            throw new Error(this.state.messageOutput.text)
        }
        else if(this.state.address === "") {
            this.setState({
                messageOutput: {
                    text: "Please input an address",
                    style: {
                        color: "red"
                    }
                }})
            throw new Error(this.state.messageOutput.text)
        }
        else {
            this.setState({
                output: "|" +"name: " + this.state.name + ", color: " + this.state.favColor + ", address: " + this.state.address + "|"
            })
        }
    }

    //Function that constructs an SMS to send and opens the user's mobile app
    sendSMS = async () => {
        //call checkText, and if valid, proceed. Else, return null
        try {
            let check = await this.checkText()
            generateKey(AES_PASSWORD, AES_SALT, 5000, 256)
            .then(key => {
                console.log('Key:', key)
                encryptData(this.state.output, key)
                .then(({ cipher, iv }) => {
                    SendSMS.send({
                        body: cipher,
                        recipients: [SERVER_PHONE_NUMBER],
                        successTypes: ['sent', 'queued'],
                        allowAndroidSendWithoutReadPermission: true
                    }, (completed, cancelled, error) => {
                        console.log('SMS Callback: completed: ' + completed + ', cancelled: ' + cancelled + ', error: ' + error);
                    });
                });
            });
        } catch (e){
            console.log(e)
            return
        }
    }

    // Function makes use of a different package to read sms from an android device
    readSMS = (date) => {
        return new Promise( (resolve, reject) => {
            /* List SMS messages matching the filter */
            var filter = {
                box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
                minDate: date,
                address: "+15708013993", // sender's phone number

                /** the next 2 filters can be used for pagination **/
                indexFrom: 0, // start from index 0
                maxCount: 1, // count of SMS to return each time
            };
            
            SmsAndroid.list(JSON.stringify(filter), (fail) => {
                    console.log('Failed with this error: ' + fail);
                }, (count, smsList) => {
                        console.log('Count: ', count);
                        var arr = JSON.parse(smsList);
                        resolve(arr)
                    
                },
            );
        });
    }

    updateMessages = async () => {
        //Read all messages stored locally
        let storedMessages
        try {
            storedMessages = await getAllMessages()
        } catch (e) {
            console.log(e)
        }

        //Determine if there are any messages stored in device
        var date;
        if (storedMessages.length) {
            let latestMessage = storedMessages[storedMessages.length-1]
            date = latestMessage.date
        }
        else {
            date = null
        }
        //call readSMS() and capture array of new messages
        let newMessages;
        try {
            //date of lastest message should not be included in search
            if (date != null) {
                newMessages = await this.readSMS(date + 1) 
            }
            else{
                newMessages = await this.readSMS(date) 
            }
            
        } catch (e) {
            console.log(e)
        }
        //Merge stored and new messages if applicable, and modify style of new messages
        if (newMessages.length){
            this.setState({
                newNotifications: true
            })
            newMessages.forEach( (message) => {
                message["isRead"] = false
            })
            //merge stored and new messages, store in device, and update state
            let allMessages = storedMessages.concat(newMessages)
            allMessages.forEach( (element, index) => {
                putMessage(index, element)
            })
            this.setState({
                messages: allMessages
            })
        }
        else {
            this.setState({
                messages: storedMessages
            })
        }
    }

    handleNavigation = () => {
        this.setState({
            newNotifications: false
        })
        this.props.navigation.navigate('Notifications')
    }

    clearAll = async () => {
        try {
          await AsyncStorage.clear()
        } catch(e) {
          // clear error
        }
      
        console.log('Done.')
      }
    
    async componentDidMount(){
        await this.updateMessages()
        //await this.clearAll()

        //TO BE REPLACED
        //Replace with React event emitter and listener
        setInterval(this.updateMessages, 5000)
    }

    render() {
        let notificationButton
        if (this.state.newNotifications){
            notificationButton = <Image style={{width: 35, height: 35}} source={bellBadge} />
        }
        else {
            notificationButton = <Image style={{width: 35, height: 35}} source={bell}/>
        }

        return (
            <View
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: "white"
                }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                    <Text style={{ color: "skyblue", fontSize: 30 }}>Input your info</Text>
                    <TouchableOpacity
                        style={{ flex: 0.2, padding: 7 }}
                        onPress={this.handleNavigation}>
                            {notificationButton}
                    </TouchableOpacity>
                </View>
                <Dropdown label={"Organization"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Dropdown label={"Project"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Dropdown label={"Fund"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Dropdown label={"Chapter"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Dropdown label={"Part"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Dropdown label={"Type"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Dropdown label={"Item"} options={["1", "2", "3", "4"]} onSelect={this.changeAddress}/>
                <Button
                    color="skyblue"
                    title="See results"
                    onPress={this.sendSMS}></Button>
                <Text style={this.state.messageOutput.style}>{this.state.messageOutput.text}</Text>
            </View>
        )
    }
}

class App extends React.Component {
    constructor(props){
        super(props)
    }
    
    render(){
        const Stack = createNativeStackNavigator();
        return(
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        visable="false"
                        name="Home"
                        component={Home}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Notifications"
                        component={Notifications}
                        
                    />
                </Stack.Navigator>
            </NavigationContainer>
        )
    }
}

export default App