import * as path from "https://deno.land/std@0.132.0/path/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.132.0/streams/mod.ts";
import { v4 } from "https://deno.land/std@0.132.0/uuid/mod.ts";

interface Player {
    name: string;
    points?: number;
}

let sockets = new Map<string, WebSocket>();
let players = new Map<string, Player>();

const port = parseInt(Deno.env.get('PORT') ?? '3000');
const server = Deno.listen({ port });
console.log('http://localhost:3000')

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

        console.log('filepath', filepath)

        if(filepath === '/ws'){
            const upgrade = requestEvent.request.headers.get("upgrade") || "";
            if (upgrade.toLowerCase() != "websocket") {
              return new Response("request isn't trying to upgrade to websocket.");
            }
            const { socket, response } = Deno.upgradeWebSocket(requestEvent.request);
            socket.onopen = () => {
                updatePlayers('playerUpdate')
            };
            socket.onmessage = (e) => {
                console.log("socket message:", e.data);
                let message = JSON.parse(e.data)

                if(message.type === 'playerUpdate') {
                    players.set(uid, message)

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
                } else {
                    console.log('message is', message)
                }
            
            };
            socket.onerror = (e) => console.log("socket errored:", e);
            socket.onclose = () => {
                sockets.delete(uid)
                players.delete(uid)

                updatePlayers('playerUpdate')
            }; // remove from sockets map
            
            const uid = v4.generate();
            sockets.set(uid, socket)

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
  