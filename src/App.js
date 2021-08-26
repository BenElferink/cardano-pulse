import {useEffect, useState} from 'react'
import PulseCanvas from './components/PulseCanvas'
import logo from './images/cardano-logo-1024x1024.png'

const ticker = 'ADABUSD'
const canvasColor = '#3564f6'
const maxQueue = 100

function App() {
  const [dataPoints, setDataPoints] = useState([])

  useEffect(() => {
    // get price data on an interval basis (every 1 second)
    const interval = setInterval(
      () =>
        fetch(`https://www.binance.com/api/v3/ticker/price?symbol=${ticker}`)
          .then(async (response) => {
            const {price} = await response.json()
            // add the price (and some extra data) to the state array,
            // whilst making sure the queue length doesn't exceed the allowed number (see variable "maxQueue")
            setDataPoints((prev) => {
              while (prev.length >= maxQueue) prev.shift()
              return [...prev, {price: Number(Number(price).toFixed(4)), timestamp: Date.now()}]
            })
          })
          .catch((error) => console.error(error)),
      1000,
    )

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className='app flex-col'>
      <header className='ticker flex-col'>
        <img src={logo} alt='logo' className='logo' />
        <span className='price'>
          ${dataPoints.length ? dataPoints[dataPoints.length - 1].price : 0}
        </span>
      </header>
      <PulseCanvas dataPoints={dataPoints} maxPoints={maxQueue} color={canvasColor} />
    </div>
  )
}

export default App
