declare module 'string-similarity' {
    interface BestMatch {
        ratings: Array<{ target: string, rating: number }>;
        bestMatch: { target: string, rating: number };
        bestMatchIndex: number;
    }

    function compareTwoStrings(first: string, second: string): number;
    function findBestMatch(mainString: string, targetStrings: string[]): BestMatch;

    export {
        compareTwoStrings,
        findBestMatch
    };
}