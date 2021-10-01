import {useEffect, useState} from 'react'
import ChangeGreenRed from './components/ChangeGreenRed'
import PulseCanvas from './components/PulseCanvas'
import logo from './images/cardano-logo-1024x1024.png'

const ticker = 'ADABUSD'
const backgroundColor = '#141428'
const canvasColor = '#3564f6'

const maxQueue = 100
const fixedDecimals = 3

export default function App() {
  const [dataPoints, setDataPoints] = useState([])
  const [change24hr, setChange24hr] = useState({
    priceChange: 0,
    priceChangePercent: 0,
  })

  useEffect(() => {
    // get price data on an interval basis (every 1 second)
    const livePriceInterval = setInterval(
      () =>
        fetch(`https://www.binance.com/api/v3/ticker/price?symbol=${ticker}`)
          .then(async (response) => {
            const {price} = await response.json()
            // add the price data to the state array,
            // whilst making sure the queue length doesn't exceed the allowed number (see variable "maxQueue")
            setDataPoints((prev) => {
              while (prev.length >= maxQueue) prev.shift()
              return [
                ...prev,
                {price: Number(Number(price).toFixed(fixedDecimals)), timestamp: Date.now()},
              ]
            })
          })
          .catch((error) => console.error(error)),
      1000,
    )

    // get 24 hour price change data on an interval basis (every 5 seconds)
    const priceChangeInterval = setInterval(
      () =>
        fetch(`https://www.binance.com/api/v3/ticker/24hr?symbol=${ticker}`)
          .then(async (response) => {
            const {priceChange, priceChangePercent} = await response.json()
            // add the price change data to the state object
            setChange24hr({
              priceChange: Number(Number(priceChange).toFixed(fixedDecimals)),
              priceChangePercent: Number(Number(priceChangePercent).toFixed(fixedDecimals)),
              timestamp: Date.now(),
            })
          })
          .catch((error) => console.error(error)),
      5000,
    )

    return () => {
      clearInterval(livePriceInterval)
      clearInterval(priceChangeInterval)
    }
  }, [])

  return (
    <div className='app flex-col' style={{backgroundColor}}>
      <header className='header flex-row'>
        <div className='ticker flex-col'>
          <img src={logo} alt='logo' className='logo' />
          <div className='flex-row'>
            <span className='price'>
              ${dataPoints.length ? dataPoints[dataPoints.length - 1].price : 0}
            </span>
            &nbsp;&nbsp;&nbsp;
            <div className='flex-col'>
              <ChangeGreenRed value={change24hr.priceChangePercent} suffix='%' invert withCaret />
              <ChangeGreenRed value={change24hr.priceChange} prefix='$' scale='0.8' />
            </div>
          </div>
        </div>
      </header>

      <PulseCanvas dataPoints={dataPoints} maxPoints={maxQueue} color={canvasColor} />
    </div>
  )
}
