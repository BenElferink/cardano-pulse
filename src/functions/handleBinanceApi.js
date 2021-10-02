export default async function handleBinanceApi(
  path = '/api/v3/ping',
  callback = (responseData, error) => {
    if (!error) console.table(responseData)
  },
) {
  const startTime = performance.now()
  try {
    const response = await fetch(`https://www.binance.com${path}`)
    const data = await response.json()
    callback({...data, processTime: performance.now() - startTime})
  } catch (error) {
    console.error(error)
    callback({error, processTime: performance.now() - startTime}, 'ERROR')
  }
}
