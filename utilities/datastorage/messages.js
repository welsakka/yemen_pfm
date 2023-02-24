import AsyncStorage from '@react-native-async-storage/async-storage';

//Functions making use of device storage to get and put messages
// Source : https://react-native-async-storage.github.io/async-storage/docs/api#multiget

//function to store messages on device
export async function putMessage(key, value) {
        try {
          await AsyncStorage.setItem(key, value)
        } catch (e) {
          console.log(e)
        }   
}

//Function to get stored messages from device memory
export async function getMessage(key) {
    try {
        const res = await AsyncStorage.getItem(key)
        if (res !== null) {
            console.log(res)
            return res
        }
    } catch(e) {
        console.log(e)
    }
}

//Function to get all stored messages from device memory
export async function getAllMessages() {
    let keys = []
    try {
        keys = await AsyncStorage.getAllKeys()
        let pairs = await AsyncStorage.multiGet(keys)
        let values = pairs.map( (pair) => {return(pair[1])} )
        return values
    } catch(e){
        console.log(e)
    }
}


