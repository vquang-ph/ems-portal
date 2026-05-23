import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "jotai";
import { createStore } from "jotai/vanilla";

function renderWithStore(
  ui: React.ReactElement,
  store: ReturnType<typeof createStore>,
) {
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

export default renderWithStore;
