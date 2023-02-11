import '../styles/App.css';
import ProfileCard from "./ProfileCard";
import SessionsByDuration from './SessionsByDuration';
import LifetimeMetrics from './LifetimeMetrics';

export default function App() {
  return (
    <>
      <ProfileCard/>
      <br/>
      <SessionsByDuration/>
      <br/>
      <LifetimeMetrics/> 
    </>
  )
}
