import * as mdl from './assets/site/mdl/material.js';
import * as quotes from './universal_quotes.js';
function loadFS() {
    return import('./filesystem-interface.js');
}
window.domParser = new DOMParser();
export function afterDelay(timeout, callback, ...args) {
    return window.setTimeout(callback, timeout, ...(args || []));
}
export function wait(timeout) {
    return new Promise(resolve => afterDelay(timeout, resolve));
}
export class UpdatableObject {
    update() {
        if (this.suppressUpdates)
            return;
        this.suppressUpdates = true;
        this.update_();
        this.suppressUpdates = false;
    }
    update_bound = this.update.bind(this);
    update_() { return; }
    updateFromInput() {
        if (this.suppressUpdates)
            return;
        this.suppressUpdates = true;
        this.updateFromInput_();
        this.suppressUpdates = false;
    }
    updateFromInput_bound = this.updateFromInput.bind(this);
    updateFromInput_() { return; }
    destroy() {
        this.suppressUpdates = true;
        queueMicrotask(() => this.suppressUpdates = true);
        this.destroy_();
    }
    destroy_bound = this.destroy.bind(this);
    destroy_() { return; }
    suppressUpdates = false;
}
export function nestAnimationFrames(num, callback) {
    if (num <= 0)
        return callback();
    requestAnimationFrame(() => nestAnimationFrames(num - 1, callback));
}
export async function animationFrames(num) {
    return new Promise(resolve => nestAnimationFrames(num, resolve));
}
export function anAnimationFrame() {
    return animationFrames(1);
}
export function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export function trimWhitespace(str, trailingNewline = false) {
    return str.trimStart()
        .trimEnd()
        .replace(/[^\S\n]*$/gm, '')
        + (trailingNewline ? '\n' : '');
}
const keyTypes = {
    'Enter': [[[], 'activate']],
    ' ': [[[], 'activate']],
    'Escape': [[[], 'exit']],
    'Esc': [[[], 'exit']],
    'z': [
        [['ctrl'], 'undo'], [['meta'], 'undo'],
        [['ctrl', 'shift'], 'redo'], [['meta', 'shift'], 'redo']
    ],
    'y': [[['ctrl'], 'redo']],
    's': [[['ctrl'], 'save']],
};
export function registerForEvents(element, events, options) {
    registerForEvents_(element, events, options, false);
}
export function unregisterForEvents(element, events, options) {
    registerForEvents_(element, events, options, true);
}
export const registerForEvents_wrappedFunctions = new Map();
export const registerForEvents_handledKeys = new Map();
function registerForEvents_(element, events, options, unregister = false) {
    let handling = false;
    const setListener = unregister ? element.removeEventListener.bind(element) : element.addEventListener.bind(element);
    function wrapCallback(callback) {
        let f = registerForEvents_wrappedFunctions.get(callback);
        if (!f) {
            f = function (...args) {
                if (handling)
                    return;
                handling = true;
                queueMicrotask(() => handling = false);
                return callback.call(this, ...args);
            };
            registerForEvents_wrappedFunctions.set(callback, f);
        }
        return f;
    }
    events = Object.fromEntries(Object.entries(events).map(([key, value]) => [key, wrapCallback(value)]));
    let handleKey = registerForEvents_handledKeys.get(events);
    if (!handleKey) {
        handleKey = function (ev) {
            if (!(ev instanceof KeyboardEvent))
                return;
            const functionName = keyTypes[ev.key]?.find(([modifiers, _]) => modifiers.every(mod => ev[`${mod}Key`]))?.[1] || 'anyKey';
            const requestedCallback = events[functionName];
            if (requestedCallback && functionName !== 'anyKey') {
                ev.preventDefault();
                ev.stopPropagation();
            }
            const callback = requestedCallback || events['anyKey'];
            callback?.call(element, ev);
        };
        registerForEvents_handledKeys.set(events, handleKey);
    }
    setListener('keydown', handleKey, options);
    for (const evt in events)
        switch (evt) {
            case 'activate':
                setListener(window.clickEvt, events[evt], options);
                break;
            case 'change':
                setListener('change', events[evt], options);
                setListener('input', events[evt], options);
                break;
            case 'dropdownInput':
                setListener('bcd-dropdown-change', events[evt], options);
                break;
            case 'exit': break;
            case 'undo': break;
            case 'redo': break;
            case 'anyKey': break;
        }
}
window.registerForEvents = registerForEvents;
export function setProxies(obj, handler, runOnEach) {
    if (!obj || typeof obj !== 'object')
        return obj;
    if (handler.set) {
        const oldSetter = handler.set;
        const wrappedSetter = (target, prop, value, receiver) => {
            if (prop in target && target[prop] === value)
                return true;
            if (value && typeof value === 'object')
                value = setProxies(value, handler, runOnEach);
            return oldSetter.call(handler, target, prop, value, receiver) ?? true;
        };
        handler.set = wrappedSetter;
    }
    for (const [key, value] of Object.entries(obj)) {
        runOnEach?.(value);
        if (!value || typeof value !== 'object')
            continue;
        obj[key] = new Proxy(setProxies(value, handler, runOnEach), handler);
    }
    return new Proxy(obj, handler);
}
export function randomNumber(min = 0, max = 1, places = 0) {
    const placesMult = Math.pow(10, places);
    return (Math.round((Math.random() * (max - min) + min) * placesMult) / placesMult);
}
window.domParser = new DOMParser();
export function focusAnyElement(element, preventScrolling = true) {
    if (!element || !element.focus)
        return;
    const hadTabIndex = element.hasAttribute('tabindex');
    if (!hadTabIndex)
        element.setAttribute('tabindex', '-8311');
    element.focus({ preventScroll: preventScrolling });
    nestAnimationFrames(2, () => {
        if (!hadTabIndex)
            element.removeAttribute('tabindex');
    });
}
export function copyCode(elem) {
    if (!elem)
        throw new Error("No element provided to copyCode with!");
    const codeElem = elem.parentElement?.querySelector('code');
    if (!codeElem)
        throw new Error("No code element found to copy from!");
    navigator.clipboard.writeText(trimWhitespace(codeElem.textContent ?? '', true));
    const selection = window.getSelection();
    const tempRange = new Range();
    tempRange.selectNode(codeElem);
    selection.removeAllRanges();
    selection.addRange(tempRange);
}
window.copyCode = copyCode;
export function getInputValue(input) {
    return input.value || input.getAttribute('bcdPlaceholder') || input.placeholder || '';
}
function ___getOrCreateChild(tagName) {
    let child = this.getElementsByTagName(tagName)[0];
    if (!child) {
        const doc = this instanceof Document ? this : this.ownerDocument;
        child = doc.createElement(tagName, { is: tagName });
        this.appendChild(child);
    }
    return child;
}
Element.prototype.getOrCreateChildByTag = ___getOrCreateChild;
Document.prototype.getOrCreateChildByTag = ___getOrCreateChild;
function ___removeChildByTag(tagName, count = 1) {
    const children = [...this.getElementsByTagName(tagName)];
    let removedCount = 0;
    for (let i = 0; removedCount <= count && i < children.length; i++) {
        const child = children[i];
        if (!child || child.tagName !== tagName)
            continue;
        child.remove();
        removedCount++;
    }
}
Element.prototype.removeChildByTag = ___removeChildByTag;
Document.prototype.removeChildByTag = ___removeChildByTag;
function ___moveItem(item, newAdjacentItem, relativePosition = 'below') {
    if (!this.has(item) || !this.has(newAdjacentItem))
        return false;
    const arr = [...this];
    const itemIndex = arr.indexOf(item);
    const adjacentIndex = arr.indexOf(newAdjacentItem);
    if (itemIndex === -1 || adjacentIndex === -1)
        return false;
    arr.splice(itemIndex, 1);
    arr.splice(adjacentIndex + (relativePosition === 'below' ? 1 : 0), 0, item);
    this.clear();
    arr.forEach(i => this.add(i));
    return true;
}
Set.prototype.moveItem = ___moveItem;
function ___moveIndex(item, newIndex) {
    if (!this.has(item))
        return false;
    const arr = [...this];
    const itemIndex = arr.indexOf(item);
    if (itemIndex === -1)
        return false;
    if (newIndex < 0)
        newIndex = arr.length + newIndex;
    arr.splice(itemIndex, 1);
    arr.splice(newIndex, 0, item);
    this.clear();
    arr.forEach(i => this.add(i));
    return true;
}
Set.prototype.moveIndex = ___moveIndex;
export function getSetIndex(set, index) {
    let i = 0;
    for (const item of set) {
        if (i === index)
            return item;
        i++;
    }
}
function ___getExtends(type) {
    const returnVal = [];
    for (const [, value] of this)
        if (value instanceof type)
            returnVal.push(value);
    return returnVal;
}
export function registerUpgrade(subject, upgrade, target, propagateToTargetChildren = false, propagateToSubjectToChildren = false) {
    forEachChildAndOrParent(subject, propagateToSubjectToChildren, child => {
        if (!child.upgrades) {
            const map = new Map();
            map.getExtends = ___getExtends;
            child.upgrades = map;
        }
        child.upgrades.set(upgrade.constructor, upgrade);
    });
    if (target)
        forEachChildAndOrParent(target, propagateToTargetChildren, child => {
            if (!child.targetingComponents) {
                const map = new Map();
                map.getExtends = ___getExtends;
                child.targetingComponents = map;
            }
            child.targetingComponents.set(upgrade.constructor, upgrade);
        });
}
function forEachChildAndOrParent(start, doChildren, callback) {
    if (doChildren)
        forEachChild(start, callback);
    callback(start);
}
function forEachChild(start, callback) {
    for (let i = 0; i < start.children.length; i++) {
        forEachChild(start.children[i], callback);
        callback(start.children[i]);
    }
}
var strs;
(function (strs) {
    strs["transitionDur"] = "transition-duration";
    strs["animDur"] = "animation-duration";
    strs["marginTop"] = "margin-top";
    strs["classIsOpen"] = "is-open";
    strs["classAdjacent"] = "adjacent";
    strs["classDetailsInner"] = "js-bcd-details-inner";
    strs["errItem"] = "Error Item:";
})(strs || (strs = {}));
window.queryParams = {};
if (window.location.search[0] === '?')
    window.location.search.substring(1).split('&')
        .map(param => param.split('='))
        .forEach(param => window.queryParams[param[0].trim()] = param[1]?.trim() ?? '');
const componentsToRegister = [];
export function registerBCDComponent(component) {
    try {
        mdl.componentHandler.register({
            constructor: component,
            classAsString: component.asString,
            cssClass: component.cssClass,
            widget: false
        });
        mdl.componentHandler.upgradeElements(document.getElementsByClassName(component.cssClass));
    }
    catch (e) {
        console.error("[BCD-Components] Error registering component", component.asString, "with class", component.cssClass, ":\n", e);
        return e;
    }
    return false;
}
export function registerBCDComponents(...components) {
    const componentArr = components.length ? components : componentsToRegister;
    for (let i = 0; i < componentArr.length; i++) {
        registerBCDComponent(componentArr[i]);
    }
}
export class BCD_CollapsibleParent {
    details;
    details_inner;
    summary;
    openIcons90deg;
    self;
    adjacent = false;
    constructor(elm) {
        this.self = elm;
        this.adjacent = elm.classList.contains(strs.classAdjacent);
    }
    isOpen() {
        return this.details.classList.contains(strs.classIsOpen) || this.summary.classList.contains(strs.classIsOpen);
    }
    toggle(doSetDuration = true) {
        if (this.isOpen()) {
            this.close(doSetDuration);
        }
        else {
            this.open(doSetDuration);
        }
    }
    reEval(doSetDuration = true, instant) {
        requestAnimationFrame(() => {
            if (this.isOpen())
                this.open(doSetDuration, instant);
            else
                this.close(doSetDuration, instant);
        });
    }
    stateChangePromise(desiredState) {
        if ((desiredState !== undefined && this.isOpen() === desiredState)
            || getComputedStyle(this.details_inner).transitionDuration === '0s') {
            return new Promise((resolve) => requestAnimationFrame(() => { this.onTransitionEnd(); resolve(); }));
        }
        const transitionEndFunct = this.onTransitionEnd.bind(this);
        return new Promise((resolve) => {
            function listener(event) {
                if (event.propertyName !== 'margin-top')
                    return;
                removeListener();
                afterDelay(10, () => { transitionEndFunct(event); resolve(); });
            }
            this.details_inner.addEventListener('transitionend', listener);
            const details_inner = this.details_inner;
            function removeListener() { details_inner.removeEventListener('transitionend', listener); }
        });
    }
    open(doSetDuration = true, instant = false) {
        const returnVal = this.stateChangePromise(true);
        if (!instant)
            this.evaluateDuration(doSetDuration);
        this.details_inner.ariaHidden = 'false';
        this.details_inner.style.visibility = 'visible';
        BCD_CollapsibleParent.setDisabled(this.details_inner, false, false);
        this.details.classList.add(strs.classIsOpen);
        this.summary.classList.add(strs.classIsOpen);
        nestAnimationFrames(3, () => {
            this.details_inner.style.marginTop = this.details.getAttribute('data-margin-top') || '0';
            if (instant)
                nestAnimationFrames(2, () => this.evaluateDuration.bind(this, doSetDuration, true));
        });
        if (instant)
            return this.instantTransition();
        return returnVal;
    }
    hasClosedFinal = false;
    close(doSetDuration = true, instant = false, final = false, duration) {
        if (this.hasClosedFinal)
            return;
        if (final) {
            this.summary.upgrades.getExtends(BCD_CollapsibleParent)[0].hasClosedFinal = true;
            this.details.upgrades.getExtends(BCD_CollapsibleParent)[0].hasClosedFinal = true;
        }
        if (duration === undefined)
            this.evaluateDuration(doSetDuration, false);
        else
            this.details_inner.style.transitionDuration = `${duration}ms`;
        const returnVal = this.stateChangePromise(false);
        this.details_inner.style.marginTop = `-${this.details_inner.offsetHeight + 32}px`;
        this.details.classList.remove(strs.classIsOpen);
        this.summary.classList.remove(strs.classIsOpen);
        BCD_CollapsibleParent.setDisabled(this.details_inner, true);
        if (instant) {
            nestAnimationFrames(2, () => this.evaluateDuration(doSetDuration, false));
            return this.instantTransition();
        }
        if (final)
            this.summary.style.pointerEvents = 'none';
        return returnVal;
    }
    onTransitionEnd(event) {
        if (event && event.propertyName !== 'margin-top')
            return;
        if (this.isOpen()) {
            BCD_CollapsibleParent.setDisabled(this.details_inner, false);
            return;
        }
        requestAnimationFrame(() => {
            this.details_inner.ariaHidden = 'true';
            this.details_inner.style.visibility = 'none';
            BCD_CollapsibleParent.setDisabled(this.details_inner, true);
        });
    }
    instantTransition() {
        if (this.details_inner) {
            this.details_inner.style.transitionDuration = `0s`;
            this.details_inner.style.animationDuration = `0s`;
            for (const icon of this.openIcons90deg) {
                icon.style.animationDuration = `0s`;
            }
        }
        this.onTransitionEnd();
        return new Promise((r) => r());
    }
    static setDisabled(elm, disabled, allowPointerEvents = true) {
        for (const child of elm.children)
            this.setDisabled(child, disabled);
        const wasDisabled = elm.getAttribute('data-was-disabled');
        const oldTabIndex = elm.getAttribute('data-old-tabindex');
        const forcePointerEvents = elm.getAttribute('data-force-pointer-events');
        if (forcePointerEvents !== null)
            allowPointerEvents = (forcePointerEvents === 'true');
        const forceDisabled = elm.getAttribute('data-force-disabled');
        if (forceDisabled !== null)
            disabled = (forceDisabled === 'true');
        if (disabled) {
            if (wasDisabled === null)
                elm.setAttribute('data-was-disabled', elm.hasAttribute('disabled') ? 'true' : 'false');
            elm.setAttribute('disabled', '');
            elm.ariaDisabled = 'true';
            if (oldTabIndex === null)
                elm.setAttribute('data-old-tabindex', elm.getAttribute('tabindex') || '');
            elm.tabIndex = -1;
        }
        else {
            elm.removeAttribute('data-was-disabled');
            if (wasDisabled === 'true')
                elm.setAttribute('disabled', '');
            else
                elm.removeAttribute('disabled');
            elm.ariaDisabled = wasDisabled === 'true' ? 'true' : 'false';
            if (oldTabIndex !== null || elm.hasAttribute('data-old-tabindex')) {
                oldTabIndex ? elm.setAttribute('tabindex', oldTabIndex) : elm.removeAttribute('tabindex');
                elm.removeAttribute('data-old-tabindex');
            }
        }
        elm.style.pointerEvents = allowPointerEvents ? '' : 'none';
    }
    evaluateDuration(doRun = true, opening = true) {
        if (doRun && this.details_inner) {
            const contentHeight = this.details_inner.offsetHeight;
            this.details_inner.style.transitionDuration = `${(opening ? 250 : 300) + ((opening ? 0.3 : 0.35) * (contentHeight + 32))}ms`;
            for (const icon of this.openIcons90deg) {
                icon.style.transitionDuration = `${250 + (0.15 * (contentHeight + 32))}ms`;
            }
        }
    }
}
export class BCDDetails extends BCD_CollapsibleParent {
    static cssClass = "js-bcd-details";
    static asString = "BellCubicDetails";
    constructor(element) {
        super(element);
        this.details = element;
        this.details_inner = document.createElement('div');
        this.details_inner.classList.add(strs.classDetailsInner);
        const temp_childrenArr = [];
        for (const node of this.details.childNodes) {
            temp_childrenArr.push(node);
        }
        for (const node of temp_childrenArr) {
            this.details_inner.appendChild(node);
        }
        this.details.appendChild(this.details_inner);
        if (this.adjacent) {
            const temp_summary = this.self.previousElementSibling;
            if (!temp_summary || !temp_summary.classList.contains(BCDSummary.cssClass)) {
                console.log(strs.errItem, this);
                throw new TypeError("[BCD-DETAILS] Error: Adjacent Details element must be preceded by a Summary element.");
            }
            this.summary = temp_summary;
        }
        else {
            const temp_summary = this.self.ownerDocument.querySelector(`.js-bcd-summary[for="${this.details.id}"`);
            if (!temp_summary) {
                console.log(strs.errItem, this);
                throw new TypeError("[BCD-DETAILS] Error: Non-adjacent Details elements must have a Summary element with a `for` attribute matching the Details element's id.");
            }
            this.summary = temp_summary;
        }
        this.openIcons90deg = this.summary.getElementsByClassName('open-icon-90CC');
        const boundReEval = this.reEvalIfClosed.bind(this);
        const observer = new ResizeObserver(boundReEval);
        observer.observe(this.details_inner);
        this.reEval(true, true);
        this.self.classList.add('initialized');
        registerUpgrade(this.self, this, this.summary, true);
    }
    reEvalIfClosed() {
        if (!this.isOpen())
            this.reEval(true, true);
    }
}
componentsToRegister.push(BCDDetails);
export class BCDSummary extends BCD_CollapsibleParent {
    static cssClass = 'js-bcd-summary';
    static asString = 'BellCubicSummary';
    constructor(element) {
        super(element);
        this.summary = element;
        registerForEvents(this.summary, { activate: this.activate.bind(this) });
        this.openIcons90deg = this.summary.getElementsByClassName('open-icon-90CC');
        if (this.adjacent) {
            const temp_details = this.self.nextElementSibling;
            if (!(temp_details && temp_details.classList.contains(BCDDetails.cssClass))) {
                console.log(strs.errItem, this);
                throw new TypeError("[BCD-SUMMARY] Error: Adjacent Summary element must be proceeded by a Details element.");
            }
            this.details = temp_details;
        }
        else {
            const temp_details = this.self.ownerDocument.getElementById(this.summary.getAttribute('for') ?? '');
            if (!temp_details) {
                console.log(strs.errItem, this);
                throw new TypeError("[BCD-SUMMARY] Error: Non-adjacent Details elements must have a summary element with a `for` attribute matching the Details element's id.");
            }
            this.details = temp_details;
        }
        this.divertedCompletion();
        registerUpgrade(this.self, this, this.details, false, true);
    }
    divertedCompletion() {
        queueMicrotask(() => {
            const temp_inner = this.details.querySelector(`.${strs.classDetailsInner}`);
            if (!temp_inner) {
                this.divertedCompletion();
                return;
            }
            this.details_inner = temp_inner;
            this.reEval(true, true);
            this.self.classList.add('initialized');
        });
    }
    correctFocus(keyDown) {
        if (keyDown)
            focusAnyElement(this.summary);
        else
            return nestAnimationFrames(2, () => {
                this.summary.blur();
            });
    }
    activate(event) {
        if (!event)
            return;
        if ((('pointerType' in event) && !event.pointerType)
            || ('path' in event && event.path && event.path instanceof Array && event.path?.slice(0, 5).some((el) => el.tagName === 'A')))
            return;
        this.toggle();
        this.correctFocus(event instanceof KeyboardEvent);
    }
}
componentsToRegister.push(BCDSummary);
export class PrettyJSON {
    static cssClass = 'js-bcd-prettyJSON';
    static asString = 'bcd_prettyJSON';
    element_;
    constructor(element) {
        registerUpgrade(element, this, null, false, true);
        this.element_ = element;
        const json = JSON.parse(element.textContent ?? '');
        this.element_.textContent = JSON.stringify(json, null, 2);
        this.element_.classList.add('initialized');
    }
}
componentsToRegister.push(PrettyJSON);
export class BCDModalDialog extends EventTarget {
    static cssClass = 'js-bcd-modal';
    static asString = 'BellCubic Modal';
    static obfuscator;
    static modalsToShow = [];
    static shownModal = null;
    element_;
    closeByClickOutside;
    constructor(element) {
        super();
        registerUpgrade(element, this, null, false, true);
        this.element_ = element;
        this.element_.ariaModal = 'true';
        this.element_.setAttribute('role', 'dialog');
        this.element_.ariaHidden = 'true';
        this.element_.hidden = true;
        const body = document.body ?? document.documentElement.getElementsByTagName('body')[0];
        body.prepend(element);
        if (!BCDModalDialog.obfuscator) {
            BCDModalDialog.obfuscator = document.createElement('div');
            BCDModalDialog.obfuscator.classList.add(mdl.MaterialLayout.cssClasses.OBFUSCATOR, 'js-bcd-modal-obfuscator');
            body.appendChild(BCDModalDialog.obfuscator);
        }
        this.closeByClickOutside = !this.element_.hasAttribute('no-click-outside');
        afterDelay(1000, function () {
            const closeButtons = this.element_.getElementsByClassName('js-bcd-modal-close');
            for (const button of closeButtons) {
                registerForEvents(button, { activate: this.boundHideFunction });
            }
            if (this.element_.hasAttribute('open-by-default'))
                this.show();
        }.bind(this));
    }
    static evalQueue(delay = 100) {
        if (this.shownModal || !this.modalsToShow.length)
            return;
        const modal = BCDModalDialog.modalsToShow.shift();
        if (!modal)
            return this.evalQueue();
        BCDModalDialog.shownModal = modal;
        afterDelay(delay, modal.show_forReal.bind(modal));
    }
    show() {
        BCDModalDialog.modalsToShow.push(this);
        BCDModalDialog.evalQueue();
        return new Promise((resolve) => {
            this.addEventListener('afterHide', (evt) => {
                if ('detail' in evt && typeof evt.detail === 'string')
                    resolve(evt.detail);
                else
                    resolve(null);
            }, { once: true });
        });
    }
    static beforeShowEvent = new CustomEvent('beforeShow', { cancelable: true, bubbles: false, composed: false });
    static afterShowEvent = new CustomEvent('afterShow', { cancelable: false, bubbles: false, composed: false });
    show_forReal() {
        if (!this.dispatchEvent(BCDModalDialog.beforeShowEvent) || !this.element_.dispatchEvent(BCDModalDialog.beforeShowEvent))
            return;
        BCDModalDialog.obfuscator.classList.add(mdl.MaterialLayout.cssClasses.IS_DRAWER_OPEN);
        registerForEvents(BCDModalDialog.obfuscator, { activate: this.boundHideFunction });
        this.element_.ariaHidden = 'false';
        this.element_.hidden = false;
        if ('show' in this.element_)
            this.element_.show();
        else
            this.element_.setAttribute('open', '');
        if (this.dispatchEvent(BCDModalDialog.afterShowEvent))
            this.element_.dispatchEvent(BCDModalDialog.afterShowEvent);
    }
    static getBeforeHideEvent(msg = null) { return new CustomEvent('beforeHide', { cancelable: true, bubbles: false, composed: false, detail: msg }); }
    static getAfterHideEvent(msg = null) { return new CustomEvent('afterHide', { cancelable: false, bubbles: false, composed: false, detail: msg }); }
    boundHideFunction = this.hide.bind(this);
    hide(evt) {
        let msg = null;
        if (evt && evt.currentTarget instanceof Element)
            msg = evt.currentTarget.getAttribute('data-modal-message');
        if (evt)
            evt.stopImmediatePropagation();
        if (!this.dispatchEvent(BCDModalDialog.getBeforeHideEvent(msg)) || !this.element_.dispatchEvent(BCDModalDialog.getBeforeHideEvent(msg)))
            return;
        this.element_.ariaHidden = 'true';
        if ('close' in this.element_)
            this.element_.close();
        else
            this.element_.removeAttribute('open');
        this.element_.hidden = true;
        BCDModalDialog.obfuscator.classList.remove(mdl.MaterialLayout.cssClasses.IS_DRAWER_OPEN);
        BCDModalDialog.obfuscator.removeEventListener(window.clickEvt, this.boundHideFunction);
        BCDModalDialog.shownModal = null;
        if (this.dispatchEvent(BCDModalDialog.getAfterHideEvent(msg)))
            this.element_.dispatchEvent(BCDModalDialog.getAfterHideEvent(msg));
        BCDModalDialog.evalQueue();
    }
}
componentsToRegister.push(BCDModalDialog);
export var menuCorners;
(function (menuCorners) {
    menuCorners["unaligned"] = "mdl-menu--unaligned";
    menuCorners["topLeft"] = "mdl-menu--bottom-left";
    menuCorners["topRight"] = "mdl-menu--bottom-right";
    menuCorners["bottomLeft"] = "mdl-menu--top-left";
    menuCorners["bottomRight"] = "mdl-menu--top-right";
})(menuCorners || (menuCorners = {}));
export class BCDDropdown extends mdl.MaterialMenu {
    doReorder;
    options_;
    options_keys;
    selectedOption = '';
    element_;
    selectionTextElements;
    constructor(element, buttonElement, doReorder = true) {
        super(element);
        this.element_ = element;
        this.doReorder = doReorder;
        if (doReorder)
            this.Constant_.CLOSE_TIMEOUT = 0;
        if (this.forElement_) {
            this.forElement_?.removeEventListener(window.clickEvt, this.boundForClick_);
            this.forElement_?.removeEventListener('keydown', this.boundForKeydown_);
        }
        if (buttonElement && buttonElement !== this.forElement_) {
            this.forElement_ = buttonElement;
        }
        if (this.forElement_) {
            this.forElement_.ariaHasPopup = 'true';
            this.forElement_.addEventListener(window.clickEvt, this.boundForClick_);
            this.forElement_.addEventListener('keydown', this.boundForKeydown_);
        }
        const tempOptions = this.options();
        this.options_ = tempOptions;
        this.options_keys = Object.keys(this.options_);
        this.selectedOption = this.options_keys[0] ?? '';
        for (const option of this.options_keys) {
            this.element_.appendChild(this.createOption(option));
        }
        this.selectionTextElements = this.forElement_?.getElementsByClassName('bcd-dropdown_value');
        this.hide();
        this.updateOptions();
        this.element_.addEventListener('focusout', this.focusOutHandler.bind(this));
        registerUpgrade(element, this, this.forElement_, true, true);
    }
    focusOutHandler(evt) {
        if (evt.relatedTarget?.parentElement !== this.element_)
            this.hide();
    }
    selectByString(option) {
        if (this.options_keys.includes(option))
            this.selectedOption = option;
        else
            console.warn("[BCD-DROPDOWN] Attempted to select an option that does not exist:", option);
        this.updateOptions();
    }
    updateOptions() {
        const children = [...this.element_.getElementsByTagName('li')];
        if (this.doReorder) {
            const goldenChild = children.find((elm) => elm.textContent === this.selectedOption);
            if (!goldenChild) {
                console.log("[BCD-DROPDOWN] Erroring instance:", this);
                throw new Error('Could not find the selected option in the dropdown.');
            }
            this.makeSelected(goldenChild);
        }
        const demonChildren = this.doReorder ? children.filter((elm) => elm.textContent !== this.selectedOption) : children;
        demonChildren.sort((a, b) => this.options_keys.indexOf(a.textContent ?? '') - this.options_keys.indexOf(b.textContent ?? ''));
        for (const child of demonChildren) {
            this.element_.removeChild(child);
            this.makeNotSelected(child);
            this.element_.appendChild(child);
        }
    }
    createOption(option, onSelectCallback, tooltip, addToList = false) {
        const li = document.createElement('li');
        li.textContent = option;
        li.setAttribute('option-value', option);
        li.classList.add('mdl-menu__item');
        this.registerItem(li);
        const optionData = this.options_[option];
        if (optionData) {
            if (tooltip === undefined && 'tooltip' in optionData)
                tooltip = optionData.tooltip;
            if (!onSelectCallback)
                if ('onSelect' in optionData)
                    onSelectCallback = optionData.onSelect;
                else
                    onSelectCallback = optionData;
        }
        if (addToList) {
            this.element_.appendChild(li);
            this.options_keys.push(option);
            this.options_[option] = {
                onSelect: onSelectCallback ?? null,
                tooltip,
            };
        }
        if (onSelectCallback)
            registerForEvents(li, { activate: onSelectCallback.bind(this) });
        this.onCreateOption?.(option);
        return li;
    }
    createTooltip(targetElement, tooltip) {
    }
    onItemSelected(option) {
        this.selectedOption = option.textContent ?? '';
        this.element_.dispatchEvent(new CustomEvent('bcd-dropdown-change', { detail: { dropdown: this, option: this.selectedOption } }));
        this.updateOptions();
    }
    makeSelected(option) {
        if (this.doReorder)
            option.classList.add('mdl-menu__item--full-bleed-divider');
        option.blur();
        for (const elm of this.selectionTextElements ?? []) {
            elm.textContent = option.textContent;
        }
    }
    makeNotSelected(option) {
        option.classList.remove('mdl-menu__item--full-bleed-divider');
    }
    _optionElements;
    get optionElements() { return this._optionElements ??= this.element_.getElementsByTagName('li'); }
    hasShownOrHiddenThisFrame = false;
    show(evt) {
        if (this.hasShownOrHiddenThisFrame)
            return;
        this.hasShownOrHiddenThisFrame = true;
        requestAnimationFrame(() => this.hasShownOrHiddenThisFrame = false);
        if (this.element_.ariaHidden === 'false')
            return;
        if (evt instanceof KeyboardEvent || evt instanceof PointerEvent && evt.pointerId === -1 || 'mozInputSource' in evt && evt.mozInputSource !== 1)
            this.optionElements[0]?.focus();
        this.element_.ariaHidden = 'false';
        this.element_.removeAttribute('disabled');
        if (this.forElement_)
            this.forElement_.ariaExpanded = 'true';
        for (const item of this.optionElements)
            item.tabIndex = 0;
        this.forElement_?.targetingComponents?.get(BCDTooltip)?.hide();
        super.show(evt);
    }
    hide() {
        if (this.hasShownOrHiddenThisFrame)
            return;
        this.hasShownOrHiddenThisFrame = true;
        requestAnimationFrame(() => this.hasShownOrHiddenThisFrame = false);
        if (this.element_.ariaHidden === 'true')
            return;
        this.optionElements[0]?.blur();
        this.element_.ariaHidden = 'true';
        this.element_.setAttribute('disabled', '');
        if (this.forElement_)
            this.forElement_.ariaExpanded = 'false';
        for (const item of this.optionElements)
            item.tabIndex = -1;
        super.hide();
    }
}
export class bcdDropdown_AwesomeButton extends BCDDropdown {
    static asString = 'BCD - Debugger\'s All-Powerful Button';
    static cssClass = 'js-bcd-debuggers-all-powerful-button';
    constructor(element) {
        super(element, undefined, false);
    }
    options() {
        return {
            'View Debug Page': () => { document.getElementById('debug-link')?.click(); },
            'Toggle Page Monochrome': () => {
                let [, start, percentage, end] = document.body.style.filter.match(/(.*)grayscale\((.*?)\)(.*)/) ?? [];
                start ??= '';
                percentage ??= '';
                end ??= '';
                document.body.style.filter = `${start}grayscale(${percentage === '100%' ? '0%' : '100%'})${end}`;
            },
        };
    }
}
componentsToRegister.push(bcdDropdown_AwesomeButton);
export class BCDTabButton extends mdl.MaterialButton {
    static asString = 'BCD - Tab List Button';
    static cssClass = 'js-tab-list-button';
    static anchorToSet = '';
    element_;
    boundTab;
    name = '';
    setAnchor = false;
    constructor(element) {
        if (element.tagName !== 'BUTTON')
            throw new TypeError('A BellCubic Tab Button must be created directly from a <button> element.');
        const name = element.getAttribute('name');
        if (!name)
            throw new TypeError('A BellCubic Tab Button must have a name attribute.');
        const boundTab = document.querySelector(`div.tab-content[name="${name}"]`);
        if (!boundTab)
            throw new TypeError(`Could not find a tab with the name "${name}".`);
        if (!boundTab.parentElement)
            throw new TypeError(`Tab with name "${name}" has no parent element!`);
        element.textContent = name;
        element.setAttribute('type', 'button');
        super(element);
        registerUpgrade(element, this, boundTab, false, true);
        this.element_ = element;
        this.boundTab = boundTab;
        this.name = name;
        const entry = window.performance.getEntriesByType("navigation")?.[0];
        this.setAnchor = element.parentElement?.hasAttribute('do-tab-anchor') ?? false;
        registerForEvents(this.element_, { activate: this.activate.bind(this) });
        if (entry && 'type' in entry && entry.type === 'reload')
            this.makeSelected(0);
        else if (this.setAnchor && window.location.hash.toLowerCase() === `#tab-${name}`.toLowerCase())
            queueMicrotask(this.makeSelected.bind(this));
        else
            this.makeSelected(0);
    }
    findTabNumber(button_) {
        const button = button_ ?? this.element_;
        return [...(button.parentElement?.children ?? [])].indexOf(button);
    }
    makeSelected(tabNumber_) {
        const tabNumber = tabNumber_ ?? this.findTabNumber();
        if (tabNumber === -1)
            throw new Error('Could not find the tab number.');
        const siblingsAndSelf = [...(this.element_.parentElement?.children ?? [])];
        if (!siblingsAndSelf[tabNumber] || siblingsAndSelf[tabNumber].classList.contains('active'))
            return;
        for (const sibling of siblingsAndSelf) {
            if (sibling === this.element_) {
                sibling.classList.add('active');
                sibling.setAttribute('aria-pressed', 'true');
                sibling.setAttribute('aria-selected', 'true');
            }
            else {
                sibling.classList.remove('active');
                sibling.setAttribute('aria-pressed', 'false');
                sibling.setAttribute('aria-selected', 'false');
            }
        }
        if (!this.boundTab.parentElement)
            return;
        const tab_siblingsAndTab = [...this.boundTab.parentElement.children];
        for (const tab of tab_siblingsAndTab) {
            if (tab === this.boundTab) {
                tab.classList.add('active');
                tab.classList.remove('tab-content--hidden');
                if ('inert' in tab)
                    tab.inert = false;
                tab.setAttribute('aria-hidden', 'false');
                tab.removeAttribute('disabled');
                tab.removeAttribute('tabindex');
                this.boundTab.parentElement.style.marginLeft = `-${tabNumber}00vw`;
            }
            else {
                tab.classList.remove('active');
                function addHidden() {
                    if (tab.classList.contains('active'))
                        return;
                    tab.classList.add('tab-content--hidden');
                    if ('inert' in tab)
                        tab.inert = true;
                }
                tab.parentElement.addEventListener('transitionend', addHidden, { once: true });
                afterDelay(250, () => {
                    tab.parentElement?.removeEventListener('transitionend', addHidden);
                    addHidden();
                });
                tab.setAttribute('aria-hidden', 'true');
                tab.setAttribute('disabled', '');
                tab.setAttribute('tabindex', '-1');
            }
        }
        if (this.setAnchor) {
            BCDTabButton.anchorToSet = tabNumber == 0 ? '' : `#tab-${this.name}`.toLowerCase();
            BCDTabButton.setAnchorIn3AnimFrames();
        }
    }
    static setAnchorIn3AnimFrames() {
        nestAnimationFrames(3, () => {
            if (BCDTabButton.anchorToSet === '')
                window.history.replaceState(null, '', window.location.pathname);
            else
                window.location.hash = BCDTabButton.anchorToSet;
        });
    }
    activate() {
        this.makeSelected();
        this.element_.blur();
    }
}
componentsToRegister.push(BCDTabButton);
export class BCDTooltip {
    static asString = 'BCD - Tooltip';
    static cssClass = 'js-bcd-tooltip';
    relation;
    position = 'top';
    element;
    boundElement;
    gapBridgeElement;
    openDelayMS;
    constructor(element) {
        this.element = element;
        element.setAttribute('role', 'tooltip');
        element.setAttribute('aria-role', 'tooltip');
        this.gapBridgeElement = document.createElement('div');
        this.gapBridgeElement.classList.add('js-bcd-tooltip_gap-bridge');
        this.element.appendChild(this.gapBridgeElement);
        this.openDelayMS = parseInt(element.getAttribute('open-delay-ms') ?? '400');
        const tempRelation = element.getAttribute('tooltip-relation') ?? 'proceeding';
        let tempElement;
        switch (tempRelation) {
            case 'preceding':
                tempElement = element.nextElementSibling;
                break;
            case 'proceeding':
                tempElement = element.previousElementSibling;
                break;
            case 'child':
                tempElement = element.parentElement;
                break;
            case 'selector': {
                const selector = element.getAttribute('tooltip-selector') ?? '';
                tempElement = element.parentElement?.querySelector(selector)
                    ?? document.querySelector(selector);
                break;
            }
            default: throw new Error('Invalid tooltip-relation attribute!');
        }
        this.relation = tempRelation;
        if (!tempElement || !(tempElement instanceof HTMLElement))
            throw new Error('TOOLTIP - Could not find a valid HTML Element to bind to!');
        this.boundElement = tempElement;
        registerUpgrade(element, this, this.boundElement, true, true);
        const tempPos = element.getAttribute('tooltip-position');
        switch (tempPos) {
            case 'top':
            case 'bottom':
            case 'left':
            case 'right':
                this.position = tempPos;
                break;
            default: throw new Error('Invalid tooltip-position attribute!');
        }
        const boundEnter = this.handleHoverEnter.bind(this);
        const boundLeave = this.handleHoverLeave.bind(this);
        const boundTouch = this.handleTouch.bind(this);
        window.addEventListener('contextmenu', boundLeave);
        this.element.addEventListener('contextmenu', (e) => e.stopPropagation());
        this.boundElement.addEventListener('mouseenter', boundEnter);
        this.element.addEventListener('mouseenter', boundEnter);
        this.boundElement.addEventListener('mouseleave', boundLeave);
        this.element.addEventListener('mouseleave', boundLeave);
        this.boundElement.addEventListener('touchstart', boundTouch, { passive: true });
        this.element.addEventListener('touchstart', boundTouch, { passive: true });
        this.boundElement.addEventListener('touchmove', boundTouch, { passive: true });
        this.element.addEventListener('touchmove', boundTouch, { passive: true });
        this.boundElement.addEventListener('touchend', boundTouch, { passive: true });
        this.element.addEventListener('touchend', boundTouch, { passive: true });
        this.boundElement.addEventListener('touchcancel', boundTouch, { passive: true });
        this.element.addEventListener('touchcancel', boundTouch, { passive: true });
    }
    handleTouch(event) {
        if (event.targetTouches.length > 0)
            this.handleHoverEnter(undefined, true);
        else
            this.handleHoverLeave();
    }
    handleHoverEnter(event, bypassWait) {
        const targetElement = event instanceof MouseEvent ? document.elementFromPoint(event?.x ?? 0, event?.y ?? 0) : event?.target;
        if (targetElement instanceof Element) {
            for (const [, instance] of targetElement.upgrades ?? [])
                if (instance instanceof BCDDropdown)
                    return;
            for (const [, instance] of targetElement.targetingComponents ?? [])
                if (instance instanceof BCDDropdown && instance.container_.classList.contains('is-visible'))
                    return;
        }
        this.showPart1();
        afterDelay(bypassWait ? 0 : 600, function () {
            if (!this.element.classList.contains('active_'))
                return;
            this.showPart2();
        }.bind(this));
    }
    showPart1() {
        this.element.classList.add('active_');
        registerForEvents(window, { exit: this.hide_bound });
    }
    showPart2() {
        this.element.classList.add('active');
        this.element.addEventListener('transitionend', this.setPosition.bind(this), { once: true });
        this.setPosition();
    }
    show() {
        this.showPart1();
        this.showPart2();
    }
    handleHoverLeave(event) { this.hide(); }
    hide() {
        this.element.classList.remove('active_');
        afterDelay(10, () => {
            if (!this.element.classList.contains('active_'))
                this.element.classList.remove('active');
        });
    }
    hide_bound = this.hide.bind(this);
    setPosition() {
        this.element.style.transform = 'none !important';
        this.element.style.transition = 'none !important';
        const tipStyle = window.getComputedStyle(this.element);
        tipStyle.transition;
        tipStyle.transform;
        const elemRect = this.boundElement.getBoundingClientRect();
        const tipRect = { width: this.element.offsetWidth, height: this.element.offsetHeight };
        let top = elemRect.top + (elemRect.height / 2);
        const marginTop = tipRect.height / -2;
        let left = elemRect.left + (elemRect.width / 2);
        const marginLeft = tipRect.width / -2;
        switch (this.position) {
            case 'top':
            case 'bottom':
                this.gapBridgeElement.style.height = '17px';
                this.gapBridgeElement.style.width = `${Math.max(tipRect.width, elemRect.width)}px`;
                this.gapBridgeElement.style.left = `${Math.min(elemRect.left, left + marginLeft) - left - marginLeft}px`;
                if (left + marginLeft < 8)
                    left += 8 - left - marginLeft;
                this.element.style.left = `${left}px`;
                this.element.style.marginLeft = `${marginLeft}px`;
                break;
            case 'left':
            case 'right':
                top += 8 - top - marginTop;
                this.gapBridgeElement.style.height = `${Math.max(tipRect.height, elemRect.height)}px`;
                this.gapBridgeElement.style.width = '17px';
                this.gapBridgeElement.style.top = `${Math.min(elemRect.top, top + marginTop) - top - marginTop}px`;
                if (top + marginTop < 8)
                    top += 8 - top - marginTop;
                this.element.style.top = `${top}px`;
                this.element.style.marginTop = `${marginTop}px`;
                break;
        }
        switch (this.position) {
            case 'top':
                this.element.style.top = `${elemRect.top - tipRect.height - 16}px`;
                this.gapBridgeElement.style.top = `${16 + tipRect.height}px`;
                break;
            case 'bottom':
                this.element.style.top = `${elemRect.top + elemRect.height + 16}px`;
                this.gapBridgeElement.style.top = `-16px`;
                break;
            case 'left':
                this.element.style.left = `${elemRect.left - tipRect.width - 16}px`;
                this.gapBridgeElement.style.left = `${16 + tipRect.width}px`;
                break;
            case 'right':
                this.element.style.left = `${elemRect.left + elemRect.width + 16}px`;
                this.gapBridgeElement.style.left = `-16px`;
        }
        this.element.style.transform = '';
        this.element.style.transition = '';
    }
}
componentsToRegister.push(BCDTooltip);
export class bcdDynamicTextArea_base {
    element;
    constructor(element) {
        registerUpgrade(element, this, null, false, true);
        this.element = element;
        this.adjust();
        const boundAdjust = this.adjust.bind(this);
        registerForEvents(this.element, { change: boundAdjust });
        const resizeObserver = new ResizeObserver(boundAdjust);
        resizeObserver.observe(this.element);
        requestAnimationFrame(boundAdjust);
    }
}
export class bcdDynamicTextAreaHeight extends bcdDynamicTextArea_base {
    static asString = 'BCD - Dynamic TextArea - Height';
    static cssClass = 'js-dynamic-textarea-height';
    constructor(element) {
        super(element);
    }
    adjust() {
        this.element.style.height = '';
        getComputedStyle(this.element).height;
        const paddingPX = parseInt(this.element.getAttribute('paddingPX') ?? '0');
        if (isNaN(paddingPX)) {
            console.warn('The paddingPX attribute of the dynamic text area is not a number:', this);
        }
        this.element.style.height = `${this.element.scrollHeight + paddingPX}px`;
    }
}
componentsToRegister.push(bcdDynamicTextAreaHeight);
export class bcdDynamicTextAreaWidth extends bcdDynamicTextArea_base {
    static asString = 'BCD - Dynamic TextArea - Width';
    static cssClass = 'js-dynamic-textarea-width';
    constructor(element) {
        super(element);
        new ResizeObserver(this.adjust.bind(this)).observe(this.element);
    }
    adjust() {
        this.element.style.width = '';
        getComputedStyle(this.element).width;
        const paddingPX = parseInt(this.element.getAttribute('paddingPX') ?? '0');
        if (isNaN(paddingPX)) {
            console.warn('The paddingPX attribute of the dynamic text area is not a number:', this);
        }
        this.element.style.width = `min(${this.element.scrollWidth + paddingPX}px, 100cqmin)`;
    }
}
componentsToRegister.push(bcdDynamicTextAreaWidth);
class RelativeFilePicker {
    static asString = 'BCD - Relative File Picker';
    static cssClass = 'js-relative-file-picker';
    element;
    button;
    relativeTo;
    get directory() {
        if (!this.relativeTo)
            return undefined;
        if ('handle' in this.relativeTo)
            return this.relativeTo;
        if ('directory' in this.relativeTo)
            return this.relativeTo.directory;
        return SettingsGrid.getSetting(this.relativeTo, 'directory');
    }
    constructor(element, relativeTo) {
        this.element = element;
        this.relativeTo = relativeTo;
        if (!relativeTo) {
            const relativeToAttr = element.getAttribute('relative-to');
            if (!relativeToAttr)
                throw new Error('The relative file picker must have a relative-to attribute or have a folder specified at creation.');
            this.relativeTo = relativeToAttr.split('.');
        }
        registerUpgrade(element, this, null, false, true);
        registerForEvents(this.element, { change: this.boundOnChange });
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--fab', 'mdl-js-ripple-effect', 'js-relative-file-picker--button');
        const icon = document.createElement('i');
        icon.classList.add('material-icons');
        icon.textContent = 'edit_document';
        this.button.appendChild(icon);
        this.element.after(this.button);
        registerForEvents(this.button, { activate: this.boundOnButtonClick });
    }
    onChange() {
    }
    boundOnChange = this.onChange.bind(this);
    async onButtonClick() {
        const fs = await import('./filesystem-interface.js');
        const relativeTo = this.relativeTo instanceof fs.BellFolder ? this.relativeTo : this.directory;
        if (!relativeTo)
            return console.warn('The relative file picker has no relative-to folder specified', this);
        let fileHandle;
        try {
            [fileHandle] = await relativeTo.openFilePicker();
        }
        catch (e) {
            if (e && e instanceof DOMException && e.name === 'AbortError')
                return;
            console.warn('The file picker threw some sort of error', e);
            return;
        }
        if (!fileHandle)
            return console.warn('The file picker returned no file', this);
        const nameArr = await this.directory?.resolveChildPath(fileHandle, true);
        if (!nameArr)
            return console.debug('The file picker returned a file that is not in the specified directory', fileHandle, this.directory);
        this.element.value = nameArr.join('/');
        this.element.dispatchEvent(new Event('change'));
    }
    boundOnButtonClick = this.onButtonClick.bind(this);
}
componentsToRegister.push(RelativeFilePicker);
class RelativeImagePicker extends RelativeFilePicker {
    static asString = 'BCD - Relative Image Picker';
    static cssClass = 'js-relative-image-picker';
    imageElem;
    noImageElem;
    relation;
    static noImageDoc;
    constructor(element, relativeTo) {
        super(element, relativeTo);
        this.relation = element.getAttribute('relation') ?? 'previous';
        switch (this.relation) {
            case 'previous':
                this.imageElem = element.parentElement.previousElementSibling;
                break;
            case 'next':
                this.imageElem = element.parentElement.nextElementSibling;
                break;
            case 'parent':
                this.imageElem = element.parentElement;
                break;
            case 'selector': {
                const selector = element.getAttribute('selector');
                if (!selector)
                    throw new Error('The relative image picker must have a selector attribute if the relation is set to selector.');
                this.imageElem = element.parentElement.querySelector(selector)
                    || document.querySelector(selector);
                break;
            }
            default:
                throw new Error('The relative image picker must have a relation attribute that is either previous, next, parent, or selector.');
        }
        this.createNoImageElem();
        registerUpgrade(element, this, this.imageElem, true, true);
    }
    async createNoImageElem() {
        RelativeImagePicker.noImageDoc ??= fetch('https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/image/default/48px.svg').then(r => r.text());
        let svg = undefined;
        if (RelativeImagePicker.noImageDoc instanceof Promise) {
            const str = await RelativeImagePicker.noImageDoc;
            RelativeImagePicker.noImageDoc = new DOMParser().parseFromString(str, 'text/html');
            svg = RelativeImagePicker.noImageDoc.querySelector('svg');
            if (!svg.hasAttribute('viewBox'))
                svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('width') || '0'} ${svg.getAttribute('height') || '0'}`);
            svg.removeAttribute('width');
            svg.removeAttribute('height');
        }
        svg ??= RelativeImagePicker.noImageDoc.querySelector('svg');
        if (!svg)
            throw new Error('Could not find the SVG element in the SVG document.');
        this.noImageElem = svg.cloneNode(true);
        this.noImageElem.classList.add('js-relative-image-picker--no-image');
        this.imageElem?.before(this.noImageElem);
        this.imageElem?.src ? this.showImage() : this.hideImage();
    }
    hideImage() {
        if (this.imageElem) {
            this.imageElem.style.display = 'none';
            this.imageElem.ariaDisabled = 'true';
            this.imageElem.ariaHidden = 'true';
        }
        if (this.noImageElem) {
            this.noImageElem.style.display = 'block';
            this.noImageElem.ariaDisabled = 'false';
            this.noImageElem.ariaHidden = 'false';
        }
    }
    showImage() {
        if (this.imageElem) {
            this.imageElem.style.display = 'block';
            this.imageElem.ariaDisabled = 'false';
            this.imageElem.ariaHidden = 'false';
        }
        if (this.noImageElem) {
            this.noImageElem.style.display = 'none';
            this.noImageElem.ariaDisabled = 'true';
            this.noImageElem.ariaHidden = 'true';
        }
    }
    lastValue = '';
    async onChange() {
        if (this.lastValue === this.element.value)
            return;
        this.lastValue = this.element.value;
        super.onChange();
        const dir = this.directory;
        if (!this.imageElem)
            return console.info('The relative image picker does not have an image element to update.', this);
        if (!dir) {
            this.hideImage();
            return console.info('The relative image picker does not have a directory to update the image from.', this, dir);
        }
        try {
            const fileHandle_ = dir.getFile(this.element.value);
            const [fileHandle, fs] = await Promise.all([fileHandle_, loadFS()]);
            if (!fileHandle || fileHandle instanceof fs.InvalidNameError) {
                this.hideImage();
                return console.info('The relative image picker does not have a file handle to update the image with.', this);
            }
            this.imageElem.src = await fileHandle.at(-1).readAsDataURL();
            this.showImage();
        }
        catch {
            this.hideImage();
        }
    }
}
componentsToRegister.push(RelativeImagePicker);
class DOMSvg {
    static asString = 'BCD - DOM SVG';
    static cssClass = 'js-dom-svg';
    svgSrc;
    element;
    constructor(element) {
        const src = element.getAttribute('src');
        if (!src)
            throw new Error('The DOM SVG must have a src attribute.');
        this.svgSrc = src;
        this.element = element;
        this.initSvg();
    }
    async initSvg() {
        try {
            const svgRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(this.svgSrc)}`, {
                cache: 'force-cache',
            });
            if (!svgRes.ok) {
                this.element.classList.add('js-dom-svg--error', 'js-dom-svg--loaded');
                return this.element.innerHTML = `<p>Could not load the image!</p><br><code>${svgRes.status}: ${svgRes.statusText || (svgRes.status == 408 ? 'Fetching the graphic took too long!' : '')}</code>`;
            }
            const svgTxt = await svgRes.text();
            const svgDoc = window.domParser.parseFromString(svgTxt, 'image/svg+xml');
            const svg = svgDoc.querySelector('svg');
            if (!svg)
                throw new Error('Could not find the SVG element in the SVG document.');
            this.element.appendChild(svg);
            this.element.classList.add('js-dom-svg--loaded');
        }
        catch (e) {
            if (!(e instanceof Error))
                throw e;
            console.warn('Could not load the SVG image.', e);
            this.element.classList.add('js-dom-svg--error', 'js-dom-svg--loaded');
            return this.element.innerHTML = `<p>Could not load the image!</p><br>JavaScript Error: <code>${e.message}</code>`;
        }
    }
}
componentsToRegister.push(DOMSvg);
const settingsToUpdate = [];
export function updateSettings() {
    for (let i = 0; i < settingsToUpdate.length; i++)
        settingsToUpdate[i]();
}
export class SettingsGrid {
    static asString = 'BCD - Settings Grid';
    static cssClass = 'js-settings-grid';
    element;
    settingTemplate;
    settingsPath;
    settings;
    constructor(element) {
        this.element = element;
        registerUpgrade(element, this, null, false, true);
        this.settings = JSON.parse(element.textContent ?? '');
        element.textContent = '';
        const settingsElemID = element.getAttribute("data-templateID");
        if (!settingsElemID)
            throw new Error("Settings Grid is missing the data-templateID attribute!");
        const settingTemplate = document.getElementById(settingsElemID);
        if (!settingTemplate || !(settingTemplate instanceof HTMLTemplateElement))
            throw new Error(`Settings Grid cannot find a TEMPLATE element with the ID "${settingsElemID}"!`);
        this.settingTemplate = settingTemplate.content;
        this.settingsPath = element.getAttribute("data-settingsPath")?.split('.') ?? [];
        for (const [key, settings] of Object.entries(this.settings))
            this.createSetting(key, settings);
        this.element.hidden = false;
    }
    createSetting(key, settings) {
        const children = this.settingTemplate.children;
        if (!children[0])
            throw new Error("Settings Grid template is missing a root element!");
        for (const child of children) {
            const clone = child.cloneNode(true);
            this.element.appendChild(clone);
            this.upgradeElement(clone, key, settings);
            if (clone.parentElement && settings.tooltip)
                this.createTooltip(clone, settings.tooltip);
        }
    }
    createTooltip(element, tooltip) {
        const elem = document.createElement('div');
        elem.classList.add('js-bcd-tooltip');
        elem.setAttribute('tooltip-relation', 'proceeding');
        elem.setAttribute('tooltip-position', typeof tooltip === 'object' ? tooltip.position : 'bottom');
        elem.appendChild(document.createElement('p')).innerHTML = typeof tooltip === 'object' ? tooltip.text : tooltip;
        element.insertAdjacentElement('afterend', elem);
        mdl.componentHandler.upgradeElement(elem);
    }
    upgradeElement(element, key, settings) {
        if (!(element && 'getAttribute' in element))
            return;
        const filterType = element.getAttribute('data-setting-filter');
        if (filterType && filterType !== settings.type)
            return element.remove();
        for (const child of element.children)
            this.upgradeElement(child, key, settings);
        const displayType = element.getAttribute('data-setting-display');
        if (!displayType)
            return;
        switch (displayType) {
            case ('id'):
                element.id = `setting--${key}`;
                break;
            case ('label'):
                element.innerHTML = settings.name;
                break;
            case ('checkbox'):
                if (element instanceof HTMLInputElement)
                    element.checked = !!this.getSetting(key, true);
                else
                    throw new Error("Settings Grid template has a checkbox that is not an INPUT element!");
                registerForEvents(element, { change: (() => this.setSetting(key, element.checked)).bind(this) });
                settingsToUpdate.push(() => {
                    if (element.checked !== !!this.getSetting(key))
                        element.click();
                });
                break;
            case ('dropdown'):
                element.classList.add(BCDSettingsDropdown.cssClass);
                element.setAttribute('data-options', JSON.stringify(settings.options));
                element.setAttribute('data-settings-path', JSON.stringify(this.settingsPath));
                element.setAttribute('data-setting', key);
                break;
            default:
                console.warn(`A Settings Grid element has an unknown display type: ${displayType}`, element);
        }
        mdl.componentHandler.upgradeElement(element);
    }
    getSetting(key, suppressError = false) { return SettingsGrid.getSetting(this.settingsPath, key, suppressError); }
    static getSetting(settingsPath, key, suppressError = false) {
        try {
            let currentDir = window;
            for (const dir of settingsPath)
                currentDir = currentDir?.[dir];
            if (currentDir === undefined)
                throw new Error(`Settings Grid cannot find the settings path "${settingsPath.join('.')}"!`);
            return currentDir[key];
        }
        catch (e) {
            if (!suppressError)
                console.error(e);
            return undefined;
        }
    }
    setSetting(key, value, suppressError = false) { SettingsGrid.setSetting(this.settingsPath, key, value, suppressError); }
    static setSetting(settingsPath, key, value, suppressError = false) {
        try {
            let currentDir = window;
            for (const dir of settingsPath)
                currentDir = currentDir?.[dir];
            if (currentDir === undefined)
                throw new Error(`Settings Grid cannot find the settings path "${settingsPath.join('.')}"!`);
            return currentDir[key] = value;
        }
        catch (e) {
            if (!suppressError)
                console.error(e);
            return undefined;
        }
    }
}
componentsToRegister.push(SettingsGrid);
let tempKeyMap = {};
export class BCDSettingsDropdown extends BCDDropdown {
    static asString = 'BCD Settings Dropdown';
    static cssClass = 'js-bcd-settings-dropdown';
    settingsPath = JSON.parse(this.element_.getAttribute('data-settings-path') ?? '[]');
    settingKey = this.element_.getAttribute('data-setting') ?? '';
    keyMap;
    constructor(element) {
        super(element, element.previousElementSibling);
        this.keyMap = tempKeyMap;
        settingsToUpdate.push(() => {
            this.selectByString(SettingsGrid.getSetting(this.settingsPath, this.settingKey) ?? '');
        });
    }
    selectByString(option) {
        super.selectByString(this.keyMap[option] ?? option);
    }
    options() {
        const options = {};
        Object.entries(JSON.parse(this.element_.getAttribute('data-options') ?? '[]')).forEach(([literalName, prettyName]) => {
            options[prettyName.toString()] = () => {
                SettingsGrid.setSetting(this.settingsPath, this.settingKey, literalName);
            };
            this.keyMap ??= {};
            this.keyMap[literalName] = prettyName;
        });
        tempKeyMap = this.keyMap;
        return options;
    }
}
componentsToRegister.push(BCDSettingsDropdown);
window.BCDSettingsDropdown = BCDSettingsDropdown;
export function bcd_universalJS_init() {
    afterDelay(10, () => registerBCDComponents());
    for (const link of [...document.links]) {
        if (window.layout.drawer_?.contains(link))
            link.rel += " noopener";
        else
            link.rel += " noopener noreferrer";
    }
    const randomTextField = document.getElementById("randomized-text-field");
    if (!randomTextField)
        throw new Error("No random text field found!");
    const quote = quotes.getRandomQuote();
    randomTextField.innerHTML = typeof quote === "string" ? quote : quote[1];
    afterDelay(100, () => {
        const lazyStyles = JSON.parse(`[${document.getElementById('lazy-styles')?.textContent ?? ''}]`);
        for (const style of lazyStyles) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style;
            document.head.appendChild(link);
        }
        document.documentElement.classList.remove('lazy-styles-not-loaded');
        window.lazyStylesLoaded = true;
    });
    afterDelay(150, () => {
        const elementsWithClickEvt = document.querySelectorAll('[onclick]');
        for (const element of elementsWithClickEvt) {
            const funct = element.onclick;
            if (!funct)
                continue;
            registerForEvents(element, { activate: funct });
            element.onclick = null;
            element.removeAttribute('onclick');
        }
        const buttons = document.querySelectorAll('button');
        function blurElem() { this.blur(); }
        for (const button of buttons) {
            button.addEventListener('mouseup', blurElem);
            button.addEventListener('touchend', blurElem);
        }
    });
    afterDelay(200, () => {
        const headers = document.querySelectorAll(':is(nav, main) :is(h1, h2, h3, h4, h5, h6)');
        for (const header of headers) {
            if (header.id)
                continue;
            header.id = header.textContent?.trim().replace(/['"+=?!@#$%^*]+/gi, '').replace(/&+/gi, 'and').replace(/[^a-z0-9]+/gi, '-').toLowerCase() ?? '';
        }
        const navHeaders = document.querySelectorAll('nav :is(h1, h2, h3, h4, h5, h6)');
        for (const header of navHeaders) {
            if (header.id)
                header.id = `nav-${header.id}`;
        }
        if (window.location.hash.startsWith('#')) {
            if (window.location.hash === '#')
                window.scrollTo(0, 0);
            else {
                const elem = document.getElementById(window.location.hash.substring(1));
                if (elem)
                    elem.scrollIntoView({ behavior: 'smooth' });
                else
                    console.info(`No element with ID "${window.location.hash.substring(1)}" found!`);
            }
        }
    });
    const drawer = document.querySelector('.mdl-layout__drawer');
    drawer.addEventListener('drawerOpen', drawerOpenHandler);
    drawer.addEventListener('drawerClose', drawerCloseHandler);
    if (drawer.classList.contains('is-visible'))
        drawerOpenHandler.call(drawer);
    else
        drawerCloseHandler.call(drawer);
}
window.bcd_init_functions.universal = bcd_universalJS_init;
function drawerOpenHandler() {
    this.removeAttribute('aria-hidden');
    BCD_CollapsibleParent.setDisabled(this, false);
}
function drawerCloseHandler() {
    this.setAttribute('aria-hidden', 'true');
    BCD_CollapsibleParent.setDisabled(this, true);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pdmVyc2FsLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9CZWxsQ3ViZURldi9zaXRlLXRlc3RpbmcvZGVwbG95bWVudC8iLCJzb3VyY2VzIjpbInVuaXZlcnNhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssR0FBRyxNQUFNLCtCQUErQixDQUFDO0FBQ3JELE9BQU8sS0FBSyxNQUFNLE1BQU0sdUJBQXVCLENBQUM7QUFHaEQsU0FBUyxNQUFNO0lBQ1gsT0FBTyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBOEVELE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUtuQyxNQUFNLFVBQVUsVUFBVSxDQUFnRCxPQUFlLEVBQUUsUUFBMEIsRUFBRSxHQUFHLElBQTJCO0lBRWpKLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBR0QsTUFBTSxVQUFVLElBQUksQ0FBQyxPQUFlO0lBQ2hDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELE1BQU0sT0FBZ0IsZUFBZTtJQUNqQyxNQUFNO1FBQ0YsSUFBSSxJQUFJLENBQUMsZUFBZTtZQUFFLE9BQU87UUFDakMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDakMsQ0FBQztJQUNRLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxPQUFPLEtBQUks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QUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsR0FBRyxTQUFTLElBQUksQ0FBQztnQkFFcEQsTUFBTTtTQUNUO1FBSUQsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBRW5CLEtBQUssS0FBSztnQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFJLEdBQUcsRUFBRSxHQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDL0UsTUFBTTtZQUVOLEtBQUssUUFBUTtnQkFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFJLE9BQU8sQ0FBQztnQkFFM0QsTUFBTTtZQUVOLEtBQUssTUFBTTtnQkFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFFN0UsTUFBTTtZQUVOLEtBQUssT0FBTztnQkFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztTQUU5RDtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN2QyxDQUFDOztBQUdMLG9CQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQStCdEMsTUFBTSxPQUFnQix1QkFBdUI7SUFDekMsT0FBTyxDQUFjO0lBRXJCLFlBQVksT0FBb0I7UUFDNUIsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFZCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFFdkQsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkQsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFHckMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUlKO0FBRUQsTUFBTSxPQUFPLHdCQUF5QixTQUFRLHVCQUF1QjtJQUNqRSxNQUFNLENBQVUsUUFBUSxHQUFHLGlDQUFpQyxDQUFDO0lBQzdELE1BQU0sQ0FBVSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7SUFFeEQsWUFBWSxPQUFvQjtRQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVRLE1BQU07UUFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQy9CLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFFdEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzFFLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUVBQW1FLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDM0Y7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxTQUFTLElBQUksQ0FBQztJQUM3RSxDQUFDOztBQUdMLG9CQUFvQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXBELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSx1QkFBdUI7SUFDaEUsTUFBTSxDQUFVLFFBQVEsR0FBRyxnQ0FBZ0MsQ0FBQztJQUM1RCxNQUFNLENBQVUsUUFBUSxHQUFHLDJCQUEyQixDQUFDO0lBRXZELFlBQVksT0FBb0I7UUFDNUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFUSxNQUFNO1FBQ1gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUM5QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRXJDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUMxRSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLG1FQUFtRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNGO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsU0FBUyxlQUFlLENBQUM7SUFDMUYsQ0FBQzs7QUFHTCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQTZCbkQsTUFBTSxrQkFBa0I7SUFDcEIsTUFBTSxDQUFDLFFBQVEsR0FBRyw0QkFBNEIsQ0FBQztJQUMvQyxNQUFNLENBQUMsUUFBUSxHQUFHLHlCQUF5QixDQUFDO0lBRTVDLE9BQU8sQ0FBbUI7SUFDMUIsTUFBTSxDQUFvQjtJQUUxQixVQUFVLENBQXFEO0lBQy9ELElBQUksU0FBUztRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU8sU0FBUyxDQUFDO1FBQ3ZDLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hELElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUNyRSxPQUFPLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsWUFBWSxPQUF5QixFQUFFLFVBQXFEO1FBQ3hGLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRTdCLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxjQUFjO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0dBQW9HLENBQUMsQ0FBQztZQUUzSSxJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDL0M7UUFFRCxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxELGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBQyxDQUFDLENBQUM7UUFTOUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQ1YsWUFBWSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsRUFDeEUsaUNBQWlDLENBQy9DLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUM7UUFFbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsUUFBUTtJQUVSLENBQUM7SUFDUSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEQsS0FBSyxDQUFDLGFBQWE7UUFDZixNQUFNLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRXJELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMvRixJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyw4REFBOEQsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUzRyxJQUFJLFVBQWlDLENBQUM7UUFDdEMsSUFBSTtZQUNBLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDcEQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZO2dCQUFFLE9BQU87WUFDdEUsT0FBTyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1RCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUvRSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLHdFQUF3RSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFekksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDUSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUE2QjlDLE1BQU0sbUJBQW9CLFNBQVEsa0JBQWtCO0lBQ2hELE1BQU0sQ0FBbUIsUUFBUSxHQUFHLDZCQUE2QixDQUFDO0lBQ2xFLE1BQU0sQ0FBbUIsUUFBUSxHQUFHLDBCQUEwQixDQUFDO0lBRS9ELFNBQVMsQ0FBb0I7SUFDN0IsV0FBVyxDQUFpQjtJQUM1QixRQUFRLENBQXdDO0lBRWhELE1BQU0sQ0FBQyxVQUFVLENBQThCO0lBRS9DLFlBQVksT0FBeUIsRUFBRSxVQUFxRDtRQUN4RixLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQTBDLElBQUksVUFBVSxDQUFDO1FBRXhHLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUVuQixLQUFLLFVBQVU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYyxDQUFDLHNCQUEwQyxDQUFDO2dCQUNuRixNQUFNO1lBRVYsS0FBSyxNQUFNO2dCQUNQLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWMsQ0FBQyxrQkFBc0MsQ0FBQztnQkFDL0UsTUFBTTtZQUVWLEtBQUssUUFBUTtnQkFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFpQyxDQUFDO2dCQUMzRCxNQUFNO1lBRVYsS0FBSyxVQUFVLENBQUMsQ0FBQztnQkFDYixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsUUFBUTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhGQUE4RixDQUFDLENBQUM7Z0JBRS9ILElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFxQjt1QkFDcEQsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQXFCLENBQUM7Z0JBQ3BGLE1BQU07YUFDVDtZQUVEO2dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsOEdBQThHLENBQUMsQ0FBQztTQUN2STtRQUVELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxLQUFLLENBQUMsaUJBQWlCO1FBRW5CLG1CQUFtQixDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsZ0dBQWdHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUUvSixJQUFJLEdBQUcsR0FBNEIsU0FBUyxDQUFDO1FBRTdDLElBQUksbUJBQW1CLENBQUMsVUFBVSxZQUFZLE9BQU8sRUFBRTtZQUNuRCxNQUFNLEdBQUcsR0FBRyxNQUFNLG1CQUFtQixDQUFDLFVBQVUsQ0FBQztZQUNqRCxtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25GLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBa0IsQ0FBQztZQUUzRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7Z0JBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDOUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0Q7UUFFRCxHQUFHLEtBQUssbUJBQW1CLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQWtCLENBQUM7UUFDN0UsSUFBSSxDQUFDLEdBQUc7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7UUFFakYsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBa0IsQ0FBQztRQUN4RCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUVyRSxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlELENBQUM7SUFFRCxTQUFTO1FBQ0wsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztTQUN0QztRQUNELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7U0FDekM7SUFDTCxDQUFDO0lBRUQsU0FBUztRQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztZQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7U0FDdkM7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7WUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUVELFNBQVMsR0FBVyxFQUFFLENBQUM7SUFDZCxLQUFLLENBQUMsUUFBUTtRQUNuQixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUNsRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBRXBDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUNmLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxxRUFBcUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVyRyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2pCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQywrRUFBK0UsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDbkg7UUFFRCxJQUFJO1lBQ0EsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVwRSxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsWUFBWSxFQUFFLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGlGQUFpRixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ2hIO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsTUFBTyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQy9FLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNwQjtRQUFDLE1BQU07WUFDSixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDcEI7SUFDTCxDQUFDOztBQUVMLG9CQUFvQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBa0IvQyxNQUFNLE1BQU07SUFDUixNQUFNLENBQVUsUUFBUSxHQUFHLGVBQWUsQ0FBQztJQUMzQyxNQUFNLENBQVUsUUFBUSxHQUFHLFlBQVksQ0FBQztJQUV4QyxNQUFNLENBQVM7SUFDZixPQUFPLENBQWM7SUFFckIsWUFBWSxPQUFvQjtRQUM1QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBRXBFLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDVCxJQUFJO1lBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsc0NBQXNDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO2dCQUNoRyxLQUFLLEVBQUUsYUFBYTthQUN2QixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtnQkFDWixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyw2Q0FBNkMsTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDO2FBQ3BNO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRXpFLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFrQixDQUFDO1lBQ3pELElBQUksQ0FBQyxHQUFHO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztZQUVqRixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUNwRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsSUFBSyxDQUFFLENBQUMsQ0FBQyxZQUFZLEtBQUssQ0FBQztnQkFBRyxNQUFNLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsK0RBQStELENBQUMsQ0FBQyxPQUFPLFNBQVMsQ0FBQztTQUNySDtJQUNMLENBQUM7O0FBRUwsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBMEJsQyxNQUFNLGdCQUFnQixHQUFzQixFQUFFLENBQUM7QUFDL0MsTUFBTSxVQUFVLGNBQWM7SUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7UUFDNUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFFLEVBQUUsQ0FBQztBQUMvQixDQUFDO0FBR0QsTUFBTSxPQUFPLFlBQVk7SUFDckIsTUFBTSxDQUFVLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQztJQUNqRCxNQUFNLENBQVUsUUFBUSxHQUFHLGtCQUFrQixDQUFDO0lBRTlDLE9BQU8sQ0FBYztJQUNyQixlQUFlLENBQW1CO0lBQ2xDLFlBQVksQ0FBVztJQUN2QixRQUFRLENBQWU7SUFDdkIsWUFBWSxPQUFvQjtRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBaUIsQ0FBQztRQUN0RSxPQUFPLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUV6QixNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLGNBQWM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7UUFFaEcsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQyxlQUFlLFlBQVksbUJBQW1CLENBQUM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxjQUFjLElBQUksQ0FBQyxDQUFDO1FBRTVLLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQztRQUUvQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWhGLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxhQUFhLENBQUMsR0FBVyxFQUFFLFFBQXlCO1FBQ2hELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1FBR3ZGLEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO1lBQzFCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFnQixDQUFDO1lBRW5ELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUcxQyxJQUFJLEtBQUssQ0FBQyxhQUFhLElBQUksUUFBUSxDQUFDLE9BQU87Z0JBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVGO0lBQ0wsQ0FBQztJQUVELGFBQWEsQ0FBQyxPQUFvQixFQUFFLE9BQWdEO1FBSWhGLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFL0csT0FBTyxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxjQUFjLENBQUMsT0FBZ0IsRUFBRSxHQUFXLEVBQUUsUUFBeUI7UUFDbkUsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLGNBQWMsSUFBSSxPQUFPLENBQUM7WUFBRSxPQUFRO1FBRXJELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUcvRCxJQUFJLFVBQVUsSUFBSSxVQUFVLEtBQUssUUFBUSxDQUFDLElBQUk7WUFBRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV4RSxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sQ0FBQyxRQUFRO1lBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWhGLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsV0FBVztZQUFFLE9BQVE7UUFFMUIsUUFBTyxXQUFXLEVBQUU7WUFDaEIsS0FBSSxDQUFDLElBQUksQ0FBQztnQkFDTixPQUFPLENBQUMsRUFBRSxHQUFHLFlBQVksR0FBRyxFQUFFLENBQUM7Z0JBQy9CLE1BQU07WUFFVixLQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNULE9BQU8sQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDbEMsTUFBTTtZQUVWLEtBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ1osSUFBSSxPQUFPLFlBQVksZ0JBQWdCO29CQUFFLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDOztvQkFDbkYsTUFBTSxJQUFJLEtBQUssQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO2dCQUU1RixpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO2dCQUMvRixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUN2QixJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO3dCQUMxQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU07WUFFVixLQUFJLENBQUMsVUFBVSxDQUFDO2dCQUNaLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN2RSxPQUFPLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLE9BQU8sQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNO1lBRVY7Z0JBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyx3REFBd0QsV0FBVyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDcEc7UUFHRCxHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWpELENBQUM7SUFFRCxVQUFVLENBQTRDLEdBQWtCLEVBQUUsYUFBYSxHQUFHLEtBQUssSUFBNEIsT0FBTyxZQUFZLENBQUMsVUFBVSxDQUFlLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqTixNQUFNLENBQUMsVUFBVSxDQUE0QyxZQUFzQixFQUFFLEdBQWtCLEVBQUUsYUFBYSxHQUFHLEtBQUs7UUFDMUgsSUFBSTtZQUNBLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQztZQUN4QixLQUFLLE1BQU0sR0FBRyxJQUFJLFlBQVk7Z0JBQzFCLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVuQyxJQUFJLFVBQVUsS0FBSyxTQUFTO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRzFILE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixJQUFJLENBQUMsYUFBYTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztJQUVELFVBQVUsQ0FBQyxHQUFrQixFQUFFLEtBQTBDLEVBQUUsYUFBYSxHQUFHLEtBQUssSUFBVSxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEwsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFzQixFQUFFLEdBQWtCLEVBQUUsS0FBMEMsRUFBRSxhQUFhLEdBQUcsS0FBSztRQUMzSCxJQUFJO1lBQ0EsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDO1lBQ3hCLEtBQUssTUFBTSxHQUFHLElBQUksWUFBWTtnQkFDMUIsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRW5DLElBQUksVUFBVSxLQUFLLFNBQVM7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFHMUgsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixJQUFJLENBQUMsYUFBYTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQzs7QUFFTCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFHeEMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxXQUFXO0lBQ2hELE1BQU0sQ0FBVSxRQUFRLEdBQUcsdUJBQXVCLENBQUM7SUFDbkQsTUFBTSxDQUFVLFFBQVEsR0FBRywwQkFBMEIsQ0FBQztJQUV0RCxZQUFZLEdBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQzdGLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDOUQsTUFBTSxDQUF5QjtJQUUvQixZQUFZLE9BQW9CO1FBRTVCLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7UUFHekIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVEsY0FBYyxDQUFDLE1BQWM7UUFFbEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFUSxPQUFPO1FBQ1osTUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUU7WUFDekgsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRTtnQkFDbEMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDN0UsQ0FBQyxDQUFDO1lBR0gsSUFBSSxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxVQUFVLENBQUM7UUFFMUMsQ0FBQyxDQUFDLENBQUM7UUFDSCxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUV6QixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDOztBQUVMLG9CQUFvQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztBQStCakQsTUFBTSxVQUFVLG9CQUFvQjtJQUtoQyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUUsRUFBRSxDQUFFLHFCQUFxQixFQUFFLENBQUUsQ0FBQztJQU0vQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUM7UUFDbkMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUM7O1lBQzlELElBQUksQ0FBQyxHQUFHLElBQUksc0JBQXNCLENBQUM7S0FDM0M7SUFNRCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDekUsSUFBSSxDQUFDLGVBQWU7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFFckUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3RDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQztJQUsxRSxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUNqQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLElBQUksRUFBRSxHQUFHLENBQWEsQ0FBQztRQUU1RyxLQUFLLE1BQU0sS0FBSyxJQUFJLFVBQVUsRUFBRTtZQUM1QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25DO1FBRUQsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDcEUsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDLENBQUMsQ0FBQztJQXdCSCxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUNqQixNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQTRCLENBQUM7UUFDL0YsS0FBSyxNQUFNLE9BQU8sSUFBSSxvQkFBb0IsRUFBRTtZQUN4QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBOEMsQ0FBQztZQUNyRSxJQUFJLENBQUMsS0FBSztnQkFBRSxTQUFTO1lBRXJCLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBRTlDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEM7UUFFRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsU0FBUyxRQUFRLEtBQXNCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDMUIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFLSCxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUNqQixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUN4RixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUMxQixJQUFJLE1BQU0sQ0FBQyxFQUFFO2dCQUFFLFNBQVM7WUFDeEIsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ25KO1FBRUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDaEYsS0FBSyxNQUFNLE1BQU0sSUFBSSxVQUFVLEVBQUU7WUFBRSxJQUFJLE1BQU0sQ0FBQyxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUcsT0FBTyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7U0FBRTtRQUduRixJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUN2QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLEdBQUc7Z0JBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ25EO2dCQUNELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXhFLElBQUksSUFBSTtvQkFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7O29CQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3pGO1NBQ0o7SUFFTCxDQUFDLENBQUMsQ0FBQztJQU1ILE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQW1CLENBQUM7SUFFL0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUUzRCxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztRQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7UUFDdkUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXpDLENBQUM7QUFDRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDO0FBRzNELFNBQVMsaUJBQWlCO0lBQ3RCLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEMscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsU0FBUyxrQkFBa0I7SUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekMscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbWRsIGZyb20gJy4vYXNzZXRzL3NpdGUvbWRsL21hdGVyaWFsLmpzJztcbmltcG9ydCAqIGFzIHF1b3RlcyBmcm9tICcuL3VuaXZlcnNhbF9xdW90ZXMuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBmcyBmcm9tICcuL2ZpbGVzeXN0ZW0taW50ZXJmYWNlLmpzJztcblxuZnVuY3Rpb24gbG9hZEZTKCkge1xuICAgIHJldHVybiBpbXBvcnQoJy4vZmlsZXN5c3RlbS1pbnRlcmZhY2UuanMnKTtcbn1cblxuLypcbiAgICBUaGFua3MgdG8gUGF0cmljayBHaWxsZXNwaWUgZm9yIHRoZSBncmVhdCBBU0NJSSBhcnQgZ2VuZXJhdG9yIVxuICAgIGh0dHBzOi8vcGF0b3Jqay5jb20vc29mdHdhcmUvdGFhZy8jcD1kaXNwbGF5Jmg9MCZ2PTAmZj1CaWclMjBNb25leS1ud1xuICAgIC4uLm1ha2VzIHRoaXMgY29kZSAqc28qIG11Y2ggZWFzaWVyIHRvIG1haW50YWluLi4uIHlvdSBrbm93LCAnY3V6IEkgY2FuIGZpbmQgbXkgZnVuY3Rpb25zIGluIFZTQ29kZSdzIE1pbmltYXBcblxuXG5cblxuJCRcXCAgICQkXFwgICAkJFxcICAgICAkJFxcICQkXFwgJCRcXCAgICQkXFwgICAgICQkXFxcbiQkIHwgICQkIHwgICQkIHwgICAgXFxfX3wkJCB8XFxfX3wgICQkIHwgICAgXFxfX3xcbiQkIHwgICQkIHwkJCQkJCRcXCAgICQkXFwgJCQgfCQkXFwgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJCRcXFxuJCQgfCAgJCQgfFxcXyQkICBffCAgJCQgfCQkIHwkJCB8XFxfJCQgIF98ICAkJCB8JCQgIF9fJCRcXCAkJCAgX19fX198XG4kJCB8ICAkJCB8ICAkJCB8ICAgICQkIHwkJCB8JCQgfCAgJCQgfCAgICAkJCB8JCQkJCQkJCQgfFxcJCQkJCQkXFxcbiQkIHwgICQkIHwgICQkIHwkJFxcICQkIHwkJCB8JCQgfCAgJCQgfCQkXFwgJCQgfCQkICAgX19fX3wgXFxfX19fJCRcXFxuXFwkJCQkJCQgIHwgIFxcJCQkJCAgfCQkIHwkJCB8JCQgfCAgXFwkJCQkICB8JCQgfFxcJCQkJCQkJFxcICQkJCQkJCQgIHxcbiBcXF9fX19fXy8gICAgXFxfX19fLyBcXF9ffFxcX198XFxfX3wgICBcXF9fX18vIFxcX198IFxcX19fX19fX3xcXF9fX19fXyovXG5cbmludGVyZmFjZSBEb2NBbmRFbGVtZW50SW5qZWN0aW9ucyB7XG4gICAgLyoqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHRhZyBuYW1lIG9yIGNyZWF0ZXMgb25lIGlmIGl0IGRvZXMgbm90IGV4aXN0ICovXG4gICAgZ2V0T3JDcmVhdGVDaGlsZEJ5VGFnPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ05hbWU6IEspOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS107XG4gICAgZ2V0T3JDcmVhdGVDaGlsZEJ5VGFnKHRhZ05hbWU6IHN0cmluZyk6RWxlbWVudDtcblxuICAgIHJlbW92ZUNoaWxkQnlUYWc8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnTmFtZTogSywgY291bnQ/OiBudW1iZXIpOiB2b2lkO1xuICAgIHJlbW92ZUNoaWxkQnlUYWcodGFnTmFtZTogc3RyaW5nLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgRWxlbWVudCBleHRlbmRzIERvY0FuZEVsZW1lbnRJbmplY3Rpb25zIHtcbiAgICAgICAgdXBncmFkZXM/OiBDb21wb25lbnRNYXA7XG4gICAgICAgIHRhcmdldGluZ0NvbXBvbmVudHM/OiBDb21wb25lbnRNYXA7XG4gICAgfVxuICAgIGludGVyZmFjZSBEb2N1bWVudCBleHRlbmRzIERvY0FuZEVsZW1lbnRJbmplY3Rpb25zIHt9XG5cbiAgICBpbnRlcmZhY2UgSFRNTEVsZW1lbnQgZXh0ZW5kcyBEb2NBbmRFbGVtZW50SW5qZWN0aW9ucyB7XG4gICAgICAgIG9uY2xpY2s6IEV2ZW50VHlwZXM8SFRNTEVsZW1lbnQ+WydhY3RpdmF0ZSddfG51bGw7XG4gICAgfVxuXG4gICAgaW50ZXJmYWNlIFNldDxUPiB7XG4gICAgICAgIC8qKiBDaGFuZ2VzIHRoZSBwb3NpdGlvbiBvZiBhbiBpdGVtIGluIHRoZSBzZXQgcmVsYXRpdmUgdG8gYW5vdGhlciBpdGVtXG4gICAgICAgICAqIEByZXR1cm5zIFdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIGNvdWxkIGJlIG1vdmVkXG4gICAgICAgICovXG4gICAgICAgIG1vdmVJdGVtOiB0eXBlb2YgX19fbW92ZUl0ZW07XG5cbiAgICAgICAgLyoqIENoYW5nZXMgdGhlIHBvc2l0aW9uIG9mIGFuIGl0ZW0gaW4gdGhlIHNldCB1c2luZyBhIHByb3ZpZGVkIGluZGV4XG4gICAgICAgICAqIEByZXR1cm5zIFdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIGNvdWxkIGJlIG1vdmVkXG4gICAgICAgICovXG4gICAgICAgIG1vdmVJbmRleDogdHlwZW9mIF9fX21vdmVJbmRleDtcbiAgICB9XG5cbiAgICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICAgICAgZG9tUGFyc2VyOiBET01QYXJzZXI7XG5cbiAgICAgICAgLyoqIFZhcmlhYmxlcyBzZXQgYnkgdGhlIHBhZ2UgKi9cbiAgICAgICAgLy9iY2RQYWdlVmFyczogUGFydGlhbDx7fT5cblxuICAgICAgICAvKiogQnJvd3Nlci1TdXBwb3J0ZWQgQ2xpY2sgRXZlbnQgKi9cbiAgICAgICAgY2xpY2tFdnQ6ICdjbGljayd8J21vdXNlZG93bidcblxuICAgICAgICAvKiogVGhlIE1ETCBsYXlvdXQgZWxlbWVudCAqL1xuICAgICAgICBsYXlvdXQ6IG1kbC5NYXRlcmlhbExheW91dFxuXG4gICAgICAgIC8qKiBBIGxpc3Qgb2YgUXVlcnkgUGFyYW1ldGVycyBmcm9tIHRoZSBVUkkgKi9cbiAgICAgICAgcXVlcnlQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICAgICAgLyoqIEEgbGlzdCBvZiBmdW5jdGlvbnMgdXNlZCB3aGVuIGxvYWRpbmcgc2NyaXB0cyAqL1xuICAgICAgICBiY2RfaW5pdF9mdW5jdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZ1bmN0aW9uPjtcblxuICAgICAgICBjb3B5Q29kZShlbGVtOiBIVE1MRWxlbWVudCk6IHZvaWQ7XG5cbiAgICAgICAgbGF6eVN0eWxlc0xvYWRlZDogdHJ1ZXx1bmRlZmluZWQ7XG5cbiAgICAgICAgQkNEU2V0dGluZ3NEcm9wZG93bjogdHlwZW9mIEJDRFNldHRpbmdzRHJvcGRvd247XG5cbiAgICAgICAgcmVnaXN0ZXJGb3JFdmVudHM6IHR5cGVvZiByZWdpc3RlckZvckV2ZW50cztcbiAgICB9XG59XG53aW5kb3cuZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXG5cblxuLyoqIFJlYXJyYW5nZWQgYW5kIGJldHRlci10eXBlZCBwYXJhbWV0ZXJzIGZvciBgc2V0VGltZW91dGAgKi9cbmV4cG9ydCBmdW5jdGlvbiBhZnRlckRlbGF5PFRDYWxsYmFjayBleHRlbmRzICguLi5hcmdzOiBhbnkpID0+IGFueSA9IGFueT4odGltZW91dDogbnVtYmVyLCBjYWxsYmFjazogVENhbGxiYWNrfHN0cmluZywgLi4uYXJnczogUGFyYW1ldGVyczxUQ2FsbGJhY2s+KTogUmV0dXJuVHlwZTxXaW5kb3dbJ3NldFRpbWVvdXQnXT4ge1xuICAgIC8vIEB0cy1pZ25vcmU6IHRoZSBgUGFyYW1ldGVyc2AgdXRpbGl0eSB0eXBlIHJldHVybnMgYSB0dXBsZSwgd2hpY2ggaW5oZXJlbnRseSBoYXMgYW4gaXRlcmF0b3IgZnVuY3Rpb24tLXJlZ2FyZGxlc3Mgb2Ygd2hhdCBUeXBlU2NyaXB0IHRoaW5rc1xuICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgdGltZW91dCwgLi4uKGFyZ3MgfHwgW10pKTtcbn1cblxuLyoqIFByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQgKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWl0KHRpbWVvdXQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IGFmdGVyRGVsYXkodGltZW91dCwgcmVzb2x2ZSkpO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVXBkYXRhYmxlT2JqZWN0IHtcbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnN1cHByZXNzVXBkYXRlcykgcmV0dXJuO1xuICAgICAgICB0aGlzLnN1cHByZXNzVXBkYXRlcyA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlXygpO1xuICAgICAgICB0aGlzLnN1cHByZXNzVXBkYXRlcyA9IGZhbHNlO1xuICAgIH1cbiAgICByZWFkb25seSB1cGRhdGVfYm91bmQgPSB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpO1xuICAgIHByb3RlY3RlZCB1cGRhdGVfKCkge3JldHVybjt9XG5cbiAgICB1cGRhdGVGcm9tSW5wdXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN1cHByZXNzVXBkYXRlcykgcmV0dXJuO1xuICAgICAgICB0aGlzLnN1cHByZXNzVXBkYXRlcyA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlRnJvbUlucHV0XygpO1xuICAgICAgICB0aGlzLnN1cHByZXNzVXBkYXRlcyA9IGZhbHNlO1xuICAgIH1cbiAgICAgICAgcmVhZG9ubHkgdXBkYXRlRnJvbUlucHV0X2JvdW5kID0gdGhpcy51cGRhdGVGcm9tSW5wdXQuYmluZCh0aGlzKTtcblxuICAgIHByb3RlY3RlZCB1cGRhdGVGcm9tSW5wdXRfKCkge3JldHVybjt9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN1cHByZXNzVXBkYXRlcyA9IHRydWU7XG4gICAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMuc3VwcHJlc3NVcGRhdGVzID0gdHJ1ZSk7XG4gICAgICAgIHRoaXMuZGVzdHJveV8oKTtcbiAgICB9XG4gICAgcmVhZG9ubHkgZGVzdHJveV9ib3VuZCA9IHRoaXMuZGVzdHJveS5iaW5kKHRoaXMpO1xuXG4gICAgcHJvdGVjdGVkIGRlc3Ryb3lfKCkge3JldHVybjt9XG5cbiAgICBzdXBwcmVzc1VwZGF0ZXMgPSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5lc3RBbmltYXRpb25GcmFtZXMobnVtOiBudW1iZXIsIGNhbGxiYWNrOiAoKSA9PiB1bmtub3duKSB7XG4gICAgaWYgKG51bSA8PSAwKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gbmVzdEFuaW1hdGlvbkZyYW1lcyhudW0gLSAxLCBjYWxsYmFjaykpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYW5pbWF0aW9uRnJhbWVzKG51bTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gbmVzdEFuaW1hdGlvbkZyYW1lcyhudW0sIHJlc29sdmUpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhbkFuaW1hdGlvbkZyYW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBhbmltYXRpb25GcmFtZXMoMSk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09IFNUUklORyBVVElMSVRJRVMgPT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFJlbW92ZXMgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmcgYW5kIGF0IHRoZSBlbmQgb2YgZXZlcnkgaW5jbHVkZWQgbGluZSovXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xufVxuXG4vKiogUmVtb3ZlcyB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZyBhbmQgYXQgdGhlIGVuZCBvZiBldmVyeSBpbmNsdWRlZCBsaW5lKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmltV2hpdGVzcGFjZShzdHI6IHN0cmluZywgdHJhaWxpbmdOZXdsaW5lID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIHJldHVybiAgc3RyLnRyaW1TdGFydCgpICAgICAgICAgICAgICAgICAgICAgLy8gVHJpbSB3aGl0ZXNwYWNlIGF0IHRoZSBzdGFydCBvZiB0aGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgLnRyaW1FbmQoKSAgICAgICAgICAgICAgICAgICAgICAvLyBUcmltIHdoaXRlc3BhY2UgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1teXFxTXFxuXSokL2dtLCAnJykgICAgIC8vIFRyaW0gd2hpdGVzcGFjZSBhdCB0aGUgZW5kIG9mIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgICsgKHRyYWlsaW5nTmV3bGluZSA/ICdcXG4nIDogJycpIC8vIEFkZCBhIHRyYWlsaW5nIG5ld2xpbmUgaWYgcmVxdWVzdGVkXG47fVxuXG4vKioqXG4gKiAgICAkJCQkJCQkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFxcbiAqICAgICQkICBfX19fX3wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAkJCB8ICAgICAgJCRcXCAgICAkJFxcICAkJCQkJCRcXCAgJCQkJCQkJFxcICAkJCQkJCRcXFxuICogICAgJCQkJCRcXCAgICBcXCQkXFwgICQkICB8JCQgIF9fJCRcXCAkJCAgX18kJFxcIFxcXyQkICBffFxuICogICAgJCQgIF9ffCAgICBcXCQkXFwkJCAgLyAkJCQkJCQkJCB8JCQgfCAgJCQgfCAgJCQgfFxuICogICAgJCQgfCAgICAgICAgXFwkJCQgIC8gICQkICAgX19fX3wkJCB8ICAkJCB8ICAkJCB8JCRcXFxuICogICAgJCQkJCQkJCRcXCAgICBcXCQgIC8gICBcXCQkJCQkJCRcXCAkJCB8ICAkJCB8ICBcXCQkJCQgIHxcbiAqICAgIFxcX19fX19fX198ICAgIFxcXy8gICAgIFxcX19fX19fX3xcXF9ffCAgXFxfX3wgICBcXF9fX18vXG4gKlxuICpcbiAqXG4gKiAgICAkJFxcICAgJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgJCRcXCAkJFxcXG4gKiAgICAkJCB8ICAkJCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8JCQgfFxcX198XG4gKiAgICAkJCB8ICAkJCB8ICQkJCQkJFxcICAkJCQkJCQkXFwgICAkJCQkJCQkIHwkJCB8JCRcXCAkJCQkJCQkXFwgICAkJCQkJCRcXFxuICogICAgJCQkJCQkJCQgfCBcXF9fX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCQgfCQkIHwkJCB8JCQgIF9fJCRcXCAkJCAgX18kJFxcXG4gKiAgICAkJCAgX18kJCB8ICQkJCQkJCQgfCQkIHwgICQkIHwkJCAvICAkJCB8JCQgfCQkIHwkJCB8ICAkJCB8JCQgLyAgJCQgfFxuICogICAgJCQgfCAgJCQgfCQkICBfXyQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHxcbiAqICAgICQkIHwgICQkIHxcXCQkJCQkJCQgfCQkIHwgICQkIHxcXCQkJCQkJCQgfCQkIHwkJCB8JCQgfCAgJCQgfFxcJCQkJCQkJCB8XG4gKiAgICBcXF9ffCAgXFxfX3wgXFxfX19fX19ffFxcX198ICBcXF9ffCBcXF9fX19fX198XFxfX3xcXF9ffFxcX198ICBcXF9ffCBcXF9fX18kJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICQkIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9fX19fXy9cbiAqL1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgICAgIC8qKiBCcm93c2VyLVN1cHBvcnRlZCBDbGljayBFdmVudCAqL1xuICAgICAgICBjbGlja0V2dDogJ2NsaWNrJ3wnbW91c2Vkb3duJ1xuXG4gICAgICAgIC8qKiBBZGQgdGhlIHByb3ZpZGVkIGV2ZW50IGxpc3RlbmVyIG9iamVjdCB0byB0aGUgZWxlbWVudCAqL1xuICAgICAgICByZWdpc3RlckZvckV2ZW50czogdHlwZW9mIHJlZ2lzdGVyRm9yRXZlbnRzO1xuICAgICAgICAvKiogUmVtb3ZlIHRoZSBwcm92aWRlZCBldmVudCBsaXN0ZW5lciBvYmplY3QgZnJvbSB0aGUgZWxlbWVudCAqL1xuICAgICAgICB1bnJlZ2lzdGVyRm9yRXZlbnRzOiB0eXBlb2YgdW5yZWdpc3RlckZvckV2ZW50cztcbiAgICB9XG59XG5cbi8qKiBBbiBpdGVtIHRoYXQgY2FuIHJlY2VpdmUgYW4gZXZlbnQgKi9cbnR5cGUgRXZlbnRFbGVtZW50ID0gSFRNTEVsZW1lbnR8dHlwZW9mIHdpbmRvd3x0eXBlb2YgZG9jdW1lbnQ7XG5cbi8qKiBDb25zdHJ1Y3RzIGFuIGV2ZW50IGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50IGFuZCBlbGVtZW50IHR5cGVzICovXG50eXBlIEV2ZW50Q2FsbGJhY2s8VEV2ZW50VHlwZSBleHRlbmRzIEV2ZW50LCBURWxlbWVudCBleHRlbmRzIEV2ZW50RWxlbWVudCA9IEV2ZW50RWxlbWVudD4gPSAodGhpczogVEVsZW1lbnQsIGV2OiBURXZlbnRUeXBlKSA9PiB1bmtub3duO1xuXG4vKiogVGhlIHZhcmlvdXMgdHlwZXMgb2YgcmVnaXN0ZXJhYmxlIGV2ZW50cyBhbmQgdGhlaXIgY2FsbGJhY2sgdHlwZXMgKi9cbmludGVyZmFjZSBFdmVudFR5cGVzPFRFbGVtZW50IGV4dGVuZHMgRXZlbnRFbGVtZW50ID0gRXZlbnRFbGVtZW50PiB7XG4gICAgYWN0aXZhdGU/OiBFdmVudENhbGxiYWNrPFRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQgPyAoTW91c2VFdmVudHxLZXlib2FyZEV2ZW50KSA6IChFdmVudHxLZXlib2FyZEV2ZW50KSwgVEVsZW1lbnQ+XG5cbiAgICBjaGFuZ2U/OiBFdmVudENhbGxiYWNrPEV2ZW50LCBURWxlbWVudD5cblxuICAgIGRyb3Bkb3duSW5wdXQ/OiBFdmVudENhbGxiYWNrPEV2ZW50LCBURWxlbWVudD5cblxuICAgIGV4aXQ/OiBFdmVudENhbGxiYWNrPEtleWJvYXJkRXZlbnQsIFRFbGVtZW50PlxuXG4gICAgdW5kbz86IEV2ZW50Q2FsbGJhY2s8S2V5Ym9hcmRFdmVudCwgVEVsZW1lbnQ+XG4gICAgcmVkbz86IEV2ZW50Q2FsbGJhY2s8S2V5Ym9hcmRFdmVudCwgVEVsZW1lbnQ+XG5cbiAgICBzYXZlPzogRXZlbnRDYWxsYmFjazxLZXlib2FyZEV2ZW50LCBURWxlbWVudD5cblxuICAgIGFueUtleT86IEV2ZW50Q2FsbGJhY2s8S2V5Ym9hcmRFdmVudCwgVEVsZW1lbnQ+XG4gICAga2V5PzogRXZlbnRDYWxsYmFjazxLZXlib2FyZEV2ZW50LCBURWxlbWVudD5cbn1cblxuLyoqIFZhcmlvdXMga2V5cyB0aGF0IGNhbiBiZSBoZWxkIHRvIG1vZGlmeSB0aGUgdXNlIG9mIGFub3RoZXIga2V5ICovXG50eXBlIG1vZGlmaWVyS2V5cyA9ICdjdHJsJyB8ICdzaGlmdCcgfCAnYWx0JyB8ICdtZXRhJztcblxuLyoqIEEgbGlzdCBvZiBrZXlzIGFuZCB0aGVpciBhc3NvY2lhdGVkIGFjdGlvbnMgKi9cbmNvbnN0IGtleVR5cGVzOiBSZWNvcmQ8c3RyaW5nLCBbbW9kaWZpZXJLZXlzW10sIGtleW9mIEV2ZW50VHlwZXNdW10+ID0ge1xuICAgICdFbnRlcic6IFtbW10sICdhY3RpdmF0ZSddXSxcbiAgICAnICc6IFtbW10sICdhY3RpdmF0ZSddXSxcbiAgICAnRXNjYXBlJzogW1tbXSwgJ2V4aXQnXV0sXG4gICAgJ0VzYyc6IFtbW10sICdleGl0J11dLFxuICAgICd6JzogW1xuICAgICAgICBbWydjdHJsJ10sICd1bmRvJ10sIFtbJ21ldGEnXSwgJ3VuZG8nXSxcbiAgICAgICAgW1snY3RybCcsICdzaGlmdCddLCAncmVkbyddLCBbWydtZXRhJywgJ3NoaWZ0J10sICdyZWRvJ11cbiAgICBdLFxuICAgICd5JzogW1tbJ2N0cmwnXSwgJ3JlZG8nXV0sXG4gICAgJ3MnOiBbW1snY3RybCddLCAnc2F2ZSddXSxcbn07XG5cbi8qKiBBZGQgdGhlIHByb3ZpZGVkIGV2ZW50IGxpc3RlbmVyIG9iamVjdCB0byB0aGUgZWxlbWVudC5cbiAqIFdBUk5JTkc6IElmIHlvdSB3aXNoIHRvIHVucmVnaXN0ZXIgdGhlc2UgZXZlbnRzIGxhdGVyLCB5b3UgV0lMTCBuZWVkIHRvIHVzZSB0aGUgc2FtZSBvcHRpb25zIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRm9yRXZlbnRzPFRFbGVtZW50IGV4dGVuZHMgRXZlbnRFbGVtZW50PihlbGVtZW50OiBURWxlbWVudCwgZXZlbnRzOiBFdmVudFR5cGVzPFRFbGVtZW50Piwgb3B0aW9ucz86IGJvb2xlYW58QWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB2b2lkIHtcbiAgICByZWdpc3RlckZvckV2ZW50c18oZWxlbWVudCwgZXZlbnRzLCBvcHRpb25zLCBmYWxzZSk7XG59XG5cbi8qKiBSZW1vdmUgdGhlIHByb3ZpZGVkIGV2ZW50IGxpc3RlbmVyIG9iamVjdCBmcm9tIHRoZSBlbGVtZW50XG4gKiBXQVJOSU5HOiBUbyB1bnJlZ2lzdGVyIHRoZXNlIGV2ZW50cywgeW91IFdJTEwgbmVlZCB0byB1c2UgdGhlIHNhbWUgb3B0aW9ucyBvYmplY3QgYXMgd2hlbiB5b3UgcmVnaXN0ZXJlZCBpdC5cbiovXG5leHBvcnQgZnVuY3Rpb24gdW5yZWdpc3RlckZvckV2ZW50czxURWxlbWVudCBleHRlbmRzIEV2ZW50RWxlbWVudD4oZWxlbWVudDogVEVsZW1lbnQsIGV2ZW50czogRXZlbnRUeXBlczxURWxlbWVudD4sIG9wdGlvbnM/OiBib29sZWFufEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdm9pZCB7XG4gICAgcmVnaXN0ZXJGb3JFdmVudHNfKGVsZW1lbnQsIGV2ZW50cywgb3B0aW9ucywgdHJ1ZSk7XG59XG5cbi8qKiBBIG1hcHBpbmcgb2YgZXZlbnQgY2FsbGJhY2tzIHRvIHRoZWlyIHdyYXBwZWQgdmVyc2lvbnMgKHN0b3JlZCBzbyB0aGUgZXZlbnQgY2FuIGJlIGxhdGVyIHJlbW92ZWQpICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJGb3JFdmVudHNfd3JhcHBlZEZ1bmN0aW9ucyA9IG5ldyBNYXA8RnVuY3Rpb24sIEZ1bmN0aW9uPigpO1xuXG4vKiogQSBtYXBwaW5nIG9mIGV2ZW50IG9iamVjdHMgdG8gdGhlaXIga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgKHN0b3JlZCBzbyB0aGUgZXZlbnQgY2FuIGJlIGxhdGVyIHJlbW92ZWQpICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJGb3JFdmVudHNfaGFuZGxlZEtleXMgPSBuZXcgTWFwPEV2ZW50VHlwZXM8YW55PiwgKHRoaXM6IGFueSwgZXY6IEV2ZW50KT0+dm9pZD4oKTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJGb3JFdmVudHNfPFRFbGVtZW50IGV4dGVuZHMgRXZlbnRFbGVtZW50PihlbGVtZW50OiBURWxlbWVudCwgZXZlbnRzOiBFdmVudFR5cGVzPFRFbGVtZW50Piwgb3B0aW9ucz86IGJvb2xlYW58QWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsIHVucmVnaXN0ZXIgPSBmYWxzZSk6IHZvaWQge1xuICAgIGxldCBoYW5kbGluZyA9IGZhbHNlO1xuXG4gICAgY29uc3Qgc2V0TGlzdGVuZXIgPSB1bnJlZ2lzdGVyID8gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyLmJpbmQoZWxlbWVudCkgOiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIuYmluZChlbGVtZW50KTtcblxuICAgIGZ1bmN0aW9uIHdyYXBDYWxsYmFjazxUQ2FsbGJhY2sgZXh0ZW5kcyAodGhpczogVEVsZW1lbnQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk+KGNhbGxiYWNrOiBUQ2FsbGJhY2spOiAoKHRoaXM6IFRoaXNQYXJhbWV0ZXJUeXBlPFRDYWxsYmFjaz4sIC4uLmFyZ3M6IFBhcmFtZXRlcnM8VENhbGxiYWNrPik9PlJldHVyblR5cGU8VENhbGxiYWNrPnx2b2lkKSB7XG4gICAgICAgIGxldCBmID0gcmVnaXN0ZXJGb3JFdmVudHNfd3JhcHBlZEZ1bmN0aW9ucy5nZXQoY2FsbGJhY2spO1xuXG4gICAgICAgIGlmICghZikge1xuICAgICAgICAgICAgZiA9IGZ1bmN0aW9uKHRoaXM6IFRoaXNQYXJhbWV0ZXJUeXBlPFRDYWxsYmFjaz4sIC4uLmFyZ3M6IFBhcmFtZXRlcnM8VENhbGxiYWNrPikge1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGluZykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiBoYW5kbGluZyA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCAuLi5hcmdzKSBhcyBSZXR1cm5UeXBlPFRDYWxsYmFjaz47XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZWdpc3RlckZvckV2ZW50c193cmFwcGVkRnVuY3Rpb25zLnNldChjYWxsYmFjaywgZik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBAdHMtaWdub3JlOiBUaGUgdHlwZSBpcyBjb3JyZWN0LCBidXQgVHlwZVNjcmlwdCBkb2Vzbid0IGtub3cgdGhhdFxuICAgICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgICAvLyBXcmFwIGFsbCB0aGUgY2FsbGJhY2tzIVxuICAgIGV2ZW50cyA9IE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhldmVudHMpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBba2V5LCB3cmFwQ2FsbGJhY2sodmFsdWUpXSkpO1xuXG4gICAgbGV0IGhhbmRsZUtleSA9IHJlZ2lzdGVyRm9yRXZlbnRzX2hhbmRsZWRLZXlzLmdldChldmVudHMpO1xuICAgIGlmICghaGFuZGxlS2V5KSB7XG4gICAgICAgIGhhbmRsZUtleSA9IGZ1bmN0aW9uKHRoaXM6IFRFbGVtZW50LCBldjogRXZlbnQpIHtcbiAgICAgICAgICAgIGlmICggIShldiBpbnN0YW5jZW9mIEtleWJvYXJkRXZlbnQpICkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBGaW5kIGFuZCBjYWxsIHRoZSBhcHByb3ByaWF0ZSBjYWxsYmFja1xuICAgICAgICAgICAgY29uc3QgZnVuY3Rpb25OYW1lID0ga2V5VHlwZXNbZXYua2V5XT8uZmluZCgoW21vZGlmaWVycywgX10pID0+IG1vZGlmaWVycy5ldmVyeShtb2QgPT4gZXZbYCR7bW9kfUtleWBdKSk/LlsxXSB8fCAnYW55S2V5JztcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RlZENhbGxiYWNrID0gZXZlbnRzW2Z1bmN0aW9uTmFtZV07XG5cbiAgICAgICAgICAgIGlmIChyZXF1ZXN0ZWRDYWxsYmFjayAmJiBmdW5jdGlvbk5hbWUgIT09ICdhbnlLZXknKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSByZXF1ZXN0ZWRDYWxsYmFjayB8fCBldmVudHNbJ2FueUtleSddO1xuICAgICAgICAgICAgY2FsbGJhY2s/LmNhbGwoZWxlbWVudCwgZXYpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlZ2lzdGVyRm9yRXZlbnRzX2hhbmRsZWRLZXlzLnNldChldmVudHMsIGhhbmRsZUtleSk7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXksIG9wdGlvbnMpO1xuXG4gICAgZm9yIChjb25zdCBldnQgaW4gZXZlbnRzKSBzd2l0Y2ggKGV2dCkge1xuICAgICAgICBjYXNlICdhY3RpdmF0ZSc6IC8vIEB0cy1pZ25vcmUgLSBteSBsb2dpYyBpcyBwZXJmZWN0bHkgdmFsaWQsIGJ1dCBUeXBlU2NyaXB0IGRvZXNuJ3Qga25vdyB0aGF0IPCfpLfigI3imYLvuI9cbiAgICAgICAgICAgIHNldExpc3RlbmVyKHdpbmRvdy5jbGlja0V2dCwgZXZlbnRzW2V2dF0hLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NoYW5nZSc6XG4gICAgICAgICAgICBzZXRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnRzW2V2dF0hLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHNldExpc3RlbmVyKCdpbnB1dCcsIGV2ZW50c1tldnRdISwgb3B0aW9ucyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdkcm9wZG93bklucHV0JzpcbiAgICAgICAgICAgIHNldExpc3RlbmVyKCdiY2QtZHJvcGRvd24tY2hhbmdlJywgZXZlbnRzW2V2dF0hLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2V4aXQnOiBicmVhaztcbiAgICAgICAgY2FzZSAndW5kbyc6IGJyZWFrO1xuICAgICAgICBjYXNlICdyZWRvJzogYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FueUtleSc6IGJyZWFrO1xuICAgIH1cbn1cbndpbmRvdy5yZWdpc3RlckZvckV2ZW50cyA9IHJlZ2lzdGVyRm9yRXZlbnRzO1xuXG4vKioqXG4gKiAgICAkJCQkJCQkXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQkJCQkXFwgICAgJCRcXCAgICAgICAgICAgICAgICAkJCQkJCRcXCAgICQkJCQkJFxcXG4gKiAgICAkJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCAgX18kJFxcICAgJCQgfCAgICAgICAgICAgICAgJCQgIF9fJCRcXCAkJCAgX18kJFxcXG4gKiAgICAkJCB8ICAkJCB8ICQkJCQkJFxcICAgJCQkJCQkXFwgICQkXFwgICAkJFxcICQkXFwgICAkJFxcICAgICAgICQkIC8gIFxcX198JCQkJCQkXFwgICAkJFxcICAgJCRcXCAkJCAvICBcXF9ffCQkIC8gIFxcX198XG4gKiAgICAkJCQkJCQkICB8JCQgIF9fJCRcXCAkJCAgX18kJFxcIFxcJCRcXCAkJCAgfCQkIHwgICQkIHwgICAgICBcXCQkJCQkJFxcICBcXF8kJCAgX3wgICQkIHwgICQkIHwkJCQkXFwgICAgICQkJCRcXFxuICogICAgJCQgIF9fX18vICQkIHwgIFxcX198JCQgLyAgJCQgfCBcXCQkJCQgIC8gJCQgfCAgJCQgfCAgICAgICBcXF9fX18kJFxcICAgJCQgfCAgICAkJCB8ICAkJCB8JCQgIF98ICAgICQkICBffFxuICogICAgJCQgfCAgICAgICQkIHwgICAgICAkJCB8ICAkJCB8ICQkICAkJDwgICQkIHwgICQkIHwgICAgICAkJFxcICAgJCQgfCAgJCQgfCQkXFwgJCQgfCAgJCQgfCQkIHwgICAgICAkJCB8XG4gKiAgICAkJCB8ICAgICAgJCQgfCAgICAgIFxcJCQkJCQkICB8JCQgIC9cXCQkXFwgXFwkJCQkJCQkIHwgICAgICBcXCQkJCQkJCAgfCAgXFwkJCQkICB8XFwkJCQkJCQgIHwkJCB8ICAgICAgJCQgfFxuICogICAgXFxfX3wgICAgICBcXF9ffCAgICAgICBcXF9fX19fXy8gXFxfXy8gIFxcX198IFxcX19fXyQkIHwgICAgICAgXFxfX19fX18vICAgIFxcX19fXy8gIFxcX19fX19fLyBcXF9ffCAgICAgIFxcX198XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICQkIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9fX19fXy9cbiAqL1xuXG4vLyBXYXRjaCBvdXQgLSBHZW5lcmljcyBhcmUgc2NhcnJ5IVxuXG50eXBlIEFueUZ1bmN0aW9uID0gKC4uLmFyZ3M6IGFueSkgPT4gYW55O1xudHlwZSBBbnlDb25zdHJ1Y3RvciA9IChuZXcgKC4uLmFyZ3M6IGFueSkgPT4gYW55KSB8IChhYnN0cmFjdCBuZXcgKC4uLmFyZ3M6IGFueSkgPT4gYW55KTtcbnR5cGUgQW55Q29uc3RydWN0b3JXaXRoQ2FsbFNpZ25hdHVyZSA9IEFueUNvbnN0cnVjdG9yICYgQW55RnVuY3Rpb247XG5cbmludGVyZmFjZSBJbXByb3ZlZFByb3h5SGFuZGxlcl9Db25zdHJ1Y3RvcjxUT2JqIGV4dGVuZHMgQW55Q29uc3RydWN0b3I+IGV4dGVuZHMgSW1wcm92ZWRQcm94eUhhbmRsZXJfT2JqZWN0PFRPYmo+IHtcbiAgICAvKipcbiAgICAgKiBBIHRyYXAgZm9yIHRoZSBgbmV3YCBvcGVyYXRvci5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBvcmlnaW5hbCBvYmplY3Qgd2hpY2ggaXMgYmVpbmcgcHJveGllZC5cbiAgICAgKiBAcGFyYW0gYXJnQXJyYXkgVGhlIGFyZ3VtZW50cyBmb3IgdGhlIGNhbGwuXG4gICAgICogQHBhcmFtIG5ld1RhcmdldCBUaGUgY29uc3RydWN0b3IgdGhhdCB3YXMgb3JpZ2luYWxseSBjYWxsZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0Pyh0YXJnZXQ6IFRPYmosIGFyZ0FycmF5OiBhbnlbXSwgbmV3VGFyZ2V0OiAoQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFRPYmo+KSk6IG9iamVjdDtcbn1cbmludGVyZmFjZSBJbXByb3ZlZFByb3h5SGFuZGxlcl9GdW5jdGlvbjxUT2JqIGV4dGVuZHMgQW55RnVuY3Rpb24+IGV4dGVuZHMgSW1wcm92ZWRQcm94eUhhbmRsZXJfT2JqZWN0PFRPYmo+IHtcbiAgICAvKipcbiAgICAgKiBBIHRyYXAgbWV0aG9kIGZvciBhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICogQHBhcmFtIHRhcmdldCBUaGUgb3JpZ2luYWwgY2FsbGFibGUgb2JqZWN0IHdoaWNoIGlzIGJlaW5nIHByb3hpZWQuXG4gICAgICogQHBhcmFtIHRoaXNBcmcgVGhlIGB0aGlzYCBhcmd1bWVudCBmb3IgdGhlIGNhbGwuXG4gICAgICogQHBhcmFtIGFyZ0FycmF5IFRoZSBhcmd1bWVudHMgZm9yIHRoZSBjYWxsLlxuICAgICAqL1xuICAgIGFwcGx5Pyh0YXJnZXQ6IFRPYmosIHRoaXNBcmc6IFRoaXNQYXJhbWV0ZXJUeXBlPFRPYmo+LCBhcmdBcnJheTogUGFyYW1ldGVyczxUT2JqPik6IGFueTtcbn1cblxudHlwZSBJbXByb3ZlZFByb3h5SGFuZGxlcl9Db25zdHJ1Y3RvcldpdGhDYWxsU2lnbmF0dXJlPFRPYmogZXh0ZW5kcyBBbnlDb25zdHJ1Y3RvcldpdGhDYWxsU2lnbmF0dXJlPiA9IEltcHJvdmVkUHJveHlIYW5kbGVyX0NvbnN0cnVjdG9yPFRPYmo+ICYgSW1wcm92ZWRQcm94eUhhbmRsZXJfRnVuY3Rpb248VE9iaj47XG5cbi8vIEB0cy1pZ25vcmU6IFR5cGVTY3JpcHQgZG9lc24ndCBsaWtlIG1lIG92ZXJ3cml0aW5nIHRoZSBiYWQgZGVmYXVsdCB0eXBlcy5cbmludGVyZmFjZSBJbXByb3ZlZFByb3h5SGFuZGxlcl9PYmplY3Q8VE9iaiBleHRlbmRzIG9iamVjdD4gZXh0ZW5kcyBQcm94eUhhbmRsZXI8VE9iaj4ge1xuICAgIC8qKiBETyBOT1QgVVNFIC0gVEhJUyBPQkpFQ1QgQ0FOTk9UIEJFIENPTlNUUlVDVEVEICovXG4gICAgYXBwbHk/OiBhbnk7XG5cbiAgICAvKiogRE8gTk9UIFVTRSAtIFRISVMgT0JKRUNUIENBTk5PVCBCRSBDT05TVFJVQ1RFRCAqL1xuICAgIGNvbnN0cnVjdD86IGFueTtcblxuICAgIC8qKlxuICAgICAqIEEgdHJhcCBmb3IgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpYC5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBvcmlnaW5hbCBvYmplY3Qgd2hpY2ggaXMgYmVpbmcgcHJveGllZC5cbiAgICAgKiBAcmV0dXJucyBBIGBCb29sZWFuYCBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSBwcm9wZXJ0eSBoYXMgYmVlbiBkZWZpbmVkLlxuICAgICAqL1xuICAgIGRlZmluZVByb3BlcnR5Pyh0YXJnZXQ6IFRPYmosIHByb3BlcnR5OiBrZXlvZiBUT2JqLCBhdHRyaWJ1dGVzOiBQcm9wZXJ0eURlc2NyaXB0b3IpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQSB0cmFwIGZvciB0aGUgYGRlbGV0ZWAgb3BlcmF0b3IuXG4gICAgICogQHBhcmFtIHRhcmdldCBUaGUgb3JpZ2luYWwgb2JqZWN0IHdoaWNoIGlzIGJlaW5nIHByb3hpZWQuXG4gICAgICogQHBhcmFtIHByb3BlcnR5IFRoZSBuYW1lIG9yIGBTeW1ib2xgIG9mIHRoZSBwcm9wZXJ0eSB0byBkZWxldGUuXG4gICAgICogQHJldHVybnMgQSBgQm9vbGVhbmAgaW5kaWNhdGluZyB3aGV0aGVyIG9yIG5vdCB0aGUgcHJvcGVydHkgd2FzIGRlbGV0ZWQuXG4gICAgICovXG4gICAgZGVsZXRlUHJvcGVydHk/KHRhcmdldDogVE9iaiwgcHJvcGVydHk6IGtleW9mIFRPYmopOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQSB0cmFwIGZvciBnZXR0aW5nIGEgcHJvcGVydHkgdmFsdWUuXG4gICAgICogQHBhcmFtIHRhcmdldCBUaGUgb3JpZ2luYWwgb2JqZWN0IHdoaWNoIGlzIGJlaW5nIHByb3hpZWQuXG4gICAgICogQHBhcmFtIHByb3BlcnR5VGhlIG5hbWUgb3IgYFN5bWJvbGAgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAgICAgKiBAcGFyYW0gcmVjZWl2ZXIgVGhlIHByb3h5IG9yIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIHByb3h5LlxuICAgICAqL1xuICAgIGdldD88VFByb3BlcnR5IGV4dGVuZHMga2V5b2YgVE9iaj4odGFyZ2V0OiBUT2JqLCBwcm9wZXJ0eTogVFByb3BlcnR5LCByZWNlaXZlcjogYW55KTogVE9ialtUUHJvcGVydHldO1xuXG4gICAgLyoqXG4gICAgICogQSB0cmFwIGZvciBgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcigpYC5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBvcmlnaW5hbCBvYmplY3Qgd2hpY2ggaXMgYmVpbmcgcHJveGllZC5cbiAgICAgKiBAcGFyYW0gcHJvcGVydHlUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2hvc2UgZGVzY3JpcHRpb24gc2hvdWxkIGJlIHJldHJpZXZlZC5cbiAgICAgKi9cbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I/PFRQcm9wZXJ0eSBleHRlbmRzIGtleW9mIFRPYmo+KHRhcmdldDogVE9iaiwgcHJvcGVydHk6IFRQcm9wZXJ0eSk6IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIEEgdHJhcCBmb3IgdGhlIGBbW0dldFByb3RvdHlwZU9mXV1gIGludGVybmFsIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBvcmlnaW5hbCBvYmplY3Qgd2hpY2ggaXMgYmVpbmcgcHJveGllZC5cbiAgICAgKi9cbiAgICBnZXRQcm90b3R5cGVPZj8odGFyZ2V0OiBUT2JqKTogb2JqZWN0IHwgbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEEgdHJhcCBmb3IgdGhlIGBpbmAgb3BlcmF0b3IuXG4gICAgICogQHBhcmFtIHRhcmdldCBUaGUgb3JpZ2luYWwgb2JqZWN0IHdoaWNoIGlzIGJlaW5nIHByb3hpZWQuXG4gICAgICogQHBhcmFtIHByb3BlcnR5VGhlIG5hbWUgb3IgYFN5bWJvbGAgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrIGZvciBleGlzdGVuY2UuXG4gICAgICovXG4gICAgaGFzPyh0YXJnZXQ6IFRPYmosIHByb3BlcnR5OiBzdHJpbmd8bnVtYmVyfHN5bWJvbCk6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBBIHRyYXAgZm9yIGBPYmplY3QuaXNFeHRlbnNpYmxlKClgLlxuICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIG9yaWdpbmFsIG9iamVjdCB3aGljaCBpcyBiZWluZyBwcm94aWVkLlxuICAgICAqL1xuICAgIGlzRXh0ZW5zaWJsZT8odGFyZ2V0OiBUT2JqKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIEEgdHJhcCBmb3IgYFJlZmxlY3Qub3duS2V5cygpYC5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBvcmlnaW5hbCBvYmplY3Qgd2hpY2ggaXMgYmVpbmcgcHJveGllZC5cbiAgICAgKi9cbiAgICBvd25LZXlzPyh0YXJnZXQ6IFRPYmopOiBBcnJheUxpa2U8a2V5b2YgVE9iaj47XG5cbiAgICAvKipcbiAgICAgKiBBIHRyYXAgZm9yIGBPYmplY3QucHJldmVudEV4dGVuc2lvbnMoKWAuXG4gICAgICogQHBhcmFtIHRhcmdldCBUaGUgb3JpZ2luYWwgb2JqZWN0IHdoaWNoIGlzIGJlaW5nIHByb3hpZWQuXG4gICAgICovXG4gICAgcHJldmVudEV4dGVuc2lvbnM/KHRhcmdldDogVE9iaik6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBBIHRyYXAgZm9yIHNldHRpbmcgYSBwcm9wZXJ0eSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSBvcmlnaW5hbCBvYmplY3Qgd2hpY2ggaXMgYmVpbmcgcHJveGllZC5cbiAgICAgKiBAcGFyYW0gcHJvcGVydHlUaGUgbmFtZSBvciBgU3ltYm9sYCBvZiB0aGUgcHJvcGVydHkgdG8gc2V0LlxuICAgICAqIEBwYXJhbSByZWNlaXZlciBUaGUgb2JqZWN0IHRvIHdoaWNoIHRoZSBhc3NpZ25tZW50IHdhcyBvcmlnaW5hbGx5IGRpcmVjdGVkLlxuICAgICAqIEByZXR1cm5zIEEgYEJvb2xlYW5gIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhlIHByb3BlcnR5IHdhcyBzZXQuXG4gICAgICovXG4gICAgc2V0PzxUUHJvcGVydHkgZXh0ZW5kcyBrZXlvZiBUT2JqPih0YXJnZXQ6IFRPYmosIHByb3BlcnR5OiBUUHJvcGVydHksIG5ld1ZhbHVlOiBUT2JqW1RQcm9wZXJ0eV0sIHJlY2VpdmVyOiBhbnkpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQSB0cmFwIGZvciBgT2JqZWN0LnNldFByb3RvdHlwZU9mKClgLlxuICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIG9yaWdpbmFsIG9iamVjdCB3aGljaCBpcyBiZWluZyBwcm94aWVkLlxuICAgICAqIEBwYXJhbSBuZXdQcm90b3R5cGUgVGhlIG9iamVjdCdzIG5ldyBwcm90b3R5cGUgb3IgYG51bGxgLlxuICAgICAqL1xuICAgIHNldFByb3RvdHlwZU9mPyh0YXJnZXQ6IFRPYmosIG5ld1Byb3RvdHlwZTogb2JqZWN0IHwgbnVsbCk6IGJvb2xlYW47XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICB0eXBlIEltcHJvdmVkUHJveHlIYW5kbGVyPFRPYmogZXh0ZW5kcyBvYmplY3Q+ID1cbiAgICAgIFRPYmogZXh0ZW5kcyBBbnlDb25zdHJ1Y3RvcldpdGhDYWxsU2lnbmF0dXJlID8gSW1wcm92ZWRQcm94eUhhbmRsZXJfQ29uc3RydWN0b3JXaXRoQ2FsbFNpZ25hdHVyZTxUT2JqPlxuICAgIDogVE9iaiBleHRlbmRzIEFueUNvbnN0cnVjdG9yICAgICAgICAgICAgICAgICAgPyBJbXByb3ZlZFByb3h5SGFuZGxlcl9Db25zdHJ1Y3RvcjxUT2JqPlxuICAgIDogVE9iaiBleHRlbmRzIEFueUZ1bmN0aW9uICAgICAgICAgICAgICAgICAgICAgPyBJbXByb3ZlZFByb3h5SGFuZGxlcl9GdW5jdGlvbjxUT2JqPlxuICAgIDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbXByb3ZlZFByb3h5SGFuZGxlcl9PYmplY3Q8VE9iaj5cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJveGllczxUT2JqIGV4dGVuZHMgb2JqZWN0PihvYmo6IFRPYmosIGhhbmRsZXI6IEltcHJvdmVkUHJveHlIYW5kbGVyPFRPYmo+LCBydW5PbkVhY2g/OiAob2JqOiBUT2JqKSA9PiB1bmtub3duKTogVE9iaiB7XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHJldHVybiBvYmo7XG5cblxuXG4gICAgaWYgKGhhbmRsZXIuc2V0KSB7XG4gICAgICAgIGNvbnN0IG9sZFNldHRlciA9IGhhbmRsZXIuc2V0O1xuICAgICAgICBjb25zdCB3cmFwcGVkU2V0dGVyOiBJbXByb3ZlZFByb3h5SGFuZGxlcjxUT2JqPlsnc2V0J10gPSAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9wIGluIHRhcmdldCAmJiB0YXJnZXRbcHJvcF0gPT09IHZhbHVlKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHZhbHVlID0gc2V0UHJveGllcyh2YWx1ZSwgaGFuZGxlciwgcnVuT25FYWNoKSBhcyBhbnk7XG5cbiAgICAgICAgICAgIHJldHVybiBvbGRTZXR0ZXIuY2FsbChoYW5kbGVyLCB0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPz8gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBoYW5kbGVyLnNldCA9IHdyYXBwZWRTZXR0ZXI7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICBydW5PbkVhY2g/Lih2YWx1ZSk7XG5cbiAgICAgICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSBjb250aW51ZTtcbiAgICAgICAgb2JqW2tleSBhcyBrZXlvZiBUT2JqXSA9IG5ldyBQcm94eShzZXRQcm94aWVzKHZhbHVlLCBoYW5kbGVyLCBydW5PbkVhY2gpLCBoYW5kbGVyKSBhcyBhbnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIGhhbmRsZXIpIGFzIFRPYmo7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09IE5VTUJFUiBVVElMSVRJRVMgPT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFJldHVybnMgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiAoaW5jbHVzaXZlKSBhbmQgbWF4IChpbmNsdXNpdmUpIHdpdGggcHJlY2lzaW9uIHVwIHRvIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzXG4gICAgQHBhcmFtIG1pbiBUaGUgbWluaW11bSB2YWx1ZSB0aGF0IHRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVyblxuICAgIEBwYXJhbSBtYXggVGhlIG1heGltdW0gdmFsdWUgdGhhdCB0aGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm5cbiAgICBAcGFyYW0gcGxhY2VzIFRoZSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdGhlIHJldHVybmVkIG51bWJlciBzaG91bGQgaW5jbHVkZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21OdW1iZXIobWluID0gMCwgbWF4ID0gMSwgcGxhY2VzID0gMCk6bnVtYmVye1xuICAgIGNvbnN0IHBsYWNlc011bHQgPSBNYXRoLnBvdygxMCwgcGxhY2VzKTtcbiAgICByZXR1cm4gKFxuICAgICAgICBNYXRoLnJvdW5kKFxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pblxuICAgICAgICAgICAgKSAqIHBsYWNlc011bHRcbiAgICAgICAgKSAvIHBsYWNlc011bHRcbiAgICApO1xufVxuXG5cbi8qKipcbiAqICAgICQkJCQkJCRcXCAgICQkJCQkJFxcICAkJFxcICAgICAgJCRcXCAgICAgICAkJFxcICAgJCRcXCAgICQkXFwgICAgICQkXFwgJCRcXCAkJFxcICAgJCRcXCAgICAgJCRcXFxuICogICAgJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkJFxcICAgICQkJCB8ICAgICAgJCQgfCAgJCQgfCAgJCQgfCAgICBcXF9ffCQkIHxcXF9ffCAgJCQgfCAgICBcXF9ffFxuICogICAgJCQgfCAgJCQgfCQkIC8gICQkIHwkJCQkXFwgICQkJCQgfCAgICAgICQkIHwgICQkIHwkJCQkJCRcXCAgICQkXFwgJCQgfCQkXFwgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJCRcXFxuICogICAgJCQgfCAgJCQgfCQkIHwgICQkIHwkJFxcJCRcXCQkICQkIHwgICAgICAkJCB8ICAkJCB8XFxfJCQgIF98ICAkJCB8JCQgfCQkIHxcXF8kJCAgX3wgICQkIHwkJCAgX18kJFxcICQkICBfX19fX3xcbiAqICAgICQkIHwgICQkIHwkJCB8ICAkJCB8JCQgXFwkJCQgICQkIHwgICAgICAkJCB8ICAkJCB8ICAkJCB8ICAgICQkIHwkJCB8JCQgfCAgJCQgfCAgICAkJCB8JCQkJCQkJCQgfFxcJCQkJCQkXFxcbiAqICAgICQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfFxcJCAgLyQkIHwgICAgICAkJCB8ICAkJCB8ICAkJCB8JCRcXCAkJCB8JCQgfCQkIHwgICQkIHwkJFxcICQkIHwkJCAgIF9fX198IFxcX19fXyQkXFxcbiAqICAgICQkJCQkJCQgIHwgJCQkJCQkICB8JCQgfCBcXF8vICQkIHwgICAgICBcXCQkJCQkJCAgfCAgXFwkJCQkICB8JCQgfCQkIHwkJCB8ICBcXCQkJCQgIHwkJCB8XFwkJCQkJCQkXFwgJCQkJCQkJCAgfFxuICogICAgXFxfX19fX19fLyAgXFxfX19fX18vIFxcX198ICAgICBcXF9ffCAgICAgICBcXF9fX19fXy8gICAgXFxfX19fLyBcXF9ffFxcX198XFxfX3wgICBcXF9fX18vIFxcX198IFxcX19fX19fX3xcXF9fX19fX18vXG4gKlxuICpcbiAqXG4gKi9cblxuaW50ZXJmYWNlIERvY0FuZEVsZW1lbnRJbmplY3Rpb25zIHtcbiAgICAvKiogUmV0dXJucyB0aGUgZmlyc3QgZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgdGFnIG5hbWUgb3IgY3JlYXRlcyBvbmUgaWYgaXQgZG9lcyBub3QgZXhpc3QgKi9cbiAgICBnZXRPckNyZWF0ZUNoaWxkQnlUYWc8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnTmFtZTogSyk6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXTtcbiAgICBnZXRPckNyZWF0ZUNoaWxkQnlUYWcodGFnTmFtZTogc3RyaW5nKTpFbGVtZW50O1xuXG4gICAgcmVtb3ZlQ2hpbGRCeVRhZzxLIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPih0YWdOYW1lOiBLLCBjb3VudD86IG51bWJlcik6IHZvaWQ7XG4gICAgcmVtb3ZlQ2hpbGRCeVRhZyh0YWdOYW1lOiBzdHJpbmcsIGNvdW50PzogbnVtYmVyKTogdm9pZDtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBFbGVtZW50IGV4dGVuZHMgRG9jQW5kRWxlbWVudEluamVjdGlvbnMge1xuICAgICAgICB1cGdyYWRlcz86IENvbXBvbmVudE1hcDtcbiAgICAgICAgdGFyZ2V0aW5nQ29tcG9uZW50cz86IENvbXBvbmVudE1hcDtcbiAgICB9XG4gICAgaW50ZXJmYWNlIERvY3VtZW50IGV4dGVuZHMgRG9jQW5kRWxlbWVudEluamVjdGlvbnMge31cblxuICAgIGludGVyZmFjZSBIVE1MRWxlbWVudCBleHRlbmRzIERvY0FuZEVsZW1lbnRJbmplY3Rpb25zIHtcbiAgICAgICAgb25jbGljazogRXZlbnRUeXBlczxIVE1MRWxlbWVudD5bJ2FjdGl2YXRlJ118bnVsbDtcbiAgICB9XG5cbiAgICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICAgICAgZG9tUGFyc2VyOiBET01QYXJzZXI7XG5cbiAgICAgICAgLyoqIEEgbGlzdCBvZiBmdW5jdGlvbnMgdXNlZCB3aGVuIGxvYWRpbmcgc2NyaXB0cyAqL1xuICAgICAgICBiY2RfaW5pdF9mdW5jdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZ1bmN0aW9uPjtcblxuICAgICAgICBjb3B5Q29kZShlbGVtOiBIVE1MRWxlbWVudCk6IHZvaWQ7XG5cbiAgICAgICAgQkNEU2V0dGluZ3NEcm9wZG93bjogdHlwZW9mIEJDRFNldHRpbmdzRHJvcGRvd247XG4gICAgfVxufVxud2luZG93LmRvbVBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblxuLyoqIEZvcmNlcyBhbiBIVE1MRWxlbWVudCB0byBiZSBmb2N1c2FibGUgYnkgdGhlIHVzZXIgYW5kIHRoZW4gZm9jdXNlcyBpdFxuICAgIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGZvY3VzXG4gICAgQHBhcmFtIHByZXZlbnRTY3JvbGxpbmcgV2hldGhlciBvciBub3QgdG8gcHJldmVudCB0aGUgcGFnZSBmcm9tIHNjcm9sbGluZyB0byB0aGUgZWxlbWVudC4gRGVmYXVsdHMgdG8gdHJ1ZS5cbiovXG5leHBvcnQgZnVuY3Rpb24gZm9jdXNBbnlFbGVtZW50KGVsZW1lbnQ6SFRNTEVsZW1lbnR8dW5kZWZpbmVkLCBwcmV2ZW50U2Nyb2xsaW5nOiBib29sZWFuID0gdHJ1ZSk6dm9pZHtcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQuZm9jdXMpIHJldHVybjtcblxuICAgIGNvbnN0IGhhZFRhYkluZGV4ID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgaWYgKCFoYWRUYWJJbmRleCkgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy04MzExJyk7XG5cbiAgICBlbGVtZW50LmZvY3VzKHtwcmV2ZW50U2Nyb2xsOiBwcmV2ZW50U2Nyb2xsaW5nfSk7XG5cbiAgICAvLyBXcmFwIGluc2lkZSB0d28gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxzIHRvIGVuc3VyZSB0aGUgYnJvd3NlciBjb3VsZCBmb2N1cyB0aGUgZWxlbWVudCBiZWZvcmUgcmVtb3ZpbmcgdGhlIHRhYmluZGV4IGF0dHJpYnV0ZS5cbiAgICBuZXN0QW5pbWF0aW9uRnJhbWVzKDIsICgpID0+IHtcbiAgICAgICAgaWYgKCFoYWRUYWJJbmRleCkgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlDb2RlKGVsZW06IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBlbGVtZW50IHByb3ZpZGVkIHRvIGNvcHlDb2RlIHdpdGghXCIpO1xuXG4gICAgLy9jb25zb2xlLmRlYnVnKFwiY29weUNvZGVcIiwgZWxlbSk7XG5cbiAgICAvLyBHZXQgY29kZVxuICAgIGNvbnN0IGNvZGVFbGVtID0gZWxlbS5wYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCdjb2RlJyk7XG4gICAgaWYgKCFjb2RlRWxlbSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gY29kZSBlbGVtZW50IGZvdW5kIHRvIGNvcHkgZnJvbSFcIik7XG5cbiAgICAvLyBXcml0ZSBjb2RlIHRvIGNsaXBib2FyZCAoYWZ0ZXIgdHJpbW1pbmcgdGhlIHdoaXRlc3BhY2UpXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodHJpbVdoaXRlc3BhY2UoY29kZUVsZW0udGV4dENvbnRlbnQgPz8gJycsIHRydWUpKTtcblxuICAgIC8vIFNlbGVjdCB0ZXh0IChVWCBzdHVudClcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhO1xuICAgIGNvbnN0IHRlbXBSYW5nZSA9IG5ldyBSYW5nZSgpO1xuICAgIHRlbXBSYW5nZS5zZWxlY3ROb2RlKGNvZGVFbGVtKTtcbiAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7IHNlbGVjdGlvbi5hZGRSYW5nZSh0ZW1wUmFuZ2UpO1xufVxud2luZG93LmNvcHlDb2RlID0gY29weUNvZGU7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElucHV0VmFsdWUoaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIHJldHVybiBpbnB1dC52YWx1ZSB8fCBpbnB1dC5nZXRBdHRyaWJ1dGUoJ2JjZFBsYWNlaG9sZGVyJykgfHwgaW5wdXQucGxhY2Vob2xkZXIgfHwgJyc7XG59XG5cblxuZnVuY3Rpb24gX19fZ2V0T3JDcmVhdGVDaGlsZCh0aGlzOkRvY3VtZW50fEVsZW1lbnQsIHRhZ05hbWU6IHN0cmluZykge1xuICAgIGxldCBjaGlsZCA9IHRoaXMuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSlbMF07XG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IHRoaXMgaW5zdGFuY2VvZiBEb2N1bWVudCA/IHRoaXMgOiB0aGlzLm93bmVyRG9jdW1lbnQ7XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZyhgQ3JlYXRpbmcgJHt0YWdOYW1lfSBlbGVtZW50IGZvcmAsIHRoaXMpO1xuICAgICAgICBjaGlsZCA9IGRvYy5jcmVhdGVFbGVtZW50KHRhZ05hbWUsIHtpczogdGFnTmFtZX0pO1xuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGQ7XG59XG5FbGVtZW50LnByb3RvdHlwZS5nZXRPckNyZWF0ZUNoaWxkQnlUYWcgPSBfX19nZXRPckNyZWF0ZUNoaWxkO1xuRG9jdW1lbnQucHJvdG90eXBlLmdldE9yQ3JlYXRlQ2hpbGRCeVRhZyA9IF9fX2dldE9yQ3JlYXRlQ2hpbGQ7XG5cbmZ1bmN0aW9uIF9fX3JlbW92ZUNoaWxkQnlUYWcodGhpczpEb2N1bWVudHxFbGVtZW50LCB0YWdOYW1lOiBzdHJpbmcsIGNvdW50OiBudW1iZXIgPSAxKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBbLi4udGhpcy5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKV07XG4gICAgbGV0IHJlbW92ZWRDb3VudCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IHJlbW92ZWRDb3VudCA8PSBjb3VudCAmJiBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKCFjaGlsZCB8fCBjaGlsZC50YWdOYW1lICE9PSB0YWdOYW1lKSBjb250aW51ZTtcblxuICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgcmVtb3ZlZENvdW50Kys7XG4gICAgfVxufVxuXG5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZEJ5VGFnID0gX19fcmVtb3ZlQ2hpbGRCeVRhZztcbkRvY3VtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZEJ5VGFnID0gX19fcmVtb3ZlQ2hpbGRCeVRhZztcblxuLyoqKlxuICogICAgICQkJCQkJFxcICAgICAgICAgICAgICAkJFxcICAgICAgICAgICAkJFxcICAgJCRcXCAgICQkXFwgICAgICQkXFwgJCRcXCAkJFxcICAgJCRcXCAgICAgJCRcXFxuICogICAgJCQgIF9fJCRcXCAgICAgICAgICAgICAkJCB8ICAgICAgICAgICQkIHwgICQkIHwgICQkIHwgICAgXFxfX3wkJCB8XFxfX3wgICQkIHwgICAgXFxfX3xcbiAqICAgICQkIC8gIFxcX198ICQkJCQkJFxcICAkJCQkJCRcXCAgICAgICAgICQkIHwgICQkIHwkJCQkJCRcXCAgICQkXFwgJCQgfCQkXFwgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJCRcXFxuICogICAgXFwkJCQkJCRcXCAgJCQgIF9fJCRcXCBcXF8kJCAgX3wgICAgICAgICQkIHwgICQkIHxcXF8kJCAgX3wgICQkIHwkJCB8JCQgfFxcXyQkICBffCAgJCQgfCQkICBfXyQkXFwgJCQgIF9fX19ffFxuICogICAgIFxcX19fXyQkXFwgJCQkJCQkJCQgfCAgJCQgfCAgICAgICAgICAkJCB8ICAkJCB8ICAkJCB8ICAgICQkIHwkJCB8JCQgfCAgJCQgfCAgICAkJCB8JCQkJCQkJCQgfFxcJCQkJCQkXFxcbiAqICAgICQkXFwgICAkJCB8JCQgICBfX19ffCAgJCQgfCQkXFwgICAgICAgJCQgfCAgJCQgfCAgJCQgfCQkXFwgJCQgfCQkIHwkJCB8ICAkJCB8JCRcXCAkJCB8JCQgICBfX19ffCBcXF9fX18kJFxcXG4gKiAgICBcXCQkJCQkJCAgfFxcJCQkJCQkJFxcICAgXFwkJCQkICB8ICAgICAgXFwkJCQkJCQgIHwgIFxcJCQkJCAgfCQkIHwkJCB8JCQgfCAgXFwkJCQkICB8JCQgfFxcJCQkJCQkJFxcICQkJCQkJCQgIHxcbiAqICAgICBcXF9fX19fXy8gIFxcX19fX19fX3wgICBcXF9fX18vICAgICAgICBcXF9fX19fXy8gICAgXFxfX19fLyBcXF9ffFxcX198XFxfX3wgICBcXF9fX18vIFxcX198IFxcX19fX19fX3xcXF9fX19fX18vXG4gKlxuICpcbiAqXG4gKi9cblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBTZXQ8VD4ge1xuICAgICAgICAvKiogQ2hhbmdlcyB0aGUgcG9zaXRpb24gb2YgYW4gaXRlbSBpbiB0aGUgc2V0IHJlbGF0aXZlIHRvIGFub3RoZXIgaXRlbVxuICAgICAgICAgKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgaXRlbSBjb3VsZCBiZSBtb3ZlZFxuICAgICAgICAqL1xuICAgICAgICBtb3ZlSXRlbTogdHlwZW9mIF9fX21vdmVJdGVtO1xuXG4gICAgICAgIC8qKiBDaGFuZ2VzIHRoZSBwb3NpdGlvbiBvZiBhbiBpdGVtIGluIHRoZSBzZXQgdXNpbmcgYSBwcm92aWRlZCBpbmRleFxuICAgICAgICAgKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgaXRlbSBjb3VsZCBiZSBtb3ZlZFxuICAgICAgICAqL1xuICAgICAgICBtb3ZlSW5kZXg6IHR5cGVvZiBfX19tb3ZlSW5kZXg7XG4gICAgfVxufVxuXG4vKiogQ2hhbmdlcyB0aGUgcG9zaXRpb24gb2YgYW4gaXRlbSBpbiB0aGUgc2V0XG4gKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgaXRlbSBjb3VsZCBiZSBtb3ZlZFxuKi9cbmZ1bmN0aW9uIF9fX21vdmVJdGVtPFQ+KHRoaXM6IFNldDxUPiwgaXRlbTpULCBuZXdBZGphY2VudEl0ZW06VCwgcmVsYXRpdmVQb3NpdGlvbjonYWJvdmUnfCdiZWxvdycgPSAnYmVsb3cnKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmhhcyhpdGVtKSB8fCAhdGhpcy5oYXMobmV3QWRqYWNlbnRJdGVtKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgYXJyID0gWy4uLnRoaXNdO1xuICAgIGNvbnN0IGl0ZW1JbmRleCA9IGFyci5pbmRleE9mKGl0ZW0pO1xuICAgIGNvbnN0IGFkamFjZW50SW5kZXggPSBhcnIuaW5kZXhPZihuZXdBZGphY2VudEl0ZW0pO1xuXG4gICAgaWYgKGl0ZW1JbmRleCA9PT0gLTEgfHwgYWRqYWNlbnRJbmRleCA9PT0gLTEpIHJldHVybiBmYWxzZTtcblxuICAgIGFyci5zcGxpY2UoaXRlbUluZGV4LCAxKTtcbiAgICBhcnIuc3BsaWNlKGFkamFjZW50SW5kZXggKyAocmVsYXRpdmVQb3NpdGlvbiA9PT0gJ2JlbG93JyA/IDEgOiAwKSwgMCwgaXRlbSk7XG5cbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgYXJyLmZvckVhY2goaSA9PiB0aGlzLmFkZChpKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblNldC5wcm90b3R5cGUubW92ZUl0ZW0gPSBfX19tb3ZlSXRlbTtcblxuLyoqIENoYW5nZXMgdGhlIHBvc2l0aW9uIG9mIGFuIGl0ZW0gaW4gdGhlIHNldCB1c2luZyBhIHByb3ZpZGVkIGluZGV4XG4gKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgaXRlbSBjb3VsZCBiZSBtb3ZlZFxuICogQHBhcmFtIG5ld0luZGV4IFRoZSBuZXcgaW5kZXggb2YgdGhlIGl0ZW0uIElmIHRoZSBpbmRleCBpcyBuZWdhdGl2ZSwgaXQgd2lsbCBiZSB0cmVhdGVkIGFzIGFuIG9mZnNldCBmcm9tIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxuKi9cbmZ1bmN0aW9uIF9fX21vdmVJbmRleDxUPih0aGlzOiBTZXQ8VD4sIGl0ZW06VCwgbmV3SW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oYXMoaXRlbSkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGFyciA9IFsuLi50aGlzXTtcblxuICAgIGNvbnN0IGl0ZW1JbmRleCA9IGFyci5pbmRleE9mKGl0ZW0pO1xuICAgIGlmIChpdGVtSW5kZXggPT09IC0xKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAobmV3SW5kZXggPCAwKSBuZXdJbmRleCA9IGFyci5sZW5ndGggKyBuZXdJbmRleDtcblxuICAgIGFyci5zcGxpY2UoaXRlbUluZGV4LCAxKTtcbiAgICBhcnIuc3BsaWNlKG5ld0luZGV4LCAwLCBpdGVtKTtcblxuICAgIHRoaXMuY2xlYXIoKTtcbiAgICBhcnIuZm9yRWFjaChpID0+IHRoaXMuYWRkKGkpKTtcblxuICAgIHJldHVybiB0cnVlO1xufVxuU2V0LnByb3RvdHlwZS5tb3ZlSW5kZXggPSBfX19tb3ZlSW5kZXg7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXRJbmRleDxUU3RlcFR5cGU+KHNldDogU2V0PFRTdGVwVHlwZT4sIGluZGV4OiBudW1iZXIpOiBUU3RlcFR5cGV8dW5kZWZpbmVkIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHNldCkge1xuICAgICAgICBpZiAoaSA9PT0gaW5kZXgpIHJldHVybiBpdGVtO1xuICAgICAgICBpKys7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfX19nZXRFeHRlbmRzPEsgZXh0ZW5kcyBhYnN0cmFjdCBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiB1bmtub3duPih0aGlzOiBDb21wb25lbnRNYXAsIHR5cGU6IEspIHtcbiAgICBjb25zdCByZXR1cm5WYWw6SW5zdGFuY2VUeXBlPEs+W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssdmFsdWVdIG9mIHRoaXMpIGlmICh2YWx1ZSBpbnN0YW5jZW9mIHR5cGUpIHJldHVyblZhbC5wdXNoKHZhbHVlIGFzIEluc3RhbmNlVHlwZTxLPik7XG4gICAgcmV0dXJuIHJldHVyblZhbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVXBncmFkZShzdWJqZWN0OiBFbGVtZW50LCB1cGdyYWRlOiBJbnN0YW5jZVR5cGU8Q29tcG9uZW50PiwgdGFyZ2V0PzogRWxlbWVudHxudWxsLCBwcm9wYWdhdGVUb1RhcmdldENoaWxkcmVuID0gZmFsc2UsIHByb3BhZ2F0ZVRvU3ViamVjdFRvQ2hpbGRyZW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIC8vY29uc29sZS5sb2coXCJyZWdpc3RlclVwZ3JhZGVcIiwge3N1YmplY3QsIHVwZ3JhZGUsIHRhcmdldCwgcHJvcGFnYXRlVG9UYXJnZXRDaGlsZHJlbiwgcHJvcGFnYXRlU3ViamVjdFRvQ2hpbGRyZW46IHByb3BhZ2F0ZVRvU3ViamVjdFRvQ2hpbGRyZW59KTtcbiAgICAvLyBTZXQgdGhlIHVwZ3JhZGUgb24gdGhlIHN1YmplY3RcbiAgICBmb3JFYWNoQ2hpbGRBbmRPclBhcmVudChzdWJqZWN0LCBwcm9wYWdhdGVUb1N1YmplY3RUb0NoaWxkcmVuLCBjaGlsZCA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJyZWdpc3RlclVwZ3JhZGU6IHN1YmplY3RcIiwgY2hpbGQpO1xuICAgICAgICBpZiAoIWNoaWxkLnVwZ3JhZGVzKSB7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCkgYXMgQ29tcG9uZW50TWFwO1xuICAgICAgICAgICAgbWFwLmdldEV4dGVuZHMgPSBfX19nZXRFeHRlbmRzO1xuICAgICAgICAgICAgY2hpbGQudXBncmFkZXMgPSBtYXA7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZC51cGdyYWRlcy5zZXQodXBncmFkZS5jb25zdHJ1Y3RvciwgdXBncmFkZSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXBlYXQgZm9yIHRhcmdldFxuICAgIGlmICh0YXJnZXQpIGZvckVhY2hDaGlsZEFuZE9yUGFyZW50KHRhcmdldCwgcHJvcGFnYXRlVG9UYXJnZXRDaGlsZHJlbiwgY2hpbGQgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoKSBhcyBDb21wb25lbnRNYXA7XG4gICAgICAgICAgICBtYXAuZ2V0RXh0ZW5kcyA9IF9fX2dldEV4dGVuZHM7XG4gICAgICAgICAgICBjaGlsZC50YXJnZXRpbmdDb21wb25lbnRzID0gbWFwO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQudGFyZ2V0aW5nQ29tcG9uZW50cy5zZXQodXBncmFkZS5jb25zdHJ1Y3RvciwgdXBncmFkZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hDaGlsZEFuZE9yUGFyZW50KHN0YXJ0OiBFbGVtZW50LCBkb0NoaWxkcmVuOiBib29sZWFuLCBjYWxsYmFjazogKGNoaWxkOiBFbGVtZW50KSA9PiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKGRvQ2hpbGRyZW4pIGZvckVhY2hDaGlsZChzdGFydCwgY2FsbGJhY2spO1xuICAgIGNhbGxiYWNrKHN0YXJ0KTtcbn1cblxuZnVuY3Rpb24gZm9yRWFjaENoaWxkKHN0YXJ0OiBFbGVtZW50LCBjYWxsYmFjazogKGNoaWxkOiBFbGVtZW50KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3JFYWNoQ2hpbGQoc3RhcnQuY2hpbGRyZW5baV0hLCBjYWxsYmFjayk7XG4gICAgICAgIGNhbGxiYWNrKHN0YXJ0LmNoaWxkcmVuW2ldISk7XG4gICAgfVxufVxuXG4vKiogUXVpY2stYW5kLWRpcnR5IGVudW0gb2Ygc3RyaW5ncyB1c2VkIG9mdGVuIHRocm91Z2hvdXQgdGhlIGNvZGUgKi9cbmVudW0gc3RycyB7XG4gICAgdHJhbnNpdGlvbkR1ciA9IFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLFxuICAgIGFuaW1EdXIgPSBcImFuaW1hdGlvbi1kdXJhdGlvblwiLFxuICAgIG1hcmdpblRvcCA9IFwibWFyZ2luLXRvcFwiLFxuICAgIGNsYXNzSXNPcGVuID0gXCJpcy1vcGVuXCIsXG4gICAgY2xhc3NBZGphY2VudCA9IFwiYWRqYWNlbnRcIixcbiAgICBjbGFzc0RldGFpbHNJbm5lciA9IFwianMtYmNkLWRldGFpbHMtaW5uZXJcIixcbiAgICBlcnJJdGVtID0gXCJFcnJvciBJdGVtOlwiXG59XG5cbndpbmRvdy5xdWVyeVBhcmFtcyA9IHt9O1xuXG5pZiAod2luZG93LmxvY2F0aW9uLnNlYXJjaFswXSA9PT0gJz8nKVxuICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpLnNwbGl0KCcmJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHBhcmFtID0+IHBhcmFtLnNwbGl0KCc9JykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2gocGFyYW0gPT4gd2luZG93LnF1ZXJ5UGFyYW1zW3BhcmFtWzBdIS50cmltKCldID0gcGFyYW1bMV0/LnRyaW0oKSA/PyAnJyk7XG5cblxuLyoqKlxuICogICAgICQkJCQkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXFxuICogICAgJCQgIF9fJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICogICAgJCQgLyAgXFxfX3wgJCQkJCQkXFwgICQkJCQkJFxcJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCRcXCAgJCQkJCQkJFxcICAgJCQkJCQkXFwgICQkJCQkJCRcXCAgJCQkJCQkXFxcbiAqICAgICQkIHwgICAgICAkJCAgX18kJFxcICQkICBfJCQgIF8kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCBcXF8kJCAgX3xcbiAqICAgICQkIHwgICAgICAkJCAvICAkJCB8JCQgLyAkJCAvICQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfCQkIHwgICQkIHwkJCQkJCQkJCB8JCQgfCAgJCQgfCAgJCQgfFxuICogICAgJCQgfCAgJCRcXCAkJCB8ICAkJCB8JCQgfCAkJCB8ICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCAgIF9fX198JCQgfCAgJCQgfCAgJCQgfCQkXFxcbiAqICAgIFxcJCQkJCQkICB8XFwkJCQkJCQgIHwkJCB8ICQkIHwgJCQgfCQkJCQkJCQgIHxcXCQkJCQkJCAgfCQkIHwgICQkIHxcXCQkJCQkJCRcXCAkJCB8ICAkJCB8ICBcXCQkJCQgIHxcbiAqICAgICBcXF9fX19fXy8gIFxcX19fX19fLyBcXF9ffCBcXF9ffCBcXF9ffCQkICBfX19fLyAgXFxfX19fX18vIFxcX198ICBcXF9ffCBcXF9fX19fX198XFxfX3wgIFxcX198ICAgXFxfX19fL1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxfX3xcbiAqICAgICQkJCQkJCQkXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXFxuICogICAgXFxfXyQkICBfX3wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAkJCB8ICAgICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCQkXFwgJCQgfCAgJCRcXCAgJCQkJCQkXFwgICAkJCQkJCRcXFxuICogICAgICAgJCQgfCAgICQkICBfXyQkXFwgIFxcX19fXyQkXFwgJCQgIF9fX19ffCQkIHwgJCQgIHwkJCAgX18kJFxcICQkICBfXyQkXFxcbiAqICAgICAgICQkIHwgICAkJCB8ICBcXF9ffCAkJCQkJCQkIHwkJCAvICAgICAgJCQkJCQkICAvICQkJCQkJCQkIHwkJCB8ICBcXF9ffFxuICogICAgICAgJCQgfCAgICQkIHwgICAgICAkJCAgX18kJCB8JCQgfCAgICAgICQkICBfJCQ8ICAkJCAgIF9fX198JCQgfFxuICogICAgICAgJCQgfCAgICQkIHwgICAgICBcXCQkJCQkJCQgfFxcJCQkJCQkJFxcICQkIHwgXFwkJFxcIFxcJCQkJCQkJFxcICQkIHxcbiAqICAgICAgIFxcX198ICAgXFxfX3wgICAgICAgXFxfX19fX19ffCBcXF9fX19fX198XFxfX3wgIFxcX198IFxcX19fX19fX3xcXF9ffFxuICpcbiAqXG4gKlxuICovXG5cbi8qKiBBbnkgY29tcG9uZW50IHRoYXQgY2FuIGJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBieSBNYXRlcmlhbCBEZXNpZ24gTGl0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnQge1xuICAgIG5ldyhlbGVtZW50OiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYW55O1xufVxuXG4vKiogQW55IGNvbXBvbmVudCB0aGF0IGRlZmluZXMgdGhlIHJlYWRvbmx5IGBjc3NDbGFzc2AgYW5kIGBhc1N0cmluZ2AgcHJvcGVydGllcyAqL1xuZXhwb3J0IGludGVyZmFjZSBCQ0RDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHJlYWRvbmx5IGFzU3RyaW5nOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgY3NzQ2xhc3M6IHN0cmluZztcbn1cblxuLy8gQ3JlYXRlIGEgbWFwIHRoYXQgZ3VhcmFudGVlIGFuIGluc3RhbmNlIG9mIHRoZSBrZXlcbmV4cG9ydCB0eXBlIENvbXBvbmVudE1hcCA9IE1hcDxDb21wb25lbnQsIEluc3RhbmNlVHlwZTxDb21wb25lbnQ+PiAmIHtcbiAgICBnZXQ8SyBleHRlbmRzIENvbXBvbmVudD4oa2V5OiBLKTogSW5zdGFuY2VUeXBlPEs+fHVuZGVmaW5lZDtcbiAgICBzZXQ8SyBleHRlbmRzIENvbXBvbmVudD4oa2V5OiBLLCB2YWx1ZTogSW5zdGFuY2VUeXBlPEs+KTogQ29tcG9uZW50TWFwO1xuXG4gICAgLyoqIEZldGNoZXMgYWxsIGNsYXNzZXMgdGhhdCBleHRlbmQgdGhlIHNwZWNpZmllZCBjbGFzcyAqL1xuICAgIGdldEV4dGVuZHM8SyBleHRlbmRzIGFic3RyYWN0IG5ldyguLi5hcmdzOmFueVtdKT0+dW5rbm93bj4oa2V5OiBLKTogSW5zdGFuY2VUeXBlPEs+W107XG59XG5cbi8qKiBWYXJpYWJsZSB0byBzdG9yZSBjb21wb25lbnRzIHRoYXQgd2UnbGwgYmUgcmVnaXN0ZXJpbmcgb24gRE9NIGluaXRpYWxpemF0aW9uICovXG5jb25zdCBjb21wb25lbnRzVG9SZWdpc3RlcjpCQ0RDb21wb25lbnRbXSA9IFtdO1xuXG4vKiogUmVnaXN0ZXJzIGEgc2luZ2xlIE1ETCBjb21wb25lbnQgdGhhdCBoYXMgdGhlIHN0YXRpYyByZWFkb25seSBwcm9wZXJ0aWVzIGBjc3NDbGFzc2AgYW5kIGBhc1N0cmluZ2AgZGVmaW5lZFxuICAgIEBwYXJhbSBjb21wb25lbnQgVGhlIEJDRENvbXBvbmVudCB0byByZWdpc3RlclxuICAgIEB0aHJvd3Mgbm90aGluZyAtIHRoaXMgZnVuY3Rpb24gZ3JhY2VmdWxseSBoYW5kbGVzIGVycm9ycyBpbiB0aGUgZm9ybSBvZiBgY29uc29sZS5lcnJvcmAgY2FsbHMgaW5zdGVhZCBvZiB0aHJvd2luZyBhY3R1YWwgZXJyb3JzXG4gICAgQHJldHVybnMgd2hldGhlciBvciBub3QgYW4gZXJyb3Igb2NjdXJyZWQgd2l0aCB0aGUgZXJyb3IgYXMgdGhlIHJldHVybiB2YWx1ZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJDRENvbXBvbmVudChjb21wb25lbnQ6QkNEQ29tcG9uZW50KTpib29sZWFufEVycm9yIHtcbiAgICB0cnl7XG5cbiAgICAgICAgbWRsLmNvbXBvbmVudEhhbmRsZXIucmVnaXN0ZXIoe1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IGNvbXBvbmVudCxcbiAgICAgICAgICAgIGNsYXNzQXNTdHJpbmc6IGNvbXBvbmVudC5hc1N0cmluZyxcbiAgICAgICAgICAgIGNzc0NsYXNzOiBjb21wb25lbnQuY3NzQ2xhc3MsXG4gICAgICAgICAgICB3aWRnZXQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBtZGwuY29tcG9uZW50SGFuZGxlci51cGdyYWRlRWxlbWVudHMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb21wb25lbnQuY3NzQ2xhc3MpKTtcblxuICAgIH1jYXRjaChlOnVua25vd24pe1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiW0JDRC1Db21wb25lbnRzXSBFcnJvciByZWdpc3RlcmluZyBjb21wb25lbnRcIiwgY29tcG9uZW50LmFzU3RyaW5nLCBcIndpdGggY2xhc3NcIiwgY29tcG9uZW50LmNzc0NsYXNzLCBcIjpcXG5cIiwgZSk7XG4gICAgICAgIHJldHVybiBlIGFzIEVycm9yO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8qKiBUZWxsIE1ETCBhYm91dCBvdXIgc2hpbnkgbmV3IGNvbXBvbmVudHNcbiAgICBAcGFyYW0gY29tcG9uZW50cyBUaGUgY29tcG9uZW50cyB0byByZWdpc3Rlci4gRGVmYXVsdHMgdG8gdGhlIGdsb2JhbCBiY2RDb21wb25lbnRzIGFycmF5IGlmIG5vdCBzcGVjaWZpZWQuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQkNEQ29tcG9uZW50cyguLi5jb21wb25lbnRzOkJDRENvbXBvbmVudFtdKTp2b2lke1xuXG4gICAgY29uc3QgY29tcG9uZW50QXJyID0gY29tcG9uZW50cy5sZW5ndGggPyBjb21wb25lbnRzIDogY29tcG9uZW50c1RvUmVnaXN0ZXI7XG5cbiAgICAvLyBUZWxsIG1kbCBhYm91dCBvdXIgc2hpbnkgbmV3IGNvbXBvbmVudHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXBvbmVudEFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICByZWdpc3RlckJDRENvbXBvbmVudChjb21wb25lbnRBcnJbaV0hKTtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUuZGVidWcoXCJbQkNELUNvbXBvbmVudHNdIFJlZ2lzdGVyZWQgdGhlIGZvbGxvd2luZyBjb21wb25lbnRzOlwiLCBjb21wb25lbnRBcnIubWFwKGMgPT4gYFxcbiAgICAke2MuYXNTdHJpbmd9YCkuam9pbignJykpO1xufVxuXG5cblxuLyoqKlxuICogICAgICQkJCQkJFxcICAgICAgICAgICAgJCRcXCAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgJCRcXCAgICAgICAkJFxcXG4gKiAgICAkJCAgX18kJFxcICAgICAgICAgICAkJCB8JCQgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX198JCQgfCAgICAgICQkIHxcbiAqICAgICQkIC8gIFxcX198ICQkJCQkJFxcICAkJCB8JCQgfCAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJFxcICQkXFwgJCQkJCQkJFxcICAkJCB8ICQkJCQkJFxcXG4gKiAgICAkJCB8ICAgICAgJCQgIF9fJCRcXCAkJCB8JCQgfCBcXF9fX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffCQkIHwkJCAgX18kJFxcICQkIHwkJCAgX18kJFxcXG4gKiAgICAkJCB8ICAgICAgJCQgLyAgJCQgfCQkIHwkJCB8ICQkJCQkJCQgfCQkIC8gICQkIHxcXCQkJCQkJFxcICAkJCB8JCQgfCAgJCQgfCQkIHwkJCQkJCQkJCB8XG4gKiAgICAkJCB8ICAkJFxcICQkIHwgICQkIHwkJCB8JCQgfCQkICBfXyQkIHwkJCB8ICAkJCB8IFxcX19fXyQkXFwgJCQgfCQkIHwgICQkIHwkJCB8JCQgICBfX19ffFxuICogICAgXFwkJCQkJCQgIHxcXCQkJCQkJCAgfCQkIHwkJCB8XFwkJCQkJCQkIHwkJCQkJCQkICB8JCQkJCQkJCAgfCQkIHwkJCQkJCQkICB8JCQgfFxcJCQkJCQkJFxcXG4gKiAgICAgXFxfX19fX18vICBcXF9fX19fXy8gXFxfX3xcXF9ffCBcXF9fX19fX198JCQgIF9fX18vIFxcX19fX19fXy8gXFxfX3xcXF9fX19fX18vIFxcX198IFxcX19fX19fX3xcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX198XG4gKi9cblxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCQ0RfQ29sbGFwc2libGVQYXJlbnQge1xuICAgIC8vIEZvciBjaGlsZHJlbiB0byBzZXRcbiAgICBkZXRhaWxzITpIVE1MRWxlbWVudDtcbiAgICBkZXRhaWxzX2lubmVyITpIVE1MRWxlbWVudDtcbiAgICBzdW1tYXJ5ITpIVE1MRWxlbWVudDtcbiAgICBvcGVuSWNvbnM5MGRlZyE6SFRNTENvbGxlY3Rpb247XG5cbiAgICAvLyBGb3IgdXMgdG8gc2V0XG4gICAgc2VsZjpIVE1MRWxlbWVudDtcbiAgICBhZGphY2VudDpib29sZWFuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcihlbG06SFRNTEVsZW1lbnQpe1xuICAgICAgICB0aGlzLnNlbGYgPSBlbG07XG4gICAgICAgIHRoaXMuYWRqYWNlbnQgPSBlbG0uY2xhc3NMaXN0LmNvbnRhaW5zKHN0cnMuY2xhc3NBZGphY2VudCk7XG4gICAgfVxuXG4gICAgaXNPcGVuKCk6Ym9vbGVhbiB7Ly90aGlzLmRlYnVnQ2hlY2soKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV0YWlscy5jbGFzc0xpc3QuY29udGFpbnMoc3Rycy5jbGFzc0lzT3BlbikgfHwgdGhpcy5zdW1tYXJ5LmNsYXNzTGlzdC5jb250YWlucyhzdHJzLmNsYXNzSXNPcGVuKTtcbiAgICB9XG5cbiAgICAvKiogVG9nZ2xlIHRoZSBjb2xsYXBzaWJsZSBtZW51LiAqL1xuICAgIHRvZ2dsZShkb1NldER1cmF0aW9uOmJvb2xlYW4gPSB0cnVlKSB7Ly90aGlzLmRlYnVnQ2hlY2soKTtcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKCkpIHsgdGhpcy5jbG9zZShkb1NldER1cmF0aW9uKTsgfSBlbHNlIHsgdGhpcy5vcGVuKGRvU2V0RHVyYXRpb24pOyB9XG4gICAgfVxuXG4gICAgLyoqIFJlLWV2YWx1YXRlIHRoZSBjb2xsYXBzaWJsZSdzIGN1cnJlbnQgc3RhdGUuICovXG4gICAgcmVFdmFsKGRvU2V0RHVyYXRpb24/OmZhbHNlKTp2b2lkXG4gICAgcmVFdmFsKGRvU2V0RHVyYXRpb24/OnRydWUsIGluc3RhbnQ/OnRydWUpOnZvaWRcbiAgICByZUV2YWwoZG9TZXREdXJhdGlvbjpib29sZWFuID0gdHJ1ZSwgaW5zdGFudD86dHJ1ZSk6dm9pZCB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzT3BlbigpKSB0aGlzLm9wZW4oZG9TZXREdXJhdGlvbiwgaW5zdGFudCk7XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmNsb3NlKGRvU2V0RHVyYXRpb24sIGluc3RhbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRlQ2hhbmdlUHJvbWlzZShkZXNpcmVkU3RhdGU/OmJvb2xlYW4pOlByb21pc2U8dm9pZD57XG5cbiAgICAgICAgaWYgKChkZXNpcmVkU3RhdGUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmlzT3BlbigpID09PSBkZXNpcmVkU3RhdGUpXG4gICAgICAgICAgICB8fCBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZGV0YWlsc19pbm5lcikudHJhbnNpdGlvbkR1cmF0aW9uID09PSAnMHMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PnsgICB0aGlzLm9uVHJhbnNpdGlvbkVuZCgpOyByZXNvbHZlKCk7ICB9KSApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbkVuZEZ1bmN0ID0gdGhpcy5vblRyYW5zaXRpb25FbmQuYmluZCh0aGlzKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJvcGVydHlOYW1lICE9PSAnbWFyZ2luLXRvcCcpIHJldHVybjtcbiAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgICAgICAgICAgIGFmdGVyRGVsYXkoMTAsICgpPT4gIHt0cmFuc2l0aW9uRW5kRnVuY3QoZXZlbnQpOyByZXNvbHZlKCk7fSAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgICAgIC8vIEltcGxlbWVudGVkIGFzIGEgc2VwYXJhdGUgZnVuY3Rpb24gYmVjYXVzZSBpdCBcImF2b2lkc1wiIGEgY3ljbGljIHJlZmVyZW5jZS5cbiAgICAgICAgICAgIGNvbnN0IGRldGFpbHNfaW5uZXIgPSB0aGlzLmRldGFpbHNfaW5uZXI7XG4gICAgICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcigpeyBkZXRhaWxzX2lubmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBsaXN0ZW5lcik7IH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIE9wZW4gdGhlIGNvbGxhcHNpYmxlIG1lbnUgY29udGVudCAqL1xuICAgIG9wZW4oZG9TZXREdXJhdGlvbiA9IHRydWUsIGluc3RhbnQgPSBmYWxzZSkgey8vdGhpcy5kZWJ1Z0NoZWNrKCk7XG4gICAgICAgIGNvbnN0IHJldHVyblZhbCA9IHRoaXMuc3RhdGVDaGFuZ2VQcm9taXNlKHRydWUpO1xuXG4gICAgICAgIGlmICghaW5zdGFudCkgdGhpcy5ldmFsdWF0ZUR1cmF0aW9uKGRvU2V0RHVyYXRpb24pO1xuXG4gICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5hcmlhSGlkZGVuID0gJ2ZhbHNlJztcbiAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICAgIEJDRF9Db2xsYXBzaWJsZVBhcmVudC5zZXREaXNhYmxlZCh0aGlzLmRldGFpbHNfaW5uZXIsIGZhbHNlLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5kZXRhaWxzLmNsYXNzTGlzdC5hZGQoc3Rycy5jbGFzc0lzT3Blbik7XG4gICAgICAgIHRoaXMuc3VtbWFyeS5jbGFzc0xpc3QuYWRkKHN0cnMuY2xhc3NJc09wZW4pO1xuXG4gICAgICAgIG5lc3RBbmltYXRpb25GcmFtZXMoMywgKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUubWFyZ2luVG9wID0gdGhpcy5kZXRhaWxzLmdldEF0dHJpYnV0ZSgnZGF0YS1tYXJnaW4tdG9wJykgfHwgJzAnO1xuXG4gICAgICAgICAgICBpZiAoaW5zdGFudCkgbmVzdEFuaW1hdGlvbkZyYW1lcygyLCAoKT0+XG4gICAgICAgICAgICAgICAgdGhpcy5ldmFsdWF0ZUR1cmF0aW9uLmJpbmQodGhpcywgZG9TZXREdXJhdGlvbiwgdHJ1ZSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGluc3RhbnQpIHJldHVybiB0aGlzLmluc3RhbnRUcmFuc2l0aW9uKCk7XG5cbiAgICAgICAgcmV0dXJuIHJldHVyblZhbDtcbiAgICB9XG5cbiAgICBoYXNDbG9zZWRGaW5hbCA9IGZhbHNlO1xuICAgIC8qKiBDbG9zZSB0aGUgY29sbGFwc2libGUgY29udGVudCAqL1xuICAgIGNsb3NlKGRvU2V0RHVyYXRpb246Ym9vbGVhbiA9IHRydWUsIGluc3RhbnQgPSBmYWxzZSwgZmluYWwgPSBmYWxzZSwgZHVyYXRpb24/OiBudW1iZXIpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgQ2xvc2luZyBjb2xsYXBzaWJsZSAtIGRvU2V0RHVyYXRpb246ICR7ZG9TZXREdXJhdGlvbn0sIGluc3RhbnQ6ICR7aW5zdGFudH0sIGZpbmFsOiAke2ZpbmFsfSwgZHVyYXRpb246ICR7ZHVyYXRpb259YCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2xvc2VkRmluYWwpIHJldHVybjtcblxuICAgICAgICBpZiAoZmluYWwpe1xuICAgICAgICAgICAgdGhpcy5zdW1tYXJ5LnVwZ3JhZGVzIS5nZXRFeHRlbmRzKEJDRF9Db2xsYXBzaWJsZVBhcmVudClbMF0hLmhhc0Nsb3NlZEZpbmFsID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGV0YWlscy51cGdyYWRlcyEuZ2V0RXh0ZW5kcyhCQ0RfQ29sbGFwc2libGVQYXJlbnQpWzBdIS5oYXNDbG9zZWRGaW5hbCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHVyYXRpb24gPT09IHVuZGVmaW5lZCkgdGhpcy5ldmFsdWF0ZUR1cmF0aW9uKGRvU2V0RHVyYXRpb24sIGZhbHNlKTtcbiAgICAgICAgZWxzZSB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gYCR7ZHVyYXRpb259bXNgO1xuXG4gICAgICAgIGNvbnN0IHJldHVyblZhbCA9IHRoaXMuc3RhdGVDaGFuZ2VQcm9taXNlKGZhbHNlKTtcblxuICAgICAgICAvLyBSZWdpc3RlcnMgZm9yIHRoZSBldmVudCB0d2ljZSBiZWNhdXNlIHRoZSBldmVudCBhcHBlYXJzIHRvIGZpcmUgdHdpY2UsIGF0IGxlYXN0IGluIENocm9taXVtIGJyb3dzZXJzLlxuICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUubWFyZ2luVG9wID0gYC0ke3RoaXMuZGV0YWlsc19pbm5lci5vZmZzZXRIZWlnaHQgKyAzMn1weGA7XG5cbiAgICAgICAgdGhpcy5kZXRhaWxzLmNsYXNzTGlzdC5yZW1vdmUoc3Rycy5jbGFzc0lzT3Blbik7XG4gICAgICAgIHRoaXMuc3VtbWFyeS5jbGFzc0xpc3QucmVtb3ZlKHN0cnMuY2xhc3NJc09wZW4pO1xuICAgICAgICBCQ0RfQ29sbGFwc2libGVQYXJlbnQuc2V0RGlzYWJsZWQodGhpcy5kZXRhaWxzX2lubmVyLCB0cnVlKTtcblxuICAgICAgICBpZiAoaW5zdGFudCkge1xuICAgICAgICAgICAgbmVzdEFuaW1hdGlvbkZyYW1lcygyLCAoKSA9PiB0aGlzLmV2YWx1YXRlRHVyYXRpb24oZG9TZXREdXJhdGlvbiwgZmFsc2UpICk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW50VHJhbnNpdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbmFsKSB0aGlzLnN1bW1hcnkuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcblxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsO1xuICAgIH1cblxuICAgIG9uVHJhbnNpdGlvbkVuZChldmVudD86VHJhbnNpdGlvbkV2ZW50KTp2b2lkIHtcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnByb3BlcnR5TmFtZSAhPT0gJ21hcmdpbi10b3AnKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIEJDRF9Db2xsYXBzaWJsZVBhcmVudC5zZXREaXNhYmxlZCh0aGlzLmRldGFpbHNfaW5uZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuYXJpYUhpZGRlbiA9ICd0cnVlJztcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ25vbmUnO1xuICAgICAgICAgICAgQkNEX0NvbGxhcHNpYmxlUGFyZW50LnNldERpc2FibGVkKHRoaXMuZGV0YWlsc19pbm5lciwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluc3RhbnRUcmFuc2l0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy5kZXRhaWxzX2lubmVyKSB7XG4gICAgICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gYDBzYDtcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5zdHlsZS5hbmltYXRpb25EdXJhdGlvbiA9IGAwc2A7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGljb24gb2YgdGhpcy5vcGVuSWNvbnM5MGRlZykge1xuICAgICAgICAgICAgICAgIChpY29uIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5hbmltYXRpb25EdXJhdGlvbiA9IGAwc2A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vblRyYW5zaXRpb25FbmQoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyKSA9PiByKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzZXREaXNhYmxlZChlbG06SFRNTEVsZW1lbnQsIGRpc2FibGVkOmJvb2xlYW4sIGFsbG93UG9pbnRlckV2ZW50cyA9IHRydWUpOnZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGVsbS5jaGlsZHJlbilcbiAgICAgICAgICAgIHRoaXMuc2V0RGlzYWJsZWQoY2hpbGQgYXMgSFRNTEVsZW1lbnQsIGRpc2FibGVkKTtcblxuICAgICAgICBjb25zdCB3YXNEaXNhYmxlZCA9IGVsbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2FzLWRpc2FibGVkJykgYXMgJ3RydWUnfCdmYWxzZSd8bnVsbDtcbiAgICAgICAgY29uc3Qgb2xkVGFiSW5kZXggPSBlbG0uZ2V0QXR0cmlidXRlKCdkYXRhLW9sZC10YWJpbmRleCcpO1xuXG4gICAgICAgIGNvbnN0IGZvcmNlUG9pbnRlckV2ZW50cyA9IGVsbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZm9yY2UtcG9pbnRlci1ldmVudHMnKSBhcyAndHJ1ZSd8J2ZhbHNlJ3xudWxsO1xuICAgICAgICBpZiAoZm9yY2VQb2ludGVyRXZlbnRzICE9PSBudWxsKSBhbGxvd1BvaW50ZXJFdmVudHMgPSAoZm9yY2VQb2ludGVyRXZlbnRzID09PSAndHJ1ZScpO1xuXG4gICAgICAgIGNvbnN0IGZvcmNlRGlzYWJsZWQgPSBlbG0uZ2V0QXR0cmlidXRlKCdkYXRhLWZvcmNlLWRpc2FibGVkJykgYXMgJ3RydWUnfCdmYWxzZSd8bnVsbDtcbiAgICAgICAgaWYgKGZvcmNlRGlzYWJsZWQgIT09IG51bGwpIGRpc2FibGVkID0gKGZvcmNlRGlzYWJsZWQgPT09ICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgICAgICBpZiAod2FzRGlzYWJsZWQgPT09IG51bGwpIGVsbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2FzLWRpc2FibGVkJywgZWxtLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gICAgICAgICAgICBlbG0uYXJpYURpc2FibGVkID0gJ3RydWUnO1xuXG4gICAgICAgICAgICBpZiAob2xkVGFiSW5kZXggPT09IG51bGwpIGVsbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtb2xkLXRhYmluZGV4JywgZWxtLmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKSB8fCAnJyk7XG4gICAgICAgICAgICBlbG0udGFiSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc2V0IGRpc2FibGVkJywgZWxtIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQsIGVsbSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtd2FzLWRpc2FibGVkJyk7XG5cbiAgICAgICAgICAgIGlmICh3YXNEaXNhYmxlZCA9PT0gJ3RydWUnKSBlbG0uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgICAgICAgICAgIGVsc2UgZWxtLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICAgICAgICAgICAgZWxtLmFyaWFEaXNhYmxlZCA9IHdhc0Rpc2FibGVkID09PSAndHJ1ZScgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgICAgICAgICBpZiAob2xkVGFiSW5kZXggIT09IG51bGwgfHwgZWxtLmhhc0F0dHJpYnV0ZSgnZGF0YS1vbGQtdGFiaW5kZXgnKSkge1xuICAgICAgICAgICAgICAgIG9sZFRhYkluZGV4ID8gZWxtLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCBvbGRUYWJJbmRleCkgOiBlbG0ucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtb2xkLXRhYmluZGV4Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlbG0uc3R5bGUucG9pbnRlckV2ZW50cyA9IGFsbG93UG9pbnRlckV2ZW50cyA/ICcnIDogJ25vbmUnO1xuXG4gICAgfVxuXG4gICAgLyogRGV0ZXJtaW5lcyB3aGF0IHRoZSB0cmFuc2l0aW9uIGFuZCBhbmltYXRpb24gZHVyYXRpb24gb2YgdGhlIGNvbGxhcHNpYmxlIG1lbnUgaXMgKi9cbiAgICBldmFsdWF0ZUR1cmF0aW9uKGRvUnVuOmJvb2xlYW4gPSB0cnVlLCBvcGVuaW5nOmJvb2xlYW49dHJ1ZSkgey8vdGhpcy5kZWJ1Z0NoZWNrKCk7XG4gICAgICAgIGlmIChkb1J1biAmJiB0aGlzLmRldGFpbHNfaW5uZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSB0aGlzLmRldGFpbHNfaW5uZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAkeyhvcGVuaW5nID8gMjUwIDogMzAwKSArICgob3BlbmluZyA/IDAuMyA6IDAuMzUpICogKGNvbnRlbnRIZWlnaHQgKyAzMikpfW1zYDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaWNvbiBvZiB0aGlzLm9wZW5JY29uczkwZGVnKSB7XG4gICAgICAgICAgICAgICAgKGljb24gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAkeyAyNTAgKyAoMC4xNSAqIChjb250ZW50SGVpZ2h0ICsgMzIpKSB9bXNgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQkNERGV0YWlscyBleHRlbmRzIEJDRF9Db2xsYXBzaWJsZVBhcmVudCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gXCJqcy1iY2QtZGV0YWlsc1wiO1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9IFwiQmVsbEN1YmljRGV0YWlsc1wiO1xuXG4gICAgLyoqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmRldGFpbHMgPSBlbGVtZW50O1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIGNvbnRhaW5lciBlbGVtZW50IHRvIG1ha2UgYW5pbWF0aW9uIGdvIGJycnJcbiAgICAgICAgLy8gU2xpZ2h0bHkgb3Zlci1jb21wbGljYXRlZCBiZWNhdXNlLCB1aCwgRE9NIGRpZG4ndCB3YW50IHRvIGNvb3BlcmF0ZS5cbiAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5jbGFzc0xpc3QuYWRkKHN0cnMuY2xhc3NEZXRhaWxzSW5uZXIpO1xuXG4gICAgICAgIC8vIFRoZSBgY2hpbGRyZW5gIEhUTUxDb2xsZWN0aW9uIGlzIGxpdmUsIHNvIHdlJ3JlIGZldGNoaW5nIGVhY2ggZWxlbWVudCBhbmQgdGhyb3dpbmcgaXQgaW50byBhbiBhcnJheS4uLlxuICAgICAgICBjb25zdCB0ZW1wX2NoaWxkcmVuQXJyOkNoaWxkTm9kZVtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLmRldGFpbHMuY2hpbGROb2Rlcyl7XG4gICAgICAgICAgICB0ZW1wX2NoaWxkcmVuQXJyLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gLi4uYW5kIGFjdHVhbGx5IG1vdmluZyB0aGUgZWxlbWVudHMgaW50byB0aGUgbmV3IGRpdiBoZXJlLlxuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGVtcF9jaGlsZHJlbkFycil7XG4gICAgICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRldGFpbHMuYXBwZW5kQ2hpbGQodGhpcy5kZXRhaWxzX2lubmVyKTtcblxuICAgICAgICBpZiAodGhpcy5hZGphY2VudCkge1xuICAgICAgICAgICAgY29uc3QgdGVtcF9zdW1tYXJ5ID0gdGhpcy5zZWxmLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICBpZiAoIXRlbXBfc3VtbWFyeSB8fCAhdGVtcF9zdW1tYXJ5LmNsYXNzTGlzdC5jb250YWlucyhCQ0RTdW1tYXJ5LmNzc0NsYXNzKSkgLyogVGhyb3cgYW4gZXJyb3IqLyB7Y29uc29sZS5sb2coc3Rycy5lcnJJdGVtLCB0aGlzKTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIltCQ0QtREVUQUlMU10gRXJyb3I6IEFkamFjZW50IERldGFpbHMgZWxlbWVudCBtdXN0IGJlIHByZWNlZGVkIGJ5IGEgU3VtbWFyeSBlbGVtZW50LlwiKTt9XG4gICAgICAgICAgICB0aGlzLnN1bW1hcnkgPSB0ZW1wX3N1bW1hcnkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wX3N1bW1hcnkgPSB0aGlzLnNlbGYub3duZXJEb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuanMtYmNkLXN1bW1hcnlbZm9yPVwiJHt0aGlzLmRldGFpbHMuaWR9XCJgKTtcbiAgICAgICAgICAgIGlmICghdGVtcF9zdW1tYXJ5KSAvKiBUaHJvdyBhbiBlcnJvciovIHtjb25zb2xlLmxvZyhzdHJzLmVyckl0ZW0sIHRoaXMpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiW0JDRC1ERVRBSUxTXSBFcnJvcjogTm9uLWFkamFjZW50IERldGFpbHMgZWxlbWVudHMgbXVzdCBoYXZlIGEgU3VtbWFyeSBlbGVtZW50IHdpdGggYSBgZm9yYCBhdHRyaWJ1dGUgbWF0Y2hpbmcgdGhlIERldGFpbHMgZWxlbWVudCdzIGlkLlwiKTt9XG4gICAgICAgICAgICB0aGlzLnN1bW1hcnkgPSB0ZW1wX3N1bW1hcnkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wZW5JY29uczkwZGVnID0gdGhpcy5zdW1tYXJ5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ29wZW4taWNvbi05MENDJyk7XG5cbiAgICAgICAgY29uc3QgYm91bmRSZUV2YWwgPSB0aGlzLnJlRXZhbElmQ2xvc2VkLmJpbmQodGhpcyk7XG5cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoYm91bmRSZUV2YWwpO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRoaXMuZGV0YWlsc19pbm5lcik7XG5cbiAgICAgICAgdGhpcy5yZUV2YWwodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuc2VsZi5jbGFzc0xpc3QuYWRkKCdpbml0aWFsaXplZCcpO1xuXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZSh0aGlzLnNlbGYsIHRoaXMsIHRoaXMuc3VtbWFyeSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmVFdmFsSWZDbG9zZWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc09wZW4oKSkgdGhpcy5yZUV2YWwodHJ1ZSwgdHJ1ZSk7XG4gICAgfVxufVxuY29tcG9uZW50c1RvUmVnaXN0ZXIucHVzaChCQ0REZXRhaWxzKTtcblxuZXhwb3J0IGNsYXNzIEJDRFN1bW1hcnkgZXh0ZW5kcyBCQ0RfQ29sbGFwc2libGVQYXJlbnQge1xuICAgIHN0YXRpYyByZWFkb25seSBjc3NDbGFzcyA9ICdqcy1iY2Qtc3VtbWFyeSc7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JlbGxDdWJpY1N1bW1hcnknO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCkge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgICAgdGhpcy5zdW1tYXJ5ID0gZWxlbWVudDtcbiAgICAgICAgcmVnaXN0ZXJGb3JFdmVudHModGhpcy5zdW1tYXJ5LCB7YWN0aXZhdGU6IHRoaXMuYWN0aXZhdGUuYmluZCh0aGlzKX0pO1xuICAgICAgICB0aGlzLm9wZW5JY29uczkwZGVnID0gdGhpcy5zdW1tYXJ5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ29wZW4taWNvbi05MENDJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRqYWNlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBfZGV0YWlscyA9IHRoaXMuc2VsZi5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICBpZiAoISh0ZW1wX2RldGFpbHMgJiYgdGVtcF9kZXRhaWxzLmNsYXNzTGlzdC5jb250YWlucyhCQ0REZXRhaWxzLmNzc0NsYXNzKSkpIC8qIFRocm93IGFuIGVycm9yKi8ge2NvbnNvbGUubG9nKHN0cnMuZXJySXRlbSwgdGhpcyk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJbQkNELVNVTU1BUlldIEVycm9yOiBBZGphY2VudCBTdW1tYXJ5IGVsZW1lbnQgbXVzdCBiZSBwcm9jZWVkZWQgYnkgYSBEZXRhaWxzIGVsZW1lbnQuXCIpO31cbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IHRlbXBfZGV0YWlscyBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBfZGV0YWlscyA9IHRoaXMuc2VsZi5vd25lckRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc3VtbWFyeS5nZXRBdHRyaWJ1dGUoJ2ZvcicpID8/ICcnKTtcbiAgICAgICAgICAgIGlmICghdGVtcF9kZXRhaWxzKSAvKiBUaHJvdyBhbiBlcnJvciovIHtjb25zb2xlLmxvZyhzdHJzLmVyckl0ZW0sIHRoaXMpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiW0JDRC1TVU1NQVJZXSBFcnJvcjogTm9uLWFkamFjZW50IERldGFpbHMgZWxlbWVudHMgbXVzdCBoYXZlIGEgc3VtbWFyeSBlbGVtZW50IHdpdGggYSBgZm9yYCBhdHRyaWJ1dGUgbWF0Y2hpbmcgdGhlIERldGFpbHMgZWxlbWVudCdzIGlkLlwiKTt9XG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSB0ZW1wX2RldGFpbHMgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpdmVydGVkQ29tcGxldGlvbigpO1xuXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZSh0aGlzLnNlbGYsIHRoaXMsIHRoaXMuZGV0YWlscywgZmFsc2UsIHRydWUpO1xuICAgIH1cblxuICAgIGRpdmVydGVkQ29tcGxldGlvbigpe3F1ZXVlTWljcm90YXNrKCgpPT57XG5cbiAgICAgICAgY29uc3QgdGVtcF9pbm5lciA9IHRoaXMuZGV0YWlscy5xdWVyeVNlbGVjdG9yKGAuJHtzdHJzLmNsYXNzRGV0YWlsc0lubmVyfWApO1xuICAgICAgICBpZiAoIXRlbXBfaW5uZXIpIHt0aGlzLmRpdmVydGVkQ29tcGxldGlvbigpOyByZXR1cm47fVxuXG4gICAgICAgIHRoaXMuZGV0YWlsc19pbm5lciA9IHRlbXBfaW5uZXIgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5yZUV2YWwodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuc2VsZi5jbGFzc0xpc3QuYWRkKCdpbml0aWFsaXplZCcpO1xuICAgIH0pO31cblxuICAgIGNvcnJlY3RGb2N1cyhrZXlEb3duPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5RG93bikgZm9jdXNBbnlFbGVtZW50KHRoaXMuc3VtbWFyeSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgIGVsc2UgcmV0dXJuIG5lc3RBbmltYXRpb25GcmFtZXMoMiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdW1tYXJ5LmJsdXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWN0aXZhdGUoZXZlbnQ/Ok1vdXNlRXZlbnR8S2V5Ym9hcmRFdmVudCl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBpZiAoIWV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBwb2ludGVyIHR5cGUgaXMgdmFsaWRcbiAgICAgICAgICAgICgoJ3BvaW50ZXJUeXBlJyBpbiBldmVudCkgJiYgIWV2ZW50LnBvaW50ZXJUeXBlKVxuXG4gICAgICAgICAgICAvLyBSZWplY3QgdGhlIGV2ZW50IGlmIHRoZXJlJ3MgYW4gPGE+IGVsZW1lbnQgd2l0aGluIHRoZSBmaXJzdCA1IGVsZW1lbnRzIG9mIHRoZSBwYXRoXG4gICAgICAgICAgICB8fCAoJ3BhdGgnIGluIGV2ZW50ICYmIGV2ZW50LnBhdGggJiYgZXZlbnQucGF0aCBpbnN0YW5jZW9mIEFycmF5ICYmIGV2ZW50LnBhdGg/LnNsaWNlKDAsIDUpLnNvbWUoKGVsOkhUTUxFbGVtZW50KSA9PiBlbC50YWdOYW1lID09PSAnQScpKVxuICAgICAgICApIHJldHVybjtcblxuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmNvcnJlY3RGb2N1cyhldmVudCBpbnN0YW5jZW9mIEtleWJvYXJkRXZlbnQpO1xuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goQkNEU3VtbWFyeSk7XG5cbi8qKipcbiAqICAgICQkJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgICAgICAgJCRcXCAgICAgICAgICAgICAgICAgICQkJCQkXFwgICQkJCQkJFxcICAgJCQkJCQkXFwgICQkXFwgICAkJFxcXG4gKiAgICAkJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAkJCB8ICAgICAgJCQgfCAgICAgICAgICAgICAgICAgXFxfXyQkIHwkJCAgX18kJFxcICQkICBfXyQkXFwgJCQkXFwgICQkIHxcbiAqICAgICQkIHwgICQkIHwgJCQkJCQkXFwgICAkJCQkJCRcXCAgJCQkJCQkXFwgICAkJCQkJCRcXCAgICQkXFwgICAkJFxcICAgICAgICQkIHwkJCAvICBcXF9ffCQkIC8gICQkIHwkJCQkXFwgJCQgfFxuICogICAgJCQkJCQkJCAgfCQkICBfXyQkXFwgJCQgIF9fJCRcXCBcXF8kJCAgX3wgIFxcXyQkICBffCAgJCQgfCAgJCQgfCAgICAgICQkIHxcXCQkJCQkJFxcICAkJCB8ICAkJCB8JCQgJCRcXCQkIHxcbiAqICAgICQkICBfX19fLyAkJCB8ICBcXF9ffCQkJCQkJCQkIHwgICQkIHwgICAgICAkJCB8ICAgICQkIHwgICQkIHwkJFxcICAgJCQgfCBcXF9fX18kJFxcICQkIHwgICQkIHwkJCBcXCQkJCQgfFxuICogICAgJCQgfCAgICAgICQkIHwgICAgICAkJCAgIF9fX198ICAkJCB8JCRcXCAgICQkIHwkJFxcICQkIHwgICQkIHwkJCB8ICAkJCB8JCRcXCAgICQkIHwkJCB8ICAkJCB8JCQgfFxcJCQkIHxcbiAqICAgICQkIHwgICAgICAkJCB8ICAgICAgXFwkJCQkJCQkXFwgICBcXCQkJCQgIHwgIFxcJCQkJCAgfFxcJCQkJCQkJCB8XFwkJCQkJCQgIHxcXCQkJCQkJCAgfCAkJCQkJCQgIHwkJCB8IFxcJCQgfFxuICogICAgXFxfX3wgICAgICBcXF9ffCAgICAgICBcXF9fX19fX198ICAgXFxfX19fLyAgICBcXF9fX18vICBcXF9fX18kJCB8IFxcX19fX19fLyAgXFxfX19fX18vICBcXF9fX19fXy8gXFxfX3wgIFxcX198XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcJCQkJCQkICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9fX19fXy9cbiAqL1xuXG4vKiogU2ltcGxlIE1ETCBDbGFzcyB0byBoYW5kbGUgbWFraW5nIEpTT04gcHJldHR5IGFnYWluXG4gICAgVGFrZXMgdGhlIHRleHRDb250ZW50IG9mIHRoZSBlbGVtZW50IGFuZCBwYXJzZXMgaXQgYXMgSlNPTiwgdGhlbiByZS1zZXJpYWxpemVzIGl0IHdpdGggMiBzcGFjZXMgcGVyIGluZGVudC5cbiovXG5leHBvcnQgY2xhc3MgUHJldHR5SlNPTiB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLWJjZC1wcmV0dHlKU09OJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgYXNTdHJpbmcgPSAnYmNkX3ByZXR0eUpTT04nO1xuICAgIGVsZW1lbnRfOkhUTUxFbGVtZW50O1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKGVsZW1lbnQsIHRoaXMsIG51bGwsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZWxlbWVudC50ZXh0Q29udGVudCA/PyAnJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8udGV4dENvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQoJ2luaXRpYWxpemVkJyk7XG4gICAgfVxufVxuY29tcG9uZW50c1RvUmVnaXN0ZXIucHVzaChQcmV0dHlKU09OKTtcbi8qXG5cblxuLyoqKlxuICogICAgJCRcXCAgICAgICQkXFwgICAgICAgICAgICAgICAgICQkXFwgICAgICAgICAgICQkXFwgICAgICAgJCQkJCQkJFxcICAkJFxcICAgICAgICAgICAkJFxcXG4gKiAgICAkJCRcXCAgICAkJCQgfCAgICAgICAgICAgICAgICAkJCB8ICAgICAgICAgICQkIHwgICAgICAkJCAgX18kJFxcIFxcX198ICAgICAgICAgICQkIHxcbiAqICAgICQkJCRcXCAgJCQkJCB8ICQkJCQkJFxcICAgJCQkJCQkJCB8ICQkJCQkJFxcICAkJCB8ICAgICAgJCQgfCAgJCQgfCQkXFwgICQkJCQkJFxcICAkJCB8ICQkJCQkJFxcICAgJCQkJCQkXFxcbiAqICAgICQkXFwkJFxcJCQgJCQgfCQkICBfXyQkXFwgJCQgIF9fJCQgfCBcXF9fX18kJFxcICQkIHwgICAgICAkJCB8ICAkJCB8JCQgfCBcXF9fX18kJFxcICQkIHwkJCAgX18kJFxcICQkICBfXyQkXFxcbiAqICAgICQkIFxcJCQkICAkJCB8JCQgLyAgJCQgfCQkIC8gICQkIHwgJCQkJCQkJCB8JCQgfCAgICAgICQkIHwgICQkIHwkJCB8ICQkJCQkJCQgfCQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfFxuICogICAgJCQgfFxcJCAgLyQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkICBfXyQkIHwkJCB8ICAgICAgJCQgfCAgJCQgfCQkIHwkJCAgX18kJCB8JCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8XG4gKiAgICAkJCB8IFxcXy8gJCQgfFxcJCQkJCQkICB8XFwkJCQkJCQkIHxcXCQkJCQkJCQgfCQkIHwgICAgICAkJCQkJCQkICB8JCQgfFxcJCQkJCQkJCB8JCQgfFxcJCQkJCQkICB8XFwkJCQkJCQkIHxcbiAqICAgIFxcX198ICAgICBcXF9ffCBcXF9fX19fXy8gIFxcX19fX19fX3wgXFxfX19fX19ffFxcX198ICAgICAgXFxfX19fX19fLyBcXF9ffCBcXF9fX19fX198XFxfX3wgXFxfX19fX18vICBcXF9fX18kJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICQkIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9fX19fXy9cbiAqL1xuXG5cbmV4cG9ydCBjbGFzcyBCQ0RNb2RhbERpYWxvZyBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtYmNkLW1vZGFsJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgYXNTdHJpbmcgPSAnQmVsbEN1YmljIE1vZGFsJztcblxuICAgIHN0YXRpYyBvYmZ1c2NhdG9yOiBIVE1MRGl2RWxlbWVudDtcbiAgICBzdGF0aWMgbW9kYWxzVG9TaG93OiBCQ0RNb2RhbERpYWxvZ1tdID0gW107XG4gICAgc3RhdGljIHNob3duTW9kYWw6IEJDRE1vZGFsRGlhbG9nfG51bGwgPSBudWxsO1xuXG4gICAgZWxlbWVudF86SFRNTERpYWxvZ0VsZW1lbnR8SFRNTEVsZW1lbnQ7XG4gICAgY2xvc2VCeUNsaWNrT3V0c2lkZTpib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRGlhbG9nRWxlbWVudCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgbnVsbCwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXJpYU1vZGFsID0gJ3RydWUnO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncm9sZScsICdkaWFsb2cnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hcmlhSGlkZGVuID0gJ3RydWUnO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmhpZGRlbiA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHkgPz8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF07XG5cbiAgICAgICAgLy8gTW92ZSBlbGVtZW50IHRvIHRoZSB0b3Agb2YgdGhlIGJvZHkgKGp1c3Qgb25lIG1vcmUgdGhpbmcgdG8gbWFrZSBzdXJlIGl0IHNob3dzIGFib3ZlIGV2ZXJ5dGhpbmcgZWxzZSlcbiAgICAgICAgYm9keS5wcmVwZW5kKGVsZW1lbnQpO1xuXG4gICAgICAgIGlmICghQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvcikge1xuICAgICAgICAgICAgQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvci5jbGFzc0xpc3QuYWRkKG1kbC5NYXRlcmlhbExheW91dC5jc3NDbGFzc2VzLk9CRlVTQ0FUT1IsICdqcy1iY2QtbW9kYWwtb2JmdXNjYXRvcicpO1xuICAgICAgICAgICAgYm9keS5hcHBlbmRDaGlsZChCQ0RNb2RhbERpYWxvZy5vYmZ1c2NhdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xvc2VCeUNsaWNrT3V0c2lkZSA9ICF0aGlzLmVsZW1lbnRfLmhhc0F0dHJpYnV0ZSgnbm8tY2xpY2stb3V0c2lkZScpO1xuXG4gICAgICAgIGFmdGVyRGVsYXkoMTAwMCwgZnVuY3Rpb24gKHRoaXM6IEJDRE1vZGFsRGlhbG9nKSB7IC8vIExldHMgdGhlIERPTSBzZXR0bGUgYW5kIGdpdmVzIEphdmFTY3JpcHQgYSBjaGFuY2UgdG8gbW9kaWZ5IHRoZSBlbGVtZW50XG5cbiAgICAgICAgICAgIGNvbnN0IGNsb3NlQnV0dG9ucyA9IHRoaXMuZWxlbWVudF8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtYmNkLW1vZGFsLWNsb3NlJykgYXMgSFRNTENvbGxlY3Rpb25PZjxIVE1MRWxlbWVudD47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBjbG9zZUJ1dHRvbnMpIHtcbiAgICAgICAgICAgICAgICByZWdpc3RlckZvckV2ZW50cyhidXR0b24sIHthY3RpdmF0ZTogdGhpcy5ib3VuZEhpZGVGdW5jdGlvbn0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50Xy5oYXNBdHRyaWJ1dGUoJ29wZW4tYnktZGVmYXVsdCcpKSB0aGlzLnNob3coKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZXZhbFF1ZXVlKGRlbGF5OiBudW1iZXIgPSAxMDApOnZvaWQge1xuXG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZyhcIj09PT09PT09PT09PT09PT09PT09PT09PVxcbkV2YWx1YXRpbmcgbW9kYWwgcXVldWUuLi5cXG49PT09PT09PT09PT09PT09PT09PT09PT1cIik7XG5cbiAgICAgICAgLy9jb25zdCB3aWxsRXhpdCA9IHtcbiAgICAgICAgLy8gICAgc2hvd25Nb2RhbDogdGhpcy5zaG93bk1vZGFsLFxuICAgICAgICAvLyAgICBtb2RhbHNUb1Nob3c6IHRoaXMubW9kYWxzVG9TaG93LFxuICAgICAgICAvL1xuICAgICAgICAvLyAgICBzaG93bk1vZGFsX2Jvb2w6ICEhdGhpcy5tb2RhbHNUb1Nob3cubGVuZ3RoLFxuICAgICAgICAvLyAgICBtb2RhbHNUb1Nob3dfbGVuZ3RoQm9vbDogIXRoaXMubW9kYWxzVG9TaG93Lmxlbmd0aFxuICAgICAgICAvL307XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZygnV2lsbCBleGl0PycsICEhKHRoaXMuc2hvd25Nb2RhbCB8fCAhdGhpcy5tb2RhbHNUb1Nob3cubGVuZ3RoKSwgd2lsbEV4aXQpO1xuXG4gICAgICAgIGlmICh0aGlzLnNob3duTW9kYWwgfHwgIXRoaXMubW9kYWxzVG9TaG93Lmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG1vZGFsID0gQkNETW9kYWxEaWFsb2cubW9kYWxzVG9TaG93LnNoaWZ0KCk7IGlmICghbW9kYWwpIHJldHVybiB0aGlzLmV2YWxRdWV1ZSgpO1xuICAgICAgICBCQ0RNb2RhbERpYWxvZy5zaG93bk1vZGFsID0gbW9kYWw7XG5cbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiU2hvd2luZyBtb2RhbDpcIiwgbW9kYWwpO1xuXG4gICAgICAgIGFmdGVyRGVsYXkoZGVsYXksIG1vZGFsLnNob3dfZm9yUmVhbC5iaW5kKG1vZGFsKSk7XG4gICAgfVxuXG4gICAgc2hvdygpe1xuICAgICAgICBCQ0RNb2RhbERpYWxvZy5tb2RhbHNUb1Nob3cucHVzaCh0aGlzKTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1NT0RBTF0gTW9kYWxzIHRvIHNob3cgKGFmdGVyIGFzc2lnbm1lbnQpOlwiLCBiY2RNb2RhbERpYWxvZy5tb2RhbHNUb1Nob3cpO1xuICAgICAgICBCQ0RNb2RhbERpYWxvZy5ldmFsUXVldWUoKTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1NT0RBTF0gTW9kYWxzIHRvIHNob3cgKGFmdGVyIGV2YWwpOlwiLCBiY2RNb2RhbERpYWxvZy5tb2RhbHNUb1Nob3cpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmd8bnVsbD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWZ0ZXJIaWRlJywgKGV2dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgnZGV0YWlsJyBpbiBldnQgJiYgdHlwZW9mIGV2dC5kZXRhaWwgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGV2dC5kZXRhaWwpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH0sIHtvbmNlOiB0cnVlfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBFdmVudCBzZW50IGp1c3QgYmVmb3JlIHRoZSBtb2RhbCBpcyBzaG93blxuICAgICAgICBJZiB0aGlzIGV2ZW50IGlzIGNhbmNlbGVkIG9yIGBQcmV2ZW50RGVmYXVsdCgpYCBpcyBjYWxsZWQsIHRoZSBtb2RhbCB3aWxsIG5vdCBiZSBzaG93bi5cblxuICAgICAgICBUaGUgZXZlbnQgaXMgZmlyc3Qgc2VudCBmb3IgdGhlIGNsYXNzIGFuZCwgaWYgbm90IGNhbmNlbGVkIGFuZCBpZiBgUHJldmVudERlZmF1bHQoKWAgd2FzIG5vdCBjYWxsZWQsIHRoZSBldmVudCBpcyBzZW50IGZvciB0aGUgZWxlbWVudC5cbiAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBiZWZvcmVTaG93RXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2JlZm9yZVNob3cnLCB7Y2FuY2VsYWJsZTogdHJ1ZSwgYnViYmxlczogZmFsc2UsIGNvbXBvc2VkOiBmYWxzZX0pO1xuXG4gICAgLyoqIEV2ZW50IHNlbnQganVzdCBhZnRlciB0aGUgbW9kYWwgaXMgc2hvd25cblxuICAgICAgICBUaGUgZXZlbnQgaXMgZmlyc3Qgc2VudCBmb3IgdGhlIGNsYXNzIGFuZCwgaWYgbm90IGNhbmNlbGVkIGFuZCBpZiBQcmV2ZW50RGVmYXVsdCgpIHdhcyBub3QgY2FsbGVkLCB0aGUgZXZlbnQgaXMgc2VudCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgYWZ0ZXJTaG93RXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2FmdGVyU2hvdycsIHtjYW5jZWxhYmxlOiBmYWxzZSwgYnViYmxlczogZmFsc2UsIGNvbXBvc2VkOiBmYWxzZX0pO1xuXG4gICAgcHJpdmF0ZSBzaG93X2ZvclJlYWwoKSB7XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZyhcIltCQ0QtTU9EQUxdIFNob3dpbmcgbW9kYWw6XCIsIHRoaXMpO1xuICAgICAgICAvKiAnQmVmb3JlJyBFdmVudCAqLyBpZiAoIXRoaXMuZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5iZWZvcmVTaG93RXZlbnQpIHx8ICF0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQoQkNETW9kYWxEaWFsb2cuYmVmb3JlU2hvd0V2ZW50KSkgcmV0dXJuO1xuXG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLm9iZnVzY2F0b3IuY2xhc3NMaXN0LmFkZChtZGwuTWF0ZXJpYWxMYXlvdXQuY3NzQ2xhc3Nlcy5JU19EUkFXRVJfT1BFTik7XG4gICAgICAgIHJlZ2lzdGVyRm9yRXZlbnRzKEJDRE1vZGFsRGlhbG9nLm9iZnVzY2F0b3IsIHthY3RpdmF0ZTogdGhpcy5ib3VuZEhpZGVGdW5jdGlvbn0pO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9ICdmYWxzZSc7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCdzaG93JyBpbiB0aGlzLmVsZW1lbnRfKSB0aGlzLmVsZW1lbnRfLnNob3coKTtcbiAgICAgICAgZWxzZSB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnb3BlbicsICcnKTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1NT0RBTF0gTW9kYWwgc2hvd246XCIsIHRoaXMpO1xuXG4gICAgICAgIC8qICdBZnRlcicgRXZlbnQgKi8gIGlmICh0aGlzLmRpc3BhdGNoRXZlbnQoQkNETW9kYWxEaWFsb2cuYWZ0ZXJTaG93RXZlbnQpKSB0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQoQkNETW9kYWxEaWFsb2cuYWZ0ZXJTaG93RXZlbnQpO1xuXG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZyhcIltCQ0QtTU9EQUxdIE1vZGFscyB0byBzaG93IChhZnRlciBzaG93KTpcIiwgYmNkTW9kYWxEaWFsb2cubW9kYWxzVG9TaG93KTtcbiAgICB9XG5cbiAgICAvKiogRXZlbnQgc2VudCBqdXN0IGJlZm9yZSB0aGUgbW9kYWwgaXMgaGlkZGVuXG4gICAgICAgIElmIHRoaXMgZXZlbnQgaXMgY2FuY2VsZWQgb3IgYFByZXZlbnREZWZhdWx0KClgIGlzIGNhbGxlZCwgdGhlIG1vZGFsIHdpbGwgbm90IGJlIHNob3duLlxuXG4gICAgICAgIFRoZSBldmVudCBpcyBmaXJzdCBzZW50IGZvciB0aGUgY2xhc3MgYW5kLCBpZiBub3QgY2FuY2VsZWQgYW5kIGlmIGBQcmV2ZW50RGVmYXVsdCgpYCB3YXMgbm90IGNhbGxlZCwgdGhlIGV2ZW50IGlzIHNlbnQgZm9yIHRoZSBlbGVtZW50LlxuICAgICovXG4gICAgc3RhdGljIGdldEJlZm9yZUhpZGVFdmVudChtc2c6IHN0cmluZ3xudWxsID0gbnVsbCkge3JldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ2JlZm9yZUhpZGUnLCB7Y2FuY2VsYWJsZTogdHJ1ZSwgYnViYmxlczogZmFsc2UsIGNvbXBvc2VkOiBmYWxzZSwgZGV0YWlsOiBtc2d9KTt9XG5cbiAgICAvKiogRXZlbnQgc2VudCBqdXN0IGFmdGVyIHRoZSBtb2RhbCBpcyBoaWRkZW5cblxuICAgICAgICBUaGUgZXZlbnQgaXMgZmlyc3Qgc2VudCBmb3IgdGhlIGNsYXNzIGFuZCwgaWYgbm90IGNhbmNlbGVkIGFuZCBpZiBQcmV2ZW50RGVmYXVsdCgpIHdhcyBub3QgY2FsbGVkLCB0aGUgZXZlbnQgaXMgc2VudCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgKi9cbiAgICBzdGF0aWMgZ2V0QWZ0ZXJIaWRlRXZlbnQobXNnOiBzdHJpbmd8bnVsbCA9IG51bGwpIHtyZXR1cm4gbmV3IEN1c3RvbUV2ZW50KCdhZnRlckhpZGUnLCB7Y2FuY2VsYWJsZTogZmFsc2UsIGJ1YmJsZXM6IGZhbHNlLCBjb21wb3NlZDogZmFsc2UsIGRldGFpbDogbXNnfSk7fVxuXG4gICAgLy8gU3RvcmluZyB0aGUgYm91bmQgZnVuY3Rpb24gbGV0cyB1cyByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIG9iZnVzY2F0b3IgYWZ0ZXIgdGhlIG1vZGFsIGlzIGhpZGRlblxuICAgIGJvdW5kSGlkZUZ1bmN0aW9uID0gdGhpcy5oaWRlLmJpbmQodGhpcyk7XG5cbiAgICBoaWRlKGV2dD86IEV2ZW50KXtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1NT0RBTF0gSGlkaW5nIG1vZGFsOlwiLCB0aGlzKTtcblxuICAgICAgICBsZXQgbXNnID0gbnVsbDtcbiAgICAgICAgaWYgKGV2dCAmJiBldnQuY3VycmVudFRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpXG4gICAgICAgICAgICBtc2cgPSBldnQuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kYWwtbWVzc2FnZScpO1xuXG4gICAgICAgIGlmIChldnQpIGV2dC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgLyogJ0JlZm9yZScgRXZlbnQgKi8gaWYgKCF0aGlzLmRpc3BhdGNoRXZlbnQoQkNETW9kYWxEaWFsb2cuZ2V0QmVmb3JlSGlkZUV2ZW50KG1zZykpIHx8IXRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5nZXRCZWZvcmVIaWRlRXZlbnQobXNnKSkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmFyaWFIaWRkZW4gPSAndHJ1ZSc7XG5cbiAgICAgICAgaWYgKCdjbG9zZScgaW4gdGhpcy5lbGVtZW50XykgdGhpcy5lbGVtZW50Xy5jbG9zZSgpO1xuICAgICAgICBlbHNlIHRoaXMuZWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKCdvcGVuJyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50Xy5oaWRkZW4gPSB0cnVlO1xuXG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLm9iZnVzY2F0b3IuY2xhc3NMaXN0LnJlbW92ZShtZGwuTWF0ZXJpYWxMYXlvdXQuY3NzQ2xhc3Nlcy5JU19EUkFXRVJfT1BFTik7XG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLm9iZnVzY2F0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3cuY2xpY2tFdnQsIHRoaXMuYm91bmRIaWRlRnVuY3Rpb24pO1xuXG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLnNob3duTW9kYWwgPSBudWxsO1xuXG5cbiAgICAgICAgLyogJ0FmdGVyJyBFdmVudCAqLyAgaWYgKHRoaXMuZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5nZXRBZnRlckhpZGVFdmVudChtc2cpKSkgdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KEJDRE1vZGFsRGlhbG9nLmdldEFmdGVySGlkZUV2ZW50KG1zZykpO1xuXG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLmV2YWxRdWV1ZSgpO1xuICAgIH1cblxufVxuY29tcG9uZW50c1RvUmVnaXN0ZXIucHVzaChCQ0RNb2RhbERpYWxvZyk7XG5cblxuLyoqKlxuICogICAgJCQkJCQkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4gKiAgICAkJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkIHxcbiAqICAgICQkIHwgICQkIHwgJCQkJCQkXFwgICAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJCB8ICQkJCQkJFxcICAkJFxcICAkJFxcICAkJFxcICQkJCQkJCRcXFxuICogICAgJCQgfCAgJCQgfCQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkICBfXyQkIHwkJCAgX18kJFxcICQkIHwgJCQgfCAkJCB8JCQgIF9fJCRcXFxuICogICAgJCQgfCAgJCQgfCQkIHwgIFxcX198JCQgLyAgJCQgfCQkIC8gICQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfCQkIHwgJCQgfCAkJCB8JCQgfCAgJCQgfFxuICogICAgJCQgfCAgJCQgfCQkIHwgICAgICAkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfCAkJCB8ICQkIHwkJCB8ICAkJCB8XG4gKiAgICAkJCQkJCQkICB8JCQgfCAgICAgIFxcJCQkJCQkICB8JCQkJCQkJCAgfFxcJCQkJCQkJCB8XFwkJCQkJCQgIHxcXCQkJCQkXFwkJCQkICB8JCQgfCAgJCQgfFxuICogICAgXFxfX19fX19fLyBcXF9ffCAgICAgICBcXF9fX19fXy8gJCQgIF9fX18vICBcXF9fX19fX198IFxcX19fX19fLyAgXFxfX19fX1xcX19fXy8gXFxfX3wgIFxcX198XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9ffFxuICovXG5cbi8qKiBDbGFzc2VzIHRoYXQgZGV0ZXJtaW5lIHdoZXJlIHRoZSBtZW51IGlzIGFsaWduZWQgcmVsYXRpdmUgdG8gdGhlIGJ1dHRvbiAqL1xuZXhwb3J0IGVudW0gbWVudUNvcm5lcnMge1xuICAgIHVuYWxpZ25lZCA9ICdtZGwtbWVudS0tdW5hbGlnbmVkJyxcbiAgICB0b3BMZWZ0ID0gJ21kbC1tZW51LS1ib3R0b20tbGVmdCcsXG4gICAgdG9wUmlnaHQgPSAnbWRsLW1lbnUtLWJvdHRvbS1yaWdodCcsXG4gICAgYm90dG9tTGVmdCA9ICdtZGwtbWVudS0tdG9wLWxlZnQnLFxuICAgIGJvdHRvbVJpZ2h0ID0gJ21kbC1tZW51LS10b3AtcmlnaHQnXG59XG5cbmludGVyZmFjZSBEcm9wZG93bkl0ZW0ge1xuICAgIC8qKiBDYWxsYmFjayBzZW50IHdoZW4gdGhpcyBwYXJ0aWN1bGFyIG9wdGlvbiBpcyBzZWxlY3RlZCAqL1xuICAgIG9uU2VsZWN0OiBGdW5jdGlvbnxudWxsO1xuICAgIC8qKiBUb29sdGlwIHRleHQgdG8gZGlzcGxheSB3aGVuIGhvdmVyaW5nIG92ZXIgdGhpcyBvcHRpb24gKi9cbiAgICB0b29sdGlwPzogc3RyaW5nO1xufVxudHlwZSBvcHRpb25PYmogPSBSZWNvcmQ8c3RyaW5nLCBEcm9wZG93bkl0ZW0gfCBGdW5jdGlvbnxudWxsPlxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQkNERHJvcGRvd24gZXh0ZW5kcyBtZGwuTWF0ZXJpYWxNZW51IHtcblxuICAgIGFic3RyYWN0IG9wdGlvbnMoKTogb3B0aW9uT2JqO1xuXG4gICAgZG9SZW9yZGVyOmJvb2xlYW47XG5cbiAgICBvcHRpb25zXzogb3B0aW9uT2JqO1xuICAgIG9wdGlvbnNfa2V5czogc3RyaW5nW107XG5cbiAgICBzZWxlY3RlZE9wdGlvbjogc3RyaW5nID0gJyc7XG5cbiAgICBvdmVycmlkZSBlbGVtZW50XzogSFRNTEVsZW1lbnQ7XG5cbiAgICBzZWxlY3Rpb25UZXh0RWxlbWVudHM6IHVuZGVmaW5lZCB8IEhUTUxDb2xsZWN0aW9uT2Y8SFRNTEVsZW1lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogRWxlbWVudCwgYnV0dG9uRWxlbWVudD86IEVsZW1lbnR8bnVsbCwgZG9SZW9yZGVyOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudCBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICB0aGlzLmRvUmVvcmRlciA9IGRvUmVvcmRlcjtcbiAgICAgICAgaWYgKGRvUmVvcmRlcikgdGhpcy5Db25zdGFudF8uQ0xPU0VfVElNRU9VVCA9IDA7XG5cbiAgICAgICAgaWYgKHRoaXMuZm9yRWxlbWVudF8pIHtcbiAgICAgICAgICAgIHRoaXMuZm9yRWxlbWVudF8/LnJlbW92ZUV2ZW50TGlzdGVuZXIod2luZG93LmNsaWNrRXZ0LCB0aGlzLmJvdW5kRm9yQ2xpY2tfKTtcbiAgICAgICAgICAgIHRoaXMuZm9yRWxlbWVudF8/LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmJvdW5kRm9yS2V5ZG93bl8pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ1dHRvbkVsZW1lbnQgJiYgYnV0dG9uRWxlbWVudCAhPT0gdGhpcy5mb3JFbGVtZW50Xykge1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50XyA9IGJ1dHRvbkVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5mb3JFbGVtZW50Xykge1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xy5hcmlhSGFzUG9wdXAgPSAndHJ1ZSc7XG5cbiAgICAgICAgICAgIC8vIE1ETCBoYXMgY3VzdG9tIGhhbmRsaW5nIGZvciBrZXlib2FyZCB2cyBtb3VzZSBldmVudHMsIHNvIEknbGwgcmVnaXN0ZXIgdGhlbSByYXdcbiAgICAgICAgICAgIHRoaXMuZm9yRWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3cuY2xpY2tFdnQsIHRoaXMuYm91bmRGb3JDbGlja18pO1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5ib3VuZEZvcktleWRvd25fKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJbQkNELURST1BET1dOXSBJbml0aWFsaXppbmcgZHJvcGRvd246XCIsIHRoaXMpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBPcHRpb25zID0gdGhpcy5vcHRpb25zKCk7XG4gICAgICAgIHRoaXMub3B0aW9uc18gPSB0ZW1wT3B0aW9ucztcbiAgICAgICAgdGhpcy5vcHRpb25zX2tleXMgPSBPYmplY3Qua2V5cyh0aGlzLm9wdGlvbnNfKTtcblxuICAgICAgICB0aGlzLnNlbGVjdGVkT3B0aW9uID0gdGhpcy5vcHRpb25zX2tleXNbMF0gPz8gJyc7XG5cbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgdGhpcy5vcHRpb25zX2tleXMpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQodGhpcy5jcmVhdGVPcHRpb24ob3B0aW9uKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlbGVjdGlvblRleHRFbGVtZW50cyA9IHRoaXMuZm9yRWxlbWVudF8/LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2JjZC1kcm9wZG93bl92YWx1ZScpIGFzIEhUTUxDb2xsZWN0aW9uT2Y8SFRNTEVsZW1lbnQ+O1xuXG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMoKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5mb2N1c091dEhhbmRsZXIuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKGVsZW1lbnQsIHRoaXMsIHRoaXMuZm9yRWxlbWVudF8sIHRydWUsIHRydWUpO1xuICAgIH1cblxuICAgIGZvY3VzT3V0SGFuZGxlcihldnQ6IEZvY3VzRXZlbnQpe1xuICAgICAgICBpZiAoKGV2dC5yZWxhdGVkVGFyZ2V0IGFzIEVsZW1lbnR8bnVsbCk/LnBhcmVudEVsZW1lbnQgIT09IHRoaXMuZWxlbWVudF8pIHRoaXMuaGlkZSgpO1xuICAgIH1cblxuICAgIHNlbGVjdEJ5U3RyaW5nKG9wdGlvbjogc3RyaW5nKXtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uc19rZXlzLmluY2x1ZGVzKG9wdGlvbikpIHRoaXMuc2VsZWN0ZWRPcHRpb24gPSBvcHRpb247XG4gICAgICAgIGVsc2UgY29uc29sZS53YXJuKFwiW0JDRC1EUk9QRE9XTl0gQXR0ZW1wdGVkIHRvIHNlbGVjdCBhbiBvcHRpb24gdGhhdCBkb2VzIG5vdCBleGlzdDpcIiwgb3B0aW9uKTtcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW46IEhUTUxMSUVsZW1lbnRbXSA9IFsuLi50aGlzLmVsZW1lbnRfLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpIF07XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJbQkNELURST1BET1dOXSBVcGRhdGluZyBvcHRpb25zOlwiLCB0aGlzLCBjaGlsZHJlbiwgY2hpbGRyZW4ubWFwKChlbG0pID0+IGVsbS50ZXh0Q29udGVudCksIHRoaXMuc2VsZWN0ZWRPcHRpb24pO1xuXG4gICAgICAgIGlmICh0aGlzLmRvUmVvcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZ29sZGVuQ2hpbGQgPSBjaGlsZHJlbi5maW5kKChlbG0pID0+IChlbG0gYXMgSFRNTExJRWxlbWVudCkudGV4dENvbnRlbnQgPT09IHRoaXMuc2VsZWN0ZWRPcHRpb24pO1xuICAgICAgICAgICAgaWYgKCFnb2xkZW5DaGlsZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0JDRC1EUk9QRE9XTl0gRXJyb3JpbmcgaW5zdGFuY2U6XCIsIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCB0aGUgc2VsZWN0ZWQgb3B0aW9uIGluIHRoZSBkcm9wZG93bi4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5tYWtlU2VsZWN0ZWQoZ29sZGVuQ2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVtb25DaGlsZHJlbiA9IHRoaXMuZG9SZW9yZGVyID8gY2hpbGRyZW4uZmlsdGVyKChlbG0pID0+IChlbG0gYXMgSFRNTExJRWxlbWVudCkudGV4dENvbnRlbnQgIT09IHRoaXMuc2VsZWN0ZWRPcHRpb24pIDogY2hpbGRyZW47XG4gICAgICAgIGRlbW9uQ2hpbGRyZW4uc29ydCggKGEsIGIpID0+IHRoaXMub3B0aW9uc19rZXlzLmluZGV4T2YoYS50ZXh0Q29udGVudCA/PyAnJykgLSB0aGlzLm9wdGlvbnNfa2V5cy5pbmRleE9mKGIudGV4dENvbnRlbnQgPz8gJycpICk7XG5cbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBkZW1vbkNoaWxkcmVuKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICAgICAgICAgIHRoaXMubWFrZU5vdFNlbGVjdGVkKGNoaWxkKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlT3B0aW9uKG9wdGlvbjogc3RyaW5nLCBvblNlbGVjdENhbGxiYWNrPzogRnVuY3Rpb258bnVsbCwgdG9vbHRpcD86IHN0cmluZywgYWRkVG9MaXN0OiBib29sZWFuID0gZmFsc2UpOiBIVE1MTElFbGVtZW50IHtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBsaS50ZXh0Q29udGVudCA9IG9wdGlvbjtcbiAgICAgICAgbGkuc2V0QXR0cmlidXRlKCdvcHRpb24tdmFsdWUnLCBvcHRpb24pO1xuICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKCdtZGwtbWVudV9faXRlbScpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJJdGVtKGxpKTtcblxuICAgICAgICBjb25zdCBvcHRpb25EYXRhID0gdGhpcy5vcHRpb25zX1tvcHRpb25dO1xuICAgICAgICBpZiAob3B0aW9uRGF0YSkge1xuXG4gICAgICAgICAgICBpZiAodG9vbHRpcCA9PT0gdW5kZWZpbmVkICYmICd0b29sdGlwJyBpbiBvcHRpb25EYXRhKVxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwID0gb3B0aW9uRGF0YS50b29sdGlwO1xuXG4gICAgICAgICAgICBpZiAoIW9uU2VsZWN0Q2FsbGJhY2spXG4gICAgICAgICAgICAgICAgaWYgKCdvblNlbGVjdCcgaW4gb3B0aW9uRGF0YSkgb25TZWxlY3RDYWxsYmFjayA9IG9wdGlvbkRhdGEub25TZWxlY3Q7XG4gICAgICAgICAgICAgICAgZWxzZSBvblNlbGVjdENhbGxiYWNrID0gb3B0aW9uRGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhZGRUb0xpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQobGkpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zX2tleXMucHVzaChvcHRpb24pO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zX1tvcHRpb25dID0ge1xuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBvblNlbGVjdENhbGxiYWNrID8/IG51bGwsXG4gICAgICAgICAgICAgICAgdG9vbHRpcCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob25TZWxlY3RDYWxsYmFjaykgcmVnaXN0ZXJGb3JFdmVudHMobGksIHthY3RpdmF0ZTogb25TZWxlY3RDYWxsYmFjay5iaW5kKHRoaXMpfSk7XG5cbiAgICAgICAgdGhpcy5vbkNyZWF0ZU9wdGlvbj8uKG9wdGlvbik7XG4gICAgICAgIHJldHVybiBsaTtcbiAgICB9XG5cbiAgICBjcmVhdGVUb29sdGlwKHRhcmdldEVsZW1lbnQ6IEhUTUxMSUVsZW1lbnQsIHRvb2x0aXA6IHN0cmluZykge1xuXG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgb25JdGVtU2VsZWN0ZWQob3B0aW9uOiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRPcHRpb24gPSBvcHRpb24udGV4dENvbnRlbnQgPz8gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2JjZC1kcm9wZG93bi1jaGFuZ2UnLCB7IGRldGFpbDoge2Ryb3Bkb3duOiB0aGlzLCBvcHRpb246IHRoaXMuc2VsZWN0ZWRPcHRpb259IH0pKTtcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zKCk7XG4gICAgfVxuXG4gICAgb25DcmVhdGVPcHRpb24/KG9wdGlvbjogc3RyaW5nKTogdm9pZFxuXG4gICAgbWFrZVNlbGVjdGVkKG9wdGlvbjogSFRNTExJRWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5kb1Jlb3JkZXIpIG9wdGlvbi5jbGFzc0xpc3QuYWRkKCdtZGwtbWVudV9faXRlbS0tZnVsbC1ibGVlZC1kaXZpZGVyJyk7XG4gICAgICAgIG9wdGlvbi5ibHVyKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbG0gb2YgdGhpcy5zZWxlY3Rpb25UZXh0RWxlbWVudHMgPz8gW10pIHtcbiAgICAgICAgICAgIGVsbS50ZXh0Q29udGVudCA9IG9wdGlvbi50ZXh0Q29udGVudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VOb3RTZWxlY3RlZChvcHRpb246IEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgb3B0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ21kbC1tZW51X19pdGVtLS1mdWxsLWJsZWVkLWRpdmlkZXInKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vcHRpb25FbGVtZW50czogdW5kZWZpbmVkIHwgSFRNTENvbGxlY3Rpb25PZjxIVE1MTElFbGVtZW50PjtcbiAgICBnZXQgb3B0aW9uRWxlbWVudHMoKTogSFRNTENvbGxlY3Rpb25PZjxIVE1MTElFbGVtZW50PiB7IHJldHVybiB0aGlzLl9vcHRpb25FbGVtZW50cyA/Pz0gdGhpcy5lbGVtZW50Xy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKSBhcyBIVE1MQ29sbGVjdGlvbk9mPEhUTUxMSUVsZW1lbnQ+OyB9XG5cbiAgICBoYXNTaG93bk9ySGlkZGVuVGhpc0ZyYW1lOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBvdmVycmlkZSBzaG93KGV2dDogYW55KXtcbiAgICAgICAgaWYgKHRoaXMuaGFzU2hvd25PckhpZGRlblRoaXNGcmFtZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhc1Nob3duT3JIaWRkZW5UaGlzRnJhbWUgPSB0cnVlO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5oYXNTaG93bk9ySGlkZGVuVGhpc0ZyYW1lID0gZmFsc2UpO1xuXG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmFyaWFIaWRkZW4gPT09ICdmYWxzZScpIHJldHVybjtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiW0JDRC1EUk9QRE9XTl0gU2hvd2luZyBkcm9wZG93bjpcIiwgdGhpcywgZXZ0KTtcblxuICAgICAgICBpZiAoZXZ0IGluc3RhbmNlb2YgS2V5Ym9hcmRFdmVudCB8fCBldnQgaW5zdGFuY2VvZiBQb2ludGVyRXZlbnQgJiYgZXZ0LnBvaW50ZXJJZCA9PT0gLTEgfHwgJ21veklucHV0U291cmNlJyBpbiBldnQgJiYgZXZ0Lm1veklucHV0U291cmNlICE9PSAxKVxuICAgICAgICAgICAgdGhpcy5vcHRpb25FbGVtZW50c1swXT8uZm9jdXMoKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmFyaWFIaWRkZW4gPSAnZmFsc2UnO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgaWYgKHRoaXMuZm9yRWxlbWVudF8pIHRoaXMuZm9yRWxlbWVudF8uYXJpYUV4cGFuZGVkID0gJ3RydWUnO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLm9wdGlvbkVsZW1lbnRzKSBpdGVtLnRhYkluZGV4ID0gMDtcblxuICAgICAgICB0aGlzLmZvckVsZW1lbnRfPy50YXJnZXRpbmdDb21wb25lbnRzPy5nZXQoQkNEVG9vbHRpcCk/LmhpZGUoKTtcblxuICAgICAgICBzdXBlci5zaG93KGV2dCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgaGlkZSgpe1xuICAgICAgICBpZiAodGhpcy5oYXNTaG93bk9ySGlkZGVuVGhpc0ZyYW1lKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzU2hvd25PckhpZGRlblRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmhhc1Nob3duT3JIaWRkZW5UaGlzRnJhbWUgPSBmYWxzZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9PT0gJ3RydWUnKSByZXR1cm47XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIltCQ0QtRFJPUERPV05dIEhpZGluZyBkcm9wZG93bjpcIiwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25FbGVtZW50c1swXT8uYmx1cigpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9ICd0cnVlJztcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgICAgICBpZiAodGhpcy5mb3JFbGVtZW50XykgdGhpcy5mb3JFbGVtZW50Xy5hcmlhRXhwYW5kZWQgPSAnZmFsc2UnO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLm9wdGlvbkVsZW1lbnRzKSBpdGVtLnRhYkluZGV4ID0gLTE7XG5cbiAgICAgICAgc3VwZXIuaGlkZSgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIGJjZERyb3Bkb3duX0F3ZXNvbWVCdXR0b24gZXh0ZW5kcyBCQ0REcm9wZG93biB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JDRCAtIERlYnVnZ2VyXFwncyBBbGwtUG93ZXJmdWwgQnV0dG9uJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtYmNkLWRlYnVnZ2Vycy1hbGwtcG93ZXJmdWwtYnV0dG9uJztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgb3B0aW9ucygpOiBSZWNvcmQ8c3RyaW5nLCBGdW5jdGlvbnxudWxsPiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnVmlldyBEZWJ1ZyBQYWdlJzogKCkgPT4ge2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWJ1Zy1saW5rJyk/LmNsaWNrKCk7fSxcbiAgICAgICAgICAgICdUb2dnbGUgUGFnZSBNb25vY2hyb21lJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBbLCBzdGFydCwgcGVyY2VudGFnZSwgZW5kXSA9IGRvY3VtZW50LmJvZHkuc3R5bGUuZmlsdGVyLm1hdGNoKC8oLiopZ3JheXNjYWxlXFwoKC4qPylcXCkoLiopLykgPz8gW107XG4gICAgICAgICAgICAgICAgc3RhcnQgPz89ICcnOyBwZXJjZW50YWdlID8/PSAnJzsgZW5kID8/PSAnJztcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmZpbHRlciA9IGAke3N0YXJ0fWdyYXlzY2FsZSgke3BlcmNlbnRhZ2UgPT09ICcxMDAlJyA/ICcwJScgOiAnMTAwJSd9KSR7ZW5kfWA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goYmNkRHJvcGRvd25fQXdlc29tZUJ1dHRvbik7XG5cblxuXG4vKioqXG4gKiAgICAkJCQkJCQkJFxcICAgICAgICAgICAkJFxcICAgICAgICQkXFwgICAgICAgICAgICAgICAgICAgICAgICQkXFxcbiAqICAgIFxcX18kJCAgX198ICAgICAgICAgICQkIHwgICAgICAkJCB8ICAgICAgICAgICAgICAgICAgICAgICQkIHxcbiAqICAgICAgICQkIHwgICAgJCQkJCQkXFwgICQkJCQkJCRcXCAgJCQkJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCQkIHxcbiAqICAgICAgICQkIHwgICAgXFxfX19fJCRcXCAkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJCB8XG4gKiAgICAgICAkJCB8ICAgICQkJCQkJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQkJCQkJCQgfCQkIC8gICQkIHxcbiAqICAgICAgICQkIHwgICAkJCAgX18kJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCAgIF9fX198JCQgfCAgJCQgfFxuICogICAgICAgJCQgfCAgIFxcJCQkJCQkJCB8JCQkJCQkJCAgfCQkJCQkJCQgIHxcXCQkJCQkJCRcXCBcXCQkJCQkJCQgfFxuICogICAgICAgXFxfX3wgICAgXFxfX19fX19ffFxcX19fX19fXy8gXFxfX19fX19fLyAgXFxfX19fX19ffCBcXF9fX19fX198XG4gKlxuICpcbiAqXG4gKiAgICAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFxcbiAqICAgICQkIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAkJCB8ICAgICAgICQkJCQkJFxcICAkJFxcICAgJCRcXCAgJCQkJCQkXFwgICQkXFwgICAkJFxcICQkJCQkJFxcXG4gKiAgICAkJCB8ICAgICAgIFxcX19fXyQkXFwgJCQgfCAgJCQgfCQkICBfXyQkXFwgJCQgfCAgJCQgfFxcXyQkICBffFxuICogICAgJCQgfCAgICAgICAkJCQkJCQkIHwkJCB8ICAkJCB8JCQgLyAgJCQgfCQkIHwgICQkIHwgICQkIHxcbiAqICAgICQkIHwgICAgICAkJCAgX18kJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8ICAkJCB8JCRcXFxuICogICAgJCQkJCQkJCRcXCBcXCQkJCQkJCQgfFxcJCQkJCQkJCB8XFwkJCQkJCQgIHxcXCQkJCQkJCAgfCAgXFwkJCQkICB8XG4gKiAgICBcXF9fX19fX19ffCBcXF9fX19fX198IFxcX19fXyQkIHwgXFxfX19fX18vICBcXF9fX19fXy8gICAgXFxfX19fL1xuICogICAgICAgICAgICAgICAgICAgICAgICAkJFxcICAgJCQgfFxuICogICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgXFxfX19fX18vXG4gKi9cblxuZXhwb3J0IGNsYXNzIEJDRFRhYkJ1dHRvbiBleHRlbmRzIG1kbC5NYXRlcmlhbEJ1dHRvbiB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JDRCAtIFRhYiBMaXN0IEJ1dHRvbic7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLXRhYi1saXN0LWJ1dHRvbic7XG5cbiAgICBzdGF0aWMgYW5jaG9yVG9TZXQgPSAnJztcblxuICAgIG92ZXJyaWRlIGVsZW1lbnRfOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBib3VuZFRhYjpIVE1MRGl2RWxlbWVudDtcbiAgICBuYW1lOnN0cmluZyA9ICcnO1xuICAgIHNldEFuY2hvcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSAhPT0gJ0JVVFRPTicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgQmVsbEN1YmljIFRhYiBCdXR0b24gbXVzdCBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gYSA8YnV0dG9uPiBlbGVtZW50LicpO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgQmVsbEN1YmljIFRhYiBCdXR0b24gbXVzdCBoYXZlIGEgbmFtZSBhdHRyaWJ1dGUuJyk7XG5cbiAgICAgICAgY29uc3QgYm91bmRUYWIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYudGFiLWNvbnRlbnRbbmFtZT1cIiR7bmFtZX1cIl1gKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgaWYgKCFib3VuZFRhYikgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ291bGQgbm90IGZpbmQgYSB0YWIgd2l0aCB0aGUgbmFtZSBcIiR7bmFtZX1cIi5gKTtcbiAgICAgICAgaWYgKCFib3VuZFRhYi5wYXJlbnRFbGVtZW50KSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUYWIgd2l0aCBuYW1lIFwiJHtuYW1lfVwiIGhhcyBubyBwYXJlbnQgZWxlbWVudCFgKTtcblxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gbmFtZTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG5cbiAgICAgICAgc3VwZXIoZWxlbWVudCk7IC8vIE5vdyB3ZSBjYW4gdXNlIGB0aGlzYCFcbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKGVsZW1lbnQsIHRoaXMsIGJvdW5kVGFiLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuYm91bmRUYWIgPSBib3VuZFRhYjtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgcGFnZSB3YXMgcmVsb2FkZWRcbiAgICAgICAgY29uc3QgZW50cnkgPSB3aW5kb3cucGVyZm9ybWFuY2UuZ2V0RW50cmllc0J5VHlwZShcIm5hdmlnYXRpb25cIik/LlswXTtcbiAgICAgICAgdGhpcy5zZXRBbmNob3IgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ/Lmhhc0F0dHJpYnV0ZSgnZG8tdGFiLWFuY2hvcicpID8/IGZhbHNlO1xuXG4gICAgICAgIHJlZ2lzdGVyRm9yRXZlbnRzKHRoaXMuZWxlbWVudF8sIHthY3RpdmF0ZTogdGhpcy5hY3RpdmF0ZS5iaW5kKHRoaXMpfSk7XG5cbiAgICAgICAgaWYgKGVudHJ5ICYmICd0eXBlJyBpbiBlbnRyeSAmJiBlbnRyeS50eXBlID09PSAncmVsb2FkJylcbiAgICAgICAgICAgIHRoaXMubWFrZVNlbGVjdGVkKDApO1xuICAgICAgICBlbHNlIGlmICh0aGlzLnNldEFuY2hvciAmJiB3aW5kb3cubG9jYXRpb24uaGFzaC50b0xvd2VyQ2FzZSgpID09PSBgI3RhYi0ke25hbWV9YC50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2sodGhpcy5tYWtlU2VsZWN0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMubWFrZVNlbGVjdGVkKDApO1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJucyB0aGUgaW5kZXggb2YgdGhpcyB0YWIgKDAtYmFzZWQpIG9yIC0xIGlmIG5vdCBmb3VuZCAqL1xuICAgIGZpbmRUYWJOdW1iZXIoYnV0dG9uXz86IEVsZW1lbnQpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBidXR0b24gPSBidXR0b25fID8/IHRoaXMuZWxlbWVudF87XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZygnZmluZFRhYk51bWJlcjogLSBidXR0b246JywgYnV0dG9uLCAnYXJyYXk6JywgWy4uLihidXR0b24ucGFyZW50RWxlbWVudD8uY2hpbGRyZW4gPz8gW10pXSwgJ2luZGV4OicsIFsuLi4oYnV0dG9uLnBhcmVudEVsZW1lbnQ/LmNoaWxkcmVuID8/IFtdKV0uaW5kZXhPZihidXR0b24pKTtcbiAgICAgICAgcmV0dXJuIFsuLi4oYnV0dG9uLnBhcmVudEVsZW1lbnQ/LmNoaWxkcmVuID8/IFtdKV0uaW5kZXhPZihidXR0b24pO1xuICAgIH1cblxuICAgIG1ha2VTZWxlY3RlZCh0YWJOdW1iZXJfPzogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRhYk51bWJlciA9IHRhYk51bWJlcl8gPz8gdGhpcy5maW5kVGFiTnVtYmVyKCk7XG4gICAgICAgIGlmICh0YWJOdW1iZXIgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoZSB0YWIgbnVtYmVyLicpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ21ha2VTZWxlY3RlZDogdGFiTnVtYmVyOicsIHRhYk51bWJlcik7XG5cbiAgICAgICAgY29uc3Qgc2libGluZ3NBbmRTZWxmID0gWy4uLih0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQ/LmNoaWxkcmVuID8/IFtdKV07XG4gICAgICAgIGlmICghc2libGluZ3NBbmRTZWxmW3RhYk51bWJlcl0gfHwgc2libGluZ3NBbmRTZWxmW3RhYk51bWJlcl0hLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHJldHVybjtcblxuICAgICAgICBmb3IgKGNvbnN0IHNpYmxpbmcgb2Ygc2libGluZ3NBbmRTZWxmKSB7XG4gICAgICAgICAgICBpZiAoc2libGluZyA9PT0gdGhpcy5lbGVtZW50Xykge1xuICAgICAgICAgICAgICAgIHNpYmxpbmcuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2libGluZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBzaWJsaW5nLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5ib3VuZFRhYi5wYXJlbnRFbGVtZW50KSByZXR1cm47IC8vIEkgd291bGQgd29ycnkgYWJvdXQgcmFjZSBjb25kaXRpb25zLCBidXQgYnJvd3NlcnMgcnVuIHdlYnNpdGVzIGluIGFuIEV2ZW50IExvb3AuXG5cbiAgICAgICAgY29uc3QgdGFiX3NpYmxpbmdzQW5kVGFiID0gWy4uLnRoaXMuYm91bmRUYWIucGFyZW50RWxlbWVudC5jaGlsZHJlbl07XG4gICAgICAgIGZvciAoY29uc3QgdGFiIG9mIHRhYl9zaWJsaW5nc0FuZFRhYikge1xuXG4gICAgICAgICAgICBpZiAodGFiID09PSB0aGlzLmJvdW5kVGFiKSB7XG4gICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIHRhYi5jbGFzc0xpc3QucmVtb3ZlKCd0YWItY29udGVudC0taGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgaWYgKCdpbmVydCcgaW4gKHRhYiBhcyBIVE1MRWxlbWVudCkpICh0YWIgYXMgSFRNTEVsZW1lbnQpLmluZXJ0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0YWIuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgdGFiLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB0YWIucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFRhYi5wYXJlbnRFbGVtZW50LnN0eWxlLm1hcmdpbkxlZnQgPSBgLSR7dGFiTnVtYmVyfTAwdndgO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYWRkSGlkZGVuKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFiLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5hZGQoJ3RhYi1jb250ZW50LS1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCdpbmVydCcgaW4gKHRhYiBhcyBIVE1MRWxlbWVudCkpICh0YWIgYXMgSFRNTEVsZW1lbnQpLmluZXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFiLnBhcmVudEVsZW1lbnQhLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBhZGRIaWRkZW4sIHtvbmNlOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgYWZ0ZXJEZWxheSgyNTAsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGFiLnBhcmVudEVsZW1lbnQ/LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBhZGRIaWRkZW4pO1xuICAgICAgICAgICAgICAgICAgICBhZGRIaWRkZW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgICAgICAgICAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgICAgICAgICAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNldEFuY2hvcikge1xuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBVUkwgaGFzaCAtIGlmIHRoZSB0YWIgaXMgbm90IHRoZSBmaXJzdCB0YWIsIHRoZW4gYWRkIHRoZSB0YWIgbmFtZSB0byB0aGUgaGFzaC4gT3RoZXJ3aXNlLCByZW1vdmUgdGhlIGhhc2guXG4gICAgICAgICAgICBCQ0RUYWJCdXR0b24uYW5jaG9yVG9TZXQgPSB0YWJOdW1iZXIgPT0gMCA/ICcnIDogYCN0YWItJHt0aGlzLm5hbWV9YC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgQkNEVGFiQnV0dG9uLnNldEFuY2hvckluM0FuaW1GcmFtZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBTZXRzIGB3aW5kb3cubG9jYXRpb24uaGFzaGAgdG8gdGhlIHZhbHVlIG9mIGBiY2RUYWJCdXR0b24uYW5jaG9yVG9TZXRgIGluIHRocmVlIGFuaW1hdGlvbiBmcmFtZXMuICovXG4gICAgc3RhdGljIHNldEFuY2hvckluM0FuaW1GcmFtZXMoKSB7XG4gICAgICAgIG5lc3RBbmltYXRpb25GcmFtZXMoMywgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJDRFRhYkJ1dHRvbi5hbmNob3JUb1NldCA9PT0gJycpIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB3aW5kb3cubG9jYXRpb24uaGFzaCA9IEJDRFRhYkJ1dHRvbi5hbmNob3JUb1NldDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubWFrZVNlbGVjdGVkKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYmx1cigpO1xuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goQkNEVGFiQnV0dG9uKTtcblxuXG5cblxuLyoqKlxuICogICAgJCQkJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICQkXFwgICAkJFxcICAgICAkJFxcXG4gKiAgICBcXF9fJCQgIF9ffCAgICAgICAgICAgICAgICAgICAgJCQgfCAgJCQgfCAgICBcXF9ffFxuICogICAgICAgJCQgfCAgICAkJCQkJCRcXCAgICQkJCQkJFxcICAkJCB8JCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJCRcXFxuICogICAgICAgJCQgfCAgICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCB8XFxfJCQgIF98ICAkJCB8JCQgIF9fJCRcXCAkJCAgX19fX198XG4gKiAgICAgICAkJCB8ICAgJCQgLyAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8ICAgICQkIHwkJCAvICAkJCB8XFwkJCQkJCRcXFxuICogICAgICAgJCQgfCAgICQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkXFwgJCQgfCQkIHwgICQkIHwgXFxfX19fJCRcXFxuICogICAgICAgJCQgfCAgIFxcJCQkJCQkICB8XFwkJCQkJCQgIHwkJCB8ICBcXCQkJCQgIHwkJCB8JCQkJCQkJCAgfCQkJCQkJCQgIHxcbiAqICAgICAgIFxcX198ICAgIFxcX19fX19fLyAgXFxfX19fX18vIFxcX198ICAgXFxfX19fLyBcXF9ffCQkICBfX19fLyBcXF9fX19fX18vXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9ffFxuICovXG5cblxuZXhwb3J0IGNsYXNzIEJDRFRvb2x0aXAge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgLSBUb29sdGlwJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtYmNkLXRvb2x0aXAnO1xuXG4gICAgcmVsYXRpb246ICdwcmVjZWRpbmcnIHwgJ3Byb2NlZWRpbmcnIHwgJ2NoaWxkJyB8ICdzZWxlY3Rvcic7XG4gICAgcG9zaXRpb246ICd0b3AnIHwgJ2JvdHRvbScgfCAnbGVmdCcgfCAncmlnaHQnID0gJ3RvcCc7XG5cbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBib3VuZEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGdhcEJyaWRnZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgb3BlbkRlbGF5TVM6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Rvb2x0aXAnKTsgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtcm9sZScsICd0b29sdGlwJyk7XG5cbiAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdqcy1iY2QtdG9vbHRpcF9nYXAtYnJpZGdlJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmdhcEJyaWRnZUVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMub3BlbkRlbGF5TVMgPSAgcGFyc2VJbnQoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ29wZW4tZGVsYXktbXMnKSA/PyAnNDAwJyk7XG5cblxuICAgICAgICBjb25zdCB0ZW1wUmVsYXRpb24gPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndG9vbHRpcC1yZWxhdGlvbicpID8/ICdwcm9jZWVkaW5nJztcblxuICAgICAgICBsZXQgdGVtcEVsZW1lbnQ7XG5cbiAgICAgICAgc3dpdGNoICh0ZW1wUmVsYXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3ByZWNlZGluZyc6IHRlbXBFbGVtZW50ID0gZWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmc7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncHJvY2VlZGluZyc6IHRlbXBFbGVtZW50ID0gZWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NoaWxkJzogdGVtcEVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7IGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdzZWxlY3Rvcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0b29sdGlwLXNlbGVjdG9yJykgPz8gJyc7XG4gICAgICAgICAgICAgICAgdGVtcEVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ/LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgYnJlYWs7IH1cblxuICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRvb2x0aXAtcmVsYXRpb24gYXR0cmlidXRlIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZWxhdGlvbiA9IHRlbXBSZWxhdGlvbjtcblxuICAgICAgICBpZiAoIXRlbXBFbGVtZW50IHx8ICEodGVtcEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgKSB0aHJvdyBuZXcgRXJyb3IoJ1RPT0xUSVAgLSBDb3VsZCBub3QgZmluZCBhIHZhbGlkIEhUTUwgRWxlbWVudCB0byBiaW5kIHRvIScpO1xuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudCA9IHRlbXBFbGVtZW50O1xuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgdGhpcy5ib3VuZEVsZW1lbnQsIHRydWUsIHRydWUpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBQb3MgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndG9vbHRpcC1wb3NpdGlvbicpO1xuXG4gICAgICAgIHN3aXRjaCAodGVtcFBvcykge1xuICAgICAgICAgICAgY2FzZSAndG9wJzogIGNhc2UgJ2JvdHRvbSc6ICBjYXNlICdsZWZ0JzogIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gdGVtcFBvczsgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0b29sdGlwLXBvc2l0aW9uIGF0dHJpYnV0ZSEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvdW5kRW50ZXIgPSB0aGlzLmhhbmRsZUhvdmVyRW50ZXIuYmluZCh0aGlzKTtcbiAgICAgICAgY29uc3QgYm91bmRMZWF2ZSA9IHRoaXMuaGFuZGxlSG92ZXJMZWF2ZS5iaW5kKHRoaXMpO1xuICAgICAgICBjb25zdCBib3VuZFRvdWNoID0gdGhpcy5oYW5kbGVUb3VjaC5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGJvdW5kTGVhdmUpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4gZS5zdG9wUHJvcGFnYXRpb24oKSk7XG5cbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICBib3VuZEVudGVyKTsgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICBib3VuZEVudGVyKTtcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICBib3VuZExlYXZlKTsgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICBib3VuZExlYXZlKTtcblxuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgIGJvdW5kVG91Y2gsIHtwYXNzaXZlOiB0cnVlfSk7IHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgIGJvdW5kVG91Y2gsIHtwYXNzaXZlOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuYm91bmRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsICAgYm91bmRUb3VjaCwge3Bhc3NpdmU6IHRydWV9KTsgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsICAgYm91bmRUb3VjaCwge3Bhc3NpdmU6IHRydWV9KTtcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAgICBib3VuZFRvdWNoLCB7cGFzc2l2ZTogdHJ1ZX0pOyB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAgICBib3VuZFRvdWNoLCB7cGFzc2l2ZTogdHJ1ZX0pO1xuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIGJvdW5kVG91Y2gsIHtwYXNzaXZlOiB0cnVlfSk7IHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIGJvdW5kVG91Y2gsIHtwYXNzaXZlOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2goZXZlbnQ6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoID4gMCkgdGhpcy5oYW5kbGVIb3ZlckVudGVyKHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICAgIGVsc2UgdGhpcy5oYW5kbGVIb3ZlckxlYXZlKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlSG92ZXJFbnRlcihldmVudD86IE1vdXNlRXZlbnR8Rm9jdXNFdmVudCwgYnlwYXNzV2FpdD86IHRydWUpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCA/IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZXZlbnQ/LnggPz8gMCwgZXZlbnQ/LnkgPz8gMCkgOiBldmVudD8udGFyZ2V0O1xuXG4gICAgICAgIGlmICh0YXJnZXRFbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbLGluc3RhbmNlXSBvZiB0YXJnZXRFbGVtZW50LnVwZ3JhZGVzID8/IFtdKVxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIEJDRERyb3Bkb3duKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgWyxpbnN0YW5jZV0gb2YgdGFyZ2V0RWxlbWVudC50YXJnZXRpbmdDb21wb25lbnRzID8/IFtdKVxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIEJDRERyb3Bkb3duICYmIGluc3RhbmNlLmNvbnRhaW5lcl8uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy12aXNpYmxlJykpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd1BhcnQxKCk7XG5cbiAgICAgICAgYWZ0ZXJEZWxheShieXBhc3NXYWl0ID8gMCA6IDYwMCwgZnVuY3Rpb24odGhpczogQkNEVG9vbHRpcCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmVfJykpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc2hvd1BhcnQyKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9XG5cbiAgICBzaG93UGFydDEoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmVfJyk7XG4gICAgICAgIHJlZ2lzdGVyRm9yRXZlbnRzKHdpbmRvdywge2V4aXQ6IHRoaXMuaGlkZV9ib3VuZH0pO1xuICAgIH1cblxuICAgIHNob3dQYXJ0MigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHRoaXMuc2V0UG9zaXRpb24uYmluZCh0aGlzKSwge29uY2U6IHRydWV9KTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMuc2hvd1BhcnQxKCk7XG4gICAgICAgIHRoaXMuc2hvd1BhcnQyKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlSG92ZXJMZWF2ZShldmVudD86IE1vdXNlRXZlbnR8Rm9jdXNFdmVudCkgeyB0aGlzLmhpZGUoKTsgfVxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZV8nKTtcblxuICAgICAgICBhZnRlckRlbGF5KDEwLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZV8nKSlcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZWFkb25seSBoaWRlX2JvdW5kID0gdGhpcy5oaWRlLmJpbmQodGhpcyk7XG5cbiAgICBzZXRQb3NpdGlvbigpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgU2V0dGluZyBwb3NpdGlvbiBvZiB0b29sdGlwIHRvIHRoZSAke3RoaXMucG9zaXRpb259IG9mIGAsIHRoaXMuYm91bmRFbGVtZW50KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ25vbmUgIWltcG9ydGFudCc7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUgIWltcG9ydGFudCc7XG5cbiAgICAgICAgLy8gRm9yY2UgcmVjYWxjIG9mIHN0eWxlc1xuICAgICAgICBjb25zdCB0aXBTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIHRpcFN0eWxlLnRyYW5zaXRpb247XG4gICAgICAgIHRpcFN0eWxlLnRyYW5zZm9ybTtcblxuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ1JlY2FsY3VsYXRlZCBzdHlsZXM6Jywge3RyYW5zZm9ybTogdGlwU3R5bGUudHJhbnNmb3JtLCB0cmFuc2l0aW9uOiB0aXBTdHlsZS50cmFuc2l0aW9uLCB3aWR0aDogdGlwU3R5bGUud2lkdGgsIGhlaWdodDogdGlwU3R5bGUuaGVpZ2h0LCBvZmZzZXRMZWZ0OiB0aGlzLmVsZW1lbnQub2Zmc2V0TGVmdCwgb2Zmc2V0VG9wOiB0aGlzLmVsZW1lbnQub2Zmc2V0VG9wLCBvZmZzZXRXaWR0aDogdGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoLCBvZmZzZXRIZWlnaHQ6IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHR9KTtcblxuICAgICAgICBjb25zdCBlbGVtUmVjdCA9IHRoaXMuYm91bmRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB0aXBSZWN0ID0ge3dpZHRoOiB0aGlzLmVsZW1lbnQub2Zmc2V0V2lkdGgsIGhlaWdodDogdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodH07XG5cbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKCdFbGVtZW50IHJlY3Q6JywgZWxlbVJlY3QpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ0VsZW1lbnQgcmVjdHM6JywgdGhpcy5ib3VuZEVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKSk7XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZygnVG9vbHRpcCByZWN0OicsIHRpcFJlY3QpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ1Rvb2x0aXAgcmVjdHM6JywgdGhpcy5lbGVtZW50LmdldENsaWVudFJlY3RzKCkpO1xuXG4gICAgICAgIC8qKiBUaGUgdG9wIHBvc2l0aW9uIC0gc2V0IHRvIHRoZSBtaWRkbGUgb2YgdGhlIEJvdW5kIEVsZW1lbnQgKi9cbiAgICAgICAgbGV0IHRvcCA9IGVsZW1SZWN0LnRvcCAgKyAoZWxlbVJlY3QuaGVpZ2h0IC8gMik7XG4gICAgICAgIC8qKiBUaGUgdG9wIG1hcmdpbiAtIHRoZSBuZWdhdGl2ZSBoZWlnaHQgb2YgdGhlIHRvb2x0aXAgKi9cbiAgICAgICAgY29uc3QgbWFyZ2luVG9wID0gdGlwUmVjdC5oZWlnaHQgLyAtMjtcblxuICAgICAgICAvKiogVGhlIGxlZnQgcG9zaXRpb24gLSBzZXQgdG8gdGhlIG1pZGRsZSBvZiB0aGUgQm91bmQgRWxlbWVudCAqL1xuICAgICAgICBsZXQgbGVmdCA9ICBlbGVtUmVjdC5sZWZ0ICsgKGVsZW1SZWN0LndpZHRoICAvIDIpO1xuICAgICAgICAvKiogVGhlIGxlZnQgbWFyZ2luIC0gdGhlIG5lZ2F0aXZlIHdpZHRoIG9mIHRoZSB0b29sdGlwICovXG4gICAgICAgIGNvbnN0IG1hcmdpbkxlZnQgPSAgIHRpcFJlY3Qud2lkdGggLyAtMjtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKGBMZWZ0IFBvc2l0aW9uOiAke2xlZnQgKyBtYXJnaW5MZWZ0fSwgcHVzaGluZz8gJHtsZWZ0ICsgbWFyZ2luTGVmdCA8IDh9OyBSaWdodCBQb3NpdGlvbjogJHtsZWZ0ICsgbWFyZ2luTGVmdCArIHRpcFJlY3Qud2lkdGh9LCBwdXNoaW5nPyAke2xlZnQgKyBtYXJnaW5MZWZ0ICsgdGlwUmVjdC53aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoIC0gOH1gKTtcblxuICAgICAgICAvLyBQYWRkaW5nIG9mIDE2cHggb24gdGhlIGxlZnQgYW5kIHJpZ2h0IG9mIHRoZSBkb2N1bWVudFxuXG4gICAgICAgIHN3aXRjaCAodGhpcy5wb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG5cblxuXG4gICAgICAgICAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxN3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHtNYXRoLm1heCh0aXBSZWN0LndpZHRoLCBlbGVtUmVjdC53aWR0aCl9cHhgO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7TWF0aC5taW4oZWxlbVJlY3QubGVmdCwgbGVmdCArIG1hcmdpbkxlZnQpIC0gbGVmdCAtIG1hcmdpbkxlZnR9cHhgO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxlZnQgKyBtYXJnaW5MZWZ0IDwgOCkgbGVmdCArPSA4IC0gbGVmdCAtIG1hcmdpbkxlZnQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGAke2xlZnR9cHhgO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5tYXJnaW5MZWZ0ID0gYCR7bWFyZ2luTGVmdH1weGA7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcblxuICAgICAgICAgICAgICAgIHRvcCArPSA4IC0gdG9wIC0gbWFyZ2luVG9wO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50LnN0eWxlLmhlaWdodCA9IGAke01hdGgubWF4KHRpcFJlY3QuaGVpZ2h0LCBlbGVtUmVjdC5oZWlnaHQpfXB4YDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50LnN0eWxlLnRvcCA9IGAke01hdGgubWluKGVsZW1SZWN0LnRvcCwgdG9wICsgbWFyZ2luVG9wKSAtIHRvcCAtIG1hcmdpblRvcH1weGA7XG5cbiAgICAgICAgICAgICAgICBpZiAodG9wICsgbWFyZ2luVG9wIDwgOCkgdG9wICs9IDggLSB0b3AgLSBtYXJnaW5Ub3A7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gYCR7dG9wfXB4YDtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubWFyZ2luVG9wID0gYCR7bWFyZ2luVG9wfXB4YDtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NvbnNvbGUubG9nKGBGaW5hbCBMZWZ0IFBvc2l0aW9uOiAke2xlZnQgKyBtYXJnaW5MZWZ0IC0gKHRpcFJlY3Qud2lkdGggLyAyKX1gKTtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMucG9zaXRpb24pIHtcblxuICAgICAgICAgICAgY2FzZSAndG9wJzogICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgID0gYCR7ZWxlbVJlY3QudG9wICAtIHRpcFJlY3QuaGVpZ2h0IC0gMTZ9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS50b3AgID0gYCR7MTYgICsgdGlwUmVjdC5oZWlnaHR9cHhgO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6IHRoaXMuZWxlbWVudC5zdHlsZS50b3AgID0gYCR7ZWxlbVJlY3QudG9wICArIGVsZW1SZWN0LmhlaWdodCArIDE2fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUudG9wICA9IGAtMTZweGA7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzogICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGAke2VsZW1SZWN0LmxlZnQgLSB0aXBSZWN0LndpZHRoIC0gMTZ9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7MTYgKyB0aXBSZWN0LndpZHRofXB4YDtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzogIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7ZWxlbVJlY3QubGVmdCArIGVsZW1SZWN0LndpZHRoICsgMTZ9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS5sZWZ0ID0gYC0xNnB4YDtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgIH1cblxufVxuY29tcG9uZW50c1RvUmVnaXN0ZXIucHVzaChCQ0RUb29sdGlwKTtcblxuXG5cbi8qKipcbiAqICAgICQkJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4gKiAgICAkJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxfX3xcbiAqICAgICQkIHwgICQkIHwkJFxcICAgJCRcXCAkJCQkJCQkXFwgICAkJCQkJCRcXCAgJCQkJCQkXFwkJCQkXFwgICQkXFwgICQkJCQkJCRcXFxuICogICAgJCQgfCAgJCQgfCQkIHwgICQkIHwkJCAgX18kJFxcICBcXF9fX18kJFxcICQkICBfJCQgIF8kJFxcICQkIHwkJCAgX19fX198XG4gKiAgICAkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwgJCQkJCQkJCB8JCQgLyAkJCAvICQkIHwkJCB8JCQgL1xuICogICAgJCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQgIF9fJCQgfCQkIHwgJCQgfCAkJCB8JCQgfCQkIHxcbiAqICAgICQkJCQkJCQgIHxcXCQkJCQkJCQgfCQkIHwgICQkIHxcXCQkJCQkJCQgfCQkIHwgJCQgfCAkJCB8JCQgfFxcJCQkJCQkJFxcXG4gKiAgICBcXF9fX19fX18vICBcXF9fX18kJCB8XFxfX3wgIFxcX198IFxcX19fX19fX3xcXF9ffCBcXF9ffCBcXF9ffFxcX198IFxcX19fX19fX3xcbiAqICAgICAgICAgICAgICAkJFxcICAgJCQgfFxuICogICAgICAgICAgICAgIFxcJCQkJCQkICB8XG4gKiAgICAgICAgICAgICAgIFxcX19fX19fL1xuICogICAgJCQkJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICAgICAgICAgICQkJCQkJFxcXG4gKiAgICBcXF9fJCQgIF9ffCAgICAgICAgICAgICAgICAgICAgICAkJCB8ICAgICAgICAgICQkICBfXyQkXFxcbiAqICAgICAgICQkIHwgICAgJCQkJCQkXFwgICQkXFwgICAkJFxcICQkJCQkJFxcICAgICAgICAgJCQgLyAgJCQgfCAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCQkXFxcbiAqICAgICAgICQkIHwgICAkJCAgX18kJFxcIFxcJCRcXCAkJCAgfFxcXyQkICBffCAgICAgICAgJCQkJCQkJCQgfCQkICBfXyQkXFwgJCQgIF9fJCRcXCAgXFxfX19fJCRcXCAkJCAgX19fX198XG4gKiAgICAgICAkJCB8ICAgJCQkJCQkJCQgfCBcXCQkJCQgIC8gICAkJCB8ICAgICAgICAgICQkICBfXyQkIHwkJCB8ICBcXF9ffCQkJCQkJCQkIHwgJCQkJCQkJCB8XFwkJCQkJCRcXFxuICogICAgICAgJCQgfCAgICQkICAgX19fX3wgJCQgICQkPCAgICAkJCB8JCRcXCAgICAgICAkJCB8ICAkJCB8JCQgfCAgICAgICQkICAgX19fX3wkJCAgX18kJCB8IFxcX19fXyQkXFxcbiAqICAgICAgICQkIHwgICBcXCQkJCQkJCRcXCAkJCAgL1xcJCRcXCAgIFxcJCQkJCAgfCAgICAgICQkIHwgICQkIHwkJCB8ICAgICAgXFwkJCQkJCQkXFwgXFwkJCQkJCQkIHwkJCQkJCQkICB8XG4gKiAgICAgICBcXF9ffCAgICBcXF9fX19fX198XFxfXy8gIFxcX198ICAgXFxfX19fLyAgICAgICBcXF9ffCAgXFxfX3xcXF9ffCAgICAgICBcXF9fX19fX198IFxcX19fX19fX3xcXF9fX19fX18vXG4gKlxuICpcbiAqXG4gKi9cblxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBiY2REeW5hbWljVGV4dEFyZWFfYmFzZSB7XG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgbnVsbCwgZmFsc2UsIHRydWUpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuYWRqdXN0KCk7XG5cbiAgICAgICAgY29uc3QgYm91bmRBZGp1c3QgPSB0aGlzLmFkanVzdC5iaW5kKHRoaXMpO1xuICAgICAgICByZWdpc3RlckZvckV2ZW50cyh0aGlzLmVsZW1lbnQsIHtjaGFuZ2U6IGJvdW5kQWRqdXN0fSk7XG5cbiAgICAgICAgY29uc3QgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoYm91bmRBZGp1c3QpO1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8gSG9wZWZ1bGx5IHJlc29sdmUgYW4gZWRnZS1jYXNlIGNhdXNpbmcgdGhlIHRleHQgYXJlYSB0byBub3QgaW5pdGlhbGx5IHNpemUgaXRzZWxmIHByb3Blcmx5XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShib3VuZEFkanVzdCk7XG4gICAgfVxuXG4gICAgYWJzdHJhY3QgYWRqdXN0KCk6IGFueTtcblxufVxuXG5leHBvcnQgY2xhc3MgYmNkRHluYW1pY1RleHRBcmVhSGVpZ2h0IGV4dGVuZHMgYmNkRHluYW1pY1RleHRBcmVhX2Jhc2Uge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgLSBEeW5hbWljIFRleHRBcmVhIC0gSGVpZ2h0JztcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtZHluYW1pYy10ZXh0YXJlYS1oZWlnaHQnO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgYWRqdXN0KCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KS5oZWlnaHQ7IC8vIEZvcmNlIHRoZSBicm93c2VyIHRvIHJlY2FsY3VsYXRlIHRoZSBzY3JvbGwgaGVpZ2h0XG5cbiAgICAgICAgY29uc3QgcGFkZGluZ1BYID0gcGFyc2VJbnQodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgncGFkZGluZ1BYJykgPz8gJzAnKTtcbiAgICAgICAgaWYgKGlzTmFOKHBhZGRpbmdQWCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignVGhlIHBhZGRpbmdQWCBhdHRyaWJ1dGUgb2YgdGhlIGR5bmFtaWMgdGV4dCBhcmVhIGlzIG5vdCBhIG51bWJlcjonLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0ICsgcGFkZGluZ1BYfXB4YDtcbiAgICB9XG5cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goYmNkRHluYW1pY1RleHRBcmVhSGVpZ2h0KTtcblxuZXhwb3J0IGNsYXNzIGJjZER5bmFtaWNUZXh0QXJlYVdpZHRoIGV4dGVuZHMgYmNkRHluYW1pY1RleHRBcmVhX2Jhc2Uge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgLSBEeW5hbWljIFRleHRBcmVhIC0gV2lkdGgnO1xuICAgIHN0YXRpYyByZWFkb25seSBjc3NDbGFzcyA9ICdqcy1keW5hbWljLXRleHRhcmVhLXdpZHRoJztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5hZGp1c3QuYmluZCh0aGlzKSkub2JzZXJ2ZSh0aGlzLmVsZW1lbnQpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGFkanVzdCgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICAgIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KS53aWR0aDsgLy8gRm9yY2UgdGhlIGJyb3dzZXIgdG8gcmVjYWxjdWxhdGUgdGhlIHNjcm9sbCBoZWlnaHRcblxuICAgICAgICBjb25zdCBwYWRkaW5nUFggPSBwYXJzZUludCh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdwYWRkaW5nUFgnKSA/PyAnMCcpO1xuICAgICAgICBpZiAoaXNOYU4ocGFkZGluZ1BYKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgcGFkZGluZ1BYIGF0dHJpYnV0ZSBvZiB0aGUgZHluYW1pYyB0ZXh0IGFyZWEgaXMgbm90IGEgbnVtYmVyOicsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gYG1pbigke3RoaXMuZWxlbWVudC5zY3JvbGxXaWR0aCArIHBhZGRpbmdQWH1weCwgMTAwY3FtaW4pYDtcbiAgICB9XG5cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goYmNkRHluYW1pY1RleHRBcmVhV2lkdGgpO1xuXG5cblxuLyoqKlxuICogICAgJCQkJCQkJFxcICAgICAgICAgICAgJCRcXCAgICAgICAgICAgICAkJFxcICAgICAkJFxcXG4gKiAgICAkJCAgX18kJFxcICAgICAgICAgICAkJCB8ICAgICAgICAgICAgJCQgfCAgICBcXF9ffFxuICogICAgJCQgfCAgJCQgfCAkJCQkJCRcXCAgJCQgfCAkJCQkJCRcXCAgJCQkJCQkXFwgICAkJFxcICQkXFwgICAgJCRcXCAgJCQkJCQkXFxcbiAqICAgICQkJCQkJCQgIHwkJCAgX18kJFxcICQkIHwgXFxfX19fJCRcXCBcXF8kJCAgX3wgICQkIHxcXCQkXFwgICQkICB8JCQgIF9fJCRcXFxuICogICAgJCQgIF9fJCQ8ICQkJCQkJCQkIHwkJCB8ICQkJCQkJCQgfCAgJCQgfCAgICAkJCB8IFxcJCRcXCQkICAvICQkJCQkJCQkIHxcbiAqICAgICQkIHwgICQkIHwkJCAgIF9fX198JCQgfCQkICBfXyQkIHwgICQkIHwkJFxcICQkIHwgIFxcJCQkICAvICAkJCAgIF9fX198XG4gKiAgICAkJCB8ICAkJCB8XFwkJCQkJCQkXFwgJCQgfFxcJCQkJCQkJCB8ICBcXCQkJCQgIHwkJCB8ICAgXFwkICAvICAgXFwkJCQkJCQkXFxcbiAqICAgIFxcX198ICBcXF9ffCBcXF9fX19fX198XFxfX3wgXFxfX19fX19ffCAgIFxcX19fXy8gXFxfX3wgICAgXFxfLyAgICAgXFxfX19fX19ffFxuICpcbiAqXG4gKlxuICogICAgJCQkJCQkJCRcXCAkJFxcICQkXFwgICAgICAgICAgICAgICAgICQkJCQkJCRcXCAgJCRcXCAgICAgICAgICAgJCRcXFxuICogICAgJCQgIF9fX19ffFxcX198JCQgfCAgICAgICAgICAgICAgICAkJCAgX18kJFxcIFxcX198ICAgICAgICAgICQkIHxcbiAqICAgICQkIHwgICAgICAkJFxcICQkIHwgJCQkJCQkXFwgICAgICAgICQkIHwgICQkIHwkJFxcICAkJCQkJCQkXFwgJCQgfCAgJCRcXCAgJCQkJCQkXFwgICAkJCQkJCRcXFxuICogICAgJCQkJCRcXCAgICAkJCB8JCQgfCQkICBfXyQkXFwgICAgICAgJCQkJCQkJCAgfCQkIHwkJCAgX19fX198JCQgfCAkJCAgfCQkICBfXyQkXFwgJCQgIF9fJCRcXFxuICogICAgJCQgIF9ffCAgICQkIHwkJCB8JCQkJCQkJCQgfCAgICAgICQkICBfX19fLyAkJCB8JCQgLyAgICAgICQkJCQkJCAgLyAkJCQkJCQkJCB8JCQgfCAgXFxfX3xcbiAqICAgICQkIHwgICAgICAkJCB8JCQgfCQkICAgX19fX3wgICAgICAkJCB8ICAgICAgJCQgfCQkIHwgICAgICAkJCAgXyQkPCAgJCQgICBfX19ffCQkIHxcbiAqICAgICQkIHwgICAgICAkJCB8JCQgfFxcJCQkJCQkJFxcICAgICAgICQkIHwgICAgICAkJCB8XFwkJCQkJCQkXFwgJCQgfCBcXCQkXFwgXFwkJCQkJCQkXFwgJCQgfFxuICogICAgXFxfX3wgICAgICBcXF9ffFxcX198IFxcX19fX19fX3wgICAgICBcXF9ffCAgICAgIFxcX198IFxcX19fX19fX3xcXF9ffCAgXFxfX3wgXFxfX19fX19ffFxcX198XG4gKlxuICpcbiAqXG4gKi9cblxuY2xhc3MgUmVsYXRpdmVGaWxlUGlja2VyIHtcbiAgICBzdGF0aWMgYXNTdHJpbmcgPSAnQkNEIC0gUmVsYXRpdmUgRmlsZSBQaWNrZXInO1xuICAgIHN0YXRpYyBjc3NDbGFzcyA9ICdqcy1yZWxhdGl2ZS1maWxlLXBpY2tlcic7XG5cbiAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICByZWxhdGl2ZVRvPzogZnMuQmVsbEZvbGRlcnx7ZGlyZWN0b3J5OiBmcy5CZWxsRm9sZGVyfXxzdHJpbmdbXTtcbiAgICBnZXQgZGlyZWN0b3J5KCk6IGZzLkJlbGxGb2xkZXJ8dW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlbGF0aXZlVG8pIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGlmICgnaGFuZGxlJyBpbiB0aGlzLnJlbGF0aXZlVG8pIHJldHVybiB0aGlzLnJlbGF0aXZlVG87XG4gICAgICAgIGlmICgnZGlyZWN0b3J5JyBpbiB0aGlzLnJlbGF0aXZlVG8pIHJldHVybiB0aGlzLnJlbGF0aXZlVG8uZGlyZWN0b3J5O1xuICAgICAgICByZXR1cm4gU2V0dGluZ3NHcmlkLmdldFNldHRpbmcodGhpcy5yZWxhdGl2ZVRvLCAnZGlyZWN0b3J5Jyk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTElucHV0RWxlbWVudCwgcmVsYXRpdmVUbz86IGZzLkJlbGxGb2xkZXJ8e2RpcmVjdG9yeTogZnMuQmVsbEZvbGRlcn0pIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuICAgICAgICBpZiAoIXJlbGF0aXZlVG8pIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlVG9BdHRyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JlbGF0aXZlLXRvJyk7XG4gICAgICAgICAgICBpZiAoIXJlbGF0aXZlVG9BdHRyKSB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZWxhdGl2ZSBmaWxlIHBpY2tlciBtdXN0IGhhdmUgYSByZWxhdGl2ZS10byBhdHRyaWJ1dGUgb3IgaGF2ZSBhIGZvbGRlciBzcGVjaWZpZWQgYXQgY3JlYXRpb24uJyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVsYXRpdmVUbyA9IHJlbGF0aXZlVG9BdHRyLnNwbGl0KCcuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgbnVsbCwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIHJlZ2lzdGVyRm9yRXZlbnRzKHRoaXMuZWxlbWVudCwge2NoYW5nZTogdGhpcy5ib3VuZE9uQ2hhbmdlfSk7XG5cblxuICAgICAgICAvKiBDcmVhdGUgdGhlIGZvbGxvd2luZyBidXR0b246XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibWRsLWJ1dHRvbiBtZGwtanMtYnV0dG9uIG1kbC1idXR0b24tLWZhYiBtZGwtanMtcmlwcGxlLWVmZmVjdCBqcy1yZWxhdGl2ZS1maWxlLXBpY2tlci0tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+ZWRpdF9kb2N1bWVudDwvaT5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAqL1xuXG4gICAgICAgIHRoaXMuYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHRoaXMuYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgdGhpcy5idXR0b24uY2xhc3NMaXN0LmFkZChcbiAgICAgICAgICAgIC8qIE1ETCAgKi8gJ21kbC1idXR0b24nLCAnbWRsLWpzLWJ1dHRvbicsICdtZGwtYnV0dG9uLS1mYWInLCAnbWRsLWpzLXJpcHBsZS1lZmZlY3QnLFxuICAgICAgICAgICAgLyogTWluZSAqLyAnanMtcmVsYXRpdmUtZmlsZS1waWNrZXItLWJ1dHRvbidcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xuICAgICAgICBpY29uLmNsYXNzTGlzdC5hZGQoJ21hdGVyaWFsLWljb25zJyk7XG4gICAgICAgIGljb24udGV4dENvbnRlbnQgPSAnZWRpdF9kb2N1bWVudCc7XG5cbiAgICAgICAgdGhpcy5idXR0b24uYXBwZW5kQ2hpbGQoaWNvbik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZnRlcih0aGlzLmJ1dHRvbik7XG5cbiAgICAgICAgcmVnaXN0ZXJGb3JFdmVudHModGhpcy5idXR0b24sIHthY3RpdmF0ZTogdGhpcy5ib3VuZE9uQnV0dG9uQ2xpY2t9KTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnb25DaGFuZ2UnLCB0aGlzLmVsZW1lbnQudmFsdWUsIHRoaXMpO1xuICAgIH1cbiAgICByZWFkb25seSBib3VuZE9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuXG4gICAgYXN5bmMgb25CdXR0b25DbGljaygpIHtcbiAgICAgICAgY29uc3QgZnMgPSBhd2FpdCBpbXBvcnQoJy4vZmlsZXN5c3RlbS1pbnRlcmZhY2UuanMnKTtcblxuICAgICAgICBjb25zdCByZWxhdGl2ZVRvID0gdGhpcy5yZWxhdGl2ZVRvIGluc3RhbmNlb2YgZnMuQmVsbEZvbGRlciA/IHRoaXMucmVsYXRpdmVUbyA6IHRoaXMuZGlyZWN0b3J5O1xuICAgICAgICBpZiAoIXJlbGF0aXZlVG8pIHJldHVybiBjb25zb2xlLndhcm4oJ1RoZSByZWxhdGl2ZSBmaWxlIHBpY2tlciBoYXMgbm8gcmVsYXRpdmUtdG8gZm9sZGVyIHNwZWNpZmllZCcsIHRoaXMpO1xuXG4gICAgICAgIGxldCBmaWxlSGFuZGxlOiBmcy5CZWxsRmlsZXx1bmRlZmluZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBbZmlsZUhhbmRsZV0gPSBhd2FpdCByZWxhdGl2ZVRvLm9wZW5GaWxlUGlja2VyKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlICYmIGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gJiYgZS5uYW1lID09PSAnQWJvcnRFcnJvcicpIHJldHVybjsgLy8gVGhlIHVzZXIgY2FuY2VsZWQgdGhlIGZpbGUgcGlja2VyICh3aGljaCBpcyBmaW5lKVxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgZmlsZSBwaWNrZXIgdGhyZXcgc29tZSBzb3J0IG9mIGVycm9yJywgZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaWxlSGFuZGxlKSByZXR1cm4gY29uc29sZS53YXJuKCdUaGUgZmlsZSBwaWNrZXIgcmV0dXJuZWQgbm8gZmlsZScsIHRoaXMpO1xuXG4gICAgICAgIGNvbnN0IG5hbWVBcnIgPSBhd2FpdCB0aGlzLmRpcmVjdG9yeT8ucmVzb2x2ZUNoaWxkUGF0aChmaWxlSGFuZGxlLCB0cnVlKTtcbiAgICAgICAgaWYgKCFuYW1lQXJyKSByZXR1cm4gY29uc29sZS5kZWJ1ZygnVGhlIGZpbGUgcGlja2VyIHJldHVybmVkIGEgZmlsZSB0aGF0IGlzIG5vdCBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeScsIGZpbGVIYW5kbGUsIHRoaXMuZGlyZWN0b3J5KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsdWUgPSBuYW1lQXJyLmpvaW4oJy8nKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgfVxuICAgIHJlYWRvbmx5IGJvdW5kT25CdXR0b25DbGljayA9IHRoaXMub25CdXR0b25DbGljay5iaW5kKHRoaXMpO1xufVxuY29tcG9uZW50c1RvUmVnaXN0ZXIucHVzaChSZWxhdGl2ZUZpbGVQaWNrZXIpO1xuXG5cbi8qKipcbiAqICAgICQkJCQkJCRcXCAgICAgICAgICAgICQkXFwgICAgICAgICAgICAgJCRcXCAgICAgJCRcXFxuICogICAgJCQgIF9fJCRcXCAgICAgICAgICAgJCQgfCAgICAgICAgICAgICQkIHwgICAgXFxfX3xcbiAqICAgICQkIHwgICQkIHwgJCQkJCQkXFwgICQkIHwgJCQkJCQkXFwgICQkJCQkJFxcICAgJCRcXCAkJFxcICAgICQkXFwgICQkJCQkJFxcXG4gKiAgICAkJCQkJCQkICB8JCQgIF9fJCRcXCAkJCB8IFxcX19fXyQkXFwgXFxfJCQgIF98ICAkJCB8XFwkJFxcICAkJCAgfCQkICBfXyQkXFxcbiAqICAgICQkICBfXyQkPCAkJCQkJCQkJCB8JCQgfCAkJCQkJCQkIHwgICQkIHwgICAgJCQgfCBcXCQkXFwkJCAgLyAkJCQkJCQkJCB8XG4gKiAgICAkJCB8ICAkJCB8JCQgICBfX19ffCQkIHwkJCAgX18kJCB8ICAkJCB8JCRcXCAkJCB8ICBcXCQkJCAgLyAgJCQgICBfX19ffFxuICogICAgJCQgfCAgJCQgfFxcJCQkJCQkJFxcICQkIHxcXCQkJCQkJCQgfCAgXFwkJCQkICB8JCQgfCAgIFxcJCAgLyAgIFxcJCQkJCQkJFxcXG4gKiAgICBcXF9ffCAgXFxfX3wgXFxfX19fX19ffFxcX198IFxcX19fX19fX3wgICBcXF9fX18vIFxcX198ICAgIFxcXy8gICAgIFxcX19fX19fX3xcbiAqXG4gKlxuICpcbiAqICAgICQkJCQkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQkJCQkJFxcICAkJFxcICAgICAgICAgICAkJFxcXG4gKiAgICBcXF8kJCAgX3wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkICBfXyQkXFwgXFxfX3wgICAgICAgICAgJCQgfFxuICogICAgICAkJCB8ICAkJCQkJCRcXCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCRcXCAgICAgICAgJCQgfCAgJCQgfCQkXFwgICQkJCQkJCRcXCAkJCB8ICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJFxcXG4gKiAgICAgICQkIHwgICQkICBfJCQgIF8kJFxcICBcXF9fX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCAgICAgICAkJCQkJCQkICB8JCQgfCQkICBfX19fX3wkJCB8ICQkICB8JCQgIF9fJCRcXCAkJCAgX18kJFxcXG4gKiAgICAgICQkIHwgICQkIC8gJCQgLyAkJCB8ICQkJCQkJCQgfCQkIC8gICQkIHwkJCQkJCQkJCB8ICAgICAgJCQgIF9fX18vICQkIHwkJCAvICAgICAgJCQkJCQkICAvICQkJCQkJCQkIHwkJCB8ICBcXF9ffFxuICogICAgICAkJCB8ICAkJCB8ICQkIHwgJCQgfCQkICBfXyQkIHwkJCB8ICAkJCB8JCQgICBfX19ffCAgICAgICQkIHwgICAgICAkJCB8JCQgfCAgICAgICQkICBfJCQ8ICAkJCAgIF9fX198JCQgfFxuICogICAgJCQkJCQkXFwgJCQgfCAkJCB8ICQkIHxcXCQkJCQkJCQgfFxcJCQkJCQkJCB8XFwkJCQkJCQkXFwgICAgICAgJCQgfCAgICAgICQkIHxcXCQkJCQkJCRcXCAkJCB8IFxcJCRcXCBcXCQkJCQkJCRcXCAkJCB8XG4gKiAgICBcXF9fX19fX3xcXF9ffCBcXF9ffCBcXF9ffCBcXF9fX19fX198IFxcX19fXyQkIHwgXFxfX19fX19ffCAgICAgIFxcX198ICAgICAgXFxfX3wgXFxfX19fX19ffFxcX198ICBcXF9ffCBcXF9fX19fX198XFxfX3xcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICQkIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwkJCQkJCQgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX19fX19fL1xuICovXG5cblxuY2xhc3MgUmVsYXRpdmVJbWFnZVBpY2tlciBleHRlbmRzIFJlbGF0aXZlRmlsZVBpY2tlciB7XG4gICAgc3RhdGljIG92ZXJyaWRlIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JDRCAtIFJlbGF0aXZlIEltYWdlIFBpY2tlcic7XG4gICAgc3RhdGljIG92ZXJyaWRlIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLXJlbGF0aXZlLWltYWdlLXBpY2tlcic7XG5cbiAgICBpbWFnZUVsZW0/OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIG5vSW1hZ2VFbGVtPzogU1ZHU1ZHRWxlbWVudDtcbiAgICByZWxhdGlvbjogJ3ByZXZpb3VzJ3wnbmV4dCd8J3BhcmVudCd8J3NlbGVjdG9yJztcblxuICAgIHN0YXRpYyBub0ltYWdlRG9jPzogRG9jdW1lbnQgfCBQcm9taXNlPHN0cmluZz47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50LCByZWxhdGl2ZVRvPzogZnMuQmVsbEZvbGRlcnx7ZGlyZWN0b3J5OiBmcy5CZWxsRm9sZGVyfSkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCByZWxhdGl2ZVRvKTtcblxuICAgICAgICB0aGlzLnJlbGF0aW9uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JlbGF0aW9uJykgYXMgJ3ByZXZpb3VzJ3wnbmV4dCd8J3BhcmVudCd8J3NlbGVjdG9yJyA/PyAncHJldmlvdXMnO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5yZWxhdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdwcmV2aW91cyc6XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0gPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0gPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdwYXJlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VFbGVtID0gZWxlbWVudC5wYXJlbnRFbGVtZW50IGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdG9yJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NlbGVjdG9yJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxlY3RvcikgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmVsYXRpdmUgaW1hZ2UgcGlja2VyIG11c3QgaGF2ZSBhIHNlbGVjdG9yIGF0dHJpYnV0ZSBpZiB0aGUgcmVsYXRpb24gaXMgc2V0IHRvIHNlbGVjdG9yLicpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0gPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIGFzIEhUTUxJbWFnZUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZWxhdGl2ZSBpbWFnZSBwaWNrZXIgbXVzdCBoYXZlIGEgcmVsYXRpb24gYXR0cmlidXRlIHRoYXQgaXMgZWl0aGVyIHByZXZpb3VzLCBuZXh0LCBwYXJlbnQsIG9yIHNlbGVjdG9yLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmVhdGVOb0ltYWdlRWxlbSgpO1xuXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZShlbGVtZW50LCB0aGlzLCB0aGlzLmltYWdlRWxlbSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY3JlYXRlTm9JbWFnZUVsZW0oKSB7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcmVxdWVzdCBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0XG4gICAgICAgIFJlbGF0aXZlSW1hZ2VQaWNrZXIubm9JbWFnZURvYyA/Pz0gZmV0Y2goJ2h0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20vcy9pL3Nob3J0LXRlcm0vcmVsZWFzZS9tYXRlcmlhbHN5bWJvbHNyb3VuZGVkL2ltYWdlL2RlZmF1bHQvNDhweC5zdmcnKS50aGVuKHIgPT4gci50ZXh0KCkpO1xuXG4gICAgICAgIGxldCBzdmc6IHVuZGVmaW5lZHxTVkdTVkdFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdCB0byBmaW5pc2ggaWYgaXQgaGFzIG5vdCBhbHJlYWR5XG4gICAgICAgIGlmIChSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2MgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBjb25zdCBzdHIgPSBhd2FpdCBSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2M7XG4gICAgICAgICAgICBSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2MgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHN0ciwgJ3RleHQvaHRtbCcpO1xuICAgICAgICAgICAgc3ZnID0gUmVsYXRpdmVJbWFnZVBpY2tlci5ub0ltYWdlRG9jLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpIGFzIFNWR1NWR0VsZW1lbnQ7XG5cbiAgICAgICAgICAgIGlmICghc3ZnLmhhc0F0dHJpYnV0ZSgndmlld0JveCcpKSBzdmcuc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgYDAgMCAke3N2Zy5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykgfHwgJzAnfSAke3N2Zy5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpIHx8ICcwJ31gKTtcbiAgICAgICAgICAgIHN2Zy5yZW1vdmVBdHRyaWJ1dGUoJ3dpZHRoJyk7IHN2Zy5yZW1vdmVBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3ZnID8/PSBSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2MucXVlcnlTZWxlY3Rvcignc3ZnJykgYXMgU1ZHU1ZHRWxlbWVudDtcbiAgICAgICAgaWYgKCFzdmcpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgdGhlIFNWRyBlbGVtZW50IGluIHRoZSBTVkcgZG9jdW1lbnQuJyk7XG5cbiAgICAgICAgdGhpcy5ub0ltYWdlRWxlbSA9IHN2Zy5jbG9uZU5vZGUodHJ1ZSkgYXMgU1ZHU1ZHRWxlbWVudDtcbiAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5jbGFzc0xpc3QuYWRkKCdqcy1yZWxhdGl2ZS1pbWFnZS1waWNrZXItLW5vLWltYWdlJyk7XG5cbiAgICAgICAgdGhpcy5pbWFnZUVsZW0/LmJlZm9yZSh0aGlzLm5vSW1hZ2VFbGVtKTtcblxuICAgICAgICB0aGlzLmltYWdlRWxlbT8uc3JjID8gdGhpcy5zaG93SW1hZ2UoKSA6IHRoaXMuaGlkZUltYWdlKCk7XG4gICAgfVxuXG4gICAgaGlkZUltYWdlKCkge1xuICAgICAgICBpZiAodGhpcy5pbWFnZUVsZW0pIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VFbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB0aGlzLmltYWdlRWxlbS5hcmlhRGlzYWJsZWQgPSAndHJ1ZSc7XG4gICAgICAgICAgICB0aGlzLmltYWdlRWxlbS5hcmlhSGlkZGVuID0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5vSW1hZ2VFbGVtKSB7XG4gICAgICAgICAgICB0aGlzLm5vSW1hZ2VFbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5hcmlhRGlzYWJsZWQgPSAnZmFsc2UnO1xuICAgICAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5hcmlhSGlkZGVuID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3dJbWFnZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VFbGVtKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VFbGVtLmFyaWFEaXNhYmxlZCA9ICdmYWxzZSc7XG4gICAgICAgICAgICB0aGlzLmltYWdlRWxlbS5hcmlhSGlkZGVuID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub0ltYWdlRWxlbSkge1xuICAgICAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5hcmlhRGlzYWJsZWQgPSAndHJ1ZSc7XG4gICAgICAgICAgICB0aGlzLm5vSW1hZ2VFbGVtLmFyaWFIaWRkZW4gPSAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0VmFsdWU6IHN0cmluZyA9ICcnO1xuICAgIG92ZXJyaWRlIGFzeW5jIG9uQ2hhbmdlKCkge1xuICAgICAgICBpZiAodGhpcy5sYXN0VmFsdWUgPT09IHRoaXMuZWxlbWVudC52YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmxhc3RWYWx1ZSA9IHRoaXMuZWxlbWVudC52YWx1ZTtcblxuICAgICAgICBzdXBlci5vbkNoYW5nZSgpO1xuXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuZGlyZWN0b3J5O1xuXG4gICAgICAgIGlmICghdGhpcy5pbWFnZUVsZW0pXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5pbmZvKCdUaGUgcmVsYXRpdmUgaW1hZ2UgcGlja2VyIGRvZXMgbm90IGhhdmUgYW4gaW1hZ2UgZWxlbWVudCB0byB1cGRhdGUuJywgdGhpcyk7XG5cbiAgICAgICAgaWYgKCFkaXIpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZUltYWdlKCk7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5pbmZvKCdUaGUgcmVsYXRpdmUgaW1hZ2UgcGlja2VyIGRvZXMgbm90IGhhdmUgYSBkaXJlY3RvcnkgdG8gdXBkYXRlIHRoZSBpbWFnZSBmcm9tLicsIHRoaXMsIGRpcik7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmlsZUhhbmRsZV8gPSBkaXIuZ2V0RmlsZSh0aGlzLmVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgW2ZpbGVIYW5kbGUsIGZzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtmaWxlSGFuZGxlXywgbG9hZEZTKCldKTtcblxuICAgICAgICAgICAgaWYgKCFmaWxlSGFuZGxlIHx8IGZpbGVIYW5kbGUgaW5zdGFuY2VvZiBmcy5JbnZhbGlkTmFtZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS5pbmZvKCdUaGUgcmVsYXRpdmUgaW1hZ2UgcGlja2VyIGRvZXMgbm90IGhhdmUgYSBmaWxlIGhhbmRsZSB0byB1cGRhdGUgdGhlIGltYWdlIHdpdGguJywgdGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaW1hZ2VFbGVtLnNyYyA9IGF3YWl0IChmaWxlSGFuZGxlLmF0KC0xKSEgYXMgZnMuQmVsbEZpbGUpLnJlYWRBc0RhdGFVUkwoKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0ltYWdlKCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgdGhpcy5oaWRlSW1hZ2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goUmVsYXRpdmVJbWFnZVBpY2tlcik7XG5cbi8qKipcbiAqICAgICQkJCQkJCRcXCAgICQkJCQkJFxcICAkJFxcICAgICAgJCRcXCAgJCQkJCQkXFxcbiAqICAgICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCRcXCAgICAkJCQgfCQkICBfXyQkXFxcbiAqICAgICQkIHwgICQkIHwkJCAvICAkJCB8JCQkJFxcICAkJCQkIHwkJCAvICBcXF9ffCQkXFwgICAgJCRcXCAgJCQkJCQkXFxcbiAqICAgICQkIHwgICQkIHwkJCB8ICAkJCB8JCRcXCQkXFwkJCAkJCB8XFwkJCQkJCRcXCAgXFwkJFxcICAkJCAgfCQkICBfXyQkXFxcbiAqICAgICQkIHwgICQkIHwkJCB8ICAkJCB8JCQgXFwkJCQgICQkIHwgXFxfX19fJCRcXCAgXFwkJFxcJCQgIC8gJCQgLyAgJCQgfFxuICogICAgJCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8XFwkICAvJCQgfCQkXFwgICAkJCB8ICBcXCQkJCAgLyAgJCQgfCAgJCQgfFxuICogICAgJCQkJCQkJCAgfCAkJCQkJCQgIHwkJCB8IFxcXy8gJCQgfFxcJCQkJCQkICB8ICAgXFwkICAvICAgXFwkJCQkJCQkIHxcbiAqICAgIFxcX19fX19fXy8gIFxcX19fX19fLyBcXF9ffCAgICAgXFxfX3wgXFxfX19fX18vICAgICBcXF8vICAgICBcXF9fX18kJCB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcICAgJCQgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwkJCQkJCQgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9fX19fXy9cbiAqL1xuXG5cbi8qKiBVbnNhZmVseSBsb2FkcyBhbiBleHRlcm5hbCBTVkcgZmlsZSBhbmQgaW5zZXJ0cyBpdCBpbnRvIHRoZSBET00uICovXG5jbGFzcyBET01Tdmcge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgLSBET00gU1ZHJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtZG9tLXN2Zyc7XG5cbiAgICBzdmdTcmM6IHN0cmluZztcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgaWYgKCFzcmMpIHRocm93IG5ldyBFcnJvcignVGhlIERPTSBTVkcgbXVzdCBoYXZlIGEgc3JjIGF0dHJpYnV0ZS4nKTtcblxuICAgICAgICB0aGlzLnN2Z1NyYyA9IHNyYztcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5pbml0U3ZnKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdFN2ZygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN2Z1JlcyA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5hbGxvcmlnaW5zLndpbi9yYXc/dXJsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuc3ZnU3JjKX1gLCB7XG4gICAgICAgICAgICAgICAgY2FjaGU6ICdmb3JjZS1jYWNoZScsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFzdmdSZXMub2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtZG9tLXN2Zy0tZXJyb3InLCAnanMtZG9tLXN2Zy0tbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSBgPHA+Q291bGQgbm90IGxvYWQgdGhlIGltYWdlITwvcD48YnI+PGNvZGU+JHtzdmdSZXMuc3RhdHVzfTogJHtzdmdSZXMuc3RhdHVzVGV4dCB8fCAoc3ZnUmVzLnN0YXR1cyA9PSA0MDggPyAnRmV0Y2hpbmcgdGhlIGdyYXBoaWMgdG9vayB0b28gbG9uZyEnIDogJycpfTwvY29kZT5gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzdmdUeHQgPSBhd2FpdCBzdmdSZXMudGV4dCgpO1xuXG4gICAgICAgICAgICBjb25zdCBzdmdEb2MgPSB3aW5kb3cuZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzdmdUeHQsICdpbWFnZS9zdmcreG1sJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHN2ZyA9IHN2Z0RvYy5xdWVyeVNlbGVjdG9yKCdzdmcnKSBhcyBTVkdTVkdFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCFzdmcpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgdGhlIFNWRyBlbGVtZW50IGluIHRoZSBTVkcgZG9jdW1lbnQuJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChzdmcpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2pzLWRvbS1zdmctLWxvYWRlZCcpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoICEgKGUgaW5zdGFuY2VvZiBFcnJvcikgKSB0aHJvdyBlO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgbG9hZCB0aGUgU1ZHIGltYWdlLicsIGUpO1xuXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtZG9tLXN2Zy0tZXJyb3InLCAnanMtZG9tLXN2Zy0tbG9hZGVkJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IGA8cD5Db3VsZCBub3QgbG9hZCB0aGUgaW1hZ2UhPC9wPjxicj5KYXZhU2NyaXB0IEVycm9yOiA8Y29kZT4ke2UubWVzc2FnZX08L2NvZGU+YDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goRE9NU3ZnKTtcblxuXG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgJCRcXCAgICAgICAkJFxcICAgICAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCQkJCRcXCAgICAgICAgICAgICQkXFwgICAgICAgJCRcXFxuJCQgIF9fJCRcXCAgICAgICAgICAgICAkJCB8ICAgICAgJCQgfCAgICBcXF9ffCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkICBfXyQkXFwgICAgICAgICAgIFxcX198ICAgICAgJCQgfFxuJCQgLyAgXFxfX3wgJCQkJCQkXFwgICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJFxcICQkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJFxcICAgICAgICQkIC8gIFxcX198ICQkJCQkJFxcICAkJFxcICAkJCQkJCQkIHxcblxcJCQkJCQkXFwgICQkICBfXyQkXFwgXFxfJCQgIF98ICBcXF8kJCAgX3wgICQkIHwkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffCAgICAgICQkIHwkJCQkXFwgJCQgIF9fJCRcXCAkJCB8JCQgIF9fJCQgfFxuIFxcX19fXyQkXFwgJCQkJCQkJCQgfCAgJCQgfCAgICAgICQkIHwgICAgJCQgfCQkIHwgICQkIHwkJCAvICAkJCB8XFwkJCQkJCRcXCAgICAgICAgJCQgfFxcXyQkIHwkJCB8ICBcXF9ffCQkIHwkJCAvICAkJCB8XG4kJFxcICAgJCQgfCQkICAgX19fX3wgICQkIHwkJFxcICAgJCQgfCQkXFwgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8IFxcX19fXyQkXFwgICAgICAgJCQgfCAgJCQgfCQkIHwgICAgICAkJCB8JCQgfCAgJCQgfFxuXFwkJCQkJCQgIHxcXCQkJCQkJCRcXCAgIFxcJCQkJCAgfCAgXFwkJCQkICB8JCQgfCQkIHwgICQkIHxcXCQkJCQkJCQgfCQkJCQkJCQgIHwgICAgICBcXCQkJCQkJCAgfCQkIHwgICAgICAkJCB8XFwkJCQkJCQkIHxcbiBcXF9fX19fXy8gIFxcX19fX19fX3wgICBcXF9fX18vICAgIFxcX19fXy8gXFxfX3xcXF9ffCAgXFxfX3wgXFxfX19fJCQgfFxcX19fX19fXy8gICAgICAgIFxcX19fX19fLyBcXF9ffCAgICAgIFxcX198IFxcX19fX19fX3xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX19fX18qL1xuXG5pbnRlcmZhY2Ugc2V0dGluZ3NHcmlkT2JqIHtcbiAgICB0eXBlOiAnYm9vbCd8J3N0cmluZydcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdG9vbHRpcD86IHN0cmluZyB8IHtcbiAgICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgICBwb3NpdGlvbjogJ3RvcCd8J2JvdHRvbSd8J2xlZnQnfCdyaWdodCdcbiAgICB9O1xuICAgIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxufVxuXG5jb25zdCBzZXR0aW5nc1RvVXBkYXRlOiAoKCkgPT4gdW5rbm93bilbXSA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNldHRpbmdzKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2V0dGluZ3NUb1VwZGF0ZS5sZW5ndGg7IGkrKylcbiAgICAgICAgc2V0dGluZ3NUb1VwZGF0ZVtpXSEoKTtcbn1cblxudHlwZSBzZXR0aW5nc0dyaWQgPSBSZWNvcmQ8c3RyaW5nLCBzZXR0aW5nc0dyaWRPYmo+XG5leHBvcnQgY2xhc3MgU2V0dGluZ3NHcmlkIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgYXNTdHJpbmcgPSAnQkNEIC0gU2V0dGluZ3MgR3JpZCc7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLXNldHRpbmdzLWdyaWQnO1xuXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgc2V0dGluZ1RlbXBsYXRlOiBEb2N1bWVudEZyYWdtZW50O1xuICAgIHNldHRpbmdzUGF0aDogc3RyaW5nW107XG4gICAgc2V0dGluZ3M6IHNldHRpbmdzR3JpZDtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgbnVsbCwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBKU09OLnBhcnNlKGVsZW1lbnQudGV4dENvbnRlbnQgPz8gJycpIGFzIHNldHRpbmdzR3JpZDtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9ICcnO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzRWxlbUlEID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRlbXBsYXRlSURcIik7XG4gICAgICAgIGlmICghc2V0dGluZ3NFbGVtSUQpIHRocm93IG5ldyBFcnJvcihcIlNldHRpbmdzIEdyaWQgaXMgbWlzc2luZyB0aGUgZGF0YS10ZW1wbGF0ZUlEIGF0dHJpYnV0ZSFcIik7XG5cbiAgICAgICAgY29uc3Qgc2V0dGluZ1RlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2V0dGluZ3NFbGVtSUQpO1xuICAgICAgICBpZiAoIXNldHRpbmdUZW1wbGF0ZSB8fCAhKHNldHRpbmdUZW1wbGF0ZSBpbnN0YW5jZW9mIEhUTUxUZW1wbGF0ZUVsZW1lbnQpKSB0aHJvdyBuZXcgRXJyb3IoYFNldHRpbmdzIEdyaWQgY2Fubm90IGZpbmQgYSBURU1QTEFURSBlbGVtZW50IHdpdGggdGhlIElEIFwiJHtzZXR0aW5nc0VsZW1JRH1cIiFgKTtcblxuICAgICAgICB0aGlzLnNldHRpbmdUZW1wbGF0ZSA9IHNldHRpbmdUZW1wbGF0ZS5jb250ZW50O1xuXG4gICAgICAgIHRoaXMuc2V0dGluZ3NQYXRoID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNldHRpbmdzUGF0aFwiKT8uc3BsaXQoJy4nKSA/PyBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHNldHRpbmdzXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLnNldHRpbmdzKSlcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU2V0dGluZyhrZXksIHNldHRpbmdzKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuaGlkZGVuID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY3JlYXRlU2V0dGluZyhrZXk6IHN0cmluZywgc2V0dGluZ3M6IHNldHRpbmdzR3JpZE9iaikge1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuc2V0dGluZ1RlbXBsYXRlLmNoaWxkcmVuO1xuICAgICAgICBpZiAoIWNoaWxkcmVuWzBdKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5ncyBHcmlkIHRlbXBsYXRlIGlzIG1pc3NpbmcgYSByb290IGVsZW1lbnQhXCIpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGNoaWxkcmVuKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICBjb25zdCBjbG9uZSA9IGNoaWxkLmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGNsb25lKTtcbiAgICAgICAgICAgIHRoaXMudXBncmFkZUVsZW1lbnQoY2xvbmUsIGtleSwgc2V0dGluZ3MpO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSB3YXNuJ3QgcmVtb3ZlZCwgZ2l2ZSAnZXIgYSB0b29sdGlwXG4gICAgICAgICAgICBpZiAoY2xvbmUucGFyZW50RWxlbWVudCAmJiBzZXR0aW5ncy50b29sdGlwKSB0aGlzLmNyZWF0ZVRvb2x0aXAoY2xvbmUsIHNldHRpbmdzLnRvb2x0aXApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlVG9vbHRpcChlbGVtZW50OiBIVE1MRWxlbWVudCwgdG9vbHRpcDogTm9uTnVsbGFibGU8c2V0dGluZ3NHcmlkT2JqWyd0b29sdGlwJ10+KSB7XG4gICAgICAgIC8vPGRpdiBjbGFzcz1cImpzLWJjZC10b29sdGlwXCIgdG9vbHRpcC1yZWxhdGlvbj1cInByb2NlZWRpbmdcIiB0b29sdGlwLXBvc2l0aW9uPVwiYm90dG9tXCI+PHA+XG4gICAgICAgIC8vICAgIFRPT0xUSVAgSU5ORVIgSFRNTFxuICAgICAgICAvLzwvcD48L2Rpdj5cbiAgICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtLmNsYXNzTGlzdC5hZGQoJ2pzLWJjZC10b29sdGlwJyk7XG4gICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCd0b29sdGlwLXJlbGF0aW9uJywgJ3Byb2NlZWRpbmcnKTtcbiAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAtcG9zaXRpb24nLCB0eXBlb2YgdG9vbHRpcCA9PT0gJ29iamVjdCcgPyB0b29sdGlwLnBvc2l0aW9uIDogJ2JvdHRvbScpO1xuICAgICAgICBlbGVtLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSkuaW5uZXJIVE1MID0gdHlwZW9mIHRvb2x0aXAgPT09ICdvYmplY3QnID8gdG9vbHRpcC50ZXh0IDogdG9vbHRpcDtcblxuICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBlbGVtKTtcbiAgICAgICAgbWRsLmNvbXBvbmVudEhhbmRsZXIudXBncmFkZUVsZW1lbnQoZWxlbSk7XG4gICAgfVxuXG4gICAgdXBncmFkZUVsZW1lbnQoZWxlbWVudDogRWxlbWVudCwga2V5OiBzdHJpbmcsIHNldHRpbmdzOiBzZXR0aW5nc0dyaWRPYmopIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCAmJiAnZ2V0QXR0cmlidXRlJyBpbiBlbGVtZW50KSkgcmV0dXJuIDsvL2NvbnNvbGUuZXJyb3IoXCJBIFNldHRpbmdzIEdyaWQgZWxlbWVudCB3YXMgbm90IGFjdHVhbGx5IGFuIGVsZW1lbnQhXCIsIGVsZW1lbnQpO1xuXG4gICAgICAgIGNvbnN0IGZpbHRlclR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXR0aW5nLWZpbHRlcicpOyAgICAgICAgICAgICAvLyBlcyBsaW50LWRpc2FibGUtbmV4dC1saW5lIHNvbmFyanMvbm8tbmVzdGVkLXRlbXBsYXRlLWxpdGVyYWxzXG4gICAgICAgIC8vY29uc29sZS5sb2coYFVwZ3JhZGluZyBjaGlsZCB3aXRoIHR5cGUgJHtmaWx0ZXJUeXBlID8gYCR7ZmlsdGVyVHlwZX06YDonJ30ke2Rpc3BsYXlUeXBlfWAsIGVsZW1lbnQsIHNldHRpbmdzKTtcblxuICAgICAgICBpZiAoZmlsdGVyVHlwZSAmJiBmaWx0ZXJUeXBlICE9PSBzZXR0aW5ncy50eXBlKSByZXR1cm4gZWxlbWVudC5yZW1vdmUoKTsvL2NvbnNvbGUud2FybihcIlJlbW92aW5nIGVsZW1lbnQgZnJvbSB0cmVlOlwiLCAoZWxlbWVudC5yZW1vdmUoKSwgZWxlbWVudCkpO1xuXG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikgdGhpcy51cGdyYWRlRWxlbWVudChjaGlsZCwga2V5LCBzZXR0aW5ncyk7XG5cbiAgICAgICAgY29uc3QgZGlzcGxheVR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXR0aW5nLWRpc3BsYXknKTtcbiAgICAgICAgaWYgKCFkaXNwbGF5VHlwZSkgcmV0dXJuIDsvL2NvbnNvbGUud2FybignQSBTZXR0aW5ncyBHcmlkIGVsZW1lbnQgaXMgbWlzc2luZyB0aGUgYGRhdGEtc2V0dGluZy1kaXNwbGF5YCBhdHRyaWJ1dGUhJywgZWxlbWVudCk7XG5cbiAgICAgICAgc3dpdGNoKGRpc3BsYXlUeXBlKSB7XG4gICAgICAgICAgICBjYXNlKCdpZCcpOlxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSBgc2V0dGluZy0tJHtrZXl9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSgnbGFiZWwnKTpcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHNldHRpbmdzLm5hbWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UoJ2NoZWNrYm94Jyk6XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSBlbGVtZW50LmNoZWNrZWQgPSAhIXRoaXMuZ2V0U2V0dGluZyhrZXksIHRydWUpO1xuICAgICAgICAgICAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZ3MgR3JpZCB0ZW1wbGF0ZSBoYXMgYSBjaGVja2JveCB0aGF0IGlzIG5vdCBhbiBJTlBVVCBlbGVtZW50IVwiKTtcblxuICAgICAgICAgICAgICAgIHJlZ2lzdGVyRm9yRXZlbnRzKGVsZW1lbnQsIHtjaGFuZ2U6ICgoKSA9PiB0aGlzLnNldFNldHRpbmcoa2V5LCBlbGVtZW50LmNoZWNrZWQpKS5iaW5kKHRoaXMpfSk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3NUb1VwZGF0ZS5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2hlY2tlZCAhPT0gISF0aGlzLmdldFNldHRpbmcoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSgnZHJvcGRvd24nKTpcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoQkNEU2V0dGluZ3NEcm9wZG93bi5jc3NDbGFzcyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3B0aW9ucycsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLm9wdGlvbnMpKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1zZXR0aW5ncy1wYXRoJywgIEpTT04uc3RyaW5naWZ5KHRoaXMuc2V0dGluZ3NQYXRoKSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0dGluZycsICBrZXkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQSBTZXR0aW5ncyBHcmlkIGVsZW1lbnQgaGFzIGFuIHVua25vd24gZGlzcGxheSB0eXBlOiAke2Rpc3BsYXlUeXBlfWAsIGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhgVXBncmFkZWQgZWxlbWVudCB3aXRoIHR5cGUgJHtkaXNwbGF5VHlwZX0uIFBhc3Npbmcgb2ZmIHRvIE1ETCBjb21wb25lbnQgaGFuZGxlci4uLmApO1xuICAgICAgICBtZGwuY29tcG9uZW50SGFuZGxlci51cGdyYWRlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgRnVsbHkgdXBncmFkZWQgZWxlbWVudCB3aXRoIHR5cGUgJHtkaXNwbGF5VHlwZX0hYCk7XG4gICAgfVxuXG4gICAgZ2V0U2V0dGluZzxUUmV0dXJuVmFsdWUgPSBzdHJpbmd8Ym9vbGVhbnxudW1iZXJ8bnVsbD4oa2V5OiBzdHJpbmd8bnVtYmVyLCBzdXBwcmVzc0Vycm9yID0gZmFsc2UpOiBUUmV0dXJuVmFsdWV8dW5kZWZpbmVkIHsgcmV0dXJuIFNldHRpbmdzR3JpZC5nZXRTZXR0aW5nPFRSZXR1cm5WYWx1ZT4odGhpcy5zZXR0aW5nc1BhdGgsIGtleSwgc3VwcHJlc3NFcnJvcik7IH1cblxuICAgIHN0YXRpYyBnZXRTZXR0aW5nPFRSZXR1cm5WYWx1ZSA9IHN0cmluZ3xib29sZWFufG51bWJlcnxudWxsPihzZXR0aW5nc1BhdGg6IHN0cmluZ1tdLCBrZXk6IHN0cmluZ3xudW1iZXIsIHN1cHByZXNzRXJyb3IgPSBmYWxzZSk6IFRSZXR1cm5WYWx1ZXx1bmRlZmluZWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnREaXIgPSB3aW5kb3c7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRpciBvZiBzZXR0aW5nc1BhdGgpIC8vQHRzLWlnbm9yZTogVGhlIHBhdGggaXMgZHluYW1pY2FsbHkgcHVsbGVkIGZyb20gdGhlIEhUTUwgZG9jdW1lbnQsIHNvIGl0J3Mgbm90IHBvc3NpYmxlIHRvIGtub3cgd2hhdCBpdCB3aWxsIGJlIGF0IGNvbXBpbGUgdGltZVxuICAgICAgICAgICAgICAgIGN1cnJlbnREaXIgPSBjdXJyZW50RGlyPy5bZGlyXTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnREaXIgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKGBTZXR0aW5ncyBHcmlkIGNhbm5vdCBmaW5kIHRoZSBzZXR0aW5ncyBwYXRoIFwiJHtzZXR0aW5nc1BhdGguam9pbignLicpfVwiIWApO1xuXG4gICAgICAgICAgICAvL0B0cy1pZ25vcmU6ICBUaGUgcGF0aCBpcyBkeW5hbWljYWxseSBwdWxsZWQgZnJvbSB0aGUgSFRNTCBkb2N1bWVudCwgc28gaXQncyBub3QgcG9zc2libGUgdG8ga25vdyB3aGF0IGl0IHdpbGwgYmUgYXQgY29tcGlsZSB0aW1lXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudERpcltrZXldO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIXN1cHByZXNzRXJyb3IpIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0U2V0dGluZyhrZXk6IHN0cmluZ3xudW1iZXIsIHZhbHVlOnN0cmluZ3xib29sZWFufG51bWJlcnxudWxsfHVuZGVmaW5lZCwgc3VwcHJlc3NFcnJvciA9IGZhbHNlKTogdm9pZCB7IFNldHRpbmdzR3JpZC5zZXRTZXR0aW5nKHRoaXMuc2V0dGluZ3NQYXRoLCBrZXksIHZhbHVlLCBzdXBwcmVzc0Vycm9yKTsgfVxuXG4gICAgc3RhdGljIHNldFNldHRpbmcoc2V0dGluZ3NQYXRoOiBzdHJpbmdbXSwga2V5OiBzdHJpbmd8bnVtYmVyLCB2YWx1ZTpzdHJpbmd8Ym9vbGVhbnxudW1iZXJ8bnVsbHx1bmRlZmluZWQsIHN1cHByZXNzRXJyb3IgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnREaXIgPSB3aW5kb3c7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRpciBvZiBzZXR0aW5nc1BhdGgpIC8vQHRzLWlnbm9yZTogVGhlIHBhdGggaXMgZHluYW1pY2FsbHkgcHVsbGVkIGZyb20gdGhlIEhUTUwgZG9jdW1lbnQsIHNvIGl0J3Mgbm90IHBvc3NpYmxlIHRvIGtub3cgd2hhdCBpdCB3aWxsIGJlIGF0IGNvbXBpbGUgdGltZVxuICAgICAgICAgICAgICAgIGN1cnJlbnREaXIgPSBjdXJyZW50RGlyPy5bZGlyXTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnREaXIgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKGBTZXR0aW5ncyBHcmlkIGNhbm5vdCBmaW5kIHRoZSBzZXR0aW5ncyBwYXRoIFwiJHtzZXR0aW5nc1BhdGguam9pbignLicpfVwiIWApO1xuXG4gICAgICAgICAgICAvL0B0cy1pZ25vcmU6IFRoZSBwYXRoIGlzIGR5bmFtaWNhbGx5IHB1bGxlZCBmcm9tIHRoZSBIVE1MIGRvY3VtZW50LCBzbyBpdCdzIG5vdCBwb3NzaWJsZSB0byBrbm93IHdoYXQgaXQgd2lsbCBiZSBhdCBjb21waWxlIHRpbWVcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50RGlyW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCFzdXBwcmVzc0Vycm9yKSBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goU2V0dGluZ3NHcmlkKTtcblxuLyoqIFZhcmlhYmxlIHRvIHdvcmsgYXJvdW5kIHRoZSBjb21wbGV4aXRpZXMgb2YgQ29uc3RydWN0b3JzIGFuZCB3aGF0bm90ICovXG5sZXQgdGVtcEtleU1hcCA9IHt9O1xuZXhwb3J0IGNsYXNzIEJDRFNldHRpbmdzRHJvcGRvd24gZXh0ZW5kcyBCQ0REcm9wZG93biB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JDRCBTZXR0aW5ncyBEcm9wZG93bic7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLWJjZC1zZXR0aW5ncy1kcm9wZG93bic7XG5cbiAgICBzZXR0aW5nc1BhdGg6c3RyaW5nW10gPSBKU09OLnBhcnNlKHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdkYXRhLXNldHRpbmdzLXBhdGgnKSA/PyAnW10nKTtcbiAgICBzZXR0aW5nS2V5ID0gdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0dGluZycpID8/ICcnO1xuICAgIGtleU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ0NvbnN0cnVjdGluZyBCQ0RTZXR0aW5nc0Ryb3Bkb3duJywgZWxlbWVudCk7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZyk7XG4gICAgICAgIHRoaXMua2V5TWFwID0gdGVtcEtleU1hcDtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnW0JDRC1EUk9QRE9XTl0gS2V5IG1hcCBpcyBub3cnLCB0aGlzLmtleU1hcCk7XG4gICAgICAgIC8vdGhpcy5zZWxlY3RCeVN0cmluZyhTZXR0aW5nc0dyaWQuZ2V0U2V0dGluZyh0aGlzLnNldHRpbmdzUGF0aCwgdGhpcy5zZXR0aW5nS2V5KSA/PyAnJyk7XG4gICAgICAgIHNldHRpbmdzVG9VcGRhdGUucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdEJ5U3RyaW5nKFNldHRpbmdzR3JpZC5nZXRTZXR0aW5nKHRoaXMuc2V0dGluZ3NQYXRoLCB0aGlzLnNldHRpbmdLZXkpID8/ICcnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgc2VsZWN0QnlTdHJpbmcob3B0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnW0JDRC1EUk9QRE9XTl0gU2VsZWN0aW5nIGJ5IHN0cmluZycsIG9wdGlvbiwgJ2FrYScsIHRoaXMua2V5TWFwPy5bb3B0aW9uXSwge2tleU1hcDogdGhpcy5rZXlNYXB9KTtcbiAgICAgICAgc3VwZXIuc2VsZWN0QnlTdHJpbmcodGhpcy5rZXlNYXBbb3B0aW9uXSA/PyBvcHRpb24pO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIG9wdGlvbnMoKTogb3B0aW9uT2JqIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogb3B0aW9uT2JqID0ge307XG4gICAgICAgIE9iamVjdC5lbnRyaWVzPHN0cmluZz4oSlNPTi5wYXJzZSh0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnZGF0YS1vcHRpb25zJykgPz8gJ1tdJykpLmZvckVhY2goKFtsaXRlcmFsTmFtZSwgcHJldHR5TmFtZV0pID0+IHtcbiAgICAgICAgICAgIG9wdGlvbnNbcHJldHR5TmFtZS50b1N0cmluZygpXSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBTZXR0aW5nc0dyaWQuc2V0U2V0dGluZyh0aGlzLnNldHRpbmdzUGF0aCwgdGhpcy5zZXR0aW5nS2V5LCBsaXRlcmFsTmFtZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdbQkNELURST1BET1dOXSBBZGRpbmcgb3B0aW9uJywgbGl0ZXJhbE5hbWUsICdha2EnLCBwcmV0dHlOYW1lKTtcbiAgICAgICAgICAgdGhpcy5rZXlNYXAgPz89IHt9O1xuICAgICAgICAgICAgdGhpcy5rZXlNYXBbbGl0ZXJhbE5hbWVdID0gcHJldHR5TmFtZTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1tCQ0QtRFJPUERPV05dIEtleSBtYXAgaXMgbm93JywgdGhpcy5rZXlNYXApO1xuICAgICAgICB9KTtcbiAgICAgICAgdGVtcEtleU1hcCA9IHRoaXMua2V5TWFwO1xuXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cbn1cbmNvbXBvbmVudHNUb1JlZ2lzdGVyLnB1c2goQkNEU2V0dGluZ3NEcm9wZG93bik7XG53aW5kb3cuQkNEU2V0dGluZ3NEcm9wZG93biA9IEJDRFNldHRpbmdzRHJvcGRvd247XG5cblxuLypcblxuXG5cbiQkJCQkJCRcXCAgICQkJCQkJFxcICAkJFxcICAgICAgJCRcXCAgICAgICAgICQkJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4kJCAgX18kJFxcICQkICBfXyQkXFwgJCQkXFwgICAgJCQkIHwgICAgICAgICQkICBfXyQkXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4kJCB8ICAkJCB8JCQgLyAgJCQgfCQkJCRcXCAgJCQkJCB8ICAgICAgICAkJCB8ICAkJCB8ICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCQkIHwkJFxcICAgJCRcXFxuJCQgfCAgJCQgfCQkIHwgICQkIHwkJFxcJCRcXCQkICQkIHwkJCQkJCRcXCAkJCQkJCQkICB8JCQgIF9fJCRcXCAgXFxfX19fJCRcXCAkJCAgX18kJCB8JCQgfCAgJCQgfFxuJCQgfCAgJCQgfCQkIHwgICQkIHwkJCBcXCQkJCAgJCQgfFxcX19fX19ffCQkICBfXyQkPCAkJCQkJCQkJCB8ICQkJCQkJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8XG4kJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHxcXCQgIC8kJCB8ICAgICAgICAkJCB8ICAkJCB8JCQgICBfX19ffCQkICBfXyQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfFxuJCQkJCQkJCAgfCAkJCQkJCQgIHwkJCB8IFxcXy8gJCQgfCAgICAgICAgJCQgfCAgJCQgfFxcJCQkJCQkJFxcIFxcJCQkJCQkJCB8XFwkJCQkJCQkIHxcXCQkJCQkJCQgfFxuXFxfX19fX19fLyAgXFxfX19fX18vIFxcX198ICAgICBcXF9ffCAgICAgICAgXFxfX3wgIFxcX198IFxcX19fX19fX3wgXFxfX19fX19ffCBcXF9fX19fX198IFxcX19fXyQkIHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX19fX19fL1xuJCQkJCQkXFwgICAgICAgICAgICQkXFwgICAkJFxcICAgICAkJFxcICAgICAgICAgICAkJFxcICQkXFwgICAgICAgICAgICAgICAgICAgICAgICQkXFwgICAgICQkXFxcblxcXyQkICBffCAgICAgICAgICBcXF9ffCAgJCQgfCAgICBcXF9ffCAgICAgICAgICAkJCB8XFxfX3wgICAgICAgICAgICAgICAgICAgICAgJCQgfCAgICBcXF9ffFxuICAkJCB8ICAkJCQkJCQkXFwgICQkXFwgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgJCQgfCQkXFwgJCQkJCQkJCRcXCAgJCQkJCQkXFwgICQkJCQkJFxcICAgJCRcXCAgJCQkJCQkXFwgICQkJCQkJCRcXFxuICAkJCB8ICAkJCAgX18kJFxcICQkIHxcXF8kJCAgX3wgICQkIHwgXFxfX19fJCRcXCAkJCB8JCQgfFxcX19fXyQkICB8IFxcX19fXyQkXFwgXFxfJCQgIF98ICAkJCB8JCQgIF9fJCRcXCAkJCAgX18kJFxcXG4gICQkIHwgICQkIHwgICQkIHwkJCB8ICAkJCB8ICAgICQkIHwgJCQkJCQkJCB8JCQgfCQkIHwgICQkJCQgXy8gICQkJCQkJCQgfCAgJCQgfCAgICAkJCB8JCQgLyAgJCQgfCQkIHwgICQkIHxcbiAgJCQgfCAgJCQgfCAgJCQgfCQkIHwgICQkIHwkJFxcICQkIHwkJCAgX18kJCB8JCQgfCQkIHwgJCQgIF8vICAgJCQgIF9fJCQgfCAgJCQgfCQkXFwgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8XG4kJCQkJCRcXCAkJCB8ICAkJCB8JCQgfCAgXFwkJCQkICB8JCQgfFxcJCQkJCQkJCB8JCQgfCQkIHwkJCQkJCQkJFxcIFxcJCQkJCQkJCB8ICBcXCQkJCQgIHwkJCB8XFwkJCQkJCQgIHwkJCB8ICAkJCB8XG5cXF9fX19fX3xcXF9ffCAgXFxfX3xcXF9ffCAgIFxcX19fXy8gXFxfX3wgXFxfX19fX19ffFxcX198XFxfX3xcXF9fX19fX19ffCBcXF9fX19fX198ICAgXFxfX19fLyBcXF9ffCBcXF9fX19fXy8gXFxfX3wgIFxcX198XG5cblxuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gYmNkX3VuaXZlcnNhbEpTX2luaXQoKTp2b2lkIHtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBSZWdpc3RlciBhbGwgdGhlIHRoaW5ncyFcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgYWZ0ZXJEZWxheSgxMCwgKCk9PiAgcmVnaXN0ZXJCQ0RDb21wb25lbnRzKCkgKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBNb2RpZnkgbGlua3Mgbm90IGluIHRoZSBtYWluIG5hdiB0byBub3Qgc2VuZCBhIHJlZmVycmVyXG4gICAgLy8gKGFsbG93cyBmb3IgZmFuY3kgZHJhd2VyIHN0dWZmKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBmb3IgKGNvbnN0IGxpbmsgb2YgWy4uLmRvY3VtZW50LmxpbmtzXSl7XG4gICAgICAgIGlmICh3aW5kb3cubGF5b3V0LmRyYXdlcl8/LmNvbnRhaW5zKGxpbmspKSBsaW5rLnJlbCArPSBcIiBub29wZW5lclwiO1xuICAgICAgICBlbHNlIGxpbmsucmVsICs9IFwiIG5vb3BlbmVyIG5vcmVmZXJyZXJcIjtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUmFuZG9tIHRleHQgdGltZSFcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBjb25zdCByYW5kb21UZXh0RmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJhbmRvbWl6ZWQtdGV4dC1maWVsZFwiKTtcbiAgICBpZiAoIXJhbmRvbVRleHRGaWVsZCkgdGhyb3cgbmV3IEVycm9yKFwiTm8gcmFuZG9tIHRleHQgZmllbGQgZm91bmQhXCIpO1xuXG4gICAgY29uc3QgcXVvdGUgPSBxdW90ZXMuZ2V0UmFuZG9tUXVvdGUoKTtcbiAgICByYW5kb21UZXh0RmllbGQuaW5uZXJIVE1MID0gdHlwZW9mIHF1b3RlID09PSBcInN0cmluZ1wiID8gcXVvdGUgOiBxdW90ZVsxXSE7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gSW1wb3J0IExhenktTG9hZGVkIFN0eWxlc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBhZnRlckRlbGF5KDEwMCwgKCkgPT4ge1xuICAgICAgICBjb25zdCBsYXp5U3R5bGVzID0gSlNPTi5wYXJzZShgWyR7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhenktc3R5bGVzJyk/LnRleHRDb250ZW50ID8/ICcnfV1gKSBhcyBzdHJpbmdbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHN0eWxlIG9mIGxhenlTdHlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgICAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICAgICAgICAgIGxpbmsuaHJlZiA9IHN0eWxlO1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdsYXp5LXN0eWxlcy1ub3QtbG9hZGVkJyk7XG4gICAgICAgIHdpbmRvdy5sYXp5U3R5bGVzTG9hZGVkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTZXQgbWFpbiBjb250ZW50IGRpdiB0byByZXNwZWN0IHRoZSBmb290ZXIgZm9yIG1vYmlsZVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIE5PVEU6IFRoaXMgY29kZSBoYXMgYmVlbiBjb21waWxlZCwgbWluaWZpZWQsIGFuZCByZWxvY2F0ZWQgdG8gdGhlIHBhZ2UgSFRNTCBpdHNlbGZcblxuICAgIC8vY29uc3QgZm9vdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvb3RlcicpIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgIC8vXG4gICAgLy9pZiAoIWZvb3RlcikgdGhyb3cgbmV3IEVycm9yKCdObyBtYWluIG9yIGZvb3RlciBkaXYgZm91bmQhJyk7XG4gICAgLy9mdW5jdGlvbiByZXNpemVNYWluKCkge1xuICAgIC8vICAgIGNvbnN0IGZvb3RlckhlaWdodCA9IChmb290ZXIhLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50KT8ub2Zmc2V0SGVpZ2h0ID8/IDA7XG4gICAgLy8gICAgZm9vdGVyIS5zdHlsZS5oZWlnaHQgPSBgJHtmb290ZXJIZWlnaHR9cHhgO1xuICAgIC8vfVxuICAgIC8vY29uc3QgY29udFJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHJlc2l6ZU1haW4pO1xuICAgIC8vcmVzaXplTWFpbigpO1xuICAgIC8vY29udFJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZm9vdGVyLmZpcnN0RWxlbWVudENoaWxkID8/IGZvb3Rlcik7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUmVnaXN0ZXIgZm9yIG1vcmUgaW5jbHVzaXZlIGludmVudHMgYXMgYSByZXBsYWNlbWVudCBmb3IgdGhlIGBvbmNsaWNrYCBhdHRyaWJ1dGVcbiAgICAvLyBGb3IgYnV0dG9ucywgcmVnaXN0ZXIgc29tZSBldmVudHMgdG8gYXNzaXN0IGluIHZpc3VhbCBzdHlsaW5nXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgYWZ0ZXJEZWxheSgxNTAsICgpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudHNXaXRoQ2xpY2tFdnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbb25jbGlja10nKSBhcyBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PjtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzV2l0aENsaWNrRXZ0KSB7XG4gICAgICAgICAgICBjb25zdCBmdW5jdCA9IGVsZW1lbnQub25jbGljayBhcyBFdmVudFR5cGVzPEhUTUxFbGVtZW50PlsnYWN0aXZhdGUnXTtcbiAgICAgICAgICAgIGlmICghZnVuY3QpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICByZWdpc3RlckZvckV2ZW50cyhlbGVtZW50LCB7YWN0aXZhdGU6IGZ1bmN0fSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub25jbGljayA9IG51bGw7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnb25jbGljaycpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICAgICAgICBmdW5jdGlvbiBibHVyRWxlbSh0aGlzOiBIVE1MRWxlbWVudCkgeyB0aGlzLmJsdXIoKTsgfVxuICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBidXR0b25zKSB7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGJsdXJFbGVtKTtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGJsdXJFbGVtKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEFkZCBJRHMgdG8gYWxsIGhlYWRlcnMgLSBPTkxZIEZPUiBVU0UgSU4gU0FNRS1QQUdFIExJTktTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGFmdGVyRGVsYXkoMjAwLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCc6aXMobmF2LCBtYWluKSA6aXMoaDEsIGgyLCBoMywgaDQsIGg1LCBoNiknKTtcbiAgICAgICAgZm9yIChjb25zdCBoZWFkZXIgb2YgaGVhZGVycykge1xuICAgICAgICAgICAgaWYgKGhlYWRlci5pZCkgY29udGludWU7XG4gICAgICAgICAgICBoZWFkZXIuaWQgPSBoZWFkZXIudGV4dENvbnRlbnQ/LnRyaW0oKS5yZXBsYWNlKC9bJ1wiKz0/IUAjJCVeKl0rL2dpLCAnJykucmVwbGFjZSgvJisvZ2ksICdhbmQnKS5yZXBsYWNlKC9bXmEtejAtOV0rL2dpLCAnLScpLnRvTG93ZXJDYXNlKCkgPz8gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYXZIZWFkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbmF2IDppcyhoMSwgaDIsIGgzLCBoNCwgaDUsIGg2KScpO1xuICAgICAgICBmb3IgKGNvbnN0IGhlYWRlciBvZiBuYXZIZWFkZXJzKSB7IGlmIChoZWFkZXIuaWQpIGhlYWRlci5pZCA9IGBuYXYtJHtoZWFkZXIuaWR9YDsgfVxuXG4gICAgICAgIC8vIFNjcm9sbCB0byB0aGUgaGFzaCBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyMnKSkgIHtcbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gJyMnKSB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQod2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKTtcblxuICAgICAgICAgICAgICAgIGlmIChlbGVtKSBlbGVtLnNjcm9sbEludG9WaWV3KHsgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xuICAgICAgICAgICAgICAgIGVsc2UgY29uc29sZS5pbmZvKGBObyBlbGVtZW50IHdpdGggSUQgXCIke3dpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKX1cIiBmb3VuZCFgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUmVnaXN0ZXIgZm9yIHRoZSBkcmF3ZXIgb3Blbi9jbG9zZSBldmVudHNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBjb25zdCBkcmF3ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWRsLWxheW91dF9fZHJhd2VyJykgYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBkcmF3ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhd2VyT3BlbicsIGRyYXdlck9wZW5IYW5kbGVyKTtcbiAgICBkcmF3ZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhd2VyQ2xvc2UnLCBkcmF3ZXJDbG9zZUhhbmRsZXIpO1xuXG4gICAgaWYgKGRyYXdlci5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLXZpc2libGUnKSkgZHJhd2VyT3BlbkhhbmRsZXIuY2FsbChkcmF3ZXIpO1xuICAgIGVsc2UgZHJhd2VyQ2xvc2VIYW5kbGVyLmNhbGwoZHJhd2VyKTtcblxufVxud2luZG93LmJjZF9pbml0X2Z1bmN0aW9ucy51bml2ZXJzYWwgPSBiY2RfdW5pdmVyc2FsSlNfaW5pdDtcblxuXG5mdW5jdGlvbiBkcmF3ZXJPcGVuSGFuZGxlcih0aGlzOiBIVE1MRGl2RWxlbWVudCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpO1xuICAgIEJDRF9Db2xsYXBzaWJsZVBhcmVudC5zZXREaXNhYmxlZCh0aGlzLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdlckNsb3NlSGFuZGxlcih0aGlzOiBIVE1MRGl2RWxlbWVudCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgQkNEX0NvbGxhcHNpYmxlUGFyZW50LnNldERpc2FibGVkKHRoaXMsIHRydWUpO1xufVxuIl19