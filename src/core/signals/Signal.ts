/**
 * ThreeDot Signal System
 * 
 * Type-safe signal/event system inspired by Godot's signals.
 * Supports typed declarations, connect/disconnect, one-shot subscriptions,
 * safe emission during listener changes, and cleanup.
 */

/** A listener function type for a signal with given argument types */
export type SignalListener<T extends unknown[] = unknown[]> = (...args: T) => void;

interface SignalConnection<T extends unknown[]> {
  listener: SignalListener<T>;
  oneShot: boolean;
  target?: object;
}

/**
 * A typed Signal that can be connected to, disconnected from, and emitted.
 * Modeled after Godot's Signal system.
 */
export class Signal<T extends unknown[] = []> {
  private connections: SignalConnection<T>[] = [];
  private emitting = false;
  private pendingRemovals: Set<SignalListener<T>> = new Set();
  private pendingAdditions: SignalConnection<T>[] = [];
  readonly name: string;

  constructor(name: string = 'anonymous') {
    this.name = name;
  }

  /**
   * Connect a listener to this signal.
   * @param listener - The callback to invoke when the signal is emitted
   * @param options - Connection options
   * @returns A disconnect function for convenience
   */
  connect(
    listener: SignalListener<T>,
    options?: { oneShot?: boolean; target?: object }
  ): () => void {
    const connection: SignalConnection<T> = {
      listener,
      oneShot: options?.oneShot ?? false,
      target: options?.target,
    };

    if (this.emitting) {
      this.pendingAdditions.push(connection);
    } else {
      // Prevent duplicate connections
      if (this.connections.some(c => c.listener === listener)) {
        return () => this.disconnect(listener);
      }
      this.connections.push(connection);
    }

    const disconnect = () => this.disconnect(listener);
    (disconnect as any).disconnect = disconnect;
    return disconnect;
  }

  /**
   * Connect a listener that fires only once, then auto-disconnects.
   */
  connectOneShot(listener: SignalListener<T>): () => void {
    return this.connect(listener, { oneShot: true });
  }

  /**
   * Alias for connectOneShot.
   */
  once(listener: SignalListener<T>): () => void {
    return this.connectOneShot(listener);
  }

  /**
   * Disconnect a listener from this signal.
   */
  disconnect(listener: SignalListener<T>): void {
    if (this.emitting) {
      this.pendingRemovals.add(listener);
    } else {
      this.connections = this.connections.filter(c => c.listener !== listener);
    }
  }

  /**
   * Disconnect all listeners bound to a particular target object.
   */
  disconnectTarget(target: object): void {
    if (this.emitting) {
      for (const conn of this.connections) {
        if (conn.target === target) {
          this.pendingRemovals.add(conn.listener);
        }
      }
    } else {
      this.connections = this.connections.filter(c => c.target !== target);
    }
  }

  /**
   * Disconnect all listeners.
   */
  disconnectAll(): void {
    if (this.emitting) {
      for (const conn of this.connections) {
        this.pendingRemovals.add(conn.listener);
      }
    } else {
      this.connections = [];
    }
  }

  /**
   * Emit the signal, invoking all connected listeners.
   * Safe to connect/disconnect during emission.
   */
  emit(...args: T): void {
    this.emitting = true;
    const oneShotToRemove: SignalListener<T>[] = [];

    for (const conn of this.connections) {
      if (this.pendingRemovals.has(conn.listener)) {
        continue;
      }

      try {
        conn.listener(...args);
      } catch (error) {
        console.error(
          `[ThreeDot] Error in signal '${this.name}' listener:`,
          error
        );
      }

      if (conn.oneShot) {
        oneShotToRemove.push(conn.listener);
      }
    }

    this.emitting = false;

    // Apply pending removals (includes one-shots)
    for (const listener of oneShotToRemove) {
      this.pendingRemovals.add(listener);
    }

    if (this.pendingRemovals.size > 0) {
      this.connections = this.connections.filter(
        c => !this.pendingRemovals.has(c.listener)
      );
      this.pendingRemovals.clear();
    }

    // Apply pending additions
    if (this.pendingAdditions.length > 0) {
      for (const conn of this.pendingAdditions) {
        if (!this.connections.some(c => c.listener === conn.listener)) {
          this.connections.push(conn);
        }
      }
      this.pendingAdditions = [];
    }
  }

  /**
   * Returns the number of active connections.
   */
  get connectionCount(): number {
    return this.connections.length;
  }

  /**
   * Check if a specific listener is connected.
   */
  isConnected(listener: SignalListener<T>): boolean {
    return this.connections.some(c => c.listener === listener);
  }

  /**
   * Returns a promise that resolves the next time this signal is emitted.
   */
  wait(): Promise<T> {
    return new Promise<T>((resolve) => {
      this.connectOneShot((...args: T) => {
        resolve(args);
      });
    });
  }

  /**
   * Clean up all connections and reset state.
   */
  dispose(): void {
    this.connections = [];
    this.pendingRemovals.clear();
    this.pendingAdditions = [];
    this.emitting = false;
  }
}
