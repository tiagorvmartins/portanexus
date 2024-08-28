import { toast } from "react-toastify";

const showErrorToast = (message: string, theme: string) => {
    toast.error(message, 
        {
            autoClose: 5000,
            position: 'top-center',
            theme: theme
        }
    )
}

export default showErrorToast;