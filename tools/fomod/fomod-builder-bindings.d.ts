import type { updatableObject } from './fomod-builder.js';
import type { Fomod } from './fomod-builder-classifications.js';
export declare class modMetadata implements updatableObject {
    parent: Fomod;
    get name(): string;
    set name(value: string);
    nameInput: HTMLInputElement;
    get author(): string;
    set author(value: string);
    authorInput: HTMLInputElement;
    get version(): string;
    set version(value: string);
    versionInput: HTMLInputElement;
    get id(): number;
    set id(value: number);
    idInput: HTMLInputElement;
    get url(): string;
    set url(value: URL | string);
    urlInput: HTMLInputElement;
    constructor(parent: Fomod);
    updateFromInput(): void;
    update(): void;
}
//# sourceMappingURL=fomod-builder-bindings.d.ts.map