import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { LikeModel } from "../../../models/like-model";
import { Role } from "../../../models/role";
import { VacationModel } from "../../../models/vacation-model";
import { AppState } from "../../../redux/store";
import { vacationService } from "../../../services/vacation-service";
import { getToday } from "../../../utils/date-util";
import { notify } from "../../../utils/notify";
import { Spinner } from "../../shared-area/spinner/spinner";
import { VacationCard } from "../vacation-card/vacation-card";
import "./vacation-list.css";

const VACATIONS_PER_PAGE = 9;

type Filter = "all" | "liked" | "active" | "upcoming";

const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All vacations" },
    { value: "liked", label: "Liked by me" },
    { value: "active", label: "Active now" },
    { value: "upcoming", label: "Not started yet" }
];

export function VacationList() {

    const user = useSelector((state: AppState) => state.user);
    const [vacations, setVacations] = useState<VacationModel[]>([]);
    const [likes, setLikes] = useState<LikeModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [page, setPage] = useState(1);

    // Regular users need both the vacation details and likes to build this list.
    // Admins use a separate page, so they do not load this data here.
    useEffect(() => {
        if (!user || user.roleId === Role.Admin) return;
        Promise.all([vacationService.getAllVacations(), vacationService.getAllLikes()])
            .then(([dbVacations, dbLikes]) => {
                setVacations(dbVacations);
                setLikes(dbLikes);
            })
            .catch(err => notify.error(err))
            .finally(() => setIsLoading(false));
    }, [user]);

    // Only logged-in users can see this page:
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admins can't like - they manage vacations in the admin page:
    if (user.roleId === Role.Admin) {
        return <Navigate to="/admin" replace />;
    }

    // Use the likes data to show the current user's choice and each vacation's total.
    const isLiked = (vacationId: number) => likes.some(like => like.vacationId === vacationId && like.userId === user.id);
    const countLikes = (vacationId: number) => likes.filter(like => like.vacationId === vacationId).length;

    // Apply the selected filter before pagination so page counts match the visible results.
    const today = getToday();
    const filteredVacations = vacations.filter(vacation => {
        switch (filter) {
            case "liked": return isLiked(vacation.id);
            case "active": return vacation.startDate <= today && vacation.endDate >= today;
            case "upcoming": return vacation.startDate > today;
            default: return true;
        }
    });

    // Keep the selected page in range if filtering or unliking reduces the list:
    const pageCount = Math.ceil(filteredVacations.length / VACATIONS_PER_PAGE);
    const currentPage = Math.min(page, Math.max(pageCount, 1));
    // Show only the nine vacations belonging to the current page.
    const pageVacations = filteredVacations.slice((currentPage - 1) * VACATIONS_PER_PAGE, currentPage * VACATIONS_PER_PAGE);

    // A new filter may have fewer pages, so start the user at the beginning.
    const changeFilter = (newFilter: Filter) => {
        setFilter(newFilter);
        setPage(1);
    };

    // After changing pages, return to the top so the new cards are easy to see.
    const changePage = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0 });
    };

    // Update the displayed likes only after the server accepts the change.
    const toggleLike = async (vacationId: number) => {
        try {
            if (isLiked(vacationId)) {
                await vacationService.unlikeVacation(vacationId);
                setLikes(prev => prev.filter(like => !(like.vacationId === vacationId && like.userId === user.id)));
            }
            else {
                await vacationService.likeVacation(vacationId);
                setLikes(prev => [...prev, { userId: user.id, vacationId }]);
            }
        }
        catch (err: unknown) {
            notify.error(err);
        }
    };

    return (
        <div className="VacationList">

            <h2>Vacations</h2>

            <div className="filters">
                {FILTERS.map(f => (
                    <button key={f.value} disabled={f.value === filter} onClick={() => changeFilter(f.value)}>{f.label}</button>
                ))}
            </div>

            {isLoading && <Spinner />}

            {!isLoading && filteredVacations.length === 0 && <p>No vacations to show.</p>}

            <div className="cards">
                {pageVacations.map(vacation => (
                    <VacationCard key={vacation.id} vacation={vacation}>
                        <button aria-pressed={isLiked(vacation.id)} onClick={() => toggleLike(vacation.id)}>
                            {isLiked(vacation.id) ? "♥" : "♡"} Like {countLikes(vacation.id)}
                        </button>
                    </VacationCard>
                ))}
            </div>

            {pageCount > 1 && (
                <div className="pagination">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNumber => (
                        <button key={pageNumber} disabled={pageNumber === currentPage} onClick={() => changePage(pageNumber)}>{pageNumber}</button>
                    ))}
                </div>
            )}

        </div>
    );
}
