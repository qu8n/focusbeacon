import '../styles/App.css';
import ProfileCard from "./ProfileCard";
import SessionsByDuration from './SessionsByDuration';
import TotalStats from './TotalStats';

export default function App() {
  return (
    <>
      <ProfileCard/>
      <br/>
      <SessionsByDuration/>
      <br/>
      <TotalStats/> 
    </>
  )
}
