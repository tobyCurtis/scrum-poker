import * as path from "https://deno.land/std@0.132.0/path/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.132.0/streams/mod.ts";
import { v4 } from "https://deno.land/std@0.132.0/uuid/mod.ts";

interface Player {
  user: string;
  points?: number;
}

interface RoomState {
  sockets: Map<string, WebSocket>;
  players: Map<string, Player>;
}

const STATIC_ROOT = Deno.env.get("STATIC_ROOT") ?? "public";
const rooms = new Map<string, RoomState>();

const port = parseInt(Deno.env.get('PORT') ?? '3000');
const server = Deno.listen({ port });

function getRoom(roomId: string): RoomState {
  const trimmed = roomId.trim() || "main";
  if (!rooms.has(trimmed)) {
    rooms.set(trimmed, { sockets: new Map(), players: new Map() });
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return rooms.get(trimmed)!;
}

function broadcast(room: RoomState, payload: Record<string, unknown>) {
  if (!payload.roomId) {
    payload.roomId = "main";
  }
  room.sockets.forEach((socket) => {
    try {
      socket.send(JSON.stringify(payload));
    } catch (_err) {
      /* ignore send errors */
    }
  });
}

function updatePlayers(roomId: string, type: string) {
  const room = getRoom(roomId);
  broadcast(room, { type, players: [...room.players.values()], roomId });
}

async function handleWebSocket(requestEvent) {
  const upgrade = requestEvent.request.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response("request isn't trying to upgrade to websocket.");
  }
  const { socket, response } = Deno.upgradeWebSocket(requestEvent.request);
  const uid = v4.generate();
  let clientRoomId = "main";

  socket.onopen = () => {
    getRoom(clientRoomId).sockets.set(uid, socket)
  };

  socket.onmessage = (e) => {
    const message = JSON.parse(e.data)
    const roomId = typeof message.roomId === 'string' ? message.roomId.trim() : ''

    if (!roomId) {
      return
    }

    if (roomId !== clientRoomId) {
      // Move socket to the new room
      const oldRoom = getRoom(clientRoomId);
      oldRoom.sockets.delete(uid);
      oldRoom.players.delete(uid);
      if (oldRoom.sockets.size === 0 && oldRoom.players.size === 0) {
        rooms.delete(clientRoomId);
      } else {
        updatePlayers(clientRoomId, 'playerUpdate');
      }
      clientRoomId = roomId;
    }

    const room = getRoom(roomId);
    room.sockets.set(uid, socket);

    if (message.type === 'playerUpdate') {
      const user = typeof message.user === 'string' ? message.user.trim() : ''
      const points = message.points

      if (!user) {
        return
      }

      room.players.set(uid, { user, points })
      updatePlayers(roomId, message.type)

    } else if (message.type === 'playerDisconnect') {
      const user = typeof message.user === 'string' ? message.user.trim() : ''

      if (!user) {
        return
      }

      for (const [socketId, player] of room.players.entries()) {
        if (player.user === user) {
          room.players.delete(socketId)
        }
      }
      updatePlayers(roomId, 'playerUpdate')

    } else if (message.type === 'getPlayers') {
      updatePlayers(roomId, 'playerUpdate')

    } else if (message.type === 'cardFlip') {
      broadcast(room, { type: 'cardFlip', roomId })

    } else if (message.type === 'nextIssue') {
      room.players.forEach(player => {
        player.points = undefined
      })
      updatePlayers(roomId, message.type)

    } else if (message.type === 'kickPlayer') {
      const target = typeof message.target === 'string' ? message.target.trim() : '';
      if (!target) {
        return;
      }

      for (const [socketId, player] of room.players.entries()) {
        if (player.user === target) {
          const targetSocket = room.sockets.get(socketId);
          try {
            targetSocket?.send(JSON.stringify({ type: 'kicked', roomId }));
            targetSocket?.close();
          } catch (_err) {
            /* ignore send errors */
          }
          room.sockets.delete(socketId);
          room.players.delete(socketId);
        }
      }
      updatePlayers(roomId, 'playerUpdate');

    } else if (message.type === 'heartbeat') {
      // ignore

    } else {
      // ignore unknown
    }
  };

  socket.onerror = (e) => {
    socket.close()
  };

  socket.onclose = () => {
    if (clientRoomId) {
      const room = getRoom(clientRoomId);
      room.sockets.delete(uid);
      room.players.delete(uid);
      if (room.sockets.size === 0 && room.players.size === 0) {
        rooms.delete(clientRoomId);
      } else {
        updatePlayers(clientRoomId, 'playerUpdate');
      }
    }
  };

  await requestEvent.respondWith(response);
}

async function openGeneralFilepath(requestEvent, filepath) {
  let file;
  try {
    // Resolve safely under STATIC_ROOT
    const fsPath = path.join(STATIC_ROOT, filepath);
    file = await Deno.open(fsPath, { read: true });
    const stat = await file.stat();

    if (stat.isDirectory) {
      file.close();
      const indexPath = path.join(STATIC_ROOT, filepath, "index.html");
      file = await Deno.open(indexPath, { read: true });
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

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);

  for await (const requestEvent of httpConn) {
    const url = new URL(requestEvent.request.url);
    const filepath = decodeURIComponent(url.pathname);

    if (filepath === '/ws') {
      handleWebSocket(requestEvent)
    } else {
      openGeneralFilepath(requestEvent, filepath)
    }

  }
}

for await (const conn of server) {
  serveHttp(conn);
}
