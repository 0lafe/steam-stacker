import { Button } from '@mui/material'
import React, {useState, useEffect} from 'react'

const Consolidator = ({userID, appID, apiKey}) => {
  const [items, setItems] = useState(null)
  const [assets, setAssets] = useState(null)
  const [dupes, setDupes] = useState(null)
  const [total, setTotal] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [currentItem, setCurrentItem] = useState([])
  const [itemAccumulator, setItemAccumulator] = useState(null)
  const [buttonState, setButtonState] = useState(false)
  const [totalSet, setTotalSet] = useState(0)
  const [done, setDone] = useState(false)

  const fieldsPresent = () => {
    return userID && appID && apiKey
  }
  const currentItemAssets = () => {
    return assets[currentItem[0][2]]
  }
  const formatAssets = (array) => {
    const output = {}
    array.forEach((item) => {
      output[`${item.appid}:${item.classid}`] = item
    })
    return output
  }

  const getInventoryData = async () => {
    url = `/homes/inventory?userID=${userID}&appID=${appID}`

    const reply = await fetch(url)
    if (reply.status === 200) {
      const response = await reply.json()
      setItems(response.assets)
      setAssets(formatAssets(response.descriptions))
    } else {
      console.error('Error obtaining inventory information')
      console.log(reply)
    }
    setButtonState(true)
  }

  const obtainDupes = () => {
    const output = {}
    const dupes = []

    items.forEach((item) => {
      const key = `${item.appid}:${item.classid}:${item.instanceid}`
      if (output[key]) {
        output[key].push([item.assetid, item.amount, `${item.appid}:${item.classid}`])
      } else {
        output[key] = [[item.assetid, item.amount, `${item.appid}:${item.classid}`]]
      }
    })
    
    for (const key in output ) {
      if (output[key].length > 1) {
        dupes.push(output[key])
      }
    }

    setTotal(dupes.length)
    return dupes
  }

  const consolidateDupes = async () => {
    if (currentItem.length > 1) {
      const item = currentItem[currentItem.length - 1]
      if (item[0] !== itemAccumulator) {
        await consolidate(item[0], itemAccumulator, item[1])
      }
      setCurrentItem(currentItem.slice(0, currentItem.length - 1))
    } else if (dupes.length > 0) {
      const items = dupes.pop()
      setItemAccumulator(items[0][0])
      setCurrentItem(items)
      setTotalSet(items.length)
    } else {
      setCurrentItem([])
      setDone(true)
    }
  }

  useEffect(() => {
    if (currentItem.length > 0) {
      window.setTimeout(consolidateDupes, 1000)
    }
  }, [currentItem])

  const consolidate = async (fromitemid, destitemid, quantity) => {
    url = `https://api.steampowered.com/IInventoryService/CombineItemStacks/v1/?key=${apiKey}&appid=${appID}&fromitemid=${fromitemid}&destitemid=${destitemid}&quantity=${quantity}&steamid=${userID}`
    const reply = await fetch(url, {
      method: 'post',
      mode: 'no-cors'
    })

    if (reply.status === 200 || reply.status === 0) {
      // const response = await reply.json()
    } else {
      console.error('Error stacking items')
      console.log(reply)
      return false
    }
    return true
  }

  useEffect(() => {
    if (items) {
      setDupes(obtainDupes())
    }
  }, [items])

  useEffect(() => {
    if (dupes) {
      setTotalItems(dupes.flat().length)
      consolidateDupes()
    }
  }, [dupes])

  const formattedName = () => {
    let color
    let rarity = 'none'
    if (currentItemAssets().tags) {
      const filtered = currentItemAssets().tags.filter((tag) => tag.category === 'rarity')
      if (filtered.length > 0) {
        rarity = filtered[0].internal_name
      }
    }
    switch (rarity) {
      case 'common':
        color = '#2560d8'
        break
      case 'uncommon':
        color = '#8b00ff'
        break
      case 'epic':
        color = '#eb0ce3'
        break
      case 'rare':
        color = '#dd222a'
        break
      case 'legendary':
        color = '#e99c0e'
        break
      default:
        color = 'gray'
        break
    }
    return (
      <>
        <p style={{color: color}}>{currentItemAssets().name}</p>
        <img style={{width: '100%', border: `2px solid ${color}`, borderRadius: '1rem'}} src={"https://community.akamai.steamstatic.com/economy/image/" + currentItemAssets().icon_url_large} />
      </>
    )
  }

  return (
    <>
      <Button 
        variant="contained"
        onClick={getInventoryData}
        disabled={buttonState || !fieldsPresent()}
      >
        Start  
      </ Button>
      <br/>
      <br/>
      { dupes && currentItem && (currentItem.length > 0) &&
        <>
        <p>Working on duplicate item set number {total - dupes.length} of {total} (Please don't close this tab until process is finished)</p>
        <p>Working on item number {totalSet - currentItem.length + 1} of {totalSet} within the set</p>
        <p>Estimated Time To Complete All Dupes ~{totalItems}s (Blame steams rate limited API's for this time)</p>
        { currentItem.length && 
          <>
            {formattedName()}
            
          </>
        }
        </>
      }
      { done && <><p>Done</p><p>Thank you for using Lafe's item stacker</p></> }
    </>
  )
}

export default Consolidator