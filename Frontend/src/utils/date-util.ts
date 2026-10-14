// Today as "YYYY-MM-DD" (local time) - the same format as the vacation dates, so they can be compared as text:
export function getToday(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}
