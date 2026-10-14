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

// The Reports page (admin only): a bar chart of how many likes each vacation got, and a CSV download of the same data.
// No backend changes were needed - it reuses the two requests the vacations page already makes.

// One bar in the chart (and one line in the CSV file), e.g. { destination: "Paris, France", likes: 4 }:
type ReportRow = {
    destination: string; // X axis
    likes: number; // Y axis
};

export function Reports() {

    // The logged-in user, from Redux (the global state) - used to make sure this is an admin:
    const user = useSelector((state: AppState) => state.user);

    // The data from the server, and whether it's still loading (to show the spinner):
    const [vacations, setVacations] = useState<VacationModel[]>([]);
    const [likes, setLikes] = useState<LikeModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load all vacations and all likes from the server (the same two requests the vacations page uses).
    // - useEffect runs this after the page appears - not on every render. [user] = run again only if the user changes.
    // - Promise.all sends both requests at the same time and waits until both answers arrive: [vacations, likes].
    // - Non-admins skip the requests - they're being redirected anyway (see below).
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

    // Only admins can see this page - a guest goes to Login, a regular user goes to the vacations page.
    // This comes AFTER the hooks above on purpose: React requires hooks to run in the same order on every render,
    // so a "return" before a hook would break React.
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.roleId !== Role.Admin) {
        return <Navigate to="/vacations" replace />;
    }

    // Turn the data into chart rows - for each vacation, count the likes that belong to it.
    // Example - Paris has id 5:
    //   likes.filter(like => like.vacationId === 5)  keeps only Paris's likes (4 of them),
    //   .length                                       turns that list into a number: 4
    //   result:                                       { destination: "Paris, France", likes: 4 }
    // The vacations come from the server already sorted by start date, so the bars are in that order too.
    const reportData: ReportRow[] = vacations.map(vacation => ({
        destination: vacation.destination,
        likes: likes.filter(like => like.vacationId === vacation.id).length
    }));

    // Download the report as a CSV file ("Comma Separated Values") - a text file that Excel opens as a table.
    // No server and no library: the browser builds the file from the same rows the chart uses (reportData).
    function downloadCsv(): void {

        // 1. Build the lines - first the header, then one line per vacation, e.g.  "Paris, France",4
        //    - The destination is wrapped in quotes because it contains a comma, and in CSV the comma separates columns.
        //      Without the quotes, Excel would split "Paris" and " France" into two columns.
        //    - A quote inside a value is written twice - replaceAll('"', '""') - that's the CSV rule,
        //      so a destination that contains a quote can't break the line.
        const lines = ["Destination,Likes", ...reportData.map(row => `"${row.destination.replaceAll('"', '""')}",${row.likes}`)];

        // 2. Join the lines with "\n" (a new line) - this text is the whole CSV file:
        const csv = lines.join("\n");

        // 3. Turn the text into a file in the browser's memory (a Blob).
        //    "\uFEFF" is an invisible marker (a "BOM") at the start of the file that tells Excel the text is UTF-8,
        //    so non-English destinations (e.g. in Hebrew) show correctly:
        const file = new Blob(["\uFEFF" + csv], { type: "text/csv" });

        // 4. Download it: create a temporary link that points to the file, give it the file name and click it -
        //    the browser saves it like any other download. Then free the memory the file took:
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

            {/* The chart - drawn with Recharts, a React chart library: the chart is written as tags, like HTML.
                The key idea is dataKey - it connects the chart to the data: each row of reportData has the fields
                "destination" and "likes", so <XAxis dataKey="destination"> puts the destinations on the X axis,
                and <Bar dataKey="likes"> makes each bar as tall as its number of likes (the Y axis). */}
            {!isLoading && (
                // ResponsiveContainer makes the chart as wide as the page, and 500px tall:
                <ResponsiveContainer width="100%" height={500}>

                    {/* BarChart gets the rows - one bar per row. margin = some space around the chart: */}
                    <BarChart data={reportData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>

                        {/* Horizontal grid lines, so each bar's height can be read against the Y axis: */}
                        <CartesianGrid vertical={false} />

                        {/* X axis - the destination. Labels are tilted so long names don't overlap, interval={0} shows all of them,
                            and height={150} leaves enough room under the axis for the longest tilted name: */}
                        <XAxis dataKey="destination" interval={0} angle={-40} textAnchor="end" height={150} />

                        {/* Y axis - the number of likes. Recharts sets the range from the data by itself (0 to the highest count).
                            allowDecimals={false} - likes are whole numbers, so no 0.5 ticks. label = the "Likes" title, turned sideways: */}
                        <YAxis allowDecimals={false} label={{ value: "Likes", angle: -90, position: "insideLeft" }} />

                        {/* Hovering a bar shows its destination and exact number of likes, e.g. "Paris, France - Likes: 4": */}
                        <Tooltip />

                        {/* The bars - their height is the "likes" value of each row. name = the label shown in the tooltip,
                            maxBarSize keeps the bars thin, and radius rounds their top corners: */}
                        <Bar dataKey="likes" name="Likes" fill="#2a78d6" maxBarSize={40} radius={[4, 4, 0, 0]} />

                    </BarChart>
                </ResponsiveContainer>
            )}

        </div>
    );
}
