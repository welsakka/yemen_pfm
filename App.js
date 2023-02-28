import React, { cloneElement } from "react";
import { View, Text, TextInput, Button, Image, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from "react-native";
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
import { Dropdown } from "./components/Dropdown.js"
import { Header } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';

class Home extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            organization: "",
            project: "",
            fund: "",
            chapter: "",
            part: "",
            type: "",
            item: "",
            errorMsg: "",
            newNotifications: false,
            output: ""
        }
    }

    changeOrganization = (input) => { this.setState({ organization: input }) }
    changeProject = (input) => { this.setState({ project: input }) }
    changeFund = (input) => { this.setState({ fund: input }) }
    changeChapter = (input) => { this.setState({ chapter: input }) }
    changePart = (input) => { this.setState({ part: input }) }
    changeType = (input) => { this.setState({ type: input }) }
    changeItem = (input) => { this.setState({ item: input }) }

    checkInput = async () => {
        if (this.state.organization === "") {this.setState( {errorMsg: "Please input organization"} ); throw new Error(this.state.errorMsg)}
        else if (this.state.project === "") {this.setState( {errorMsg: "Please input project"} ); throw new Error(this.state.errorMsg)}
        else if (this.state.fund === "") {this.setState( {errorMsg: "Please input fund"} ); throw new Error(this.state.errorMsg)}
        else if (this.state.chapter === "") {this.setState( {errorMsg: "Please input chapter"} ); throw new Error(this.state.errorMsg)}
        else if (this.state.part === "") {this.setState( {errorMsg: "Please input part"} ); throw new Error(this.state.errorMsg)}
        else if (this.state.time === "") {this.setState( {errorMsg: "Please input time"} ); throw new Error(this.state.errorMsg)}
        else if (this.state.item === "") {this.setState( {errorMsg: "Please input item"} ); throw new Error(this.state.errorMsg)}
        else {
            this.setState({
                errorMsg: ""
            })
            this.setState({
                output: this.state.organization + this.state.project + this.state.fund + this.state.chapter + this.state.part + this.state.type + this.state.item,
                errorMsg: this.state.organization + this.state.project + this.state.fund + this.state.chapter + this.state.part + this.state.type + this.state.item
            })
            return;
        }
    }

    //Function that constructs an SMS to send and opens the user's mobile app
    sendSMS = async () => {
        //call checkText, and if valid, proceed. Else, return null
        try {
            let check = await this.checkInput()
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
                address: SERVER_PHONE_NUMBER, // sender's phone number

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
            notificationButton = <Image style={{width: 35, height: 35, tintColor: "white"}} source={bellBadge} />
        }
        else {
            notificationButton = <Image style={{width: 35, height: 35, tintColor: "white"}} source={bell}/>
        }

        return (
            <SafeAreaProvider>
                <Header
                backgroundColor="#A7C7E7"
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 20,
                    width: '100%',
                    paddingVertical: 15,
                }}

                rightComponent={                        
                    <TouchableOpacity
                        style={{ 
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: 10,
                         }}
                        onPress={this.handleNavigation}>
                        {notificationButton}
                    </TouchableOpacity>}
                
                centerComponent={                        
                    <Text
                        style={{
                            color: "white",
                            fontSize: 35,
                            fontWeight: "bold"
                        }}>
                    Create Input
                    </Text>}
                     >
                        
                </Header>
                <ScrollView
                    style={{
                        flex: 1,
                        padding: 20,
                        backgroundColor: "white"
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            padding: 10
                        }}>
                    </View>
                    <Dropdown label={"Organization"} options={["1", "2", "3", "4"]} onSelect={this.changeOrganization} />
                    <Dropdown label={"Project"} options={["1", "2", "3", "4"]} onSelect={this.changeProject} />
                    <Dropdown label={"Fund"} options={["1", "2", "3", "4"]} onSelect={this.changeFund} />
                    <Dropdown label={"Chapter"} options={["1", "2", "3", "4"]} onSelect={this.changeChapter} />
                    <Dropdown label={"Part"} options={["1", "2", "3", "4"]} onSelect={this.changePart} />
                    <Dropdown label={"Type"} options={["1", "2", "3", "4"]} onSelect={this.changeType} />
                    <Dropdown label={"Item"} options={["1", "2", "3", "4"]} onSelect={this.changeItem} />
                    <Button
                        color="#A7C7E7"
                        title="Send"
                        onPress={this.sendSMS}></Button>
                    <Text style={{ color: "red", padding: 10 }}>{this.state.errorMsg}</Text>
                </ScrollView>
            </SafeAreaProvider>
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