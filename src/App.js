import {useEffect, useRef, useState} from 'react'
import logo from './images/cardano-logo-1024x1024.png'

const ticker = 'ADABUSD'
const canvasColor = '#3564f6'
const maxQueue = 100

let animationFrameId
let pulseCount = 0

function App() {
  const [dataPoints, setDataPoints] = useState([])
  const canvasRef = useRef(null)

  useEffect(() => {
    // get price data on an interval basis (every 1 second)
    const interval = setInterval(
      () =>
        fetch(`https://www.binance.com/api/v3/ticker/price?symbol=${ticker}`)
          .then(async (response) => {
            const {symbol, price} = await response.json()
            // add the price (and some extra data) to the state array,
            // whilst making sure the queue length doesn't exceed the allowed number (see variable "maxQueue")
            setDataPoints((prev) => {
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

    // set width and height according to screen size.
    // this is also applied when the screen size changes
    canvas.width = window.innerWidth - 100
    canvas.height = window.innerHeight - 420

    // eslint-disable-next-line
  }, [window.innerWidth, window.innerHeight])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // set colors of canvas items.
    // basically required only once, but it won't hurt performance by applying this again when this useEffect is called
    ctx.strokeStyle = canvasColor
    ctx.fillStyle = canvasColor

    // the animation draw function, creates the visuals on the canvas
    const draw = () => {
      pulseCount++
      let maxPrice = 0
      let minPrice = 0

      // find the highest price, and lowest price in the current queue
      dataPoints.forEach(({price}) => {
        if (price > maxPrice) {
          maxPrice = price
        } else if (price < minPrice || minPrice === 0) {
          minPrice = price
        }
      })

      // generic calculators to get the X and Y positions for each data point
      const pulseRadius = 7 * Math.sin(pulseCount * 0.05) ** 2
      const getX = (index) => (canvas.width / maxQueue) * index
      const getY = (price) =>
        Math.abs((canvas.height / (maxPrice - minPrice)) * (price - minPrice) - canvas.height)

      // draw the pulse dot
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.beginPath()
      ctx.arc(
        dataPoints.length >= canvas.width
          ? getX(canvas.width - pulseRadius)
          : dataPoints.length
          ? getX(dataPoints.length - 1)
          : getX(0),
        dataPoints.length ? getY(dataPoints[dataPoints.length - 1].price) : getY(0),
        pulseRadius,
        0,
        2 * Math.PI,
      )
      ctx.fill()

      // draw the graph lines
      ctx.beginPath()
      dataPoints.forEach(({price}, i) => {
        if (i === 0) {
          ctx.moveTo(getX(i), getY(price))
        } else {
          ctx.lineTo(getX(i), getY(price))
        }
      })
      ctx.stroke()

      animationFrameId = window.requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [dataPoints])

  return (
    <div className='app flex-col'>
      <header className='ticker flex-col'>
        <img src={logo} alt='logo' className='logo' />
        <span className='price'>
          ${dataPoints.length ? dataPoints[dataPoints.length - 1].price : 0}
        </span>
      </header>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default App
