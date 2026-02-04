import { name, lastChosenPoints, isSpectator, showNameSelection } from './stores/pokieStore.js'

const heartbeatTimeInMilliseconds = 50000
const wshost = production ? location.origin.replace(/^http/, 'ws') + '/ws' : 'ws://localhost:3000/ws'

function getNameValue() {
  let current
  name.subscribe(v => current = v)()
  return typeof current === 'string' ? current.trim() : ''
}

function sendSafe(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload))
  }
}

export default {
  ws: {},
  initWebSocket: function () {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wshost)
        this.ws.addEventListener('open', () => {
          console.log('websocket opened')

          const keepAlive = () => {
            try {
              sendSafe(this.ws, { type: 'heartbeat' })
            } catch (error) {
              console.log('heartbeat error', error)
              clearInterval(keepAliveInterval)
            }
          }
          let keepAliveInterval = setInterval(keepAlive, [heartbeatTimeInMilliseconds]);



          const reconnect = () => {
            return this.initWebSocket()
              .then(() => {
                const currentName = getNameValue()

                if (currentName) {
                  sendSafe(this.ws, { type: 'playerUpdate', user: currentName, points: lastChosenPoints })
                }
                if (currentName || (!currentName && isSpectator)) {
                  console.log('showing board')
                  showNameSelection.set(false)
                }
              })
          }

          document.addEventListener('visibilitychange', () => {
            const websocketNotConnected = this.ws.readyState !== WebSocket.OPEN
            const windowIsActive = document.visibilityState === 'visible'

            if (windowIsActive && websocketNotConnected) {
              console.log('dead on return')
              reconnect()
            }
          });

          // Graceful disconnect when closing the tab/window.
          window.addEventListener('beforeunload', () => {
            const currentName = getNameValue()
            if (currentName) {
              try {
                sendSafe(this.ws, { type: 'playerDisconnect', user: currentName })
              } catch (err) {
                console.warn('failed to notify disconnect', err)
              }
            }
          })

          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  sendMessage: function (message) {
    sendSafe(this.ws, message)
  }
}
