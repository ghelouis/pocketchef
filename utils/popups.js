import {Alert} from "react-native";
import i18n from "i18n-js";

export function errorPopup(msg) {
    Alert.alert(i18n.t('error'), msg)
}

export function popup(msg) {
    Alert.alert('', msg)
}
