import '../styles/App.css';
import ProfileCard from "./ProfileCard";
import SessionsByDuration from './SessionsByDuration';
import LifetimeMetrics from './LifetimeMetrics';
import useFetchData from '../hooks/useFetchData';
import '@tremor/react/dist/esm/tremor.css';
import Milestones from './Milestones';
import { Card, ColGrid } from '@tremor/react';

export default function App() {
  const [loading, profileData, sessionsData] = useFetchData();
  return (
    <div className={'App'}>
      <ProfileCard data={[loading, profileData]}/>
      <br/>
      <LifetimeMetrics data={[loading, sessionsData]}/> 
      <br/>
      {/* <Card> */}
      <ColGrid numColsLg={ 3 } gapX="gap-x-6" gapY="gap-y-6">
        <SessionsByDuration data={[loading, sessionsData]}/>
        <Milestones data={[loading, sessionsData]}/>
        <Milestones data={[loading, sessionsData]}/>
      </ColGrid>
      {/* </Card> */}
    </div>
  )
}
