import { useStore } from "@/store/useStore";

// Reset the persisted zustand store to a clean slate between tests.
export function resetStore() {
  useStore.setState({
    pages: {},
    rootOrder: [],
    currentPageId: null,
    expanded: {},
    theme: "light",
  });
}

export const store = () => useStore.getState();
