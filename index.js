import {Platform} from "react-native";
if (Platform.OS === 'web') {
  require('@expo/metro-runtime');
}
import './registerServiceWorker';
import './gesture-handler';
import { registerRootComponent } from 'expo';
import App from "./src/screens/App";
import { Provider } from 'react-redux';
import { store } from './src/store/store';

const ReduxApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

registerRootComponent(ReduxApp)

