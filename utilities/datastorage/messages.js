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
        const value = JSON.parse(res)
        return value
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
        //Parse String into object
        let pairsParsed = pairs.map( (pair) => {
            return [pair[0], JSON.parse(pair[1])] 
        })
        //Return only array of values, no keys
        let values = pairsParsed.map( (pair) => { return(pair[1])} )
        return values
    } catch(e){
        console.log(e)
    }
}


