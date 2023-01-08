import type { updatableObject } from './fomod-builder.js';
import type * as fomod from './fomod-builder-classifications.js';
export declare class Fomod implements updatableObject {
    parent: fomod.Fomod;
    main: HTMLDivElement;
    nameInput: HTMLInputElement;
    get name(): string;
    set name(value: string);
    imageInput: HTMLInputElement;
    get image(): string;
    set image(value: string);
    sortOrderMenu: HTMLMenuElement;
    get sortOrder(): fomod.SortOrder;
    set sortOrder(value: fomod.SortOrder);
    constructor(parent: fomod.Fomod);
    updateFromInput(): void;
    update(): void;
}
export declare class Option implements updatableObject {
    parent: fomod.Option;
    get name(): string;
    set name(value: string);
    input: HTMLInputElement;
    optionArea: HTMLDivElement;
    constructor(parent: fomod.Option, optionArea: HTMLDivElement);
    updateFromInput(): void;
    update(): void;
}
//# sourceMappingURL=fomod-builder-steps-1st-party.d.ts.map