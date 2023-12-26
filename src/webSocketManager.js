// import { players } from './stores/pokieStore.js'


// console.log('in here', $players)

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
                            this.sendMessage({type: 'heartbeat'})
                        } catch (error) {
                            console.log('heartbeat error', error)
                            clearInterval(keepAliveInterval)
                        }
                    }
                    let keepAliveInterval = setInterval(keepAlive, [heartbeatTimeInMilliseconds]);

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