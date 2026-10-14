import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { Role } from "../../../models/role";
import { VacationModel } from "../../../models/vacation-model";
import { AppState } from "../../../redux/store";
import { vacationService } from "../../../services/vacation-service";
import { notify } from "../../../utils/notify";
import { VacationCard } from "../../vacation-area/vacation-card/vacation-card";
import { Spinner } from "../../shared-area/spinner/spinner";
import "./admin-vacation-list.css";

export function AdminVacationList() {

    const user = useSelector((state: AppState) => state.user);
    const navigate = useNavigate();
    const [vacations, setVacations] = useState<VacationModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.roleId !== Role.Admin) return;
        vacationService.getAllVacations()
            .then(dbVacations => setVacations(dbVacations))
            .catch(err => notify.error(err))
            .finally(() => setIsLoading(false));
    }, [user]);

    // Only admins can see this page:
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.roleId !== Role.Admin) {
        return <Navigate to="/vacations" replace />;
    }

    const deleteVacation = async (vacation: VacationModel) => {

        // Make sure the admin is sure:
        if (!window.confirm(`Are you sure you want to delete the vacation to ${vacation.destination}?`)) return;

        try {
            await vacationService.deleteVacation(vacation.id);
            setVacations(prev => prev.filter(v => v.id !== vacation.id));
            notify.success(`The vacation to ${vacation.destination} has been deleted.`);
        }
        catch (err: unknown) {
            notify.error(err);
        }
    };

    return (
        <div className="AdminVacationList">

            <h2>Manage Vacations</h2>

            <button className="add-button" onClick={() => navigate("/admin/add")}>Add Vacation</button>

            {isLoading && <Spinner />}

            <div className="cards">
                {vacations.map(vacation => (
                    <VacationCard key={vacation.id} vacation={vacation}>
                        <button onClick={() => navigate(`/admin/edit/${vacation.id}`)}>✎ Edit</button>
                        <button onClick={() => deleteVacation(vacation)}>🗑 Delete</button>
                    </VacationCard>
                ))}
            </div>

        </div>
    );
}
