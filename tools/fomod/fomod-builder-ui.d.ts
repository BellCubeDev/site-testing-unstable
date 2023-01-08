import * as bcdUniversal from '../../universal.js';
export declare class bcdDropdownSortingOrder extends bcdUniversal.BCDDropdown {
    static readonly asString = "FOMOD Builder - Sorting Order Dropdown";
    static readonly cssClass = "bcd-dropdown-sorting-order";
    constructor(element: Element);
    options(): {
        Explicit: null;
        Ascending: null;
        Descending: null;
    };
}
export declare class bcdDropdownOptionState extends bcdUniversal.BCDDropdown {
    static readonly asString = "FOMOD Builder - Option State Dropdown";
    static readonly cssClass = "bcd-dropdown-option-state";
    constructor(element: Element);
    options(): {
        Optional: null;
        Recommended: null;
        "Could Be Useable": null;
        Required: null;
        "Not Useable": null;
    };
}
export interface windowUI {
    openFolder: () => void;
    save: () => void;
    cleanSave: () => void;
    attemptRepair: () => void;
    setStepEditorType: (type: bcdBuilderType) => void;
    openTypeConditions: (elem: HTMLElement) => void;
    openConditions: (elem: HTMLElement) => void;
}
export type bcdBuilderType = 'builder' | 'vortex' | 'mo2';
export declare function setStepEditorType(type: bcdBuilderType): void;
export declare function openFolder_entry(): Promise<void>;
export declare function save(): Promise<void>;
export declare function cleanSave(): void;
//# sourceMappingURL=fomod-builder-ui.d.ts.map