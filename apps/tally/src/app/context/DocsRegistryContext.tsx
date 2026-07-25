import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NotionIconName } from "../icons/notion-icon-urls";
import type { HolonLucideIconName } from "../components/docs/holonIcons";

export type HolonRegistration = {
  id: string;
  label: string;
  icon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  parentId: string | null;
  order: number;
  inView: boolean;
};

export type HolonTreeNode = HolonRegistration & {
  children: HolonTreeNode[];
};

type DocsRegistryContextValue = {
  holons: Map<string, HolonRegistration>;
  register: (holon: HolonRegistration) => void;
  unregister: (id: string) => void;
  registerFocus: (id: string, handler: () => void) => void;
  unregisterFocus: (id: string) => void;
  focusHolon: (id: string) => void;
  tree: HolonTreeNode[];
};

const DocsRegistryContext = createContext<DocsRegistryContextValue | null>(null);

function buildHolonTree(holons: Map<string, HolonRegistration>): HolonTreeNode[] {
  const nodes = new Map<string, HolonTreeNode>();

  for (const holon of holons.values()) {
    nodes.set(holon.id, { ...holon, children: [] });
  }

  const roots: HolonTreeNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (list: HolonTreeNode[]) => {
    list.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    for (const child of list) sortNodes(child.children);
  };

  sortNodes(roots);
  return roots;
}

export function DocsRegistryProvider({ children }: { children: ReactNode }) {
  const [holons, setHolons] = useState<Map<string, HolonRegistration>>(() => new Map());
  const focusHandlersRef = useRef(new Map<string, () => void>());

  const register = useCallback((holon: HolonRegistration) => {
    setHolons((prev) => {
      const existing = prev.get(holon.id);
      if (
        existing &&
        existing.label === holon.label &&
        existing.icon === holon.icon &&
        existing.lucideIcon === holon.lucideIcon &&
        existing.parentId === holon.parentId &&
        existing.order === holon.order &&
        existing.inView === holon.inView
      ) {
        return prev;
      }
      const next = new Map(prev);
      next.set(holon.id, holon);
      return next;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setHolons((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const registerFocus = useCallback((id: string, handler: () => void) => {
    focusHandlersRef.current.set(id, handler);
  }, []);

  const unregisterFocus = useCallback((id: string) => {
    focusHandlersRef.current.delete(id);
  }, []);

  const focusHolon = useCallback((id: string) => {
    focusHandlersRef.current.get(id)?.();
  }, []);

  const tree = useMemo(() => buildHolonTree(holons), [holons]);

  const value = useMemo(
    () => ({ holons, register, unregister, registerFocus, unregisterFocus, focusHolon, tree }),
    [holons, register, unregister, registerFocus, unregisterFocus, focusHolon, tree],
  );

  return (
    <DocsRegistryContext.Provider value={value}>{children}</DocsRegistryContext.Provider>
  );
}

export function useDocsRegistry(): DocsRegistryContextValue {
  const ctx = useContext(DocsRegistryContext);
  if (!ctx) {
    throw new Error("useDocsRegistry must be used within DocsRegistryProvider");
  }
  return ctx;
}
