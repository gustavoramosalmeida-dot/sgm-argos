import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';
import { PageContainer } from '../components/Layout/PageContainer';
import { PlantasPage } from '../pages/plants/PlantasPage';
import { MapaPlantaPage } from '../pages/plants/MapaPlantaPage';
import { MaquinaPage } from '../pages/machines/MaquinaPage';
import { MachineVisualEditorPage } from '../pages/machines/MachineVisualEditorPage';
import { FabricaPage } from '../pages/FabricaPage';
import { MaquinasPage } from '../pages/MaquinasPage';
import { LoginPage } from '../pages/login/LoginPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        {/* Editor visual: shell próprio, sem sidebar global da aplicação */}
        <Route path="/machines/:machineId/editor" element={<MachineVisualEditorPage />} />
        <Route path="/" element={<PageContainer />}>
          <Route index element={<Navigate to="/plants" replace />} />
          <Route path="fabrica" element={<FabricaPage />} />
          <Route path="maquinas" element={<MaquinasPage />} />
          <Route path="plants" element={<PlantasPage />} />
          <Route path="plants/:siteId" element={<MapaPlantaPage />} />
          <Route path="machines/:machineId" element={<MaquinaPage />} />
          <Route path="*" element={<Navigate to="/plants" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
