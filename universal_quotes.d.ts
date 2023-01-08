export declare const possibilities_conditionalized: [conditionObj, string][];
export declare const possibilities_Generic: string[];
export declare function checkCondition(condition: conditionObj): boolean;
export declare function checkDateCondition(dateBounds: conditionDateBounds): boolean;
export declare function getRandomQuote_base(): string | [conditionObj, string];
export declare function getRandomQuote(): string | [conditionObj, string];
export type conditionDate_Individual = [number, number, number];
export type conditionDateBounds = [conditionDate_Individual, conditionDate_Individual];
export type conditionTime_Individual = [number, number];
export type conditionTimeBounds = [conditionTime_Individual, conditionTime_Individual];
export type conditionObj = {
    random?: number;
    time?: conditionTimeBounds;
    date?: conditionDateBounds;
};
//# sourceMappingURL=universal_quotes.d.ts.map