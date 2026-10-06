import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ModesPage } from "./pages/ModesPage";
import { GamePage } from "./pages/GamePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:categoryId" element={<ModesPage />} />
      <Route path="/category/:categoryId/play/:modeId" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
