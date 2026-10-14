import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LikeModel } from "../../../models/like-model";
import { Role } from "../../../models/role";
import { VacationModel } from "../../../models/vacation-model";
import { AppState } from "../../../redux/store";
import { vacationService } from "../../../services/vacation-service";
import { notify } from "../../../utils/notify";
import { Spinner } from "../../shared-area/spinner/spinner";
import "./reports.css";

// Admin reports page with a bar chart of vacation likes and a CSV download.
// It reuses the existing vacation and likes requests.

// Data for one vacation in both the chart and the CSV file:
type ReportRow = {
    destination: string;
    likes: number;
};

export function Reports() {

    // The logged-in user, used to check admin access:
    const user = useSelector((state: AppState) => state.user);

    // Server data and its loading state:
    const [vacations, setVacations] = useState<VacationModel[]>([]);
    const [likes, setLikes] = useState<LikeModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load vacations and likes together when an admin opens this page.
    useEffect(() => {
        if (user?.roleId !== Role.Admin) return;
        Promise.all([vacationService.getAllVacations(), vacationService.getAllLikes()])
            .then(([dbVacations, dbLikes]) => {
                setVacations(dbVacations);
                setLikes(dbLikes);
            })
            .catch(err => notify.error(err))
            .finally(() => setIsLoading(false));
    }, [user]);

    // Guests go to Login and regular users go to Vacations. Keep these checks after the hooks
    // so React runs the hooks in the same order on every render.
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.roleId !== Role.Admin) {
        return <Navigate to="/vacations" replace />;
    }

    // Create one row per vacation, counting how many likes belong to it.
    // The server's vacation order determines the bar order.
    const reportData: ReportRow[] = vacations.map(vacation => ({
        destination: vacation.destination,
        likes: likes.filter(like => like.vacationId === vacation.id).length
    }));

    // Build and download a CSV in the browser using the same rows as the chart.
    function downloadCsv(): void {

        // Add a header, then one row per vacation. Quote destinations so commas stay in one column,
        // and escape any quotes inside them.
        const lines = ["Destination,Likes", ...reportData.map(row => `"${row.destination.replaceAll('"', '""')}",${row.likes}`)];

        // Join the rows into the CSV text:
        const csv = lines.join("\n");

        // Create a browser file with a UTF-8 marker for non-English destinations:
        const file = new Blob(["\uFEFF" + csv], { type: "text/csv" });

        // Start the download through a temporary link, then release its object URL:
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = "Vacation Likes.csv";
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return (
        <div className="Reports">

            <h2>Likes per Vacation</h2>

            <button onClick={downloadCsv} disabled={isLoading}>Download CSV</button>

            {isLoading && <Spinner />}

            {/* Recharts renders the report data as a responsive bar chart. */}
            {!isLoading && (
                // Keep the chart full width and 500 pixels tall:
                <ResponsiveContainer width="100%" height={500}>

                    {/* Each report row becomes one bar, with space around the chart. */}
                    <BarChart data={reportData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>

                        {/* Grid lines help compare bar heights. */}
                        <CartesianGrid vertical={false} />

                        {/* Tilt destination labels to make long names easier to read. */}
                        <XAxis dataKey="destination" interval={0} angle={-40} textAnchor="end" height={150} />

                        {/* The vertical axis shows whole-number like counts. */}
                        <YAxis allowDecimals={false} label={{ value: "Likes", angle: -90, position: "insideLeft" }} />

                        {/* Hover over a bar to see its destination and exact like count. */}
                        <Tooltip />

                        {/* Bar height represents likes; rounded corners and a maximum width keep the chart tidy. */}
                        <Bar dataKey="likes" name="Likes" fill="#2a78d6" maxBarSize={40} radius={[4, 4, 0, 0]} />

                    </BarChart>
                </ResponsiveContainer>
            )}

        </div>
    );
}
