import {maxQueue, percentDecimals, btcDecimals} from '../constants'

export default function reducer(state, action) {
  const {dataPoints, change24hr} = state
  const {type, payload} = action
  const {price, priceChange, priceChangePercent} = payload

  switch (type) {
    case 'ADD_PRICE': {
      const prev = [...dataPoints]
      // add the price data to the state array,
      // whilst making sure the queue length doesn't exceed the allowed number (see variable "maxQueue")
      while (prev.length >= maxQueue) prev.shift()
      return {
        ...state,
        dataPoints: [
          ...prev,
          {price: Number(Number(price).toFixed(btcDecimals)), timestamp: Date.now()},
        ],
      }
    }

    case 'ADD_24HOUR': {
      // add the price change data to the state object
      return {
        ...state,
        change24hr: {
          ...change24hr,
          priceChange: Number(Number(priceChange).toFixed(btcDecimals)),
          priceChangePercent: Number(Number(priceChangePercent).toFixed(percentDecimals)),
          timestamp: Date.now(),
        },
      }
    }

    default: {
      return state
    }
  }
}
