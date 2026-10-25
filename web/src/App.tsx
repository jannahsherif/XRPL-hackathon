import { Navigate, Route, Routes } from "react-router";

import { ErrorToast } from "./components/ui";
import { SettleProvider, useSettle } from "./lib/store";
import { Dashboard } from "./screens/Dashboard";
import { Login } from "./screens/Login";
import { ManagerRoute } from "./screens/Manager";
import { MemberRoute } from "./screens/Member";
import { Pos } from "./screens/Pos";
import { Present } from "./screens/Present";

export function App() {
  return (
    <SettleProvider>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/member/:tabId" element={<MemberRoute />} />
        <Route path="/manager" element={<ManagerRoute />} />
        <Route path="/present" element={<Present />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Errors />
    </SettleProvider>
  );
}

function Errors() {
  const { error, actions } = useSettle();
  return error ? <ErrorToast key={error.at} message={error.message} onClose={actions.clearError} /> : null;
}
