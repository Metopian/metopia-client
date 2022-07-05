import React from 'react';
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import store from './config/store';
import './index.scss';
import LoginModal from './module/LoginModal';
import { Menu } from './module/Menu';

const Index = () => {
  return (
    <div >
      <CookiesProvider>
        <div className="MenuWrapper">
          <Menu logoUrl={'https://metopia.oss-cn-hongkong.aliyuncs.com/logo.svg'} user={null} />
        </div>
        <div className="AppContainer">
          <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/bg_colored.png" className="AppBg" alt="" />
          <div className="AppMainContainer">
            <BrowserRouter basename="">
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/alpha" element={<App />} />
                <Route path="/alpha/:page" element={<App />} />
                <Route path="/alpha/:page/:event" element={<App />} />
                <Route path="/alpha/:page/:event/:event2" element={<App />} />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
        <LoginModal />
      </CookiesProvider >
    </div >
  )
}

ReactDOM.render(
  <Provider store={store}> <Index /></Provider>,
  document.getElementById('root')
);
