/**
 * ThreeDot SignalBus & HTML DOM Signal Bridge
 *
 * Provides global decoupled pub/sub messaging and connects
 * HTML/DOM elements and JSX tags to ThreeDot signals seamlessly.
 */

import { Signal, type SignalListener } from './Signal';

class SignalBusManager {
  private signals: Map<string, Signal<any>> = new Map();
  private domBridgeInitialized = false;

  /**
   * Get or create a global Signal by name.
   */
  get<T extends unknown[] = any[]>(name: string): Signal<T> {
    if (!this.signals.has(name)) {
      this.signals.set(name, new Signal<T>(name));
    }
    return this.signals.get(name)!;
  }

  /**
   * Emit a global signal by name with arguments.
   */
  emit(name: string, ...args: any[]): void {
    this.get(name).emit(...args);
  }

  /**
   * Connect a listener to a global signal by name.
   */
  connect<T extends unknown[] = any[]>(name: string, listener: SignalListener<T>): () => void {
    return this.get<T>(name).connect(listener);
  }

  /**
   * Alias for connect.
   */
  on<T extends unknown[] = any[]>(name: string, listener: SignalListener<T>): () => void {
    return this.connect<T>(name, listener);
  }

  /**
   * Disconnect a listener from a global signal by name.
   */
  disconnect<T extends unknown[] = any[]>(name: string, listener: SignalListener<T>): void {
    if (this.signals.has(name)) {
      this.signals.get(name)!.disconnect(listener);
    }
  }

  /**
   * Alias for disconnect.
   */
  off<T extends unknown[] = any[]>(name: string, listener: SignalListener<T>): void {
    this.disconnect<T>(name, listener);
  }

  /**
   * Check if a signal with the given name has active listeners.
   */
  hasListeners(name: string): boolean {
    return this.signals.has(name) && this.signals.get(name)!.connectionCount > 0;
  }

  /**
   * Automatically inspect and bind HTML elements or JSX nodes containing
   * the 'threedot-signal' attribute to the signal system.
   *
   * Supported HTML / DOM attributes:
   * - `threedot-signal="signal_name"`
   * - `threedot-params='["param1", 42]'` or `threedot-params="single_param"`
   * - `threedot-event="click"` (defaults to 'click')
   * - `threedot-target="NodeName"` (optional target node lookup)
   */
  initDOMBridge(root?: HTMLElement | Document | null): void {
    if (typeof window === 'undefined') return;
    const targetRoot = root ?? (typeof document !== 'undefined' ? document : null);
    if (!targetRoot || this.domBridgeInitialized) return;
    this.domBridgeInitialized = true;

    const handleDOMSignalEvent = (event: Event) => {
      let target = event.target as HTMLElement | null;
      while (target && target !== targetRoot) {
        const signalName =
          target.getAttribute('threedot-signal') ||
          target.getAttribute('data-threedot-signal');

        if (signalName) {
          const expectedEvent =
            target.getAttribute('threedot-event') ||
            target.getAttribute('data-threedot-event') ||
            'click';

          if (event.type === expectedEvent) {
            let params: any[] = [];
            const rawParams =
              target.getAttribute('threedot-params') ||
              target.getAttribute('data-threedot-params') ||
              target.getAttribute('data-signal-args') ||
              target.getAttribute('threedot-args');

            if (rawParams) {
              try {
                const parsed = JSON.parse(rawParams);
                params = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                params = rawParams.split(',').map((s) => {
                  const trimmed = s.trim();
                  const num = Number(trimmed);
                  return !isNaN(num) && trimmed !== '' ? num : trimmed;
                });
              }
            }

            // Emit globally on SignalBus
            this.emit(signalName, ...params);
            break;
          }
        }
        target = target.parentElement;
      }
    };

    targetRoot.addEventListener('click', handleDOMSignalEvent);
    targetRoot.addEventListener('change', handleDOMSignalEvent);
    targetRoot.addEventListener('input', handleDOMSignalEvent);
  }

  /**
   * Reset all global signals and state.
   */
  dispose(): void {
    for (const signal of this.signals.values()) {
      signal.dispose();
    }
    this.signals.clear();
    this.domBridgeInitialized = false;
  }
}

export const SignalBus = new SignalBusManager();
