import { Navigate, Route, Routes } from "react-router-dom";
import { AddVacation } from "../../admin-area/add-vacation/add-vacation";
import { AdminVacationList } from "../../admin-area/admin-vacation-list/admin-vacation-list";
import { EditVacation } from "../../admin-area/edit-vacation/edit-vacation";
import { Reports } from "../../admin-area/reports/reports";
import { AiRecommendation } from "../../ai-area/ai-recommendation/ai-recommendation";
import { McpQuestion } from "../../ai-area/mcp-question/mcp-question";
import { Login } from "../../auth-area/login/login";
import { Register } from "../../auth-area/register/register";
import { Page404 } from "../../pages-area/page404/page404";
import { VacationList } from "../../vacation-area/vacation-list/vacation-list";

export function Routing() {

    return (
        <Routes>

            {/* Default Route - the vacations page sends guests to Login and admins to the admin page: */}
            <Route path="/" element={<Navigate to="/vacations" />} />

            {/* Vacations: */}
            <Route path="/vacations" element={<VacationList />} />

            {/* Register: */}
            <Route path="/register" element={<Register />} />

            {/* Login: */}
            <Route path="/login" element={<Login />} />

            {/* AI Recommendation: */}
            <Route path="/ai-recommendation" element={<AiRecommendation />} />

            {/* Questions about the vacations (answered by the backend's MCP server): */}
            <Route path="/ask-question" element={<McpQuestion />} />

            {/* Admin: */}
            <Route path="/admin" element={<AdminVacationList />} />
            <Route path="/admin/add" element={<AddVacation />} />
            <Route path="/admin/edit/:id" element={<EditVacation />} />
            <Route path="/admin/reports" element={<Reports />} />

            {/* Page not found: */}
            <Route path="*" element={<Page404 />} />

        </Routes>
    );
}
