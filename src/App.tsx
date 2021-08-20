import {useEffect, useState} from 'react'

function App() {
  const [ada, setAda] = useState(
    JSON.parse(localStorage.getItem('ada') ?? JSON.stringify({symbol: 'ADABUSD', price: ''})),
  )

  useEffect(() => localStorage.setItem('ada', JSON.stringify(ada)), [ada])

  useEffect(() => {
    const interval = setInterval(
      () =>
        fetch(
          // 'https://www.binance.com/api/v3/avgPrice?symbol=ADABUSD'
          // 'https://www.binance.com/api/v3/ticker/24hr?symbol=ADABUSD'
          'https://www.binance.com/api/v3/ticker/price?symbol=ADABUSD',
        )
          .then(async (response) => setAda(await response.json()))
          .catch((error) => console.error(error)),
      1000,
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <img
        src='/assets/images/cardano-logo-1024x1024.png'
        alt='logo'
        style={{
          width: '11rem',
          height: '11rem',
          filter: 'drop-shadow(0.5px -0.5px 0.5px var(--light))',
        }}
      />
      <span
        style={{
          marginTop: '1rem',
          fontSize: '2rem',
          color: 'var(--light)',
        }}>
        ${Number(ada.price).toFixed(4)}
      </span>
    </div>
  )
}

export default App
