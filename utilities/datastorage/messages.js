import AsyncStorage from '@react-native-async-storage/async-storage';

//Functions making use of device storage to get and put messages
// Source : https://react-native-async-storage.github.io/async-storage/docs/api#multiget

//function to store messages on device
export async function putMessage(key, value) {
        try {
          const jsonValue = JSON.stringify(value)
          const keyString = key.toString();
          await AsyncStorage.setItem(keyString, jsonValue)
        } catch (e) {
          console.log(e)
        }   
}

//Function to get stored messages from device memory
export async function getMessage(key) {
    try {
        const res = await AsyncStorage.getItem(key)
        return res != null ? JSON.parse(res) : null
    } catch(e) {
        console.log(e)
    }
}

//Function to get all stored messages from device memory
export async function getAllMessages() {
    let keys = []
    try {
        keys = await AsyncStorage.getAllKeys()
        var values = keys.map( async (key) => {
            let res = await getMessage(key)
            return res
        });
        return values
    } catch(e){
        console.log(e)
    }
}


