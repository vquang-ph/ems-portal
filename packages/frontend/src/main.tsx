import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./app/AppRouter";
import "./index.css";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  );
}
