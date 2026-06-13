import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Toast } from "./components/Toast";
import { Candidates } from "./pages/Candidates";
import { Jobs } from "./pages/Jobs";
import { MatchReport } from "./pages/MatchReport";
import { Communications } from "./pages/Communications";
import { Templates } from "./pages/Templates";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/candidates" replace />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/match-report" element={<MatchReport />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="*" element={<Navigate to="/candidates" replace />} />
      </Routes>
      <Toast />
    </Layout>
  );
}
