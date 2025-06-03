import { Server as NetServer } from "http";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};

declare global {
    const io: SocketIOServer | undefined;
}
