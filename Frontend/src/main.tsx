import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Layout } from './components/layout-area/layout/layout'
import './index.css'
import { store } from './redux/store'
import { interceptor } from './utils/interceptor'

// Create interceptor:
interceptor.create();

createRoot(document.getElementById('root')!).render(

    <Provider store={store}>

        <BrowserRouter>

            <Layout />

        </BrowserRouter>

    </Provider>

)
