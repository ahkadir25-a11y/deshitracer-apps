import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtHelpers } from './jwt';
import config from '../config';
import { JwtPayload } from 'jsonwebtoken';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = JwtHelpers.verifyToken(token, config.jwt.accessSecret as string) as JwtPayload;
      // We attach the user ID and role, but we also expect the client to tell us which business room to join
      // since a user might be a staff member for a specific business.
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client explicitly requests to join a business room. We MUST verify the
    // authenticated user actually belongs to that business, otherwise any
    // logged-in user could join any room and receive another tenant's realtime
    // orders/payments (cross-tenant data leak).
    socket.on('join_business', async (businessId: string) => {
      try {
        const user = (socket as any).user as JwtPayload & {
          id?: string;
          role?: string;
          email?: string;
        };
        if (!user || !businessId) return;

        // Admins can observe any business.
        if (user.role === 'admin') {
          socket.join(`business_${businessId}`);
          return;
        }

        const { Business } = await import('../modules/business/business.model');
        const { RotaEmployee } = await import('../modules/rota/employee/employee.model');

        const biz = await Business.findById(businessId).select('owner').lean();
        const isOwner = !!biz && String((biz as any).owner) === String(user.id);

        let isStaff = false;
        if (!isOwner) {
          const staff = await RotaEmployee.exists({
            business: businessId,
            isDeleted: false,
            $or: [
              ...(user.id ? [{ user: user.id }] : []),
              ...(user.email ? [{ email: String(user.email).toLowerCase() }] : []),
            ],
          });
          isStaff = !!staff;
        }

        if (!isOwner && !isStaff) {
          console.warn(`Socket ${socket.id} denied join for business_${businessId}`);
          return;
        }

        socket.join(`business_${businessId}`);
        console.log(`Socket ${socket.id} joined room business_${businessId}`);
      } catch (err: any) {
        console.error('[socket] join_business check failed:', err?.message);
      }
    });

    socket.on('leave_business', (businessId: string) => {
      socket.leave(`business_${businessId}`);
      console.log(`Socket ${socket.id} left room business_${businessId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Safely emit a real-time event to a business room. Never throws — if the socket
 * server isn't ready or the businessId is missing, it silently no-ops so it can be
 * dropped into any service/controller without risking the request.
 */
export const emitToBusiness = (businessId: unknown, event: string, data?: unknown) => {
  try {
    if (!io || !businessId) return;
    io.to(`business_${String(businessId)}`).emit(event, data ?? {});
  } catch {
    // real-time is best-effort — never break the mutation that triggered it
  }
};
