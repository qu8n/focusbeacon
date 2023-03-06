import '../styles/index.css';
import SessionsByDuration from './SessionsByDuration';
import LifetimeMetrics from './LifetimeMetrics';
import '@tremor/react/dist/esm/tremor.css';
import Milestones from './Milestones';
import { ColGrid, Text } from '@tremor/react';
import useProcessData from '../hooks/useProcessData';
import RepeatPartners from './RepeatPartners';
import LTMSessions from './LTMSessions';
import LTMHours from './LTMHours';
import NavBar from './NavBar';
import LoaderSpinner from './LoaderSpinner';
import Footer from './Footer';
import LTWSessions from './LTWSessions';
import LTWHours from './LTWHours';
import GitHubButton from 'react-github-btn';

export default function App() {
  const [
    loading,
    profileData,
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
    updateTime,
    lTWSessionsArr,
    lTWHoursArr,
  ] = useProcessData();
  
  if (loading) {
    return (
      <div className='loader-center'>
        <LoaderSpinner/>
      </div>
    )
  } else {
    return (
      <div className='background-color'>
        <NavBar data={profileData}/>

        <div className='row-margin'>
          <Text textAlignment='text-center'>
            <p>
              👋🏼 Hi! I'm building this metrics dashboard for FocusMate users.
            </p>
            <p>
              Below are my stats. Soon, you'll be able to sign in and see your own.
            </p>
            <p>
              Star my project on GitHub to stay updated!
            </p>
            <div className='mt-3'>
            <GitHubButton
              href="https://github.com/qu8n/focusbeacon"
              data-size="large" 
              aria-label="Star project on GitHub">
                  &nbsp; Star project on GitHub
            </GitHubButton>
            </div>
          </Text>
        </div>

        <div className='row-margin'>
          <LifetimeMetrics data={[
              totalSessions, 
              totalHours,
              totalPartners,
              firstSessionDate,
              maxHoursADay,
          ]}/>
        </div>

        <div className='row-margin'>
          <ColGrid numColsLg={ 3 } gapX="gap-x-6" gapY="gap-y-6">
            <SessionsByDuration data={[sessionsByDurationArr, totalSessions]}/>
            <Milestones data={milestonesArr}/>
            <RepeatPartners data={repeatPartnersArr}/>
          </ColGrid>
        </div>
        
        <div className='row-margin'>
          <ColGrid numColsLg={ 2 } gapX="gap-x-6" gapY="gap-y-6">
            <LTWSessions data={lTWSessionsArr}/>
            <LTWHours data={lTWHoursArr}/>
          </ColGrid>
        </div>

        <div className='row-margin'>
          <ColGrid numColsLg={ 2 } gapX="gap-x-6" gapY="gap-y-6">
            <LTMSessions data={lTMSessionsArr}/>
            <LTMHours data={lTMHoursArr}/>
          </ColGrid>
        </div>

        <div className='row-margin'>
          <Footer data={updateTime}/>
        </div>
        <br/>
      </div>
    )
  }
}
