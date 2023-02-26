import React from "react";
import { getMessage, getAllMessages, putMessage } from "../utilities/datastorage/messages.js";
import { View, Text, FlatList, TouchableOpacity, Modal, Button, TouchableWithoutFeedback} from "react-native";

class Notifications extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            notifications: "",
            selectedId: null,
            modalVisible: false,
            modalContent: '',
        }
    }

    async componentDidMount() {
        //Load all messages stored in device
        let messages = await getAllMessages()
        console.log(messages)
        messages.forEach(
           (message, index) => { message["id"] = index; console.log("Notifications: Message = "); console.log(message) })
        this.setState({
            notifications: messages
        })
    }

    handlePress = (item) => {
        //change item's fontStyle to show it has been read
        item.style.fontStyle = "normal"
        putMessage(item.id, item)
        this.setState({ selectedId: item.id, modalVisible: true, modalContent: item.body });
    };

    closeModal = () => {
        this.setState({ modalVisible: false });
    };

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.handlePress(item)}>
                <View style={{
                    backgroundColor: 'skyblue',
                    padding: 25,
                    borderWidth: 0.5
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: item.style.fontStyle
                    }}>
                        New Message!
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    //function that renders the modal when a notification is loaded
    renderModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={this.closeModal}
            >

                    <View style={{ 
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        }}>
                        <View style={{ 
                            backgroundColor: '#fff',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20,
                            flex: 0.7}}>
                            <Text style={{
                                fontSize: 20,
                                flex: 0.7}}>
                                    {this.state.modalContent}
                            </Text>
                            <Button style={{flexDirection: 'row'}} title="Close" onPress={this.closeModal} />
                        </View>
                    </View>
            </Modal>
        );
    };

    render() {
        return (
            <View>
                <FlatList
                    inverted
                    data={this.state.notifications}
                    renderItem={this.renderItem}
                    keyExtractor={(item) => item.id}
                />
                {this.renderModal()}
            </View>
        )
    }
}

export default Notifications