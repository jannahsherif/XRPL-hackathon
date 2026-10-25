import { Navigate, Route, Routes } from "react-router";

import { ErrorToast } from "./components/ui";
import { SettleProvider, useSettle } from "./lib/store";
import { Dashboard } from "./screens/Dashboard";

export function App() {
  return (
    <SettleProvider>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
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
