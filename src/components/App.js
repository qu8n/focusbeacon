import '../styles/App.css';
import SessionsByDuration from './SessionsByDuration';
import LifetimeMetrics from './LifetimeMetrics';
import '@tremor/react/dist/esm/tremor.css';
import Milestones from './Milestones';
import { ColGrid, Divider } from '@tremor/react';
import useProcessData from '../hooks/useProcessData';
import RepeatPartners from './RepeatPartners';
import WelcomeMessage from './WelcomeMessage';
import LTMSessions from './LTMSessions';
import LTMHours from './LTMHours';
import NavBar from './NavBar';

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
      lTMSessionsArr,
      lTMHoursArr,
    ]
  ] = useProcessData();
  return (
    <div className={'App'}>
      <NavBar />
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
      <ColGrid numColsLg={ 2 } gapX="gap-x-6" gapY="gap-y-6">
        <LTMSessions data={[loading, lTMSessionsArr]}/>
        <LTMHours data={[loading, lTMHoursArr]}/>
      </ColGrid>
      <br/>
      <ColGrid numColsLg={ 3 } gapX="gap-x-6" gapY="gap-y-6">
        <SessionsByDuration data={[loading, [sessionsByDurationArr, totalSessions]]}/>
        <Milestones data={[loading, milestonesArr]}/>
        <RepeatPartners data={[loading, repeatPartnersArr]}/>
      </ColGrid>
      <Divider />
      <WelcomeMessage/>
    </div>
  )
}
