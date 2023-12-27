import { name, lastChosenPoints, isSpectator, showNameSelection } from './stores/pokieStore.js'


// console.log('in here', players)

// export const tempWs = {}

const heartbeatTimeInMilliseconds = 50000
const wshost = production ? location.origin.replace(/^http/, 'ws') + '/ws' : 'ws://localhost:3000/ws'

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
              this.sendMessage({ type: 'heartbeat' })
            } catch (error) {
              console.log('heartbeat error', error)
              clearInterval(keepAliveInterval)
            }
          }
          let keepAliveInterval = setInterval(keepAlive, [heartbeatTimeInMilliseconds]);



          const reconnect = () => {
            return this.initWebSocket()
              .then(() => {
                if (name) {
                  this.sendMessage({ type: 'playerUpdate', user: name, points: lastChosenPoints })
                }
                if (name || (!name && isSpectator)) {
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

          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  sendMessage: function (message) {
    this.ws.send(JSON.stringify(message))
  }
}