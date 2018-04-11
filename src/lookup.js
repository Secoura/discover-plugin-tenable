// This file provides some simple lookups.

// SeverityToString takes in a severityID and returns the string representation.
function SeverityToString(severityID) {
    switch (severityID) {
        case "0" || 0:
            return "Informational";
        case "1" || 1:
            return "Low";
        case "2" || 2:
            return "Medium";
        case "3" || 3:
            return "High";
        case "4" || 4:
            return "Critical";
    }
    return "Unknown";
}

export {
    SeverityToString
};
