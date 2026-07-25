import { createRoot } from "react-dom/client";
import { AppRouter } from "./app/Router";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />);
