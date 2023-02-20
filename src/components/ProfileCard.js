import React from 'react';
import '../styles/ProfileCard.css'

export default function ProfileCard(props) {
    const [loading, data] = props.data;
    const {name, timeZone, photoUrl} = data;

    const profileCard = 
    <>
        <div className='profile-card'>
            <div className='box'>
                <img className='image' src={ photoUrl } alt="profile-img"/>
                <h1 className='name'>{ name }</h1>
                <p className='description'>{ timeZone }</p>
            </div>
        </div>
    </>

    return (
        <div>
            {loading ? 'Loading...' : profileCard}
        </div>
    );
}
