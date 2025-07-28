import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { toast } from "react-toastify";

export const showErrorToast = (message: string, theme: string) => {
    if (Platform.OS === 'web') {
        toast.error(message, 
            {
                autoClose: 5000,
                position: 'top-center',
                theme: theme
            }
        ) 
    } else {
        Toast.show({
            type: 'error',
            text1: message,
        });
    }
}

export const showSuccessToast = (message: string, theme: string) => {
    if (Platform.OS === 'web') {
        toast.success(message, 
            {
                autoClose: 5000,
                position: 'top-center',
                theme: theme
            }
        ) 
    } else {
        Toast.show({
            type: 'success',
            text1: message,
        });
    }
}
