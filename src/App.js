import {useReducer, useEffect} from 'react'
import usdReducer from './reducers/usdReducer'
import btcReducer from './reducers/btcReducer'
import useLocalStorage from './hooks/useLocalStorage'
import handleBinanceApi from './functions/handleBinanceApi'
import ChangeGreenRed from './components/ChangeGreenRed'
import PulseCanvas from './components/PulseCanvas'
import {usdSymbol, usdDecimals, btcSymbol, btcDecimals, maxQueue} from './constants'

import logo from './images/cardano-logo-1024x1024.png'
const ticker = 'ADA'
const accentColor = '#3564f6'
const backgroundColor = '#141428'

const initialReducerState = {
  dataPoints: [
    {
      price: 0,
    },
  ],
  change24hr: {
    priceChange: 0,
    priceChangePercent: 0,
  },
}

export default function App() {
  const [usdState, dispatchUsd] = useReducer(usdReducer, initialReducerState)
  const [btcState, dispatchBtc] = useReducer(btcReducer, initialReducerState)
  const [displayBitcoin, setDisplayBitcoin] = useLocalStorage('display_bitcoin', false)

  useEffect(() => {
    const usdLivePriceInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/price?symbol=${ticker}BUSD`, (data, error) => {
        if (!error) dispatchUsd({type: 'ADD_PRICE', payload: data})
      })
    }, 1000)

    const usdPriceChangeInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/24hr?symbol=${ticker}BUSD`, (data, error) => {
        if (!error) dispatchUsd({type: 'ADD_24HOUR', payload: data})
      })
    }, 5000)

    const btcLivePriceInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/price?symbol=${ticker}BTC`, (data, error) => {
        if (!error) dispatchBtc({type: 'ADD_PRICE', payload: data})
      })
    }, 1000)

    const btcPriceChangeInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/24hr?symbol=${ticker}BTC`, (data, error) => {
        if (!error) dispatchBtc({type: 'ADD_24HOUR', payload: data})
      })
    }, 5000)

    return () => {
      clearInterval(usdLivePriceInterval)
      clearInterval(usdPriceChangeInterval)
      clearInterval(btcLivePriceInterval)
      clearInterval(btcPriceChangeInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker])

  const dataPoints = displayBitcoin ? btcState.dataPoints : usdState.dataPoints
  const change24hr = displayBitcoin ? btcState.change24hr : usdState.change24hr

  return (
    <div className='app flex-col' style={{backgroundColor}}>
      <button
        className='toggle-currency'
        style={{color: accentColor}}
        onClick={() => setDisplayBitcoin((prev) => !prev)}>
        {displayBitcoin ? 'Show in USD' : 'Show in BTC'}
      </button>

      <header className='ticker flex-col'>
        <img src={logo} alt='logo' className='logo' />

        <div className='flex-row'>
          <span className='price'>
            {displayBitcoin ? btcSymbol : usdSymbol}
            {dataPoints.length ? dataPoints[dataPoints.length - 1].price : 0}
          </span>

          <div className='flex-col'>
            <ChangeGreenRed value={change24hr.priceChangePercent} suffix='%' invert withCaret />
            <ChangeGreenRed
              value={change24hr.priceChange}
              prefix={displayBitcoin ? btcSymbol : usdSymbol}
              scale='0.8'
            />
          </div>
        </div>
      </header>

      <PulseCanvas
        color={accentColor}
        dataPoints={dataPoints}
        maxPoints={maxQueue}
        numOfPriceDecimals={displayBitcoin ? btcDecimals : usdDecimals}
      />
    </div>
  )
}
