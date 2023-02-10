import '../styles/App.css';
import ProfileCard from "./ProfileCard";
import SessionsByDuration from './SessionsByDuration';
import TotalHours from './TotalHours';

export default function App() {
  return (
    <>
      <ProfileCard/>
      <br/>
      <SessionsByDuration/>
      <br/>
      <TotalHours/> 
    </>
  )
}
