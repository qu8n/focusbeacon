import '../styles/App.css';
// import ProfileCard from "./ProfileCard";
import SessionsByDuration from './SessionsByDuration';
import LifetimeMetrics from './LifetimeMetrics';
import '@tremor/react/dist/esm/tremor.css';
import Milestones from './Milestones';
import { Card, ColGrid } from '@tremor/react';
import GitHubButton from 'react-github-btn';
import ProfileCard from './ProfileCard';
import useProcessData from '../hooks/useProcessData';
import RepeatPartners from './RepeatPartners';

export default function App() {
  const [
    loading, [
      totalSessions, 
      totalHours, 
      totalPartners,
      firstSessionDate,
      maxHoursADay,
      sessionsByDurationArr,
      milestonesArr,
      repeatPartnersArr,
    ]
  ] = useProcessData();
  return (
    <div className={'App'}>
      <Card>
        <p>
          Thanks for visiting! 👋🏼
        </p>
        <p>
          This is a (very much) work-in-progress website that will eventually allow FocusMate users to 
          sign in and see their detailed session metrics.
        </p>
        <p>
          As a sneak peek, below are my stats. Many more metrics will be added over time.
        </p>
        <p>
          This website uses the official FocusMate API and does not store user data, keeping them 100% confidential.
        </p>
        <mark>
          Want to be the first to know when this website is ready? 
          Provide your email <a href="https://mailchi.mp/32761f8aafc0/focusstats">here</a>. 
          (No spams. You'll get a one-time email when this website is ready.)
        </mark>
        <p>
          If you're a developer on GitHub, it'd mean the world to me if you'd give it a star:
        </p>
        <GitHubButton 
          href="https://github.com/qu8n/focusmate-stats" 
          data-size="large" 
          aria-label="Star qu8n/focusmate-stats on GitHub">
            Star project on GitHub
        </GitHubButton>
      </Card>
      {/* <ProfileCard data={[loading, profileData]}/> */}
      <br/>
      <LifetimeMetrics data={[
        loading, [
          totalSessions, 
          totalHours,
          totalPartners,
          firstSessionDate,
          maxHoursADay,
        ]
      ]}/> 
      <br/>
      <ColGrid numColsLg={ 3 } gapX="gap-x-6" gapY="gap-y-6">
        <SessionsByDuration data={[loading, [sessionsByDurationArr, totalSessions]]}/>
        <Milestones data={[loading, milestonesArr]}/>
        <RepeatPartners data={[loading, repeatPartnersArr]}/>
      </ColGrid>
    </div>
  )
}
