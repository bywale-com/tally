/**
 * Isolated entry for /prototype-carbon.
 * Must NEVER be imported from main.tsx / App Router — Carbon global CSS
 * would poison the Plant/Register SPA.
 */
import { createRoot } from "react-dom/client";
import { CarbonAppRouter } from "./app/CarbonAppRouter";

createRoot(document.getElementById("root")!).render(<CarbonAppRouter />);
