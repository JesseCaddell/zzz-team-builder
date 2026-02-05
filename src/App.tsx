import { useEffect, useMemo, useState } from "react";
import type { Character, Condition, LoadDataResponse } from "./types";
import {
    indexConditions,
    optionsForSlot2,
    optionsForSlot3,
    validateTeam,
} from "./rules";


function sortByName<T extends { name: string }>(list: T[]): T[] {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

function asset(path: string) {
    return `/assets/${path}`;
}

function imgOrEmpty(src: string) {
    return src ? src : "";
}

type Slot = "slot1" | "slot2" | "slot3";

export default function App() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [status, setStatus] = useState<string>("loading...");

    const [pick1, setPick1] = useState<string>("");
    const [pick2, setPick2] = useState<string>("");
    const [pick3, setPick3] = useState<string>("");

    useEffect(() => {
        setStatus("loading...");

        if (!window.zzzApi) {
            setStatus("ERROR: preload not loaded (window.zzzApi is undefined)");
            return;
        }

        window.zzzApi
            .loadData()
            .then((data: LoadDataResponse) => {
                setCharacters(data.characters);
                setConditions(data.conditions);
                setStatus(
                    `loaded ${data.characters.length} characters, ${data.conditions.length} conditions`
                );
            })
            .catch((err: unknown) => {
                let message = "Unknown error";

                if (err instanceof Error) {
                    message = err.message;
                }

                setStatus(`ERROR: ${message}`);
                console.error("loadData failed:", err);
            });
    }, []);


    const byId = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters]);
    const conditionsByChar = useMemo(() => indexConditions(conditions), [conditions]);

    const c1 = pick1 ? byId.get(pick1) : undefined;
    const c2 = pick2 ? byId.get(pick2) : undefined;
    const c3 = pick3 ? byId.get(pick3) : undefined;

    const slot2Options = useMemo(() => {
        if (!c1) return characters;
        return optionsForSlot2(characters, c1, conditionsByChar);
    }, [characters, c1, conditionsByChar]);

    const slot3Options = useMemo(() => {
        if (!c1 || !c2) return characters;
        return optionsForSlot3(characters, c1, c2, conditionsByChar);
    }, [characters, c1, c2, conditionsByChar]);


    // remove duplicates
    const slot2OptionsNoDup = useMemo(
        () => slot2Options.filter((c) => c.id !== pick1),
        [slot2Options, pick1]
    );

    const slot3OptionsNoDup = useMemo(
        () => slot3Options.filter((c) => c.id !== pick1 && c.id !== pick2),
        [slot3Options, pick1, pick2]
    );

    // sort alphabetically
    const slot1OptionsSorted = useMemo(
        () => sortByName(characters),
        [characters]
    );

    const slot2OptionsSorted = useMemo(
        () => sortByName(slot2OptionsNoDup),
        [slot2OptionsNoDup]
    );

    const slot3OptionsSorted = useMemo(
        () => sortByName(slot3OptionsNoDup),
        [slot3OptionsNoDup]
    );

    const validation = useMemo(() => {
        if (!c1 || !c2 || !c3) return null;
        return validateTeam([c1, c2, c3], conditionsByChar);
    }, [c1, c2, c3, conditionsByChar]);

    function resetFrom(slot: Slot) {
        if (slot === "slot1") {
            setPick1("");
            setPick2("");
            setPick3("");
            return;
        }
        if (slot === "slot2") {
            setPick2("");
            setPick3("");
            return;
        }
        if (slot === "slot3") {
            setPick3("");
        }
    }

    function onPick1(id: string) {
        setPick1(id);
        setPick2("");
        setPick3("");
    }

    function onPick2(id: string) {
        setPick2(id);
        setPick3("");
    }

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <h2 style={{ margin: 0 }}>ZZZ Team Builder</h2>
                <div style={{ opacity: 0.7 }}>
                    Characters loaded: {characters.length || "loading..."}
                </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                {status}
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "flex-start" }}>
                <Picker
                    title="Slot 1"
                    value={pick1}
                    onChange={onPick1}
                    options={slot1OptionsSorted}
                    disabled={false}
                />
                <Picker
                    title="Slot 2"
                    value={pick2}
                    onChange={onPick2}
                    options={slot2OptionsSorted}
                    disabled={!pick1}
                />
                <Picker
                    title="Slot 3"
                    value={pick3}
                    onChange={setPick3}
                    options={slot3OptionsSorted}
                    disabled={!pick1 || !pick2}
                />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={() => resetFrom("slot1")}>Reset All</button>
                <button disabled={!pick1} onClick={() => resetFrom("slot2")}>
                    Clear Slot 2+
                </button>
                <button disabled={!pick3} onClick={() => resetFrom("slot3")}>
                    Clear Slot 3
                </button>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
                <CharacterCard c={c1} />
                <CharacterCard c={c2} />
                <CharacterCard c={c3} />
            </div>

            <div style={{ marginTop: 18, padding: 12, border: "1px solid #333", borderRadius: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Passive Validation (true ZZZ rule)</div>

                {!validation && <div>Select all 3 characters to validate.</div>}

                {validation && (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li style={{ color: validation.aOk ? "inherit" : "crimson" }}>
                            Slot 1 passive: {validation.aOk ? "OK" : "NOT triggered"}
                        </li>
                        <li style={{ color: validation.bOk ? "inherit" : "crimson" }}>
                            Slot 2 passive: {validation.bOk ? "OK" : "NOT triggered"}
                        </li>
                        <li style={{ color: validation.cOk ? "inherit" : "crimson" }}>
                            Slot 3 passive: {validation.cOk ? "OK" : "NOT triggered"}
                        </li>
                    </ul>
                )}
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                Asset paths assumed under <code>public/assets/*</code>.
            </div>
        </div>
    );
}

function Picker(props: {
    title: string;
    value: string;
    onChange: (id: string) => void;
    options: Character[];
    disabled: boolean;
}) {
    const { title, value, onChange, options, disabled } = props;

    return (
        <div style={{ width: 280 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
            <select
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "100%", padding: 8 }}
            >
                <option value="">
                    {disabled ? "Select previous slot first" : "Select a character"}
                </option>
                {options.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function CharacterCard({ c }: { c?: Character }) {
    return (
        <div style={{ width: 320, border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            {!c ? (
                <div style={{ opacity: 0.7 }}>Empty</div>
            ) : (
                <div style={{ display: "flex", gap: 12 }}>
                    <img
                        src={imgOrEmpty(asset(`character_icons/${c.portrait}`))}
                        width={72}
                        height={72}
                        style={{ borderRadius: 10, objectFit: "cover" }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                            {c.rating_icon && (
                                <img
                                    src={imgOrEmpty(asset(`rank_icons/${c.rating_icon}`))}
                                    width={26}
                                    height={26}
                                />
                            )}
                            {c.faction_icon && (
                                <img
                                    src={imgOrEmpty(asset(`faction_icons/${c.faction_icon}`))}
                                    width={26}
                                    height={26}
                                />
                            )}
                            {c.attribute_icon && (
                                <img
                                    src={imgOrEmpty(asset(`element_icons/${c.attribute_icon}`))}
                                    width={26}
                                    height={26}
                                />
                            )}
                            {c.role_icon && (
                                <img
                                    src={imgOrEmpty(asset(`role_icons/${c.role_icon}`))}
                                    width={26}
                                    height={26}
                                />
                            )}
                        </div>

                        {c.assists && (
                            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                                Assist: {c.assists}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
