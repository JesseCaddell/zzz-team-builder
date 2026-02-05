import type { Character, Condition } from "./types";

export type TeamValidation = {
    aOk: boolean;
    bOk: boolean;
    cOk: boolean;
    allOk: boolean;
};

export function indexConditions(conditions: Condition[]) {
    const byChar = new Map<string, Condition[]>();
    for (const c of conditions) {
        const arr = byChar.get(c.character_id) ?? [];
        arr.push(c);
        byChar.set(c.character_id, arr);
    }
    return byChar;
}

function matchesCondition(candidate: Character, cond: Condition): boolean {
    switch (cond.kind) {
        case "faction":
            return (candidate.faction ?? "") === cond.value;
        case "attribute":
            return (candidate.attribute ?? "") === cond.value;
        case "role":
            return (candidate.role ?? "") === cond.value;
        case "tag":
            // If your dataset includes tags beyond role/attribute, decide later.
            // For now, treat tag like role match (common in your sheet).
            return (candidate.role ?? "") === cond.value;
        default:
            return false;
    }
}

// candidate satisfies picked if candidate matches ANY of picked's conditions
export function candidateSatisfiesPicked(
    picked: Character,
    candidate: Character,
    conditionsByChar: Map<string, Condition[]>
): boolean {
    if (picked.id === candidate.id) return false;

    const conds = conditionsByChar.get(picked.id) ?? [];
    if (conds.length === 0) return true;

    return conds.some((cond) => matchesCondition(candidate, cond));
}

// Slot filtering (UX)
export function optionsForSlot2(
    all: Character[],
    c1: Character,
    conditionsByChar: Map<string, Condition[]>
) {
    return all.filter((c) => candidateSatisfiesPicked(c1, c, conditionsByChar));
}

export function optionsForSlot3(
    all: Character[],
    c1: Character,
    c2: Character,
    conditionsByChar: Map<string, Condition[]>
) {
    return all.filter(
        (c) =>
            candidateSatisfiesPicked(c1, c, conditionsByChar) &&
            candidateSatisfiesPicked(c2, c, conditionsByChar)
    );
}

// True ZZZ rule: each character must be satisfied by at least one teammate
export function validateTeam(
    team: [Character, Character, Character],
    conditionsByChar: Map<string, Condition[]>
): TeamValidation {
    const [a, b, c] = team;

    const aOk =
        candidateSatisfiesPicked(a, b, conditionsByChar) ||
        candidateSatisfiesPicked(a, c, conditionsByChar);

    const bOk =
        candidateSatisfiesPicked(b, a, conditionsByChar) ||
        candidateSatisfiesPicked(b, c, conditionsByChar);

    const cOk =
        candidateSatisfiesPicked(c, a, conditionsByChar) ||
        candidateSatisfiesPicked(c, b, conditionsByChar);

    return { aOk, bOk, cOk, allOk: aOk && bOk && cOk };
}
