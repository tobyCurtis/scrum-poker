import * as path from "https://deno.land/std@0.132.0/path/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.132.0/streams/mod.ts";
import { v4 } from "https://deno.land/std@0.132.0/uuid/mod.ts";

interface Player {
    name: string;
    points?: number;
}

const sockets = new Map<string, WebSocket>();
const players = new Map<string, Player>();

const port = parseInt(Deno.env.get('PORT') ?? '3000');
const server = Deno.listen({ port });
console.log(`:${port}`)

for await (const conn of server) {
  serveHttp(conn);
}

function updatePlayers(type: string) {
    sockets.forEach(socket => {
        socket.send(JSON.stringify({type, players: [...players.values()]}))
    })
}

async function serveHttp(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);

    for await (const requestEvent of httpConn) {
        // Use the request pathname as filepath
        const url = new URL(requestEvent.request.url);
        const filepath = decodeURIComponent(url.pathname);

        console.log('filepath', filepath, 'for', JSON.stringify(httpConn))

        if(filepath === '/ws'){
            const upgrade = requestEvent.request.headers.get("upgrade") || "";
            if (upgrade.toLowerCase() != "websocket") {
                console.log('socket upgrade')
                return new Response("request isn't trying to upgrade to websocket.");
            }
            const { socket, response } = Deno.upgradeWebSocket(requestEvent.request);
            socket.onopen = () => {
                console.log('socket opened')
                updatePlayers('playerUpdate')
            };
            socket.onmessage = (e) => {
                console.log("socket message:", e.data);
                let message = JSON.parse(e.data)

                if(message.type === 'playerUpdate') {
                    players.set(uid, message)

                    updatePlayers(message.type)
                } else if (message.type === 'getPlayers') {
                    updatePlayers(message.type)
                } else if (message.type === 'cardFlip') {
                    sockets.forEach(socket => {
                        socket.send(JSON.stringify({type: 'cardFlip'}))
                    })
                } else if (message.type === 'nextIssue') {
                    players.forEach(player => {
                        player.points = undefined
                    })
                    
                    updatePlayers(message.type)
                } else if (message.type === 'heartbeat') {
                    console.log('boop')
                    // socket.send(JSON.stringify({type: message.type}))
                } else {
                    console.log('unknown message is', message)
                }
            };
            socket.onerror = (e) => {
                console.log("socket errored:", e)   
                console.log('closing socket')
                socket.close()
            };
            socket.onclose = () => {
                console.log('socket closing')
                sockets.delete(uid)
                players.delete(uid)

                updatePlayers('playerUpdate')
            };
            
            const uid = v4.generate();
            console.log('setting socket', uid)
            sockets.set(uid, socket)

            console.log('responding with', response)
            await requestEvent.respondWith(response);
        } else {
            let file;
            try {
                file = await Deno.open("." + filepath, { read: true });
                const stat = await file.stat();
    
                if (stat.isDirectory) {
                    file.close();
                    const filePath = path.join("./", filepath, "index.html");
                    file = await Deno.open(filePath, { read: true });
                }
            } catch { 
                const notFoundResponse = new Response("404 Not Found", { status: 404 });
                await requestEvent.respondWith(notFoundResponse);
                return;
            }
    
            const readableStream = readableStreamFromReader(file);
            const response = new Response(readableStream);
            await requestEvent.respondWith(response);
        }

    }   
}
  