import * as mdl from './assets/site/mdl/material.js';
export declare function afterDelay<TCallback extends (...args: any) => any = any>(timeout: number, callback: TCallback | string, ...args: Parameters<TCallback>): number;
export type objOf<T> = {
    [key: string]: T;
};
export declare function capitalizeFirstLetter(str: string): string;
export declare function trimWhitespace(str: string, trailingNewline?: boolean): string;
export declare function preventPropagation(event: Event): void;
export declare function setProxies<TObj>(obj: TObj, handler: TObj extends Record<string, any> ? ProxyHandler<TObj> : ProxyHandler<any>): TObj;
export declare function sortArr<TUnknown>(arr: TUnknown[], refArr: TUnknown[]): void;
export declare function randomNumber(min?: number, max?: number, places?: number): number;
export declare function focusAnyElement(element: HTMLElement | undefined, preventScrolling?: boolean): void;
export declare function copyCode(elem: HTMLElement): void;
export declare function getInputValue(input: HTMLInputElement): string;
interface getOrCreateChild {
    getOrCreateChild<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    getOrCreateChild(tagName: string): Element;
}
declare global {
    interface Element extends getOrCreateChild {
        upgrades?: Record<string, InstanceType<BCDComponentI>>;
        upgrades_proto?: Partial<{
            tooltip: BCDTooltip;
            dropdown: BCDDropdown;
        }>;
        targetingComponents?: Record<string, BCDComponentI>;
        targetingComponents_proto?: Partial<{
            tooltip: BCDTooltip;
            dropdown: BCDDropdown;
        }>;
    }
    interface Document extends getOrCreateChild {
    }
    interface Window {
        clickEvt: 'click' | 'mousedown';
        layout: mdl.MaterialLayout;
        queryParams: objOf<string>;
        bcd_init_functions: objOf<Function>;
        bcd_ComponentTracker: bcd_ComponentTracker;
        copyCode(elem: HTMLElement): void;
        lazyStylesLoaded: true | undefined;
        BCDSettingsDropdown: typeof BCDSettingsDropdown;
    }
}
interface BCDComponentI extends Function {
    new (element: any, ...args: any[]): any;
    readonly asString: string;
    readonly cssClass: string;
}
export interface componentTrackingItem<TConstructor> {
    obj: objOf<TConstructor>;
    arr: TConstructor[];
}
export interface trackableConstructor<TClass> extends Function {
    asString: string;
    new (...args: any[]): TClass;
}
export declare class bcd_ComponentTracker {
    static registered_components: objOf<componentTrackingItem<unknown>>;
    static registerComponent<TClass>(component: TClass, constructor: trackableConstructor<TClass>, element: HTMLElement): void;
    static createTrackedComponent(constructor: trackableConstructor<any>): void;
    static getTrackedConstructor<TConstructor>(constructor: trackableConstructor<TConstructor>): componentTrackingItem<TConstructor>;
    static findItem<TConstructor>(constructor: trackableConstructor<TConstructor>, element: HTMLElement, findPredicate?: (arg0: TConstructor) => boolean): TConstructor | undefined;
}
declare abstract class bcd_collapsibleParent {
    details: HTMLElement;
    details_inner: HTMLElement;
    summary: HTMLElement;
    openIcons90deg: HTMLCollection;
    self: HTMLElement;
    adjacent: boolean;
    constructor(elm: HTMLElement);
    isOpen(): boolean;
    toggle(doSetDuration?: boolean): void;
    reEval(doSetDuration?: false): void;
    reEval(doSetDuration?: true, instant?: true): void;
    open(doSetDuration?: boolean, instant?: boolean): void;
    close(doSetDuration?: boolean, instant?: boolean): void;
    onTransitionEnd(event?: TransitionEvent): void;
    instantTransition(): void;
    evaluateDuration(doRun?: boolean, opening?: boolean): void;
}
export declare class BellCubicDetails extends bcd_collapsibleParent {
    static readonly cssClass = "js-bcd-details";
    static readonly asString = "BellCubicDetails";
    constructor(element: HTMLElement);
    reEvalOnSizeChange(event: unknown): void;
}
export declare class BellCubicSummary extends bcd_collapsibleParent {
    static readonly cssClass = "js-bcd-summary";
    static readonly asString = "BellCubicSummary";
    constructor(element: HTMLElement);
    divertedCompletion(): void;
    correctFocus(keyDown?: boolean): void;
    handleClick(event?: MouseEvent): void;
    handleKey(event: KeyboardEvent): void;
}
export declare class bcd_prettyJSON {
    static readonly cssClass = "js-bcd-prettyJSON";
    static readonly asString = "bcd_prettyJSON";
    element_: HTMLElement;
    constructor(element: HTMLElement);
}
export declare class BCDModalDialog extends EventTarget {
    static readonly cssClass = "js-bcd-modal";
    static readonly asString = "BellCubic Modal";
    static obfuscator: HTMLDivElement;
    static modalsToShow: BCDModalDialog[];
    static shownModal: BCDModalDialog | null;
    element_: HTMLDialogElement | HTMLElement;
    closeByClickOutside: boolean;
    constructor(element: HTMLDialogElement);
    static evalQueue(delay?: number): void;
    show(): void;
    static readonly beforeShowEvent: CustomEvent<unknown>;
    static readonly afterShowEvent: CustomEvent<unknown>;
    private show_forReal;
    static readonly beforeHideEvent: CustomEvent<unknown>;
    static readonly afterHideEvent: CustomEvent<unknown>;
    boundHideFunction: (evt?: Event) => void;
    hide(evt?: Event): void;
}
export declare enum menuCorners {
    unaligned = "mdl-menu--unaligned",
    topLeft = "mdl-menu--bottom-left",
    topRight = "mdl-menu--bottom-right",
    bottomLeft = "mdl-menu--top-left",
    bottomRight = "mdl-menu--top-right"
}
type optionObj = objOf<Function | null>;
export declare abstract class BCDDropdown extends mdl.MaterialMenu {
    abstract options(): optionObj;
    doReorder: boolean;
    options_: optionObj;
    options_keys: string[];
    selectedOption: string;
    element_: HTMLElement;
    selectionTextElements: undefined | HTMLCollectionOf<HTMLElement>;
    constructor(element: Element, buttonElement?: Element | null, doReorder?: boolean);
    focusOutHandler(evt: FocusEvent): void;
    selectByString(option: string): void;
    updateOptions(): void;
    createOption(option: string, clickCallback?: Function | null, addToList?: boolean): HTMLLIElement;
    onItemSelected(option: HTMLLIElement): void;
    onCreateOption?(option: string): void;
    makeSelected(option: HTMLLIElement): void;
    makeNotSelected(option: HTMLLIElement): void;
    private _optionElements;
    get optionElements(): HTMLCollectionOf<HTMLLIElement>;
    hasShownOrHiddenThisFrame: boolean;
    show(evt: any): void;
    hide(): void;
}
export declare class bcdDropdown_AwesomeButton extends BCDDropdown {
    static readonly asString = "BCD - Debugger's All-Powerful Button";
    static readonly cssClass = "js-bcd-debuggers-all-powerful-button";
    constructor(element: Element);
    options(): objOf<Function | null>;
}
export declare class BCDTabButton extends mdl.MaterialButton {
    static readonly asString = "BCD - Tab List Button";
    static readonly cssClass = "js-tab-list-button";
    static anchorToSet: string;
    element_: HTMLButtonElement;
    boundTab: HTMLDivElement;
    name: string;
    setAnchor: boolean;
    constructor(element: HTMLButtonElement);
    findTabNumber(button_?: Element): number;
    makeSelected(tabNumber_?: number): void;
    static setAnchorIn3AnimFrames(): void;
    onClick(event?: MouseEvent): void;
    onKeyPress(event: KeyboardEvent): void;
}
export declare class BCDTooltip {
    static readonly asString = "BCD - Tooltip";
    static readonly cssClass = "js-bcd-tooltip";
    relation: 'preceding' | 'proceeding' | 'child' | 'selector';
    position: 'top' | 'bottom' | 'left' | 'right';
    element: HTMLElement;
    boundElement: HTMLElement;
    gapBridgeElement: HTMLElement;
    openDelayMS: number;
    constructor(element: HTMLElement);
    handleKeyDown(event: KeyboardEvent): void;
    readonly boundKeyDown: (event: KeyboardEvent) => void;
    handleTouch(event: TouchEvent): void;
    handleHoverEnter(event?: MouseEvent | FocusEvent, bypassWait?: true): void;
    showPart1(): void;
    showPart2(): void;
    show(): void;
    handleHoverLeave(event?: MouseEvent | FocusEvent): void;
    hide(): void;
    setPosition(): void;
}
export declare abstract class bcdDynamicTextArea_base {
    element: HTMLElement;
    constructor(element: HTMLElement);
    abstract adjust(): any;
}
export declare class bcdDynamicTextAreaHeight extends bcdDynamicTextArea_base {
    static readonly asString = "BCD - Dynamic TextArea - Height";
    static readonly cssClass = "js-dynamic-textarea-height";
    constructor(element: HTMLElement);
    adjust(): void;
}
export declare class bcdDynamicTextAreaWidth extends bcdDynamicTextArea_base {
    static readonly asString = "BCD - Dynamic TextArea - Width";
    static readonly cssClass = "js-dynamic-textarea-width";
    constructor(element: HTMLElement);
    adjust(): void;
}
interface settingsGridObj {
    type: 'bool' | 'string';
    name: string;
    tooltip?: string | {
        text: string;
        position: 'top' | 'bottom' | 'left' | 'right';
    };
    options?: Record<string, string>;
}
export declare function updateSettings(): void;
type settingsGrid = Record<string, settingsGridObj>;
export declare class SettingsGrid {
    static readonly asString = "BCD - Settings Grid";
    static readonly cssClass = "js-settings-grid";
    element: HTMLElement;
    settingTemplate: DocumentFragment;
    settingsPath: string[];
    settings: settingsGrid;
    constructor(element: HTMLElement);
    createSetting(key: string, settings: settingsGridObj): void;
    createTooltip(element: HTMLElement, tooltip: NonNullable<settingsGridObj['tooltip']>): void;
    upgradeElement(element: Element, key: string, settings: settingsGridObj): void;
    getSetting<TReturnValue = string | boolean | number | null>(key: string | number, suppressError?: boolean): TReturnValue | undefined;
    static getSetting<TReturnValue = string | boolean | number | null>(settingsPath: string[], key: string | number, suppressError?: boolean): TReturnValue | undefined;
    setSetting(key: string | number, value: string | boolean | number | null | undefined, suppressError?: boolean): void;
    static setSetting(settingsPath: string[], key: string | number, value: string | boolean | number | null | undefined, suppressError?: boolean): void;
}
export declare class BCDSettingsDropdown extends BCDDropdown {
    static readonly asString = "BCD Settings Dropdown";
    static readonly cssClass = "js-bcd-settings-dropdown";
    settingsPath: string[];
    settingKey: string;
    keyMap: Record<string, string>;
    constructor(element: HTMLElement);
    selectByString(option: string): void;
    options(): optionObj;
}
export declare function registerBCDComponent(component: BCDComponentI): boolean | Error;
export declare function registerBCDComponents(...components: BCDComponentI[]): void;
export declare function bcd_universalJS_init(): void;
export {};
//# sourceMappingURL=universal.d.ts.map