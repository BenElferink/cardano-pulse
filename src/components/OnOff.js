export default function OnOff({connected = false, on = 'on', off = 'off', ...props}) {
  return (
    <div {...props}>
      <span style={{position: 'relative'}}>
        <span style={dotStyle(connected)} />
        {connected ? on : off}
      </span>
    </div>
  )
}

function dotStyle(online) {
  return {
    width: '3px',
    height: '3px',
    borderRadius: '100%',
    backgroundColor: online ? 'lime' : 'tomato',
    boxShadow: `0 0 4px 1px ${online ? 'lime' : 'tomato'}`,
    position: 'absolute',
    left: '-10px',
    top: '50%',
    transform: 'translateY(-50%)',
  }
}
