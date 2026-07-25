import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  CarbonPlantHub,
  ClientCarbonPlant,
  GuestCarbonPlantRouted,
  OperatorCarbonPlant,
  WorkerCarbonPlant,
} from "./plant-carbon/PrototypeCarbonPage";

/**
 * Standalone router for the Carbon document only.
 * basename matches the URL prefix served by prototype-carbon.html.
 */
export function CarbonAppRouter() {
  return (
    <BrowserRouter basename="/prototype-carbon">
      <Routes>
        <Route path="/" element={<CarbonPlantHub />} />
        <Route path="/operator" element={<OperatorCarbonPlant />} />
        <Route path="/guest" element={<GuestCarbonPlantRouted />} />
        <Route path="/client" element={<ClientCarbonPlant />} />
        <Route path="/worker" element={<WorkerCarbonPlant />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
