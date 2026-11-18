import { View, Text } from 'react-native'
import React from 'react'
import * as Clipboard from "expo-clipboard"
import Toast from "react-native-root-toast"


export const formatSlug = (slug) => {
    if(!slug) return "";

    return slug
    .split("-") //split the string by hyphens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitaluze each word
    .join(" ") // join the words with spaces
    
}




export const inverseFormatSlug = (title) => {
    if(!title) return "";

    return title
    .split(" ") //split the string by spaces
    .map((word) => word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()) // lowercase each word
    .join("-") // join the words with spaces
    
}


export const copySlug = async (slug) => {
    if(!slug) return;


    await Clipboard.setStringAsync(formatSlug(slug)); //orange-happy-monkey => Orange Happy Monkey

    Toast.show("Copied Call ID to Clipboard", {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: true
    })

}

