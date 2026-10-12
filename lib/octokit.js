import { getOctokit } from '@actions/github';
import * as core from '@actions/core';
let defaultClient;
let patClient;
function readEnvToken(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`${name} environment variable is required`);
    return v;
}
function buildOctokit(token) {
    return getOctokit(token);
}
export function getDefaultOctokitClient() {
    if (!defaultClient) {
        defaultClient = buildOctokit(readEnvToken('GITHUB_TOKEN'));
    }
    return defaultClient;
}
export function getPATOctokit() {
    if (!patClient) {
        const token = process.env.PERSONAL_ACCESS_TOKEN;
        if (!token) {
            core.setFailed(`Please add a personal access token as an environment variable for writing signatures in a remote repository/organization as mentioned in the README.md file`);
            throw new Error('PERSONAL_ACCESS_TOKEN is required for remote signatures repo');
        }
        patClient = buildOctokit(token);
    }
    return patClient;
}
/**
 * The default client used for all non-remote-repo operations. Lazily
 * constructed on first property access so importing this module has no
 * side effects.
 */
export const octokit = new Proxy({}, {
    get(_target, prop) {
        const client = getDefaultOctokitClient();
        const value = client[prop];
        return typeof value === 'function'
            ? value.bind(client)
            : value;
    }
});
export function isPersonalAccessTokenPresent() {
    return Boolean(process.env.PERSONAL_ACCESS_TOKEN);
}
/** For tests: reset cached clients so a subsequent call picks up new env. */
export function _resetOctokitClientsForTests() {
    defaultClient = undefined;
    patClient = undefined;
}
