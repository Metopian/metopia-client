import React, { useMemo } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import './App.css';
import { ClubHomePage, ClubSettingPage } from './page/club';
import HomePage from './page/home';
import ProfilePage from './page/profile';
import { ProposalCreatePage, ProposalHomePage } from './page/proposal';
import TestMintPage from './test/TestMintPage';

const App = () => {
  const routeParams = useParams()
  const [searchParams] = useSearchParams();
  const page = useMemo(() => {
    if (!routeParams.page) {
      return <HomePage />
    } else {
      if (routeParams.page === 'space') {
        if (routeParams.event === 'create') {
          return <ClubSettingPage />
        } else if (routeParams.event === 'update') {
          return <ClubSettingPage slug={routeParams.event2} />
        } else {
          if (routeParams.event2 === 'propose') {
            return <ProposalCreatePage space={routeParams.event} />
          } else {
            if (!routeParams.event?.length) {
              return <HomePage />
            } else {
              return <ClubHomePage slug={routeParams.event} />
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
  }, [routeParams, searchParams])
  return (
    <div className="MainContainer" >
      {page}
    </div>
  );
}

export default App;

