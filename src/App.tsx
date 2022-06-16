import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams  } from "react-router-dom";
import './App.css';
import { ClubSettingPage, ClubHomePage } from './page/club';
import HomePage from './page/home';
import ProfilePage from './page/profile';
import { ProposalCreatePage, ProposalHomePage } from './page/proposal';
import  TestMintPage  from './test/TestMintPage'

const App = () => {
  const routeParams = useParams()
  const [searchParams] = useSearchParams();
  // const [routeParams, setRouteParams] = useState(useParams())
  const page = useMemo(() => {
    if (!routeParams.page) {
      return <HomePage />
    } else {
      if (routeParams.page === 'space') {
        if (routeParams.event === 'create') {
          return <ClubSettingPage />
        }else if (routeParams.event === 'update'){
          return <ClubSettingPage slug={routeParams.event2}/>
        }else {
          if (routeParams.event2==='propose') {
            return <ProposalCreatePage space={routeParams.event}/>
          }else{
            return <ClubHomePage slug={routeParams.event} />
          }
        }
      } else if(routeParams.page === 'proposal'){
          return <ProposalHomePage id={routeParams.event} />
      }
      else if (routeParams.page === 'profile') {
        return <ProfilePage slug={routeParams.event} subpage={searchParams.get('subpage')} state={searchParams.get('state')} code={searchParams.get('code')} />
      } else if(routeParams.page==='test'){
        return <TestMintPage/>
      }
    }
    return <HomePage />
  }, [routeParams])
  return (
    <div className="MainContainer">
      {page}
    </div>
  );
}

export default App;



  // const initWeb3 = async () => {
  //   // console.log({ serverUrl:moralis_server, appId :moralis_appId })
  //   Moralis.start({ serverUrl: moralis_server, appId: moralis_appId });
  //   async function login() {
  //     let user = Moralis.User.current();
  //     if (!user) {
  //       user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
  //         .then(function (user) {
  //           console.log("logged in user:", user);
  //           
  //         })
  //         .catch(function (error) {
  //           console.log(error);
  //         });
  //     }
  //   }
  //   await login()
  // }

  // useEffect(async () => {
  //   await initWeb3()
  // })

  // const goto = useCallback((url, refresh) => {
  //   if (refresh) {
  //     window.location.href = url
  //   } else {
  //     window.history.pushState({}, undefined, urls.router.test)
  //     setRouteParams({ page: 'test' })
  //   }
  // })


  // let searchParams = useSearchParams()
  // console.log(searchParams.get('test'))\


  
  // async function sign(message, callback) {
  //   if (typeof window.web3 !== 'undefined') {
  //     let ethereum = window.web3.currentProvider
  //     let web3 = new Web3(ethereum);
  //     let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  //     // let hash = web3.utils.sha3(serverNonce)

  //     const privateKey = '11bfe6e8c5f1da0c83fc3368b143abea5cbde8d3627acfed0bda34dfe64ee509';
  //     let s_msg = await web3.eth.accounts.sign(message, privateKey);
  //     // let signature = await web3.eth.personal.sign(message, accounts[0])
  //     callback(s_msg)
  //   } else {
  //     window.alert('Please install Metamask.')
  //   }
  // }

  // useEffect(async () => {
  //   const Contract = require('web3-eth-contract');
  //   const redeemCodeFactory = require('./config/RedeemCodeFactory.json');
  //   let ethereum = window.web3.currentProvider
  //   Contract.setProvider(ethereum);
  //   let web3 = new Web3(ethereum);
  //   const addr = "0x3506230e2C0702768F6F307Fe29f775703eCfCA7"
  //   const contract = new Contract(redeemCodeFactory.abi, addr);
  //   const validate = contract.methods['verifyWhitelist']
  //   let message = "hello word!"
  //   await sign('simple', signed => {
  //     console.log(signed)
  //     validate(signed.messageHash, signed.signature).call((err, result) => {
  //       console.log(err, result)
  //     })
  //   })
  // })