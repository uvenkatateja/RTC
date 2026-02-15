// Server-Sent Events (SSE) based real-time system
// Using SSE instead of WebSockets for Next.js App Router compatibility

import { RealtimeEvent } from '@/types';

type Listener = (event: RealtimeEvent) => void;

class RealtimeHub {
    private listeners: Map<string, Set<Listener>> = new Map();

    subscribe(boardId: string, listener: Listener): () => void {
        if (!this.listeners.has(boardId)) {
            this.listeners.set(boardId, new Set());
        }
        this.listeners.get(boardId)!.add(listener);

        // Return unsubscribe function
        return () => {
            const boardListeners = this.listeners.get(boardId);
            if (boardListeners) {
                boardListeners.delete(listener);
                if (boardListeners.size === 0) {
                    this.listeners.delete(boardId);
                }
            }
        };
    }

    broadcast(event: RealtimeEvent): void {
        const boardListeners = this.listeners.get(event.boardId);
        if (boardListeners) {
            boardListeners.forEach(listener => {
                try {
                    listener(event);
                } catch (e) {
                    console.error('Error in realtime listener:', e);
                }
            });
        }
    }

    getSubscriberCount(boardId: string): number {
        return this.listeners.get(boardId)?.size ?? 0;
    }
}

// Singleton instance
export const realtimeHub = new RealtimeHub();
