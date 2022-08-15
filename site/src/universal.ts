import { request } from 'http';
import {componentHandler} from './assets/site/mdl/material.js';
import * as quotes from './universal_quotes.js';
console.log("%cHello and welcome to the JavaScript console! This is where wizards do their magic!\nAs for me? I'm the wizard you don't want to anger.", "color: #2d6");

export class bcdStr extends String {
    constructor(str_:string){super(str_);}

    /** Removes whitespace at the beginning and end of a string and at the end of every included line*/ //@ts-ignore: Property 'capitalizeFirstLetter' does not exist on type 'String'.
    capitalizeFirstLetter():bcdStr{
        return new bcdStr(this.charAt(0).toUpperCase() + this.slice(1));
    }

    /** Removes whitespace at the beginning and end of a string and at the end of every included line*/ //@ts-ignore: Property 'trimWhitespace' does not exist on type 'String'.
    trimWhitespace():bcdStr{
        return new bcdStr(this
            .trimStart()                // Trim whitespace at the start of the string
            .trimEnd()                  // Trim whitespace at the end of the string
            .replace(/[^\S\n]*$/gm, '') // Trim whitespace at the end of each line
    );}
}

declare global {interface Window {
    dataLayer: [];
    bcd_init_functions: objOf<Function>;
}}



export function sortArr<TUnknown>(arr: TUnknown[], refArr: TUnknown[]) {
    arr.sort(function(a, b){
        return refArr.indexOf(a) - refArr.indexOf(b);
    });
}

export type objOf<T> = {[key:string]: T};


const _ganalytics_HTML = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-5YE7EYGLGT"></script>';

// Currently unused since I haven't made the opt-in prompt yet
function enableAnalytics():void{
    //console.log('[BCD-Analytics] Enabling analytics...');

    document.head.insertAdjacentHTML('beforeend', _ganalytics_HTML);

    //console.log('[BCD-Analytics] Analytics enabled.');
    window.dataLayer = window.dataLayer || [];

    // @ts-ignore: Cannot find name 'dataLayer'.
    // eslint-disable-next-line prefer-rest-params
    function gtag(...args:unknown[]){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-5YE7EYGLGT');
}


/*
    This script hooks into Material Design Lite's "Component Design Pattern" API
    (see https://github.com/jasonmayes/mdl-component-design-pattern) to provide:

    * An animatable alternative to <Details>/<Summary> (bcd-details and bcd-summary)
        - Provides Open, Close, Toggle, and re-evaluate functions on both the bcd-details and bcd-summary elements.
        - Provides a "for" attribute to the bcd-summary element to specify the ID of the bcd-details element it should toggle.

    * A random text generator
*/
interface componentTrackingItem {
    obj:objOf<unknown>,
    arr:unknown[]
}


interface trackableConstructor<TConstructor> extends Function {
    asString: string,
    new(...args: never[]): TConstructor,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string|number|symbol]: any
}

/** Wrapped in a class to get around the complexities of exporting. */
export class bcd_ComponentTracker {
    static registered_components:objOf<componentTrackingItem> = {};


    static registerComponent<TConstructor>(component:TConstructor, constructor: trackableConstructor<TConstructor>, element:HTMLElement):void{
        bcd_ComponentTracker.createComponent(constructor);

        if (element.id !== '')
            bcd_ComponentTracker.registered_components[constructor.asString].obj[element.id] = component;
        else
            bcd_ComponentTracker.registered_components[constructor.asString].arr.push(component);
    }

    static createComponent<TConstructor>(constructor:trackableConstructor<TConstructor>){
        if (typeof bcd_ComponentTracker.registered_components[constructor.asString] === 'undefined')
            bcd_ComponentTracker.registered_components[constructor.asString] = {obj: {}, arr: []};
    }


    static findItem<TConstructor>(constructor: trackableConstructor<TConstructor>, element:HTMLElement, findPredicate: (arg0:TConstructor) => boolean): TConstructor|undefined {
        if (element.id)
            return bcd_ComponentTracker.registered_components[constructor.asString].obj[element.id] as TConstructor;
        else
            return (bcd_ComponentTracker.registered_components[constructor.asString].arr as TConstructor[]).find(findPredicate);
    }
}

const bcd_const_transitionDur:string = "transition-duration";
const bcd_const_animDur:string = "animation-duration";
const bcd_const_marginTop:string = "margin-top";
const bcd_const_classIsOpen:string = "is-open";
const bcd_const_classAdjacent:string = "adjacent";
const bcd_const_classDetailsInner:string = "bcd-details-inner";

// eslint-disable-next-line i18n-text/no-en
const bcd_const_errItem = "Error Item:";

export function randomNumber(min = 0, max = 1, places = 0):number{
    const placesMult = Math.pow(10, places);
    return (
        (
            Math.round(
                Math.random() * (max - min) + min
            ) * placesMult
        ) / placesMult
    );
}



interface BCDComponent extends Function {
    asString:string;
    cssClass:string;
}

// This is a const, but it is manipulated via Push/Pop.
const bcdComponents:BCDComponent[] = [];

class bcd_collapsableParent {
    // For children to set
    details!:HTMLElement;
    details_inner!:HTMLElement;
    summary!:HTMLElement;
    openIcons90deg!:HTMLCollection;

    // For us to set
    self:HTMLElement;
    adjacent:boolean = false;

    constructor(elm:HTMLElement){
        this.self = elm;
        this.adjacent = elm.classList.contains(bcd_const_classAdjacent);
    }

    /*
    debugCheck():void{
        if (!this.details) {console.log(bcd_const_errItem, this); throw new TypeError("bcd_collapsableParent: Details not found!");}
        if (!this.details_inner) {console.log(bcd_const_errItem, this); throw new TypeError("bcd_collapsableParent: Details_inner not found!");}
        if (!this.summary) {console.log(bcd_const_errItem, this); throw new TypeError("bcd_collapsableParent: Summary not found!");}
        if (!this.openIcons90deg) {console.log(bcd_const_errItem, this); throw new TypeError("bcd_collapsableParent: OpenIcons90deg not found!");}
    }
    */

    isOpen():boolean {//this.debugCheck();
        return this.details.classList.contains(bcd_const_classIsOpen) || this.summary.classList.contains(bcd_const_classIsOpen);
    }

    /** Toggle the collapsable menu. */
    toggle(doSetDuration:boolean = true) {//this.debugCheck();
        /*console.log('[BCD-DETAILS] toggle() called on ',this)*/
        if (this.isOpen()) { this.close(doSetDuration); } else { this.open(doSetDuration); }
    }

    /** Re-evaluate the collapsable's current state. */
    reEval(doSetDuration?:false):void
    reEval(doSetDuration?:true, instant?:true):void
    reEval(doSetDuration:boolean = true, instant?:true):void {
                requestAnimationFrame(() => {
            if (this.isOpen()) { this.open(doSetDuration, instant); } else { this.close(doSetDuration, instant); }
        });
    }

    /** Open the collapsable menu. */
    open(doSetDuration:boolean = true, instant = false) {//this.debugCheck();
        if (!instant) this.evaluateDuration(doSetDuration);

        if (instant) this.evaluateDuration(doSetDuration);
        this.details_inner.style.marginTop = `0px`;
        if (instant) this.evaluateDuration(doSetDuration);

        this.details.classList.add(bcd_const_classIsOpen);
        this.summary.classList.add(bcd_const_classIsOpen);
    }

    /** Close the collapsable menu. */
    close(doSetDuration:boolean = true, instant = false) {//this.debugCheck();
        if (!instant) this.evaluateDuration(doSetDuration);

        if (instant) this.instantTransition();
        this.details_inner.style.marginTop = `-${this.details_inner.offsetHeight * 1.04}px`;
        if (instant) this.evaluateDuration(true);

        this.details.classList.remove(bcd_const_classIsOpen);
        this.summary.classList.remove(bcd_const_classIsOpen);
    }

    instantTransition():void {
        if (this.details_inner) {
            this.details_inner.style.transitionDuration = `0s`;
            this.details_inner.style.animationDuration = `$0s`;
            for (const icon of this.openIcons90deg) {
                (icon as HTMLElement).style.animationDuration = `0s`;
            }
        }
    }

    /* Determines what the transition and animation duration of the collapsable menu is */
    evaluateDuration(doRun:boolean = true) {//this.debugCheck();
        if (doRun && this.details_inner) {
            this.details_inner.style.transitionDuration = `${200 + 1.25 * this.details_inner.offsetHeight * 1.04}ms`;
            this.details_inner.style.animationDuration = `${215 + 1.25 * this.details_inner.offsetHeight * 1.04}ms`;
            for (const icon of this.openIcons90deg) {
                (icon as HTMLElement).style.animationDuration = `${215 + 1.25 * this.details_inner.offsetHeight * 1.04}ms`;
            }
        }
    }
}

export class BellCubicDetails extends bcd_collapsableParent {
    static cssClass = "bcd-details";
    static asString = "BellCubicDetails";

    /** @param {HTMLElement} element */
    constructor(element:HTMLElement) {
        super(element);
        this.details = element;

        /*console.log("[BCD-DETAILS] Registering  component: ", this)*/

        //console.log("Registering element:", this.element_);

        // Create a container element to make animation go brrr
        // Slightly over-complicated because, uh, DOM didn't want to cooperate.
        this.details_inner = document.createElement('div');
        this.details_inner.classList.add(bcd_const_classDetailsInner);

        //console.log(this.details_inner);

        // The `children` HTMLCollection is live, so we're fetching each element and throwing it into an array...
        var temp_childrenArr:ChildNode[] = [];
        for (const node of this.details.childNodes){
            temp_childrenArr.push(node);
        }
        // ...and actually moving the elements into the new div here.
        for (const node of temp_childrenArr){
            this.details_inner.appendChild(node);
        }

        this.details.appendChild(this.details_inner);


        //console.log(this.element_, {parent: dumpCSSText(this.element_), child: dumpCSSText(this.details_inner)});
        if (this.adjacent) {
            const temp_summary = this.self.previousElementSibling;
            if (!(temp_summary && temp_summary.classList.contains(BellCubicSummary.cssClass))) {console.log(bcd_const_errItem, this); throw new TypeError("[BCD-DETAILS] Error: Adjacent Details element must be preceded by a Summary element.");}
            this.summary = temp_summary as HTMLElement;
        } else {
            const temp_summary = this.self.ownerDocument.querySelector(`.bcd-summary[for="${this.details.id}"`);
            if (!temp_summary) {console.log(bcd_const_errItem, this); throw new TypeError("[BCD-DETAILS] Error: Non-adjacent Details elements must have a Summary element with a `for` attribute matching the Details element's id.");}
            this.summary = temp_summary as HTMLElement;
        }
        this.openIcons90deg = this.summary.getElementsByClassName('open-icon-90CC');
        //console.log(this.element_, {parent: dumpCSSText(this.element_), child: dumpCSSText(this.details_inner)});

        new ResizeObserver(this.reEvalOnSizeChange.bind(this)).observe(this.details_inner);

        requestAnimationFrame(() => {
            bcd_ComponentTracker.registerComponent(this, BellCubicDetails, this.details);
            this.reEval();
            this.self.classList.add('initialized');
        });
    }

    reEvalOnSizeChange(event: Event|unknown) {
        console.warn('Observe event!');
        // @ts-ignore: TypeScript doesn't seem to be able to parse this IF statement properly because of the `unknown` type.
        if (event && event.propertyName && event.propertyName === 'margin-top') return;
        this.reEval(true, true);
    }
}
bcdComponents.push(BellCubicDetails);


const queryParamsArr = window.location.search.substring(1).split('&').map(param => param.split('='));
const queryParams: objOf<string> = {};

for (const param of queryParamsArr) {
    queryParams[param[0]] = param[1];
}


export class BellCubicSummary extends bcd_collapsableParent {
    static cssClass = 'bcd-summary';
    static asString = 'BellCubicSummary';

    constructor(element:HTMLElement) {
        super(element);
        this.summary = element; // @ts-expect-error: No overload matches this call.
        this.summary.addEventListener('click', this.handleClick.bind(this));
        this.openIcons90deg = this.summary.getElementsByClassName('open-icon-90CC');

        /*console.log("[BCD-SUMMARY] Registering  component: ", this)*/

        //console.log(this.element_, {parent: dumpCSSText(this.element_), child: dumpCSSText(this.details_inner)});
        if (this.adjacent) {
            const temp_details = this.self.nextElementSibling;
            if (!(temp_details && temp_details.classList.contains(BellCubicDetails.cssClass))) {console.log(bcd_const_errItem, this); throw new TypeError("[BCD-SUMMARY] Error: Adjacent Summary element must be proceeded by a Details element.");}
            this.details = temp_details as HTMLElement;
        } else {
            const temp_details = this.self.ownerDocument.getElementById(this.summary.getAttribute('for') ?? '');
            if (!temp_details) {console.log(bcd_const_errItem, this); throw new TypeError("[BCD-SUMMARY] Error: Non-adjacent Details elements must have a summary element with a `for` attribute matching the Details element's id.");}
            this.details = temp_details as HTMLElement;
        }

        //console.log(this.element_, {parent: dumpCSSText(this.element_), child: dumpCSSText(this.details_inner)});
        this.divertedCompletion();
    }

    divertedCompletion(){requestAnimationFrame(()=>{

        const temp_inner = this.details.querySelector(`.${bcd_const_classDetailsInner}`);
        if (!temp_inner) {this.divertedCompletion(); return;}
            else this.details_inner = temp_inner as HTMLElement;

        bcd_ComponentTracker.registerComponent(this, BellCubicSummary, this.details);
        this.reEval();
        this.self.classList.add('initialized');
    });}

    /**
        @param {PointerEvent} event
    */
    handleClick(event:PointerEvent){
        //console.log(event, event.target.tagName);
        // @ts-expect-error: Property 'path' does not exist on type 'PointerEvent'
        if (event.path.slice(0, 5).map((el:HTMLElement) => el.tagName === 'A').includes(true)) return;
        this.toggle();
    }
}
bcdComponents.push(BellCubicSummary);

export class bcd_prettyJSON {
    static cssClass = 'bcd-prettyJSON';
    static asString = 'bcd_prettyJSON';
    element_:HTMLElement;
    constructor(element:HTMLElement) {
        this.element_ = element;

        const raw_json = element.innerText;
        const json = JSON.parse(raw_json);
        console.log("Registered new Pretty JSON element:", element, json);

        this.element_.innerText = JSON.stringify(json, null, 2);

        this.element_.classList.add('initialized');
    }
}
bcdComponents.push(bcd_prettyJSON);

export function registerBCDComponent(component:BCDComponent):void {
    try{
        componentHandler.register({
            constructor: component,
            classAsString: component.asString,
            cssClass: component.cssClass,
            widget: false
        });
        componentHandler.upgradeElements(document.getElementsByClassName(component.cssClass));
    }catch(e:unknown){
        console.error("[BCD-Components] Error registering component", component.asString, "with class", component.cssClass, ":\n", e);
    }
}


function registerComponents():void{
    console.debug("[BCD-Components] Registering components...");

    // Tell mdl about our shiny new components

    for (const component of bcdComponents) {
        registerBCDComponent(component);
    }
    console.debug("[BCD-Components] Registered components:", bcdComponents);
}


export function bcd_universalJS_init():void {

    // Register all the things!
    registerComponents();

    // =============================================================
    // Random text time!
    // =============================================================

    const randomTextField = document.getElementById("randomized-text-field");
    if (!randomTextField) return;

    const toSetText = quotes.possibilities_conditionalized[randomNumber(0, quotes.possibilities_conditionalized.length - 1)];
    /*console.log(`[BCD-RANDOM-TEXT] Text to set: ${JSON.stringify(toSetText)}`);*/

    // Check condition
    if (quotes.checkCondition(toSetText[0])) {
        randomTextField.innerHTML = toSetText[1];
        /*console.log(`[BCD-RANDOM-TEXT] Condition passed. Using conditionalized text.`);*/
    } else {
        randomTextField.innerHTML = quotes.possibilities_Generic[randomNumber(0, quotes.possibilities_Generic.length - 1)];
        /*console.log(`[BCD-RANDOM-TEXT] Condition failed. Using generic text.`);*/
    }
}
window.bcd_init_functions.universal = bcd_universalJS_init;
