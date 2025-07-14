import { formatRelative, isSameYear, parse, addDays, parseJSON, isMatch } from "date-fns";
import enGB from 'date-fns/locale/en-GB';
export { getFormattedDate, parseDate };

const locale = {
    ...enGB,
    formatRelative: (token, date, baseDate) => {
        const formatRelativeLocale = {
            lastWeek: "'Last' eeee",
            yesterday: "'Yesterday'",
            today: "'Today'",
            tomorrow: "'Tomorrow'",
            nextWeek: "eeee",
            other: isSameYear(date, baseDate) ? 'MMM d' : 'MMM d yyyy',
        };

        return formatRelativeLocale[token];
    },
}

const getFormattedDate = date => date ? formatRelative(date, new Date(), { locale }) : "";

const parseDate = date => {
    if (!date) return null;
    return isMatch(date, "yyyy-MM-dd") ? parse(date, "yyyy-MM-dd", new Date()) : parseJSON(date);
};