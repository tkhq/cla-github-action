/**
 * Reduce commit identities to the ones that must sign: primary commit
 * authors. Co-authored-by trailers are unverified text that commonly names
 * pairing partners and AI coding agents; they satisfy the opener authorship
 * guard but never create a signing obligation of their own.
 */
export function requiredSigners(commitAuthors) {
    return commitAuthors.filter(committer => committer.isPrimaryAuthor);
}
/**
 * Include the authenticated Pull Request opener as a contributor when the
 * opener is not present in git metadata. Git author and committer fields are
 * assertions, so the live Pull Request identity must remain a separate
 * contributor even when the commit list is otherwise complete.
 */
export function includePullRequestOpener(committers, opener, pullRequestNo) {
    const existing = committers.find(committer => committer.id === opener.id);
    if (existing) {
        existing.isPullRequestOpener = true;
        return committers;
    }
    return [
        {
            name: opener.login,
            id: opener.id,
            pullRequestNo,
            isPullRequestOpener: true
        },
        ...committers
    ];
}
/**
 * Return an authenticated opener mismatch when no primary-author or
 * co-author identity in the current commit set has the opener's account ID.
 * The git committer field is never collected, so it cannot qualify.
 */
export function findOpenerAuthorshipMismatch(commitAuthors, opener) {
    const authorshipIdentities = commitAuthors.filter(committer => committer.isPrimaryAuthor || committer.isCoAuthor);
    if (authorshipIdentities.some(committer => committer.id === opener.id)) {
        return undefined;
    }
    return {
        opener: opener.login,
        commitAuthors: authorshipIdentities
            .map(committer => committer.name)
            .filter(name => name.length > 0)
    };
}
export function openerAuthorshipMismatchMessage(mismatch) {
    return `Pull Request opener @${mismatch.opener} is not recorded as an author or co-author of any commit in this PR. If this is intentional (e.g. a cherry-pick or release-engineering workflow), set the 'require-opener-as-author' action input to 'false'.`;
}
