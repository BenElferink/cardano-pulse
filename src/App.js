import {useReducer, useEffect} from 'react'
import usdReducer from './reducers/usdReducer'
import btcReducer from './reducers/btcReducer'
import processTimeReducer from './reducers/processTimeReducer'
import useLocalStorage from './hooks/useLocalStorage'
import handleBinanceApi from './functions/handleBinanceApi'
import ChangeGreenRed from './components/ChangeGreenRed'
import PulseCanvas from './components/PulseCanvas'
import {
  initialPriceReducerState,
  initialConnectionReducerState,
  token,
  usdSymbol,
  btcSymbol,
} from './constants'
import OnOff from './components/OnOff'

export default function App() {
  const [usdState, dispatchUsd] = useReducer(usdReducer, initialPriceReducerState)
  const [btcState, dispatchBtc] = useReducer(btcReducer, initialPriceReducerState)
  const [displayBitcoin, setDisplayBitcoin] = useLocalStorage('display_bitcoin', false)
  const [connection, dispatchConnection] = useReducer(
    processTimeReducer,
    initialConnectionReducerState,
  )

  useEffect(() => {
    const usdLivePriceInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/price?symbol=${token.ticker}BUSD`, (data, error) => {
        if (!error) dispatchUsd({type: 'ADD_PRICE', payload: data})
        dispatchConnection({type: 'ADD_PROCESSTIME', payload: data.processTime})
      })
    }, 1000)

    const usdPriceChangeInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/24hr?symbol=${token.ticker}BUSD`, (data, error) => {
        if (!error) dispatchUsd({type: 'ADD_24HOUR', payload: data})
        dispatchConnection({type: 'ADD_PROCESSTIME', payload: data.processTime})
      })
    }, 5000)

    const btcLivePriceInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/price?symbol=${token.ticker}BTC`, (data, error) => {
        if (!error) dispatchBtc({type: 'ADD_PRICE', payload: data})
        dispatchConnection({type: 'ADD_PROCESSTIME', payload: data.processTime})
      })
    }, 1000)

    const btcPriceChangeInterval = setInterval(() => {
      handleBinanceApi(`/api/v3/ticker/24hr?symbol=${token.ticker}BTC`, (data, error) => {
        if (!error) dispatchBtc({type: 'ADD_24HOUR', payload: data})
        dispatchConnection({type: 'ADD_PROCESSTIME', payload: data.processTime})
      })
    }, 5000)

    return () => {
      clearInterval(usdLivePriceInterval)
      clearInterval(usdPriceChangeInterval)
      clearInterval(btcLivePriceInterval)
      clearInterval(btcPriceChangeInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const dataPoints = displayBitcoin ? btcState.dataPoints : usdState.dataPoints
  const change24hr = displayBitcoin ? btcState.change24hr : usdState.change24hr

  return (
    <div className='app flex-col' style={{backgroundColor: token.backgroundColor}}>
      <OnOff
        className='connection'
        on='Good connection'
        off='Bad connection'
        connected={connection.goodConnection}
      />

      <button
        className='toggle-currency'
        style={{color: token.accentColor}}
        onClick={() => setDisplayBitcoin((prev) => !prev)}>
        {displayBitcoin ? 'Show in USD' : 'Show in BTC'}
      </button>

      <header className='ticker flex-col'>
        <img src={token.logo} alt='logo' className='logo' />

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

      <PulseCanvas dataPoints={dataPoints} color={token.accentColor} />
    </div>
  )
}
