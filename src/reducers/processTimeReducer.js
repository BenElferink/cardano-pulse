const arrayLength = 20
const timeLimit = 2000

export default function reducer(state, action) {
  const {processTimes} = state
  const {type, payload} = action

  switch (type) {
    case 'ADD_PROCESSTIME': {
      const prev = [...processTimes]
      while (prev.length >= arrayLength) prev.shift()
      // create an average from the collected process times
      // and use that average to determine if the connection is good or bad
      const average = prev.reduce((a, b) => a + b) / prev.length
      return {
        goodConnection: average < timeLimit,
        processTimes: [...prev, payload],
      }
    }

    default: {
      return state
    }
  }
}
