import {useEffect, useRef, useState} from 'react'
import logo from './images/cardano-logo-1024x1024.png'

const ticker = 'ADABUSD'
const maxQueue = window.innerWidth
let frameCount = 0
let animationFrameId

function App() {
  const [coinPrices, setCoinPrices] = useState([
    {symbol: ticker, price: 0.0, timestamp: Date.now()},
  ])
  const canvasRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(
      () =>
        fetch(`https://www.binance.com/api/v3/ticker/price?symbol=${ticker}`)
          .then(async (response) => {
            const {symbol, price} = await response.json()
            setCoinPrices((prev) => {
              while (prev.length >= maxQueue) prev.shift()
              return [
                ...prev,
                {symbol, price: Number(Number(price).toFixed(4)), timestamp: Date.now()},
              ]
            })
          })
          .catch((error) => console.error(error)),
      1000,
    )
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = window.innerWidth - 100
    canvas.height = window.innerHeight - 420

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#3564f6'
    ctx.fillStyle = '#3564f6'
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvasRef.current.getContext('2d')

    const draw = () => {
      frameCount++
      let maxPrice = 0
      let minPrice = 0
      coinPrices.forEach(({price}) => {
        if (price > maxPrice) {
          maxPrice = price
        } else if (price < minPrice || minPrice === 0) {
          minPrice = price
        }
      })

      const pulseRadius = 7 * Math.sin(frameCount * 0.05) ** 2
      const getY = (price) =>
        Math.abs((canvas.height / (maxPrice - minPrice)) * (price - minPrice) - canvas.height)

      // pulse dot
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.beginPath()
      ctx.arc(
        coinPrices.length >= canvas.width ? canvas.width - pulseRadius : coinPrices.length - 1,
        getY(coinPrices[coinPrices.length - 1].price),
        pulseRadius,
        0,
        2 * Math.PI,
      )
      ctx.fill()

      // graph lines
      ctx.beginPath()
      coinPrices.forEach(({price}, dataPointX) => {
        if (dataPointX === 0) {
          ctx.moveTo(dataPointX, getY(price))
        } else {
          ctx.lineTo(dataPointX, getY(price))
        }
      })
      ctx.stroke()

      animationFrameId = window.requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [coinPrices])

  return (
    <div className='app flex-col'>
      <header className='ticker flex-col'>
        <img src={logo} alt='logo' className='logo' />
        <span className='price'>${coinPrices[coinPrices.length - 1].price}</span>
      </header>

      <canvas ref={canvasRef} />
    </div>
  )
}

export default App
