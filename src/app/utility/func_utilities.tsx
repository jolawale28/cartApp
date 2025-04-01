export const months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export const getOrdinal = (num: number): string => {
    if (typeof num !== "number" || isNaN(num)) return `${num}`; // Ensure it's a string

    const suffixes = ["th", "st", "nd", "rd"];
    const remainder = num % 100;

    const suffix =
        remainder >= 11 && remainder <= 13
            ? "th"
            : suffixes[num % 10] || "th";

    return `${num}${suffix}`;
}

export const formatDate = (seconds: number) => {
    const month = (new Date(seconds)).getMonth()
    const day = (new Date(seconds)).getUTCDate()
    const year = (new Date(seconds)).getFullYear()
    const hours = (new Date(seconds)).getHours()
    const minutes = (new Date(seconds)).getMinutes()

    return `${months[month]} ${getOrdinal(day)}, ${year} | ${hours}:${minutes < 10 ? "0" + minutes: minutes } ${hours >= 12 ? 'PM' : 'AM'}`
}