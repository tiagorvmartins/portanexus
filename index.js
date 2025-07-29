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

(async () => {
  registerRootComponent(ReduxApp);
})();


