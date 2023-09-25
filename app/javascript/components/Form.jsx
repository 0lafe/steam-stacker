import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import Consolidator from './Consolidator';

const Form = () => {
  const [userID, setUserID] = useState('')
  const [appID, setAppID] = useState('')
  const [apiKey, setKey] = useState('')
  const [filter, setFilter] = useState('')
  const [filterQuantity, setFilterQuantity] = useState('')

  return (
    <>
      <h1>Please Fill Out All Fields</h1>
      <br/>
      <br/>
      <TextField
        required
        id="userID"
        label="User ID (64 bit version)"
        onChange={(e) => {setUserID(e.target.value)}}
        />
      <br/>
      <p>You can find your steam ID <strong><a href='https://steamid.xyz/'>here</a></strong></p>
      <br/>
      <TextField
        required
        id="appID"
        label="App ID (Payday 2 is 218620)"
        onChange={(e) => {setAppID(e.target.value)}}
        />
      <br/>
      <p>You can find steam game IDs <strong><a href='https://steamdb.info/'>here</a></strong></p>
      <br/>
      <TextField
        required
        id="key"
        label="API Key (opbtained from steam)"
        onChange={(e) => {setKey(e.target.value)}}
        />
      <p>You can get a steam API key <strong><a href='https://steamcommunity.com/dev/apikey'>here</a></strong></p>
      <br/>
      <h3>~ Optional ~</h3>
      <div>
      <TextField
        required
        id="filter"
        label="Filter"
        onChange={(e) => {setFilter(e.target.value)}}
        style={{margin: '0 2rem'}}
        />
      <TextField
        required
        id="filter-quantity"
        label="Quantity"
        onChange={(e) => {setFilterQuantity(e.target.value)}}
        style={{margin: '0 2rem'}}
        />
      </div>
      <p>Optional filter for specifying items to stack/unstack</p>
      <p>Filter will work on partial matches</p>
      <br/>
      <br/>
      <Consolidator userID={userID} appID={appID} apiKey={apiKey} filter={filter} filterQuantity={filterQuantity}/>
    </>
  )
}

export default Form