import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router";
import App from "./App";
import { DocsRegistryProvider } from "./context/DocsRegistryContext";
import {
  ClientPlant,
  GuestPlant,
  OperatorPlant,
  PlantHub,
  WorkerPlant,
} from "./plant/PrototypePage";
import { RegisterPage } from "./register/pages/RegisterPage";
import { isRegisterRouteEnabled } from "./register/registerAuth";

function GuestPlantRouted() {
  const navigate = useNavigate();
  return <GuestPlant onOpenDesk={() => navigate("/prototype/client")} />;
}

/**
 * Main SPA. Must not import plant-carbon — Carbon's global CSS would poison
 * Plant/Register. Carbon lives in a separate document (prototype-carbon.html).
 */
export function AppRouter() {
  const registerEnabled = isRegisterRouteEnabled();

  return (
    <BrowserRouter>
      <DocsRegistryProvider>
        <Routes>
          {registerEnabled ? <Route path="/register" element={<RegisterPage />} /> : null}
          <Route path="/prototype" element={<PlantHub />} />
          <Route path="/prototype/operator" element={<OperatorPlant />} />
          <Route path="/prototype/guest" element={<GuestPlantRouted />} />
          <Route path="/prototype/client" element={<ClientPlant />} />
          <Route path="/prototype/worker" element={<WorkerPlant />} />
          <Route path="/" element={<App />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DocsRegistryProvider>
    </BrowserRouter>
  );
}
