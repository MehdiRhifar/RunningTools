export const parseIntSafe = (str : string) : number => {
    return parseInt(str) || 0;
}