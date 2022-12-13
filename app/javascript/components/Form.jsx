import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import Consolidator from './Consolidator';

const Form = () => {
  const [userID, setUserID] = useState('')
  const [appID, setAppID] = useState('')
  const [apiKey, setKey] = useState('')

  return (
    <>
      <p>Please Fill Out All Fields</p>
      <p>You can find your steam ID <strong><a href='https://steamid.xyz/83112873'>here</a></strong></p>
      <p>You can find steam game IDs <strong><a href='https://steamdb.info/'>here</a></strong></p>
      <p>You can get a steam API key <strong><a href='https://steamcommunity.com/dev/apikey'>here</a></strong></p>
      <br/>
      <br/>
      <TextField
        required
        id="userID"
        label="User ID (64 bit version)"
        onChange={(e) => {setUserID(e.target.value)}}
        />
      <br/>
      <br/>
      <TextField
        required
        id="appID"
        label="App ID (Payday 2 is 218620)"
        onChange={(e) => {setAppID(e.target.value)}}
        />
      <br/>
      <br/>
      <TextField
        required
        id="key"
        label="API Key (opbtained from steam)"
        onChange={(e) => {setKey(e.target.value)}}
        />
      <br/>
      <br/>
      <Consolidator userID={userID} appID={appID} apiKey={apiKey}/>
    </>
  )
}

export default Form