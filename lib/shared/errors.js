export function errorMessage(err) {
    if (err instanceof Error)
        return err.message;
    return String(err);
}
/** Status code from an Octokit RequestError or a generic error; undefined otherwise. */
export function errorStatus(err) {
    if (err && typeof err === 'object' && 'status' in err) {
        const s = err.status;
        if (typeof s === 'number')
            return s;
    }
    return undefined;
}
