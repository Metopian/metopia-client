import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import './App.css';
import { DaoHomePage, DaoSettingPage } from './page/dao';
import HomePage from './page/home';
import ProfilePage from './page/profile';
import { ProposalCreatePage, ProposalHomePage } from './page/proposal';
import TestMintPage from './test/TestMintPage';

const App = () => {
  const routeParams = useParams()
  const [searchParams] = useSearchParams();
  const [atBottom, setAtBottom] = useState(false)
  const page = useMemo(() => {
    if (!routeParams.page) {
      return <HomePage />
    } else {
      if (routeParams.page === 'dao') {
        if (routeParams.event === 'create') {
          return <DaoSettingPage />
        } else if (routeParams.event === 'update') {
          return <DaoSettingPage slug={routeParams.event2} />
        } else {
          if (routeParams.event2 === 'propose') {
            return <ProposalCreatePage dao={routeParams.event} />
          } else {
            if (!routeParams.event?.length || routeParams.event === 'undefined') {
              return <HomePage />
            } else {
              return <DaoHomePage slug={routeParams.event} atBottom={atBottom}/>
            }
          }
        }
      } else if (routeParams.page === 'proposal') {
        return <ProposalHomePage id={routeParams.event} />
      }
      else if (routeParams.page === 'profile') {
        return <ProfilePage slug={routeParams.event} subpage={searchParams.get('subpage')} state={searchParams.get('state')} code={searchParams.get('code')} />
      } else if (routeParams.page === 'test') {
        return <TestMintPage />
      }
    }
    return <HomePage />
  }, [routeParams, searchParams,atBottom])

  return (
    <div className="MainContainer" onScroll={(e) => {
      let target = e.target as HTMLElement
      if (target.clientHeight + target.scrollTop === target.scrollHeight) {
        setAtBottom(true)
      }
    }}>
      {page}
    </div >
  );
}

export default App;

