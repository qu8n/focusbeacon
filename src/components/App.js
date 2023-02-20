import '../styles/App.css';
import ProfileCard from "./ProfileCard";
import SessionsByDuration from './SessionsByDuration';
import LifetimeMetrics from './LifetimeMetrics';
import useFetchData from '../hooks/useFetchData';
import '@tremor/react/dist/esm/tremor.css';

export default function App() {
  const [loading, profileData, sessionsData] = useFetchData();
  return (
    <>
      <ProfileCard data={[loading, profileData]}/>
      <br/>
      <SessionsByDuration data={[loading, sessionsData]}/>
      <br/>
      <LifetimeMetrics data={[loading, sessionsData]}/> 
    </>
  )
}
