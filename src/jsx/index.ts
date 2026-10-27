/**
 * ThreeDot Declarative JSX / TSX Adapter
 *
 * Provides a native, lightweight JSX factory that instantiates and nests
 * ThreeDot nodes declaratively without requiring external UI frameworks.
 * Seamlessly integrates with the SignalBus via 'threedot-signal' attributes.
 */

import { Node } from '../core/node/Node';
import { SignalBus } from '../core/signals/SignalBus';
import { getNodeType } from '../core/scene/PackedScene';

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
  threedotEvent?: string;
  [key: string]: any;
}

/**
 * JSX factory function for createElement.
 * Supports any tag: HTML string tags, ThreeDot nodes, UI controls, and custom components.
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
    // String tag — resolve registered node class or map HTML tags to controls
    const nodeName = typeof type === 'string' ? type : String(type);
    const capitalized = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
    const RegisteredCls = (getNodeType(nodeName) || getNodeType(capitalized)) as NodeClass | undefined;

    if (RegisteredCls) {
      instance = new RegisteredCls(combinedProps);
    } else {
      const lower = nodeName.toLowerCase();
      if (lower === 'div' || lower === 'section') {
        const ControlCls = getNodeType('Control') as NodeClass | undefined;
        instance = ControlCls ? new ControlCls(combinedProps) : new Node({ name: nodeName });
      } else if (lower === 'span' || lower === 'p') {
        const LabelCls = getNodeType('Label') as NodeClass | undefined;
        instance = LabelCls ? new LabelCls(combinedProps) : new Node({ name: nodeName });
      } else if (lower === 'input') {
        const LineEditCls = getNodeType('LineEdit') as NodeClass | undefined;
        instance = LineEditCls ? new LineEditCls(combinedProps) : new Node({ name: nodeName });
      } else {
        instance = new Node({ name: nodeName });
      }
    }
  }

  // Attach children
  for (const child of allChildren) {
    if (child instanceof Node) {
      instance.addChild(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      // Assign string/number children to node text property if available (e.g. Button, Label)
      if ('text' in instance && typeof (instance as any).text === 'string' && !(instance as any).text) {
        (instance as any).text = String(child);
      }
    }
  }

  if (props) {
    // 1. Handle signal subscriptions specified in props: on[SignalName] on ANY tag
    for (const [key, val] of Object.entries(props)) {
      if (key.startsWith('on') && typeof val === 'function') {
        const eventName = key.slice(2, 3).toLowerCase() + key.slice(3);
        const signal = (instance as any)[eventName];
        if (signal && typeof signal.connect === 'function') {
          signal.connect(val);
        } else if (
          eventName === 'click' &&
          (instance as any).pressed &&
          typeof (instance as any).pressed.connect === 'function'
        ) {
          // Convenience alias: onClick -> pressed on Button / interactive nodes
          (instance as any).pressed.connect(val);
        } else {
          // If instance has an underlying DOM element, attach standard DOM event listener
          const domEl =
            (instance as any).element ||
            (instance as any)._buttonElement ||
            (instance as any).domElement;
          if (domEl && typeof domEl.addEventListener === 'function') {
            domEl.addEventListener(eventName, val);
          }
        }
      }
    }

    // 2. Handle threedot-signal declarative dispatch on ANY tag
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

      const customEvent = props['threedot-event'] || props['threedotEvent'];
      const domEl =
        (instance as any).element ||
        (instance as any)._buttonElement ||
        (instance as any).domElement;

      // Bridge attributes to underlying DOM element (compatible with SignalBus DOM bridge)
      if (domEl && typeof domEl.setAttribute === 'function') {
        domEl.setAttribute('threedot-signal', signalName);
        if (rawParams !== undefined) {
          domEl.setAttribute(
            'threedot-params',
            typeof rawParams === 'string' ? rawParams : JSON.stringify(params)
          );
        }
        if (customEvent) {
          domEl.setAttribute('threedot-event', customEvent);
        }
      }

      let connected = false;

      // If a specific triggering signal was requested via threedotEvent / threedot-event
      if (customEvent && typeof customEvent === 'string') {
        const customSignal = (instance as any)[customEvent];
        if (customSignal && typeof customSignal.connect === 'function') {
          customSignal.connect((...eventArgs: any[]) => {
            const emitArgs = params.length > 0 ? params : eventArgs;
            SignalBus.emit(signalName, ...emitArgs);
          });
          connected = true;
        } else if (domEl && typeof domEl.addEventListener === 'function') {
          domEl.addEventListener(customEvent, (e: any) => {
            e?.preventDefault?.();
            SignalBus.emit(signalName, ...params);
          });
          connected = true;
        }
      }

      // Check default interactive signals on ANY node instance
      if (!connected) {
        const triggerSignal =
          (instance as any).pressed ||
          (instance as any).clicked ||
          (instance as any).toggled ||
          (instance as any).selected ||
          (instance as any).trigger ||
          (instance as any).activated;

        if (triggerSignal && typeof triggerSignal.connect === 'function') {
          triggerSignal.connect(() => {
            SignalBus.emit(signalName, ...params);
          });
          connected = true;
        }
      }

      // If not connected to a node signal but has a DOM element, attach click listener
      if (!connected && domEl && typeof domEl.addEventListener === 'function') {
        domEl.addEventListener('click', (e: any) => {
          e?.preventDefault?.();
          SignalBus.emit(signalName, ...params);
        });
        connected = true;
      }

      // Fallback for any generic Node (e.g. Node, Node3D, MeshInstance3D) on ready signal
      if (!connected) {
        const fallbackSignal =
          (customEvent && (instance as any)[customEvent]) ||
          (customEvent === undefined && (instance as any).ready);

        if (fallbackSignal && typeof fallbackSignal.connect === 'function') {
          fallbackSignal.connect((...eventArgs: any[]) => {
            const emitArgs = params.length > 0 ? params : eventArgs;
            SignalBus.emit(signalName, ...emitArgs);
          });
          connected = true;
        }
      }
    }
  }

  return instance;
}

/**
 * Compiles a declarative JSX tree element into an instantiated ThreeDot Node hierarchy.
 */
export function instantiate<T extends Node = Node>(element: T | any): T {
  if (element instanceof Node) return element as T;
  if (typeof element === 'function') {
    try {
      return new (element as any)();
    } catch {
      return (element as any)();
    }
  }
  return element as T;
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
