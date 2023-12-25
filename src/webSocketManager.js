// import { players } from './stores/pokieStore.js'


// console.log('in here', $players)

// export const tempWs = {}

const heartbeatTimeInMilliseconds = 50000
const wshost = production ? location.origin.replace(/^http/, 'ws') + '/ws' : 'ws://localhost:3000/ws'

export default {
    ws: {},
    initWebSocket: function () {
        this.ws = 'test'

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(wshost)
    
            this.ws.addEventListener('open', () => {
                console.log('websocket opened')
    
                // ws.addEventListener('message', msg => {
                //     $waitingForMessage = false
                //     let message = JSON.parse(msg.data)
    
                //     if(message.type === 'playerUpdate') {
                //         $players = message.players
                //         $playersStillChoosing = getPlayersStillChoosing()
                //     } else if (message.type === 'getPlayers') {
                //         $players = message.players
                //     } else if (message.type === 'cardFlip') {
                //         checkForConfetti()
                //         generateOptions()
                //         $cardsFlipped = true
                //     } else if (message.type === 'nextIssue') {
                //         stopConfetti()
                //         $mySelection = null
                //         $cardsFlipped = false
                //         $players = message.players
                //         $lastChosenPoints = null
                //     } else if (message.type === 'heartbeat') {
                //         console.log('heartbeat response')
                //     }
                // })
    
                let keepAliveInterval = setInterval(keepAlive, [heartbeatTimeInMilliseconds]);
                function keepAlive() {
                    try {
                        sendMessage({type: 'heartbeat'})
                    } catch (error) {
                        console.log('heartbeat error', error)
                        clearInterval(keepAliveInterval)
                    }
                }
    
                resolve()
            })
        })
    }
}