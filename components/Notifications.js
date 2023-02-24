import React from "react";
import { getMessage, getAllMessages } from "../utilities/datastorage/messages.js";
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
        let res = await getAllMessages()
        let ids = res.map(
            (message, index) => {
                return (
                    {
                        id: index,
                        message: message
                    }
                )
            })
        this.setState({
            notifications: ids
        })
    }

    handlePress = (id, content) => {
        this.setState({ selectedId: id, modalVisible: true, modalContent: content });
    };

    closeModal = () => {
        this.setState({ modalVisible: false });
    };

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.handlePress(item.id, item.message)}>
                <View style={{
                    backgroundColor: 'skyblue',
                    padding: 25,
                    borderWidth: 0.5
                }}>
                    <Text style={{
                        fontSize: 18
                    }}>
                        New message received!
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