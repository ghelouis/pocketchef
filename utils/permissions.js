import * as Permissions from "expo-permissions";
import i18n from "i18n-js";

export async function getCameraPermissions() {
    const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
    if (status !== 'granted') {
        alert(i18n.t('errors.missingPermission'));
    }
}
