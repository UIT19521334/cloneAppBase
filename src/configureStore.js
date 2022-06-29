import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage'
import thunk from 'redux-thunk';
import devTools from 'remote-redux-devtools';
import promise from './promise';
import reducer from './redux/reducers';

export default function configureStore(onCompletion: () => void): any {
    const enhancer = compose(
        applyMiddleware(thunk, promise),
        devTools({
            name: 'NativeStarterProwithExpNav', realtime: true,
        }),
    );

    const store = createStore(reducer, enhancer);
    persistStore(store, { storage: AsyncStorage }, onCompletion);

    return store;
}