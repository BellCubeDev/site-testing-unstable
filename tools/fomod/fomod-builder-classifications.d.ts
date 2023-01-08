import * as main from "./fomod-builder.js";
import { objOf } from '../../universal.js';
export declare abstract class XMLElement implements main.updatableObject {
    instanceElement: Element | undefined;
    objectsToUpdate: main.updatableObject[];
    updateObjects(): void;
    update(): void;
    constructor(instanceElement?: Element | undefined);
    asModuleXML?(document: XMLDocument): Element;
    asInfoXML?(document: XMLDocument): Element;
}
export declare abstract class dependency extends XMLElement {
    constructor(instanceElement?: Element | undefined);
    abstract asModuleXML(document: XMLDocument): Element;
}
export declare abstract class DependencyBaseVersionCheck extends dependency {
    private _version;
    set version(value: string);
    get version(): string;
}
export declare const flags: objOf<Flag>;
export declare class Flag {
    name: string;
    values: Set<string>;
    getters: unknown[];
    setters: unknown[];
    constructor(name?: string, value?: string);
    removeValue(value: string): boolean;
}
export declare function setNewFlagValue(name: string, value: string): Flag;
export type DependencyFileState = "Active" | "Inactive" | "Missing";
export type DependencyGroupOperator = "And" | "Or";
export declare class DependencyGroup extends dependency {
    private _operator;
    set operator(value: DependencyGroupOperator);
    get operator(): DependencyGroupOperator;
    private _children;
    set children(value: dependency[]);
    get children(): dependency[];
    constructor(instanceElement?: Element | undefined, operator?: DependencyGroupOperator, parseChildren?: boolean);
    asModuleXML(document: XMLDocument, nodeName?: string): Element;
}
export declare class DependencyFlag extends dependency {
    private _flag;
    set flag(value: string);
    get flag(): string;
    private _value;
    set value(value: string);
    get value(): string;
    asModuleXML(document: XMLDocument): Element;
}
export declare class DependencyFile extends dependency {
    private _file;
    set file(value: string);
    get file(): string;
    private _state;
    set state(value: DependencyFileState);
    get state(): DependencyFileState;
    asModuleXML(document: XMLDocument): Element;
}
export declare class DependencyScriptExtender extends DependencyBaseVersionCheck {
    asModuleXML(document: XMLDocument): Element;
}
export declare class DependencyGameVersion extends DependencyBaseVersionCheck {
    asModuleXML(document: XMLDocument): Element;
}
export declare class DependencyModManager extends DependencyBaseVersionCheck {
    asModuleXML(document: XMLDocument): Element;
}
export type OptionType = "Optional" | "Recommended" | "CouldBeUseable" | "Required" | "NotUseable";
export declare class OptionTypeDescriptor extends XMLElement {
    private _default;
    set default(value: OptionType);
    get default(): OptionType;
    private _dependencies;
    set dependencies(value: OptionTypeDescriptorWithDependency[]);
    get dependencies(): OptionTypeDescriptorWithDependency[];
    private _basicElement;
    set basicElement(value: Element | undefined);
    get basicElement(): Element | undefined;
    private _complexElement;
    set complexElement(value: Element | undefined);
    get complexElement(): Element | undefined;
    private _complexTypeElement;
    set complexTypeElement(value: Element | undefined);
    get complexTypeElement(): Element | undefined;
    private _complexPatternElement;
    set complexPatternElement(value: Element | undefined);
    get complexPatternElement(): Element | undefined;
    constructor(element?: Element, defaultType?: OptionType, dependencies?: OptionTypeDescriptorWithDependency[]);
    asModuleXML(document: XMLDocument): Element;
}
export declare class OptionTypeDescriptorWithDependency extends XMLElement {
    private _type;
    set type(value: OptionType);
    get type(): OptionType;
    private _typeElement;
    set typeElement(value: Element | undefined);
    get typeElement(): Element | undefined;
    private _dependency;
    set dependency(value: DependencyGroup);
    get dependency(): DependencyGroup;
    constructor(dependency: DependencyGroup, type?: OptionType);
    asModuleXML(document: XMLDocument): Element;
}
export declare class Install extends XMLElement {
    static paths: string[][];
    private _path;
    set path(value: string[]);
    get path(): string[];
    updateFile(pathOrFile: string | string[] | FileSystemHandle): Promise<void>;
    constructor(element: Element, file?: string | string[] | FileSystemFileHandle);
    asModuleXML(document: XMLDocument): Element;
}
export type SortOrder = "Ascending" | "Descending" | "Explicit";
export declare abstract class Step extends XMLElement {
    name: string;
    order: SortOrder;
    groups: Group[];
    asModuleXML(document: XMLDocument): Element;
}
export type groupSelectType = "SelectAll" | "SelectAny" | "SelectAtMostOne" | "SelectAtLeastOne" | "SelectExactlyOne";
export declare class Group extends XMLElement {
    private _name;
    set name(value: string);
    get name(): string;
    private _type;
    set type(value: groupSelectType);
    get type(): groupSelectType;
    private _sortOrder;
    set sortOrder(value: SortOrder);
    get sortOrder(): SortOrder;
    private _options;
    set options(value: Option[]);
    get options(): Option[];
    asModuleXML(document: XMLDocument): Element;
}
export declare class Option extends XMLElement {
    private _name;
    set name(value: string);
    get name(): string;
    private _description;
    set description(value: OptionDescription);
    get description(): OptionDescription;
    private _image;
    set image(value: OptionImage);
    get image(): OptionImage;
    private _conditionFlags;
    set conditionFlags(value: DependencyFlag[]);
    get conditionFlags(): DependencyFlag[];
    private _conditionFlagsContainer;
    set conditionFlagsContainer(value: Element | undefined);
    get conditionFlagsContainer(): Element | undefined;
    private _files;
    set files(value: DependencyFile[]);
    get files(): DependencyFile[];
    private _filesContainer;
    set filesContainer(value: Element | undefined);
    get filesContainer(): Element | undefined;
    private _typeDescriptor;
    set typeDescriptor(value: OptionTypeDescriptor);
    get typeDescriptor(): OptionTypeDescriptor;
    constructor(element?: Element, name?: string, description?: OptionDescription | string, image?: OptionImage | string[] | FileSystemFileHandle, conditionFlags?: DependencyFlag[], files?: DependencyFile[], typeDescriptor?: OptionTypeDescriptor);
    asModuleXML(document: XMLDocument): Element;
}
export declare class OptionDescription extends XMLElement {
    private _description;
    set description(value: string);
    get description(): string;
    constructor(element?: Element, description?: string);
    asModuleXML(document: XMLDocument): Element;
}
export declare class OptionImage extends XMLElement {
    private _image;
    set image(value: string[]);
    get image(): string[];
    constructor(element?: Element, image?: string[] | FileSystemFileHandle);
    asModuleXML(document: XMLDocument): Element;
}
export declare class Fomod extends XMLElement {
    private _metaName;
    set metaName(value: string);
    get metaName(): string;
    private _moduleName;
    set moduleName(value: string);
    get moduleName(): string;
    private _metaImage;
    set metaImage(value: string);
    get metaImage(): string;
    private _metaAuthor;
    set metaAuthor(value: string);
    get metaAuthor(): string;
    private _metaVersion;
    set metaVersion(value: string);
    get metaVersion(): string;
    private _metaId;
    set metaId(value: number);
    get metaId(): number;
    private _infoInstanceElement;
    set infoInstanceElement(value: Element | undefined);
    get infoInstanceElement(): Element | undefined;
    _metaUrl: URL | string;
    get metaUrl(): URL | string;
    set metaUrl(url: URL | string);
    getURLAsString(): string;
    installs: Install[];
    conditions: DependencyGroup | undefined;
    steps: Step[];
    sortingOrder: SortOrder;
    constructor(instanceElement?: Element, infoInstanceElement?: Element, metaName?: string, metaImage?: string, metaAuthor?: string, metaVersion?: string, metaId?: number, metaUrl?: string, installs?: Install[], steps?: Step[], conditions?: DependencyGroup);
    asModuleXML(document: XMLDocument): Element;
    asInfoXML(document: XMLDocument): Element;
}
//# sourceMappingURL=fomod-builder-classifications.d.ts.map