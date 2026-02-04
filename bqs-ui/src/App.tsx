
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BQSProvider } from './context/RoleContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ScoringWizard } from './pages/ScoringWizard';
import { AllOpportunities } from './pages/AllOpportunities';

function App() {
    return (
        <BQSProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="opportunities" element={<AllOpportunities />} />
                        <Route path="score/:id" element={<ScoringWizard />} />
                        {/* Catch all / History / Reviews just route to dashboard or generic lists for now */}
                        <Route path="reviews" element={<Navigate to="/dashboard" replace />} />
                        <Route path="history" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </BQSProvider>
    );
}

export default App;
