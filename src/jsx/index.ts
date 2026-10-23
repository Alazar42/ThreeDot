/**
 * ThreeDot Declarative JSX / TSX Adapter
 *
 * Provides a native, lightweight JSX factory that instantiates and nests
 * ThreeDot nodes declaratively without requiring external UI frameworks.
 * Seamlessly integrates with the SignalBus via 'threedot-signal' attributes.
 */

import { Node } from '../core/node/Node';
import { Signal } from '../core/signals/Signal';
import { SignalBus } from '../core/signals/SignalBus';

export type NodeComponent<P = any> = (props: P) => Node;
export type NodeClass<P = any> = new (props?: P) => Node;
export type JSXElementType = NodeClass | NodeComponent | string;

export interface JSXProps {
  children?: any;
  'threedot-signal'?: string;
  threedotSignal?: string;
  'threedot-params'?: any;
  threedotParams?: any;
  'threedot-event'?: string;
  [key: string]: any;
}

/**
 * JSX factory function for createElement.
 */
export function createElement(
  type: JSXElementType,
  props: JSXProps | null,
  ...children: any[]
): Node {
  const allChildren = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
  const combinedProps = { ...(props ?? {}), children: allChildren };

  let instance: Node;

  if (typeof type === 'function') {
    // Check if it's a class constructor (inherits Node)
    if (type.prototype && (type.prototype instanceof Node || type === Node)) {
      const Cls = type as NodeClass;
      instance = new Cls(combinedProps);
    } else {
      // Function component
      const fn = type as NodeComponent;
      instance = fn(combinedProps);
    }
  } else {
    // String tag — default to generic Node
    instance = new Node({ name: type });
  }

  // Attach children
  for (const child of allChildren) {
    if (child instanceof Node) {
      instance.addChild(child);
    }
  }

  if (props) {
    // Handle signal subscriptions if specified in props: on[SignalName]
    for (const [key, val] of Object.entries(props)) {
      if (key.startsWith('on') && typeof val === 'function') {
        const signalName = key.slice(2, 3).toLowerCase() + key.slice(3);
        const signal = (instance as any)[signalName];
        if (signal && typeof signal.connect === 'function') {
          signal.connect(val);
        }
      }
    }

    // Handle threedot-signal declarative dispatch
    const signalName = props['threedot-signal'] || props['threedotSignal'];
    if (signalName && typeof signalName === 'string') {
      const rawParams =
        props['threedot-params'] ??
        props['threedotParams'] ??
        props['data-signal-args'] ??
        props['threedotArgs'];

      const params = Array.isArray(rawParams)
        ? rawParams
        : rawParams !== undefined
          ? [rawParams]
          : [];

      const triggerSignal = (instance as any).pressed || (instance as any).clicked;
      if (triggerSignal instanceof Signal) {
        triggerSignal.connect(() => {
          SignalBus.emit(signalName, ...params);
        });
      }
    }
  }

  return instance;
}

export const jsx = createElement;
export const jsxs = createElement;

export namespace JSX {
  export type Element = Node;
  export interface ElementChildrenAttribute {
    children: {};
  }
  export interface IntrinsicElements {
    [elemName: string]: JSXProps;
  }
}
