import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import store from './config/store';
import './index.css';
import LoginModal from './module/LoginModal';
import { Menu } from './module/Menu';
import AIActPage from './page/ai';

const Index = () => {
  return (
    <div >
      <div className="MenuWrapper">
        <Menu logoUrl={'https://metopia.oss-cn-hongkong.aliyuncs.com/logo.svg'} user={null} />
      </div>
      <div className="AppContainer">
        <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/bg_colored.png" className="AppBg" alt="" />
        <div className="AppMainContainer">
          <BrowserRouter basename="">
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/ai" element={<AIActPage />} />
              <Route path="/alpha" element={<App />} />
              <Route path="/alpha/:page" element={<App />} />
              <Route path="/alpha/:page/:event" element={<App />} />
              <Route path="/alpha/:page/:event/:event2" element={<App />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
      <LoginModal />
    </div >
  )
}

ReactDOM.render(
  <Provider store={store}> <Index /></Provider>,
  document.getElementById('root')
);
