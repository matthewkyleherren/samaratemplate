export default function createErrorLink(subject, entries) {
    const body = entries
        .map(([label, value]) => value && `${label}: ${value}`)
        .filter((line) => !!line)
        .join("%0A");

    return `mailto:customercare@logmin.ch?subject=${subject}&body=Feel free to replace this line with a message, but please leave the information below so we can help you.%0A%0A--------------- Please do not modify the information below this line ---------------%0A%0A${body}`;
}