import { Button } from '@mui/material'
import React, {useState, useEffect} from 'react'

const Consolidator = ({userID, appID, apiKey, filter, filterQuantity}) => {
  const [inventory, setInventory] = useState(null)
  const [assets, setAssets] = useState(null)
  const [dupes, setDupes] = useState(null)
  const [total, setTotal] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [currentItem, setCurrentItem] = useState([])
  const [itemAccumulator, setItemAccumulator] = useState(null)
  const [buttonState, setButtonState] = useState(false)
  const [totalSet, setTotalSet] = useState(0)
  const [done, setDone] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")

  const fieldsPresent = () => {
    return userID && appID && apiKey
  }

  const currentItemAssets = () => {
    if (actionType === 'combine') {
      return assets[currentItem[0][2]]
    } else {
      return assets[currentItem[2]]
    }
  }

  const formatAssets = (array) => {
    const output = {}
    array.forEach((item) => {
      output[`${item.appid}:${item.classid}`] = item
    })
    return output
  }

  const getInventoryData = async () => {
    setButtonState(true)
    setStatusMessage("Getting Inventory Data")
    url = `/homes/inventory?userID=${userID}&appID=${appID}`

    const reply = await fetch(url)
    if (reply.status === 200) {
      const response = await reply.json()
      const tempAssets = formatAssets(response.descriptions)
      setInventory(filterInventory(response.assets, tempAssets))
      setAssets(tempAssets)
      setStatusMessage("")
    } else {
      console.error('Error obtaining inventory information')
      console.log(reply)
      setStatusMessage("Something Went Wrong. Let Lafe Know About This")
    }
  }

  const filterInventory = (itemList, names) => {
    let out = []
    if (filter && filter.length) {
      out = itemList.filter((item) => {
        return names[`${item.appid}:${item.classid}`].name.toUpperCase().includes(filter.toUpperCase())
      })
    } else {
      out = itemList
    }
    if (filterQuantity && filterQuantity.length) {
      const maxQuantity = parseInt(filterQuantity)
      out = out.map((item) => {
        if (parseInt(item.amount) > maxQuantity) {
          return {...item, amount: maxQuantity}
        } else {
          return item
        }
      })
    }
    return out
  }

  const obtainDupes = () => {
    const output = {}
    const dupes = []

    inventory.forEach((item) => {
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

  const obtainStacks = () => {
    const dupes = inventory.filter((item) => {
      return item.amount > 1
    })

    const formattedDupes = dupes.map((item) => {
      return [item.assetid, item.amount, `${item.appid}:${item.classid}`]
    })

    setTotal(formattedDupes.length)
    return formattedDupes
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

  const unstackItems = async () => {
    if (currentItem[1] > 1) {
      await unstack(currentItem[0])
      const copy = [... currentItem]
      copy[1] = copy[1] - 1
      setCurrentItem(copy)
    } else if (dupes.length > 0) {
      const items = dupes.pop()
      setCurrentItem(items)
      setTotalSet(items[1])
    } else {
      setCurrentItem([])
      setDone(true)
    }
  }

  const consolidate = async (fromitemid, destitemid, quantity) => {
    url = `https://api.steampowered.com/IInventoryService/CombineItemStacks/v1/?key=${apiKey}&appid=${appID}&fromitemid=${fromitemid}&destitemid=${destitemid}&quantity=${quantity}&steamid=${userID}`
    const reply = await fetch(url, {
      method: 'post',
      mode: 'no-cors'
    })
    
    if (reply.status === 200 || reply.status === 0) {
      return true
    } else {
      console.error('Error stacking items')
      console.log(reply)
      return false
    }
  }

  const unstack = async (itemId) => {
    url = `https://api.steampowered.com/IInventoryService/SplitItemStack/v1/?key=${apiKey}&appid=${appID}&itemid=${itemId}&quantity=1&steamid=${userID}`

    const reply = await fetch(url, {
      method: 'post',
      mode: 'no-cors'
    })

    if (reply.status === 200 || reply.status === 0) {
      return true
    } else {
      console.error('Error stacking items')
      console.log(reply)
      return false
    }
  }

  useEffect(() => {
    if (inventory && actionType === 'combine') {
      setDupes(obtainDupes())
    } else if (inventory && actionType === 'split') {
      setDupes(obtainStacks())
    }
  }, [inventory])

  useEffect(() => {
    if (dupes) {
      if (actionType === 'combine') {
        setTotalItems(dupes.flat().length)
        consolidateDupes()
      } else {
        const initialValue = 0
        const total = dupes.reduce((accumulator, currentValue) => 
          accumulator + parseInt(currentValue[1]),
          initialValue
        )
        setTotalItems(total)
        unstackItems()
      }
    }
  }, [dupes])

  useEffect(() => {
    if (currentItem.length > 0) {
      if (actionType === 'combine') {
        window.setTimeout(consolidateDupes, 1000)
      } else {
        window.setTimeout(unstackItems, 1000)
      }
    }
  }, [currentItem])

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
      case 'rare':
        color = '#eb0ce3'
        break
      case 'epic':
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
      <div style={{width: '100%', border: `2px solid ${color}`, borderRadius: '1rem'}}>
        <p style={{color: color}}>{currentItemAssets().name}</p>
        <img style={{width: '100%'}} src={"https://community.akamai.steamstatic.com/economy/image/" + currentItemAssets().icon_url_large} />
      </div>
    )
  }

  const itemNumber = () => {
    if (actionType === 'combine') {
      return totalSet - currentItem.length + 1
    } else {
      return totalSet - currentItem[1] + 1
    }
  }

  return (
    <>
      <Button 
        variant="contained"
        onClick={() => {
          setActionType('combine')
          getInventoryData()
        }}
        disabled={buttonState || !fieldsPresent()}
        style={{margin: '1rem'}}
      >
        Combine Stacks  
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          setActionType('split')
          getInventoryData()
        }}
        disabled={buttonState || !fieldsPresent()}
        style={{margin: '1rem'}}
      >
        Split Stacks
      </Button>
      <div>
        { statusMessage }
      </div>
      <br/>
      <br/>
      { dupes && currentItem && (currentItem.length > 0) &&
        <>
        <p>Working on {actionType === 'combine' ? 'duplicate' : 'stacked'} item set number {total - dupes.length} of {total} (Please don't close this tab until process is finished)</p>
        <p>Working on item number {itemNumber()} of {totalSet} within the set</p>
        <p>Estimated Time To Complete All {actionType === 'combine' ? 'Dupes' : 'Stacks'} ~{totalItems}s (Blame Steam's rate limited API's for this time)</p>
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