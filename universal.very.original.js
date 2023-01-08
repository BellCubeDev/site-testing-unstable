import * as mdl from './assets/site/mdl/material.js';
import * as quotes from './universal_quotes.js';
function loadFS() {
    return import('./filesystem-interface.js');
}
export function afterDelay(timeout, callback, ...args) {
    return window.setTimeout(callback, timeout, ...(args || []));
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
export function preventPropagation(event) {
    event.stopPropagation();
}
export function setProxies(obj, handler) {
    if (!obj || typeof obj !== 'object')
        return obj;
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value !== 'object')
            continue;
        setProxies(value, handler);
        obj[key] = new Proxy(value ?? {}, handler);
    }
    obj = new Proxy(obj, handler);
    return obj;
}
export function sortArr(arr, refArr) {
    arr.sort(function (a, b) {
        return refArr.indexOf(a) - refArr.indexOf(b);
    });
}
export function randomNumber(min = 0, max = 1, places = 0) {
    const placesMult = Math.pow(10, places);
    return (Math.round((Math.random() * (max - min) + min) * placesMult) / placesMult);
}
export function focusAnyElement(element, preventScrolling = true) {
    if (!element || !element.focus)
        return;
    const hadTabIndex = element.hasAttribute('tabindex');
    if (!hadTabIndex)
        element.setAttribute('tabindex', '-8311');
    element.focus({ preventScroll: preventScrolling });
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (!hadTabIndex)
                element.removeAttribute('tabindex');
        });
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
Element.prototype.getOrCreateChild = ___getOrCreateChild;
Document.prototype.getOrCreateChild = ___getOrCreateChild;
function registerUpgrade(subject, upgrade, target, propagateToTargetChildren = false, propagateToSubjectToChildren = false) {
    forEachChildAndOrParent(subject, propagateToSubjectToChildren, child => {
        child.upgrades ??= {};
        child.upgrades[upgrade.constructor.name] = upgrade;
    });
    if (target)
        forEachChildAndOrParent(target, propagateToTargetChildren, child => {
            child.targetingComponents ??= {};
            child.targetingComponents[upgrade.constructor.name] = upgrade;
        });
    if (upgrade instanceof BCDTooltip) {
        forEachChildAndOrParent(subject, propagateToSubjectToChildren, child => {
            if (!child.upgrades_proto)
                child.upgrades_proto = {};
            child.upgrades_proto.tooltip = upgrade;
        });
        if (target)
            forEachChildAndOrParent(target, propagateToTargetChildren, child => {
                if (!child.targetingComponents_proto)
                    child.targetingComponents_proto = {};
                child.targetingComponents_proto.tooltip = upgrade;
            });
    }
    if (upgrade instanceof BCDDropdown) {
        forEachChildAndOrParent(subject, propagateToSubjectToChildren, child => {
            if (!child.upgrades_proto)
                child.upgrades_proto = {};
            child.upgrades_proto.dropdown = upgrade;
        });
        if (target)
            forEachChildAndOrParent(target, propagateToTargetChildren, child => {
                if (!child.targetingComponents_proto)
                    child.targetingComponents_proto = {};
                child.targetingComponents_proto.dropdown = upgrade;
            });
    }
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
const bcdComponents = [];
export class bcd_ComponentTracker {
    static registered_components = {};
    static registerComponent(component, constructor, element) {
        bcd_ComponentTracker.createTrackedComponent(constructor);
        if (element.id !== '')
            bcd_ComponentTracker.registered_components[constructor.asString].obj[element.id] = component;
        else
            bcd_ComponentTracker.registered_components[constructor.asString].arr.push(component);
    }
    static createTrackedComponent(constructor) {
        if (typeof bcd_ComponentTracker.registered_components[constructor.asString] === 'undefined')
            bcd_ComponentTracker.registered_components[constructor.asString] = { obj: {}, arr: [] };
    }
    static getTrackedConstructor(constructor) {
        bcd_ComponentTracker.createTrackedComponent(constructor);
        return bcd_ComponentTracker.registered_components[constructor.asString];
    }
    static findItem(constructor, element, findPredicate) {
        if (element.id)
            return bcd_ComponentTracker.registered_components[constructor.asString].obj[element.id];
        else if (findPredicate)
            return bcd_ComponentTracker.getTrackedConstructor(constructor).arr.find(findPredicate);
        else
            return undefined;
    }
}
window.bcd_ComponentTracker = bcd_ComponentTracker;
class bcd_collapsibleParent {
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
            this.onTransitionEnd();
        });
    }
    open(doSetDuration = true, instant = false) {
        if (instant)
            this.instantTransition();
        else if (doSetDuration)
            this.evaluateDuration(doSetDuration);
        this.details_inner.setAttribute('disabled', 'true');
        this.details_inner.ariaHidden = 'false';
        this.details_inner.style.visibility = 'none';
        this.details.classList.add(strs.classIsOpen);
        this.summary.classList.add(strs.classIsOpen);
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
            this.details_inner.style.marginTop = this.details.getAttribute('data-margin-top') || '0';
            if (instant)
                requestAnimationFrame(() => requestAnimationFrame(() => this.evaluateDuration.bind(this, doSetDuration, true)));
        }))));
    }
    close(doSetDuration = true, instant = false) {
        if (instant)
            this.instantTransition();
        else if (doSetDuration)
            this.evaluateDuration(doSetDuration, false);
        this.details_inner.style.marginTop = `-${this.details_inner.offsetHeight + 32}px`;
        this.details.classList.remove(strs.classIsOpen);
        this.summary.classList.remove(strs.classIsOpen);
        if (instant)
            requestAnimationFrame(() => requestAnimationFrame(() => {
                this.evaluateDuration(doSetDuration, false);
            }));
    }
    onTransitionEnd(event) {
        if (event && event.propertyName !== 'margin-top')
            return;
        if (this.isOpen()) {
            this.details_inner.setAttribute('disabled', 'false');
            return;
        }
        requestAnimationFrame(() => {
            this.details_inner.setAttribute('disabled', 'true');
            this.details_inner.ariaHidden = 'true';
            this.details_inner.style.visibility = 'none';
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
    }
    evaluateDuration(doRun = true, opening = true) {
        if (doRun && this.details_inner) {
            const contentHeight = this.details_inner.offsetHeight;
            this.details_inner.style.transitionDuration = `${(opening ? 250 : 500) + ((opening ? 0.2 : 0.5) * (contentHeight + 32))}ms`;
            for (const icon of this.openIcons90deg) {
                icon.style.transitionDuration = `${250 + (0.15 * (contentHeight + 32))}ms`;
            }
        }
    }
}
export class BellCubicDetails extends bcd_collapsibleParent {
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
            if (!temp_summary || !temp_summary.classList.contains(BellCubicSummary.cssClass)) {
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
        new ResizeObserver(this.reEvalOnSizeChange.bind(this)).observe(this.details_inner);
        this.details_inner.addEventListener('transitionend', this.onTransitionEnd.bind(this));
        bcd_ComponentTracker.registerComponent(this, BellCubicDetails, this.details);
        this.reEval(true, true);
        this.self.classList.add('initialized');
        registerUpgrade(this.self, this, this.summary, true);
    }
    reEvalOnSizeChange(event) {
        this.reEval(true, true);
    }
}
bcdComponents.push(BellCubicDetails);
export class BellCubicSummary extends bcd_collapsibleParent {
    static cssClass = 'js-bcd-summary';
    static asString = 'BellCubicSummary';
    constructor(element) {
        super(element);
        this.summary = element;
        this.summary.addEventListener(window.clickEvt, this.handleClick.bind(this));
        this.summary.addEventListener('keypress', this.handleKey.bind(this));
        this.openIcons90deg = this.summary.getElementsByClassName('open-icon-90CC');
        if (this.adjacent) {
            const temp_details = this.self.nextElementSibling;
            if (!(temp_details && temp_details.classList.contains(BellCubicDetails.cssClass))) {
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
        requestAnimationFrame(() => {
            const temp_inner = this.details.querySelector(`.${strs.classDetailsInner}`);
            if (!temp_inner) {
                this.divertedCompletion();
                return;
            }
            else
                this.details_inner = temp_inner;
            bcd_ComponentTracker.registerComponent(this, BellCubicSummary, this.details);
            this.reEval(true, true);
            this.self.classList.add('initialized');
        });
    }
    correctFocus(keyDown) {
        if (!this.isOpen())
            focusAnyElement(this.summary);
        if (this.isOpen() || !keyDown)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.summary.blur();
                });
            });
    }
    handleClick(event) {
        if (!event || (('pointerType' in event) && !event.pointerType) || (event.path && event.path?.slice(0, 5).map((el) => el.tagName === 'A').includes(true)))
            return;
        this.toggle();
        this.correctFocus();
    }
    handleKey(event) {
        if (event.key === ' ' || event.key === 'Enter')
            requestAnimationFrame(() => {
                this.toggle();
                this.correctFocus(true);
            });
    }
}
bcdComponents.push(BellCubicSummary);
export class bcd_prettyJSON {
    static cssClass = 'js-bcd-prettyJSON';
    static asString = 'bcd_prettyJSON';
    element_;
    constructor(element) {
        registerUpgrade(element, this, null, false, true);
        this.element_ = element;
        const raw_json = element.innerText;
        const json = JSON.parse(raw_json);
        this.element_.innerText = JSON.stringify(json, null, 2);
        this.element_.classList.add('initialized');
    }
}
bcdComponents.push(bcd_prettyJSON);
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
                button.addEventListener(window.clickEvt, this.boundHideFunction);
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
    }
    static beforeShowEvent = new CustomEvent('beforeShow', { cancelable: true, bubbles: false, composed: false });
    static afterShowEvent = new CustomEvent('afterShow', { cancelable: false, bubbles: false, composed: false });
    show_forReal() {
        if (!this.dispatchEvent(BCDModalDialog.beforeShowEvent) || !this.element_.dispatchEvent(BCDModalDialog.beforeShowEvent))
            return;
        BCDModalDialog.obfuscator.classList.add(mdl.MaterialLayout.cssClasses.IS_DRAWER_OPEN);
        BCDModalDialog.obfuscator.addEventListener(window.clickEvt, this.boundHideFunction);
        this.element_.ariaHidden = 'false';
        if ('show' in this.element_)
            this.element_.show();
        else
            this.element_.setAttribute('open', '');
        if (this.dispatchEvent(BCDModalDialog.afterShowEvent))
            this.element_.dispatchEvent(BCDModalDialog.afterShowEvent);
    }
    static beforeHideEvent = new CustomEvent('beforeHide', { cancelable: true, bubbles: false, composed: false });
    static afterHideEvent = new CustomEvent('afterHide', { cancelable: false, bubbles: false, composed: false });
    boundHideFunction = this.hide.bind(this);
    hide(evt) {
        if (evt)
            evt.stopImmediatePropagation();
        if (!this.dispatchEvent(BCDModalDialog.beforeHideEvent) || !this.element_.dispatchEvent(BCDModalDialog.beforeHideEvent))
            return;
        this.element_.ariaHidden = 'true';
        if ('close' in this.element_)
            this.element_.close();
        else
            this.element_.removeAttribute('open');
        BCDModalDialog.obfuscator.classList.remove(mdl.MaterialLayout.cssClasses.IS_DRAWER_OPEN);
        BCDModalDialog.obfuscator.removeEventListener(window.clickEvt, this.boundHideFunction);
        BCDModalDialog.shownModal = null;
        if (this.dispatchEvent(BCDModalDialog.afterHideEvent))
            this.element_.dispatchEvent(BCDModalDialog.afterHideEvent);
        BCDModalDialog.evalQueue();
    }
}
bcdComponents.push(BCDModalDialog);
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
        this.updateOptions();
    }
    updateOptions() {
        const children = [...this.element_.getElementsByTagName('li')];
        if (this.doReorder) {
            const goldenChild = children.find((elm) => elm.innerText === this.selectedOption);
            if (!goldenChild) {
                console.log("[BCD-DROPDOWN] Erroring instance:", this);
                throw new Error('Could not find the selected option in the dropdown.');
            }
            this.makeSelected(goldenChild);
        }
        const demonChildren = this.doReorder ? children.filter((elm) => elm.innerText !== this.selectedOption) : children;
        demonChildren.sort((a, b) => this.options_keys.indexOf(a.innerText) - this.options_keys.indexOf(b.innerText));
        for (const child of demonChildren) {
            this.element_.removeChild(child);
            this.makeNotSelected(child);
            this.element_.appendChild(child);
        }
    }
    createOption(option, clickCallback, addToList = false) {
        const li = document.createElement('li');
        li.innerText = option;
        li.classList.add('mdl-menu__item');
        this.registerItem(li);
        const temp_clickCallback = clickCallback ?? this.options_[option] ?? null;
        if (addToList) {
            this.element_.appendChild(li);
            this.options_keys.push(option);
            this.options_[option] = temp_clickCallback;
        }
        li.addEventListener(window.clickEvt, temp_clickCallback?.bind(this));
        this.onCreateOption?.(option);
        return li;
    }
    onItemSelected(option) {
        this.selectedOption = option.innerText;
        this.updateOptions();
    }
    makeSelected(option) {
        if (this.doReorder)
            option.classList.add('mdl-menu__item--full-bleed-divider');
        option.blur();
        for (const elm of this.selectionTextElements ?? []) {
            elm.innerText = option.innerText;
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
        this.forElement_?.targetingComponents_proto?.tooltip?.hide();
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
            'View Debug Page': () => { document.getElementById('debug-link')?.click(); }
        };
    }
}
bcdComponents.push(bcdDropdown_AwesomeButton);
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
        element.innerText = name;
        element.setAttribute('type', 'button');
        super(element);
        registerUpgrade(element, this, boundTab, false, true);
        this.element_ = element;
        this.boundTab = boundTab;
        this.name = name;
        this.setAnchor = element.parentElement?.hasAttribute('do-tab-anchor') ?? false;
        this.element_.addEventListener(window.clickEvt, this.onClick.bind(this));
        this.element_.addEventListener('keypress', this.onKeyPress.bind(this));
        if (this.setAnchor && window.location.hash.toLowerCase() === `#tab-${name}`.toLowerCase())
            requestAnimationFrame((() => { this.makeSelected(); }).bind(this));
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
            }
            else {
                sibling.classList.remove('active');
                sibling.setAttribute('aria-pressed', 'false');
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
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (BCDTabButton.anchorToSet === '')
                        window.history.replaceState(null, '', window.location.pathname);
                    else
                        window.location.hash = BCDTabButton.anchorToSet;
                });
            });
        });
    }
    onClick(event) {
        this.makeSelected();
        this.element_.blur();
    }
    onKeyPress(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            this.onClick();
        }
    }
}
bcdComponents.push(BCDTabButton);
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
        this.element.addEventListener('contextmenu', preventPropagation);
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
    handleKeyDown(event) {
        if (event.key === 'Escape')
            this.hide();
    }
    boundKeyDown = this.handleKeyDown.bind(this);
    handleTouch(event) {
        if (event.targetTouches.length > 0)
            this.handleHoverEnter(undefined, true);
        else
            this.handleHoverLeave();
    }
    handleHoverEnter(event, bypassWait) {
        const targetElement = event instanceof MouseEvent ? document.elementFromPoint(event?.x ?? 0, event?.y ?? 0) : event?.target;
        if (targetElement instanceof Element && (targetElement.upgrades_proto?.dropdown
            || targetElement.targetingComponents_proto?.dropdown?.container_.classList.contains('is-visible')))
            return;
        this.showPart1();
        afterDelay(bypassWait ? 0 : 600, function () {
            if (!this.element.classList.contains('active_'))
                return;
            this.showPart2();
        }.bind(this));
    }
    showPart1() {
        this.element.classList.add('active_');
        window.addEventListener('keydown', this.boundKeyDown, { once: true });
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
        window.removeEventListener('keydown', this.boundKeyDown);
        this.element.classList.remove('active_');
        afterDelay(10, () => {
            if (!this.element.classList.contains('active_'))
                this.element.classList.remove('active');
        });
    }
    setPosition() {
        this.element.style.transform = 'none !important';
        this.element.style.transition = 'none !important';
        const tipStyle = window.getComputedStyle(this.element);
        const tipPaddingRight = parseInt(tipStyle.paddingRight);
        const tipPaddingLeft = parseInt(tipStyle.paddingLeft);
        const tipPaddingTop = parseInt(tipStyle.paddingTop);
        const tipPaddingBottom = parseInt(tipStyle.paddingBottom);
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
bcdComponents.push(BCDTooltip);
export class bcdDynamicTextArea_base {
    element;
    constructor(element) {
        registerUpgrade(element, this, null, false, true);
        this.element = element;
        this.adjust();
        const boundAdjust = this.adjust.bind(this);
        this.element.addEventListener('input', boundAdjust);
        this.element.addEventListener('change', boundAdjust);
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
bcdComponents.push(bcdDynamicTextAreaHeight);
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
bcdComponents.push(bcdDynamicTextAreaWidth);
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
        this.element.addEventListener('change', this.boundOnChange);
        this.element.addEventListener('input', this.boundOnChange);
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--fab', 'mdl-js-ripple-effect', 'js-relative-file-picker--button');
        const icon = document.createElement('i');
        icon.classList.add('material-icons');
        icon.textContent = 'edit_document';
        this.button.appendChild(icon);
        this.element.after(this.button);
        this.button.addEventListener(window.clickEvt, this.boundOnButtonClick);
    }
    onChange() {
        console.log('onChange', this.element.value, this);
    }
    boundOnChange = this.onChange.bind(this);
    async onButtonClick() {
        console.log('onButtonClick', this.element.value, this);
        let fileHandle;
        try {
            [fileHandle] = await window.showOpenFilePicker({ multiple: false });
        }
        catch (e) {
            if (e && e instanceof DOMException && e.name === 'AbortError')
                return;
            console.warn('The file picker threw some sort of error', e);
            return;
        }
        const nameArr = await this.directory?.handle.resolve(fileHandle);
        if (!nameArr)
            return console.debug('The file picker returned a file that is not in the specified directory', fileHandle, this.directory);
        this.element.value = nameArr.join('/');
        this.element.dispatchEvent(new Event('change'));
    }
    boundOnButtonClick = this.onButtonClick.bind(this);
}
bcdComponents.push(RelativeFilePicker);
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
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.setAttribute('viewBox', '0 0 48 48');
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
        const fileHandle_ = dir.getFile(this.element.value);
        const fs_ = loadFS();
        const [fileHandle, fs] = await Promise.all([fileHandle_, fs_]);
        if (!fileHandle || fileHandle instanceof fs.InvalidNameError) {
            this.hideImage();
            return console.info('The relative image picker does not have a file handle to update the image with.', this);
        }
        this.imageElem.src = await fs.readFileAsDataURI(fileHandle);
        this.showImage();
    }
}
bcdComponents.push(RelativeImagePicker);
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
        this.settings = JSON.parse(element.innerText);
        element.innerText = '';
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
                element.addEventListener('change', (() => this.setSetting(key, element.checked)).bind(this));
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
bcdComponents.push(SettingsGrid);
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
bcdComponents.push(BCDSettingsDropdown);
window.BCDSettingsDropdown = BCDSettingsDropdown;
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
    const componentArr = components.length ? components : bcdComponents;
    for (let i = 0; i < componentArr.length; i++) {
        registerBCDComponent(componentArr[i]);
    }
}
export function bcd_universalJS_init() {
    registerBCDComponents();
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
        const lazyStyles = JSON.parse(`[${document.getElementById('lazy-styles')?.innerText ?? ''}]`);
        for (const style of lazyStyles) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style;
            document.head.appendChild(link);
        }
        document.documentElement.classList.remove('lazy-styles-not-loaded');
        window.lazyStylesLoaded = true;
    });
}
window.bcd_init_functions.universal = bcd_universalJS_init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pdmVyc2FsLmpzIiwic291cmNlUm9vdCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9CZWxsQ3ViZURldi9zaXRlLXRlc3RpbmcvZGVwbG95bWVudC8iLCJzb3VyY2VzIjpbInVuaXZlcnNhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssR0FBRyxNQUFNLCtCQUErQixDQUFDO0FBQ3JELE9BQU8sS0FBSyxNQUFNLE1BQU0sdUJBQXVCLENBQUM7QUFHaEQsU0FBUyxNQUFNO0lBQ1gsT0FBTyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBc0JELE1BQU0sVUFBVSxVQUFVLENBQWdELE9BQWUsRUFBRSxRQUEwQixFQUFFLEdBQUcsSUFBMkI7SUFFakosT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFlRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsR0FBVztJQUM3QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBR0QsTUFBTSxVQUFVLGNBQWMsQ0FBQyxHQUFXLEVBQUUsZUFBZSxHQUFHLEtBQUs7SUFDL0QsT0FBUSxHQUFHLENBQUMsU0FBUyxFQUFFO1NBQ1YsT0FBTyxFQUFFO1NBQ1QsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7VUFDekIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQzlDO0FBQUEsQ0FBQztBQU1GLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxLQUFZO0lBQzNDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsTUFB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USxDQUFDLEdBQUcsR0FBSSxPQUFPLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUNyRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsR0FBSSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQy9FLE1BQU07WUFFTixLQUFLLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBSSxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUNyRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxPQUFPLENBQUM7Z0JBRTNELE1BQU07WUFFTixLQUFLLE1BQU07Z0JBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUNuRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLENBQUM7Z0JBRTdFLE1BQU07WUFFTixLQUFLLE9BQU87Z0JBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUNwRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7U0FFOUQ7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdkMsQ0FBQzs7QUFHTCxhQUFhLENBQUMsSUFBSSxDQUFD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WUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkM7UUFFRCxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNwRSxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0FBa0JQLENBQUM7QUFDRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbWRsIGZyb20gJy4vYXNzZXRzL3NpdGUvbWRsL21hdGVyaWFsLmpzJztcbmltcG9ydCAqIGFzIHF1b3RlcyBmcm9tICcuL3VuaXZlcnNhbF9xdW90ZXMuanMnO1xuaW1wb3J0IHR5cGUgKiBhcyBmcyBmcm9tICcuL2ZpbGVzeXN0ZW0taW50ZXJmYWNlLmpzJztcblxuZnVuY3Rpb24gbG9hZEZTKCkge1xuICAgIHJldHVybiBpbXBvcnQoJy4vZmlsZXN5c3RlbS1pbnRlcmZhY2UuanMnKTtcbn1cblxuLypcbiAgICBUaGFua3MgdG8gUGF0cmljayBHaWxsZXNwaWUgZm9yIHRoZSBncmVhdCBBU0NJSSBhcnQgZ2VuZXJhdG9yIVxuICAgIGh0dHBzOi8vcGF0b3Jqay5jb20vc29mdHdhcmUvdGFhZy8jcD1kaXNwbGF5Jmg9MCZ2PTAmZj1CaWclMjBNb25leS1ud1xuICAgIC4uLm1ha2VzIHRoaXMgY29kZSAqc28qIG11Y2ggZWFzaWVyIHRvIG1haW50YWluLi4uIHlvdSBrbm93LCAnY3V6IEkgY2FuIGZpbmQgbXkgZnVuY3Rpb25zIGluIFZTQ29kZSdzIE1pbmltYXBcblxuXG5cblxuJCRcXCAgICQkXFwgICAkJFxcICAgICAkJFxcICQkXFwgJCRcXCAgICQkXFwgICAgICQkXFxcbiQkIHwgICQkIHwgICQkIHwgICAgXFxfX3wkJCB8XFxfX3wgICQkIHwgICAgXFxfX3xcbiQkIHwgICQkIHwkJCQkJCRcXCAgICQkXFwgJCQgfCQkXFwgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJCRcXFxuJCQgfCAgJCQgfFxcXyQkICBffCAgJCQgfCQkIHwkJCB8XFxfJCQgIF98ICAkJCB8JCQgIF9fJCRcXCAkJCAgX19fX198XG4kJCB8ICAkJCB8ICAkJCB8ICAgICQkIHwkJCB8JCQgfCAgJCQgfCAgICAkJCB8JCQkJCQkJCQgfFxcJCQkJCQkXFxcbiQkIHwgICQkIHwgICQkIHwkJFxcICQkIHwkJCB8JCQgfCAgJCQgfCQkXFwgJCQgfCQkICAgX19fX3wgXFxfX19fJCRcXFxuXFwkJCQkJCQgIHwgIFxcJCQkJCAgfCQkIHwkJCB8JCQgfCAgXFwkJCQkICB8JCQgfFxcJCQkJCQkJFxcICQkJCQkJCQgIHxcbiBcXF9fX19fXy8gICAgXFxfX19fLyBcXF9ffFxcX198XFxfX3wgICBcXF9fX18vIFxcX198IFxcX19fX19fX3xcXF9fX19fXyovXG5cblxuXG4vKiogUmVhcnJhbmdlZCBhbmQgYmV0dGVyLXR5cGVkIHBhcmFtZXRlcnMgZm9yIGBzZXRUaW1lb3V0YCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFmdGVyRGVsYXk8VENhbGxiYWNrIGV4dGVuZHMgKC4uLmFyZ3M6IGFueSkgPT4gYW55ID0gYW55Pih0aW1lb3V0OiBudW1iZXIsIGNhbGxiYWNrOiBUQ2FsbGJhY2t8c3RyaW5nLCAuLi5hcmdzOiBQYXJhbWV0ZXJzPFRDYWxsYmFjaz4pOiBudW1iZXIge1xuICAgIC8vIEB0cy1pZ25vcmU6IHRoZSBgUGFyYW1ldGVyc2AgdXRpbGl0eSB0eXBlIHJldHVybnMgYSB0dXBsZSwgd2hpY2ggaW5oZXJlbnRseSBoYXMgYW4gaXRlcmF0b3IgZnVuY3Rpb24tLXJlZ2FyZGxlc3Mgb2Ygd2hhdCBUeXBlU2NyaXB0IHRoaW5rc1xuICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgdGltZW91dCwgLi4uKGFyZ3MgfHwgW10pKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09IFRZUEUgVVRJTElUSUVTID09PT09PT09XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogQ29udmVuaWVuY2UgdHlwZSB0byBxdWlja2x5IGNyZWF0ZSBhbiBpbmRleGVkIE9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQgdHlwZSAqL1xuZXhwb3J0IHR5cGUgb2JqT2Y8VD4gPSB7W2tleTpzdHJpbmddOiBUfTtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyA9PT09PT09PSBTVFJJTkcgVVRJTElUSUVTID09PT09PT09XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBSZW1vdmVzIHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nIGFuZCBhdCB0aGUgZW5kIG9mIGV2ZXJ5IGluY2x1ZGVkIGxpbmUqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemVGaXJzdExldHRlcihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbn1cblxuLyoqIFJlbW92ZXMgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmcgYW5kIGF0IHRoZSBlbmQgb2YgZXZlcnkgaW5jbHVkZWQgbGluZSovXG5leHBvcnQgZnVuY3Rpb24gdHJpbVdoaXRlc3BhY2Uoc3RyOiBzdHJpbmcsIHRyYWlsaW5nTmV3bGluZSA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gIHN0ci50cmltU3RhcnQoKSAgICAgICAgICAgICAgICAgICAgIC8vIFRyaW0gd2hpdGVzcGFjZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmluZ1xuICAgICAgICAgICAgICAgIC50cmltRW5kKCkgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpbSB3aGl0ZXNwYWNlIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1xuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcU1xcbl0qJC9nbSwgJycpICAgICAvLyBUcmltIHdoaXRlc3BhY2UgYXQgdGhlIGVuZCBvZiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICArICh0cmFpbGluZ05ld2xpbmUgPyAnXFxuJyA6ICcnKSAvLyBBZGQgYSB0cmFpbGluZyBuZXdsaW5lIGlmIHJlcXVlc3RlZFxuO31cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT0gRVZFTlQgIFVUSUxJVElFUyA9PT09PT09XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudFByb3BhZ2F0aW9uKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJveGllczxUT2JqPihvYmo6IFRPYmosIGhhbmRsZXI6IFRPYmogZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID8gUHJveHlIYW5kbGVyPFRPYmo+IDogUHJveHlIYW5kbGVyPGFueT4pOiBUT2JqIHtcbiAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JykgcmV0dXJuIG9iajtcblxuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIGNvbnRpbnVlO1xuXG4gICAgICAgIHNldFByb3hpZXModmFsdWUsIGhhbmRsZXIpO1xuICAgICAgICBvYmpba2V5IGFzIGtleW9mIFRPYmpdID0gbmV3IFByb3h5KHZhbHVlID8/IHt9LCBoYW5kbGVyKTtcbiAgICB9XG5cbiAgICBvYmogPSBuZXcgUHJveHkob2JqLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gb2JqO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09IEFSUkFZIFVUSUxJVElFUyA9PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBTb3J0cyB0aGUgaXRlbXMgaW4gb25lIGFycmF5IHRvIG1hdGNoIHRob3NlIGluIGFub3RoZXIuIEl0ZW1zIG5vdCBpbmNsdWRlZCBpbiB0aGUgcmVmZXJlbmNlIGFycmF5IGFyZSBwbGFjZWQgYXQgdGhlIGVuZCBvZiB0aGUgcmVzdWx0LlxuICAgIEBwYXJhbSBhcnIgQXJyYXkgb2YgaXRlbXMgdG8gc29ydFxuICAgIEBwYXJhbSByZWZBcnIgQXJyYXkgdG8gcHVsbCB0aGUgb3JkZXIgZnJvbVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3J0QXJyPFRVbmtub3duPihhcnI6IFRVbmtub3duW10sIHJlZkFycjogVFVua25vd25bXSkge1xuICAgIGFyci5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gcmVmQXJyLmluZGV4T2YoYSkgLSByZWZBcnIuaW5kZXhPZihiKTtcbiAgICB9KTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT0gTlVNQkVSIFVUSUxJVElFUyA9PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogUmV0dXJucyBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIChpbmNsdXNpdmUpIGFuZCBtYXggKGluY2x1c2l2ZSkgd2l0aCBwcmVjaXNpb24gdXAgdG8gdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXNcbiAgICBAcGFyYW0gbWluIFRoZSBtaW5pbXVtIHZhbHVlIHRoYXQgdGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuXG4gICAgQHBhcmFtIG1heCBUaGUgbWF4aW11bSB2YWx1ZSB0aGF0IHRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVyblxuICAgIEBwYXJhbSBwbGFjZXMgVGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0aGUgcmV0dXJuZWQgbnVtYmVyIHNob3VsZCBpbmNsdWRlXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbU51bWJlcihtaW4gPSAwLCBtYXggPSAxLCBwbGFjZXMgPSAwKTpudW1iZXJ7XG4gICAgY29uc3QgcGxhY2VzTXVsdCA9IE1hdGgucG93KDEwLCBwbGFjZXMpO1xuICAgIHJldHVybiAoXG4gICAgICAgIE1hdGgucm91bmQoXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluXG4gICAgICAgICAgICApICogcGxhY2VzTXVsdFxuICAgICAgICApIC8gcGxhY2VzTXVsdFxuICAgICk7XG59XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT0gRE9NIFVUSUxJVElFUyA9PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogRm9yY2VzIGFuIEhUTUxFbGVtZW50IHRvIGJlIGZvY3VzYWJsZSBieSB0aGUgdXNlciBhbmQgdGhlbiBmb2N1c2VzIGl0XG4gICAgQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gZm9jdXNcbiAgICBAcGFyYW0gcHJldmVudFNjcm9sbGluZyBXaGV0aGVyIG9yIG5vdCB0byBwcmV2ZW50IHRoZSBwYWdlIGZyb20gc2Nyb2xsaW5nIHRvIHRoZSBlbGVtZW50LiBEZWZhdWx0cyB0byB0cnVlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0FueUVsZW1lbnQoZWxlbWVudDpIVE1MRWxlbWVudHx1bmRlZmluZWQsIHByZXZlbnRTY3JvbGxpbmc6IGJvb2xlYW4gPSB0cnVlKTp2b2lke1xuICAgIGlmICghZWxlbWVudCB8fCAhZWxlbWVudC5mb2N1cykgcmV0dXJuO1xuXG4gICAgY29uc3QgaGFkVGFiSW5kZXggPSBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICBpZiAoIWhhZFRhYkluZGV4KSBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTgzMTEnKTtcblxuICAgIGVsZW1lbnQuZm9jdXMoe3ByZXZlbnRTY3JvbGw6IHByZXZlbnRTY3JvbGxpbmd9KTtcblxuICAgIC8vIFdyYXAgaW5zaWRlIHR3byByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgY2FsbHMgdG8gZW5zdXJlIHRoZSBicm93c2VyIGNvdWxkIGZvY3VzIHRoZSBlbGVtZW50IGJlZm9yZSByZW1vdmluZyB0aGUgdGFiaW5kZXggYXR0cmlidXRlLlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgaWYgKCFoYWRUYWJJbmRleCkgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfSk7fSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlDb2RlKGVsZW06IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBlbGVtZW50IHByb3ZpZGVkIHRvIGNvcHlDb2RlIHdpdGghXCIpO1xuXG4gICAgLy9jb25zb2xlLmRlYnVnKFwiY29weUNvZGVcIiwgZWxlbSk7XG5cbiAgICAvLyBHZXQgY29kZVxuICAgIGNvbnN0IGNvZGVFbGVtID0gZWxlbS5wYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCdjb2RlJyk7XG4gICAgaWYgKCFjb2RlRWxlbSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gY29kZSBlbGVtZW50IGZvdW5kIHRvIGNvcHkgZnJvbSFcIik7XG5cbiAgICAvLyBXcml0ZSBjb2RlIHRvIGNsaXBib2FyZCAoYWZ0ZXIgdHJpbW1pbmcgdGhlIHdoaXRlc3BhY2UpXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodHJpbVdoaXRlc3BhY2UoY29kZUVsZW0udGV4dENvbnRlbnQgPz8gJycsIHRydWUpKTtcblxuICAgIC8vIFNlbGVjdCB0ZXh0IChVWCBzdHVudClcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhO1xuICAgIGNvbnN0IHRlbXBSYW5nZSA9IG5ldyBSYW5nZSgpO1xuICAgIHRlbXBSYW5nZS5zZWxlY3ROb2RlKGNvZGVFbGVtKTtcbiAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7IHNlbGVjdGlvbi5hZGRSYW5nZSh0ZW1wUmFuZ2UpO1xufVxud2luZG93LmNvcHlDb2RlID0gY29weUNvZGU7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElucHV0VmFsdWUoaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIHJldHVybiBpbnB1dC52YWx1ZSB8fCBpbnB1dC5nZXRBdHRyaWJ1dGUoJ2JjZFBsYWNlaG9sZGVyJykgfHwgaW5wdXQucGxhY2Vob2xkZXIgfHwgJyc7XG59XG5cblxuZnVuY3Rpb24gX19fZ2V0T3JDcmVhdGVDaGlsZCh0aGlzOkRvY3VtZW50fEVsZW1lbnQsIHRhZ05hbWU6IHN0cmluZykge1xuICAgIGxldCBjaGlsZCA9IHRoaXMuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSlbMF07XG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IHRoaXMgaW5zdGFuY2VvZiBEb2N1bWVudCA/IHRoaXMgOiB0aGlzLm93bmVyRG9jdW1lbnQ7XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZyhgQ3JlYXRpbmcgJHt0YWdOYW1lfSBlbGVtZW50IGZvcmAsIHRoaXMpO1xuICAgICAgICBjaGlsZCA9IGRvYy5jcmVhdGVFbGVtZW50KHRhZ05hbWUsIHtpczogdGFnTmFtZX0pO1xuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGQ7XG59XG5FbGVtZW50LnByb3RvdHlwZS5nZXRPckNyZWF0ZUNoaWxkID0gX19fZ2V0T3JDcmVhdGVDaGlsZDtcbkRvY3VtZW50LnByb3RvdHlwZS5nZXRPckNyZWF0ZUNoaWxkID0gX19fZ2V0T3JDcmVhdGVDaGlsZDtcblxuXG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAkJFxcICAgICAgICAgICAgICAgICAkJCQkJCRcXCAgICAgICAgICAgJCRcXCAgICQkXFxcbiQkIF9fXyQkXFwgICAgICAgICAgICAgICAgICAgICBcXF9ffCAgICAgICAgICAgICAgICBcXF8kJCAgX3wgICAgICAgICAgXFxfX3wgICQkIHxcbiQkLyAgICQkIHwgJCQkJCQkXFwgICAkJCQkJCQkXFwgJCRcXCAgJCQkJCQkJFxcICAgICAgICAgJCQgfCAgJCQkJCQkJFxcICAkJFxcICQkJCQkJFxcXG4kJCQkJCQkXFwgfCBcXF9fX18kJFxcICQkICBfX19fX3wkJCB8JCQgIF9fX19ffCAgICAgICAgJCQgfCAgJCQgIF9fJCRcXCAkJCB8XFxfJCQgIF98XG4kJCAgX18kJFxcICAkJCQkJCQkIHxcXCQkJCQkJFxcICAkJCB8JCQgLyAgICAgICAgICAgICAgJCQgfCAgJCQgfCAgJCQgfCQkIHwgICQkIHxcbiQkIHwgICQkIHwkJCAgX18kJCB8IFxcX19fXyQkXFwgJCQgfCQkIHwgICAgICAgICAgICAgICQkIHwgICQkIHwgICQkIHwkJCB8ICAkJCB8JCRcXFxuJCQkJCQkJCAgfFxcJCQkJCQkJCB8JCQkJCQkJCAgfCQkIHxcXCQkJCQkJCRcXCAgICAgICAkJCQkJCRcXCAkJCB8ICAkJCB8JCQgfCAgXFwkJCQkICB8XG4gXFxfX19fX18vICBcXF9fX19fX198XFxfX19fX19fLyBcXF9ffCBcXF9fX19fX198ICAgICAgXFxfX19fX198XFxfX3wgIFxcX198XFxfX3wgICBcXF9fXyovXG5cbmludGVyZmFjZSBnZXRPckNyZWF0ZUNoaWxkIHtcbiAgICAvKiogUmV0dXJucyB0aGUgZmlyc3QgZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgdGFnIG5hbWUgb3IgY3JlYXRlcyBvbmUgaWYgaXQgZG9lcyBub3QgZXhpc3QgKi9cbiAgICBnZXRPckNyZWF0ZUNoaWxkPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KHRhZ05hbWU6IEspOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS107XG4gICAgZ2V0T3JDcmVhdGVDaGlsZCh0YWdOYW1lOiBzdHJpbmcpOkVsZW1lbnQ7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgRWxlbWVudCBleHRlbmRzIGdldE9yQ3JlYXRlQ2hpbGQge1xuICAgICAgICB1cGdyYWRlcz86IFJlY29yZDxzdHJpbmcsIEluc3RhbmNlVHlwZTxCQ0RDb21wb25lbnRJPj47XG4gICAgICAgIHVwZ3JhZGVzX3Byb3RvPzogUGFydGlhbDx7XG4gICAgICAgICAgICB0b29sdGlwOiBCQ0RUb29sdGlwO1xuICAgICAgICAgICAgZHJvcGRvd246IEJDRERyb3Bkb3duO1xuICAgICAgICB9PlxuICAgICAgICB0YXJnZXRpbmdDb21wb25lbnRzPzogUmVjb3JkPHN0cmluZywgQkNEQ29tcG9uZW50ST47XG4gICAgICAgIHRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8/OiBQYXJ0aWFsPHtcbiAgICAgICAgICAgIHRvb2x0aXA6IEJDRFRvb2x0aXA7XG4gICAgICAgICAgICBkcm9wZG93bjogQkNERHJvcGRvd25cbiAgICAgICAgfT5cbiAgICB9XG4gICAgaW50ZXJmYWNlIERvY3VtZW50IGV4dGVuZHMgZ2V0T3JDcmVhdGVDaGlsZCB7fVxuXG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgICAgIC8qKiBWYXJpYWJsZXMgc2V0IGJ5IHRoZSBwYWdlICovXG4gICAgICAgIC8vYmNkUGFnZVZhcnM6IFBhcnRpYWw8e30+XG5cbiAgICAgICAgLyoqIEJyb3dzZXItU3VwcG9ydGVkIENsaWNrIEV2ZW50ICovXG4gICAgICAgIGNsaWNrRXZ0OiAnY2xpY2snfCdtb3VzZWRvd24nXG5cbiAgICAgICAgLyoqIFRoZSBNREwgbGF5b3V0IGVsZW1lbnQgKi9cbiAgICAgICAgbGF5b3V0OiBtZGwuTWF0ZXJpYWxMYXlvdXRcblxuICAgICAgICAvKiogQSBsaXN0IG9mIFF1ZXJ5IFBhcmFtZXRlcnMgZnJvbSB0aGUgVVJJICovXG4gICAgICAgIHF1ZXJ5UGFyYW1zOiBvYmpPZjxzdHJpbmc+O1xuXG4gICAgICAgIC8qKiBBIGxpc3Qgb2YgZnVuY3Rpb25zIHVzZWQgd2hlbiBsb2FkaW5nIHNjcmlwdHMgKi9cbiAgICAgICAgYmNkX2luaXRfZnVuY3Rpb25zOiBvYmpPZjxGdW5jdGlvbj47XG5cbiAgICAgICAgLyoqIEEgc3BlY2lhbCBjbGFzcyB1c2VkIHRvIHRyYWNrIGNvbXBvbmVudHMgYWNyb3NzIG11bHRpcGxlIG1vZHVsZSBzY3JpcHRzICovXG4gICAgICAgIGJjZF9Db21wb25lbnRUcmFja2VyOiBiY2RfQ29tcG9uZW50VHJhY2tlcjtcblxuICAgICAgICBjb3B5Q29kZShlbGVtOiBIVE1MRWxlbWVudCk6IHZvaWQ7XG5cbiAgICAgICAgbGF6eVN0eWxlc0xvYWRlZDogdHJ1ZXx1bmRlZmluZWQ7XG5cbiAgICAgICAgQkNEU2V0dGluZ3NEcm9wZG93bjogdHlwZW9mIEJDRFNldHRpbmdzRHJvcGRvd247XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlclVwZ3JhZGUoc3ViamVjdDogRWxlbWVudCwgdXBncmFkZTogSW5zdGFuY2VUeXBlPEJDRENvbXBvbmVudEk+LCB0YXJnZXQ/OiBFbGVtZW50fG51bGwsIHByb3BhZ2F0ZVRvVGFyZ2V0Q2hpbGRyZW4gPSBmYWxzZSwgcHJvcGFnYXRlVG9TdWJqZWN0VG9DaGlsZHJlbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgLy9jb25zb2xlLmxvZyhcInJlZ2lzdGVyVXBncmFkZVwiLCB7c3ViamVjdCwgdXBncmFkZSwgdGFyZ2V0LCBwcm9wYWdhdGVUb1RhcmdldENoaWxkcmVuLCBwcm9wYWdhdGVTdWJqZWN0VG9DaGlsZHJlbjogcHJvcGFnYXRlVG9TdWJqZWN0VG9DaGlsZHJlbn0pO1xuICAgIC8vIFNldCB0aGUgdXBncmFkZSBvbiB0aGUgc3ViamVjdFxuICAgIGZvckVhY2hDaGlsZEFuZE9yUGFyZW50KHN1YmplY3QsIHByb3BhZ2F0ZVRvU3ViamVjdFRvQ2hpbGRyZW4sIGNoaWxkID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInJlZ2lzdGVyVXBncmFkZTogc3ViamVjdFwiLCBjaGlsZCk7XG4gICAgICAgIGNoaWxkLnVwZ3JhZGVzID8/PSB7fTtcbiAgICAgICAgY2hpbGQudXBncmFkZXNbdXBncmFkZS5jb25zdHJ1Y3Rvci5uYW1lXSA9IHVwZ3JhZGU7XG4gICAgfSk7XG5cbiAgICAvLyBSZXBlYXQgZm9yIHRhcmdldFxuICAgIGlmICh0YXJnZXQpIGZvckVhY2hDaGlsZEFuZE9yUGFyZW50KHRhcmdldCwgcHJvcGFnYXRlVG9UYXJnZXRDaGlsZHJlbiwgY2hpbGQgPT4ge1xuICAgICAgICBjaGlsZC50YXJnZXRpbmdDb21wb25lbnRzID8/PSB7fTtcbiAgICAgICAgY2hpbGQudGFyZ2V0aW5nQ29tcG9uZW50c1t1cGdyYWRlLmNvbnN0cnVjdG9yLm5hbWVdID0gdXBncmFkZTtcbiAgICB9KTtcblxuICAgIGlmICh1cGdyYWRlIGluc3RhbmNlb2YgQkNEVG9vbHRpcCkge1xuICAgICAgICBmb3JFYWNoQ2hpbGRBbmRPclBhcmVudChzdWJqZWN0LCBwcm9wYWdhdGVUb1N1YmplY3RUb0NoaWxkcmVuLCBjaGlsZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkLnVwZ3JhZGVzX3Byb3RvKSBjaGlsZC51cGdyYWRlc19wcm90byA9IHt9O1xuICAgICAgICAgICAgY2hpbGQudXBncmFkZXNfcHJvdG8hLnRvb2x0aXAgPSB1cGdyYWRlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRhcmdldCkgZm9yRWFjaENoaWxkQW5kT3JQYXJlbnQodGFyZ2V0LCBwcm9wYWdhdGVUb1RhcmdldENoaWxkcmVuLCBjaGlsZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8pIGNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8gPSB7fTtcbiAgICAgICAgICAgIGNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8hLnRvb2x0aXAgPSB1cGdyYWRlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodXBncmFkZSBpbnN0YW5jZW9mIEJDRERyb3Bkb3duKSB7XG4gICAgICAgIGZvckVhY2hDaGlsZEFuZE9yUGFyZW50KHN1YmplY3QsIHByb3BhZ2F0ZVRvU3ViamVjdFRvQ2hpbGRyZW4sIGNoaWxkID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQudXBncmFkZXNfcHJvdG8pIGNoaWxkLnVwZ3JhZGVzX3Byb3RvID0ge307XG4gICAgICAgICAgICBjaGlsZC51cGdyYWRlc19wcm90byEuZHJvcGRvd24gPSB1cGdyYWRlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRhcmdldCkgZm9yRWFjaENoaWxkQW5kT3JQYXJlbnQodGFyZ2V0LCBwcm9wYWdhdGVUb1RhcmdldENoaWxkcmVuLCBjaGlsZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8pIGNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8gPSB7fTtcbiAgICAgICAgICAgIGNoaWxkLnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8hLmRyb3Bkb3duID0gdXBncmFkZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoQ2hpbGRBbmRPclBhcmVudChzdGFydDogRWxlbWVudCwgZG9DaGlsZHJlbjogYm9vbGVhbiwgY2FsbGJhY2s6IChjaGlsZDogRWxlbWVudCkgPT4gdW5rbm93bik6IHZvaWQge1xuICAgIGlmIChkb0NoaWxkcmVuKSBmb3JFYWNoQ2hpbGQoc3RhcnQsIGNhbGxiYWNrKTtcbiAgICBjYWxsYmFjayhzdGFydCk7XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hDaGlsZChzdGFydDogRWxlbWVudCwgY2FsbGJhY2s6IChjaGlsZDogRWxlbWVudCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhcnQuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yRWFjaENoaWxkKHN0YXJ0LmNoaWxkcmVuW2ldISwgY2FsbGJhY2spO1xuICAgICAgICBjYWxsYmFjayhzdGFydC5jaGlsZHJlbltpXSEpO1xuICAgIH1cbn1cblxuLyoqIFF1aWNrLWFuZC1kaXJ0eSBlbnVtIG9mIHN0cmluZ3MgdXNlZCBvZnRlbiB0aHJvdWdob3V0IHRoZSBjb2RlICovXG5lbnVtIHN0cnMge1xuICAgIHRyYW5zaXRpb25EdXIgPSBcInRyYW5zaXRpb24tZHVyYXRpb25cIixcbiAgICBhbmltRHVyID0gXCJhbmltYXRpb24tZHVyYXRpb25cIixcbiAgICBtYXJnaW5Ub3AgPSBcIm1hcmdpbi10b3BcIixcbiAgICBjbGFzc0lzT3BlbiA9IFwiaXMtb3BlblwiLFxuICAgIGNsYXNzQWRqYWNlbnQgPSBcImFkamFjZW50XCIsXG4gICAgY2xhc3NEZXRhaWxzSW5uZXIgPSBcImpzLWJjZC1kZXRhaWxzLWlubmVyXCIsXG4gICAgZXJySXRlbSA9IFwiRXJyb3IgSXRlbTpcIlxufVxuXG53aW5kb3cucXVlcnlQYXJhbXMgPSB7fTtcblxuaWYgKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2hbMF0gPT09ICc/JylcbiAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKS5zcGxpdCgnJicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwYXJhbSA9PiBwYXJhbS5zcGxpdCgnPScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHBhcmFtID0+IHdpbmRvdy5xdWVyeVBhcmFtc1twYXJhbVswXSEudHJpbSgpXSA9IHBhcmFtWzFdPy50cmltKCkgPz8gJycpO1xuXG5cblxuLyoqIEludGVyZmFjZSBkZWZpbmluZyB0aGUgcmVhZG9ubHkgcHJvcGVydGllcyBjc3NDbGFzcyBhbmQgYXNTdHJpbmcgdG8gbWFrZSBpZGVudGlmeWluZyBNREwgQ2xhc3NlcyBzZXQgdXAgZm9yIG15IGN1c3RvbSwgcGFpbmxlc3MgcmVnaXN0cmF0aW9uIGZ1bmN0aW9ucyBhIGJyZWV6ZSAqL1xuaW50ZXJmYWNlIEJDRENvbXBvbmVudEkgZXh0ZW5kcyBGdW5jdGlvbiB7XG4gICAgbmV3KGVsZW1lbnQ6IGFueSwgLi4uYXJnczogYW55W10pOiBhbnk7XG4gICAgcmVhZG9ubHkgYXNTdHJpbmc6IHN0cmluZztcbiAgICByZWFkb25seSBjc3NDbGFzczogc3RyaW5nO1xufVxuXG4vKiogVmFyaWFibGUgdG8gc3RvcmUgY29tcG9uZW50cyB0aGF0IHdlJ2xsIGJlIHJlZ2lzdGVyaW5nIG9uIERPTSBpbml0aWFsaXphdGlvbiAqL1xuY29uc3QgYmNkQ29tcG9uZW50czpCQ0RDb21wb25lbnRJW10gPSBbXTtcblxuXG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFxcbiQkICBfXyQkXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkIHxcbiQkIC8gIFxcX198ICQkJCQkJFxcICAkJCQkJCRcXCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkXFwgICQkJCQkJCRcXCAgICQkJCQkJFxcICAkJCQkJCQkXFwgICQkJCQkJFxcXG4kJCB8ICAgICAgJCQgIF9fJCRcXCAkJCAgXyQkICBfJCRcXCAkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkICBfXyQkXFwgXFxfJCQgIF98XG4kJCB8ICAgICAgJCQgLyAgJCQgfCQkIC8gJCQgLyAkJCB8JCQgLyAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8JCQkJCQkJCQgfCQkIHwgICQkIHwgICQkIHxcbiQkIHwgICQkXFwgJCQgfCAgJCQgfCQkIHwgJCQgfCAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQgICBfX19ffCQkIHwgICQkIHwgICQkIHwkJFxcXG5cXCQkJCQkJCAgfFxcJCQkJCQkICB8JCQgfCAkJCB8ICQkIHwkJCQkJCQkICB8XFwkJCQkJCQgIHwkJCB8ICAkJCB8XFwkJCQkJCQkXFwgJCQgfCAgJCQgfCAgXFwkJCQkICB8XG4gXFxfX19fX18vICBcXF9fX19fXy8gXFxfX3wgXFxfX3wgXFxfX3wkJCAgX19fXy8gIFxcX19fX19fLyBcXF9ffCAgXFxfX3wgXFxfX19fX19ffFxcX198ICBcXF9ffCAgIFxcX19fXy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX198XG4kJCQkJCQkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFxcblxcX18kJCAgX198ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICAgJCQgfCAgICAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJFxcICQkIHwgICQkXFwgICQkJCQkJFxcICAgJCQkJCQkXFxcbiAgICQkIHwgICAkJCAgX18kJFxcICBcXF9fX18kJFxcICQkICBfX19fX3wkJCB8ICQkICB8JCQgIF9fJCRcXCAkJCAgX18kJFxcXG4gICAkJCB8ICAgJCQgfCAgXFxfX3wgJCQkJCQkJCB8JCQgLyAgICAgICQkJCQkJCAgLyAkJCQkJCQkJCB8JCQgfCAgXFxfX3xcbiAgICQkIHwgICAkJCB8ICAgICAgJCQgIF9fJCQgfCQkIHwgICAgICAkJCAgXyQkPCAgJCQgICBfX19ffCQkIHxcbiAgICQkIHwgICAkJCB8ICAgICAgXFwkJCQkJCQkIHxcXCQkJCQkJCRcXCAkJCB8IFxcJCRcXCBcXCQkJCQkJCRcXCAkJCB8XG4gICBcXF9ffCAgIFxcX198ICAgICAgIFxcX19fX19fX3wgXFxfX19fX19ffFxcX198ICBcXF9ffCBcXF9fX19fX198XFxfKi9cblxuXG5cbi8qKiBBIHNpbmdsZSBpdGVtIGxpc3RlZCBpbiB0aGUgQ29tcG9uZW50IFRyYWNrZXIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgY29tcG9uZW50VHJhY2tpbmdJdGVtPFRDb25zdHJ1Y3Rvcj4ge1xuICAgIG9iajpvYmpPZjxUQ29uc3RydWN0b3I+LFxuICAgIGFycjpUQ29uc3RydWN0b3JbXVxufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgdHJhY2thYmxlQ29uc3RydWN0b3I8VENsYXNzPiBleHRlbmRzIEZ1bmN0aW9uIHtcbiAgICBhc1N0cmluZzogc3RyaW5nO1xuICAgIG5ldyguLi5hcmdzOmFueVtdKTpUQ2xhc3M7XG59XG5cbi8qKiBXcmFwcGVkIGluIGEgY2xhc3MgdG8gZ2V0IGFyb3VuZCB0aGUgY29tcGxleGl0aWVzIG9mIGV4cG9ydGluZy4gKi9cbmV4cG9ydCBjbGFzcyBiY2RfQ29tcG9uZW50VHJhY2tlciB7XG4gICAgc3RhdGljIHJlZ2lzdGVyZWRfY29tcG9uZW50czpvYmpPZjxjb21wb25lbnRUcmFja2luZ0l0ZW08dW5rbm93bj4+ID0ge307XG5cblxuICAgIHN0YXRpYyByZWdpc3RlckNvbXBvbmVudDxUQ2xhc3M+KGNvbXBvbmVudDpUQ2xhc3MsIGNvbnN0cnVjdG9yOiB0cmFja2FibGVDb25zdHJ1Y3RvcjxUQ2xhc3M+LCBlbGVtZW50OkhUTUxFbGVtZW50KTp2b2lke1xuICAgICAgICBiY2RfQ29tcG9uZW50VHJhY2tlci5jcmVhdGVUcmFja2VkQ29tcG9uZW50KGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAoZWxlbWVudC5pZCAhPT0gJycpXG4gICAgICAgICAgICBiY2RfQ29tcG9uZW50VHJhY2tlci5yZWdpc3RlcmVkX2NvbXBvbmVudHNbY29uc3RydWN0b3IuYXNTdHJpbmddIS5vYmpbZWxlbWVudC5pZF0gPSBjb21wb25lbnQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJjZF9Db21wb25lbnRUcmFja2VyLnJlZ2lzdGVyZWRfY29tcG9uZW50c1tjb25zdHJ1Y3Rvci5hc1N0cmluZ10hLmFyci5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVRyYWNrZWRDb21wb25lbnQoY29uc3RydWN0b3I6dHJhY2thYmxlQ29uc3RydWN0b3I8YW55Pil7XG4gICAgICAgIGlmICh0eXBlb2YgYmNkX0NvbXBvbmVudFRyYWNrZXIucmVnaXN0ZXJlZF9jb21wb25lbnRzW2NvbnN0cnVjdG9yLmFzU3RyaW5nXSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICBiY2RfQ29tcG9uZW50VHJhY2tlci5yZWdpc3RlcmVkX2NvbXBvbmVudHNbY29uc3RydWN0b3IuYXNTdHJpbmddID0ge29iajoge30sIGFycjogW119O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRUcmFja2VkQ29uc3RydWN0b3I8VENvbnN0cnVjdG9yPihjb25zdHJ1Y3Rvcjp0cmFja2FibGVDb25zdHJ1Y3RvcjxUQ29uc3RydWN0b3I+KTpjb21wb25lbnRUcmFja2luZ0l0ZW08VENvbnN0cnVjdG9yPntcbiAgICAgICAgYmNkX0NvbXBvbmVudFRyYWNrZXIuY3JlYXRlVHJhY2tlZENvbXBvbmVudChjb25zdHJ1Y3Rvcik7XG4gICAgICAgIHJldHVybiBiY2RfQ29tcG9uZW50VHJhY2tlci5yZWdpc3RlcmVkX2NvbXBvbmVudHNbY29uc3RydWN0b3IuYXNTdHJpbmddIGFzIGNvbXBvbmVudFRyYWNraW5nSXRlbTxUQ29uc3RydWN0b3I+O1xuICAgIH1cblxuXG4gICAgc3RhdGljIGZpbmRJdGVtPFRDb25zdHJ1Y3Rvcj4oY29uc3RydWN0b3I6IHRyYWNrYWJsZUNvbnN0cnVjdG9yPFRDb25zdHJ1Y3Rvcj4sIGVsZW1lbnQ6SFRNTEVsZW1lbnQsIGZpbmRQcmVkaWNhdGU/OiAoYXJnMDpUQ29uc3RydWN0b3IpID0+IGJvb2xlYW4pOiBUQ29uc3RydWN0b3J8dW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuaWQpXG4gICAgICAgICAgICByZXR1cm4gYmNkX0NvbXBvbmVudFRyYWNrZXIucmVnaXN0ZXJlZF9jb21wb25lbnRzW2NvbnN0cnVjdG9yLmFzU3RyaW5nXSEub2JqW2VsZW1lbnQuaWRdIGFzIFRDb25zdHJ1Y3RvcjtcbiAgICAgICAgZWxzZSBpZiAoZmluZFByZWRpY2F0ZSlcbiAgICAgICAgICAgIHJldHVybiBiY2RfQ29tcG9uZW50VHJhY2tlci5nZXRUcmFja2VkQ29uc3RydWN0b3IoY29uc3RydWN0b3IpLmFyci5maW5kKGZpbmRQcmVkaWNhdGUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cbndpbmRvdy5iY2RfQ29tcG9uZW50VHJhY2tlciA9IGJjZF9Db21wb25lbnRUcmFja2VyO1xuXG5cblxuLyokJCQkJFxcICAgICAgICAgICAgJCRcXCAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgJCRcXCAgICAgICAkJFxcXG4kJCAgX18kJFxcICAgICAgICAgICAkJCB8JCQgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX198JCQgfCAgICAgICQkIHxcbiQkIC8gIFxcX198ICQkJCQkJFxcICAkJCB8JCQgfCAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJFxcICQkXFwgJCQkJCQkJFxcICAkJCB8ICQkJCQkJFxcXG4kJCB8ICAgICAgJCQgIF9fJCRcXCAkJCB8JCQgfCBcXF9fX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffCQkIHwkJCAgX18kJFxcICQkIHwkJCAgX18kJFxcXG4kJCB8ICAgICAgJCQgLyAgJCQgfCQkIHwkJCB8ICQkJCQkJCQgfCQkIC8gICQkIHxcXCQkJCQkJFxcICAkJCB8JCQgfCAgJCQgfCQkIHwkJCQkJCQkJCB8XG4kJCB8ICAkJFxcICQkIHwgICQkIHwkJCB8JCQgfCQkICBfXyQkIHwkJCB8ICAkJCB8IFxcX19fXyQkXFwgJCQgfCQkIHwgICQkIHwkJCB8JCQgICBfX19ffFxuXFwkJCQkJCQgIHxcXCQkJCQkJCAgfCQkIHwkJCB8XFwkJCQkJCQkIHwkJCQkJCQkICB8JCQkJCQkJCAgfCQkIHwkJCQkJCQkICB8JCQgfFxcJCQkJCQkJFxcXG4gXFxfX19fX18vICBcXF9fX19fXy8gXFxfX3xcXF9ffCBcXF9fX19fX198JCQgIF9fX18vIFxcX19fX19fXy8gXFxfX3xcXF9fX19fX18vIFxcX198IFxcX19fX19fX3xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcXyovXG5cblxuXG5hYnN0cmFjdCBjbGFzcyBiY2RfY29sbGFwc2libGVQYXJlbnQge1xuICAgIC8vIEZvciBjaGlsZHJlbiB0byBzZXRcbiAgICBkZXRhaWxzITpIVE1MRWxlbWVudDtcbiAgICBkZXRhaWxzX2lubmVyITpIVE1MRWxlbWVudDtcbiAgICBzdW1tYXJ5ITpIVE1MRWxlbWVudDtcbiAgICBvcGVuSWNvbnM5MGRlZyE6SFRNTENvbGxlY3Rpb247XG5cbiAgICAvLyBGb3IgdXMgdG8gc2V0XG4gICAgc2VsZjpIVE1MRWxlbWVudDtcbiAgICBhZGphY2VudDpib29sZWFuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcihlbG06SFRNTEVsZW1lbnQpe1xuICAgICAgICB0aGlzLnNlbGYgPSBlbG07XG4gICAgICAgIHRoaXMuYWRqYWNlbnQgPSBlbG0uY2xhc3NMaXN0LmNvbnRhaW5zKHN0cnMuY2xhc3NBZGphY2VudCk7XG4gICAgfVxuXG4gICAgaXNPcGVuKCk6Ym9vbGVhbiB7Ly90aGlzLmRlYnVnQ2hlY2soKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV0YWlscy5jbGFzc0xpc3QuY29udGFpbnMoc3Rycy5jbGFzc0lzT3BlbikgfHwgdGhpcy5zdW1tYXJ5LmNsYXNzTGlzdC5jb250YWlucyhzdHJzLmNsYXNzSXNPcGVuKTtcbiAgICB9XG5cbiAgICAvKiogVG9nZ2xlIHRoZSBjb2xsYXBzaWJsZSBtZW51LiAqL1xuICAgIHRvZ2dsZShkb1NldER1cmF0aW9uOmJvb2xlYW4gPSB0cnVlKSB7Ly90aGlzLmRlYnVnQ2hlY2soKTtcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKCkpIHsgdGhpcy5jbG9zZShkb1NldER1cmF0aW9uKTsgfSBlbHNlIHsgdGhpcy5vcGVuKGRvU2V0RHVyYXRpb24pOyB9XG4gICAgfVxuXG4gICAgLyoqIFJlLWV2YWx1YXRlIHRoZSBjb2xsYXBzaWJsZSdzIGN1cnJlbnQgc3RhdGUuICovXG4gICAgcmVFdmFsKGRvU2V0RHVyYXRpb24/OmZhbHNlKTp2b2lkXG4gICAgcmVFdmFsKGRvU2V0RHVyYXRpb24/OnRydWUsIGluc3RhbnQ/OnRydWUpOnZvaWRcbiAgICByZUV2YWwoZG9TZXREdXJhdGlvbjpib29sZWFuID0gdHJ1ZSwgaW5zdGFudD86dHJ1ZSk6dm9pZCB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzT3BlbigpKSB0aGlzLm9wZW4oZG9TZXREdXJhdGlvbiwgaW5zdGFudCk7XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmNsb3NlKGRvU2V0RHVyYXRpb24sIGluc3RhbnQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vblRyYW5zaXRpb25FbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKiogT3BlbiB0aGUgY29sbGFwc2libGUgbWVudS4gKi9cbiAgICBvcGVuKGRvU2V0RHVyYXRpb246Ym9vbGVhbiA9IHRydWUsIGluc3RhbnQgPSBmYWxzZSkgey8vdGhpcy5kZWJ1Z0NoZWNrKCk7XG5cbiAgICAgICAgaWYgKGluc3RhbnQpIHRoaXMuaW5zdGFudFRyYW5zaXRpb24oKTtcbiAgICAgICAgZWxzZSBpZiAoZG9TZXREdXJhdGlvbikgdGhpcy5ldmFsdWF0ZUR1cmF0aW9uKGRvU2V0RHVyYXRpb24pO1xuXG4gICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLmFyaWFIaWRkZW4gPSAnZmFsc2UnO1xuICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdub25lJztcblxuXG4gICAgICAgIHRoaXMuZGV0YWlscy5jbGFzc0xpc3QuYWRkKHN0cnMuY2xhc3NJc09wZW4pO1xuICAgICAgICB0aGlzLnN1bW1hcnkuY2xhc3NMaXN0LmFkZChzdHJzLmNsYXNzSXNPcGVuKTtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpPT5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5zdHlsZS5tYXJnaW5Ub3AgPSB0aGlzLmRldGFpbHMuZ2V0QXR0cmlidXRlKCdkYXRhLW1hcmdpbi10b3AnKSB8fCAnMCc7XG5cbiAgICAgICAgICAgIGlmIChpbnN0YW50KSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+XG4gICAgICAgICAgICAgICAgdGhpcy5ldmFsdWF0ZUR1cmF0aW9uLmJpbmQodGhpcywgZG9TZXREdXJhdGlvbiwgdHJ1ZSlcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgIH0pKSkpO1xuICAgIH1cblxuICAgIC8qKiBDbG9zZSB0aGUgY29sbGFwc2libGUgbWVudS4gKi9cbiAgICBjbG9zZShkb1NldER1cmF0aW9uOmJvb2xlYW4gPSB0cnVlLCBpbnN0YW50ID0gZmFsc2UpIHsvL3RoaXMuZGVidWdDaGVjaygpO1xuXG4gICAgICAgIGlmIChpbnN0YW50KSB0aGlzLmluc3RhbnRUcmFuc2l0aW9uKCk7XG4gICAgICAgIGVsc2UgaWYgKGRvU2V0RHVyYXRpb24pIHRoaXMuZXZhbHVhdGVEdXJhdGlvbihkb1NldER1cmF0aW9uLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLnN0eWxlLm1hcmdpblRvcCA9IGAtJHt0aGlzLmRldGFpbHNfaW5uZXIub2Zmc2V0SGVpZ2h0ICsgMzJ9cHhgO1xuXG4gICAgICAgIHRoaXMuZGV0YWlscy5jbGFzc0xpc3QucmVtb3ZlKHN0cnMuY2xhc3NJc09wZW4pO1xuICAgICAgICB0aGlzLnN1bW1hcnkuY2xhc3NMaXN0LnJlbW92ZShzdHJzLmNsYXNzSXNPcGVuKTtcblxuICAgICAgICBpZiAoaW5zdGFudCkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpPT5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ldmFsdWF0ZUR1cmF0aW9uKGRvU2V0RHVyYXRpb24sIGZhbHNlKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIG9uVHJhbnNpdGlvbkVuZChldmVudD86VHJhbnNpdGlvbkV2ZW50KTp2b2lkIHtcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnByb3BlcnR5TmFtZSAhPT0gJ21hcmdpbi10b3AnKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLmFyaWFIaWRkZW4gPSAndHJ1ZSc7XG4gICAgICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5zdGFudFRyYW5zaXRpb24oKTp2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuZGV0YWlsc19pbm5lcikge1xuICAgICAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAwc2A7XG4gICAgICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIuc3R5bGUuYW5pbWF0aW9uRHVyYXRpb24gPSBgMHNgO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpY29uIG9mIHRoaXMub3Blbkljb25zOTBkZWcpIHtcbiAgICAgICAgICAgICAgICAoaWNvbiBhcyBIVE1MRWxlbWVudCkuc3R5bGUuYW5pbWF0aW9uRHVyYXRpb24gPSBgMHNgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub25UcmFuc2l0aW9uRW5kKCk7XG4gICAgfVxuXG4gICAgLyogRGV0ZXJtaW5lcyB3aGF0IHRoZSB0cmFuc2l0aW9uIGFuZCBhbmltYXRpb24gZHVyYXRpb24gb2YgdGhlIGNvbGxhcHNpYmxlIG1lbnUgaXMgKi9cbiAgICBldmFsdWF0ZUR1cmF0aW9uKGRvUnVuOmJvb2xlYW4gPSB0cnVlLCBvcGVuaW5nOmJvb2xlYW49dHJ1ZSkgey8vdGhpcy5kZWJ1Z0NoZWNrKCk7XG4gICAgICAgIGlmIChkb1J1biAmJiB0aGlzLmRldGFpbHNfaW5uZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSB0aGlzLmRldGFpbHNfaW5uZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAkeyhvcGVuaW5nID8gMjUwIDogNTAwKSArICgob3BlbmluZyA/IDAuMiA6IDAuNSkgKiAoY29udGVudEhlaWdodCArIDMyKSl9bXNgO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpY29uIG9mIHRoaXMub3Blbkljb25zOTBkZWcpIHtcbiAgICAgICAgICAgICAgICAoaWNvbiBhcyBIVE1MRWxlbWVudCkuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gYCR7IDI1MCArICgwLjE1ICogKGNvbnRlbnRIZWlnaHQgKyAzMikpIH1tc2A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCZWxsQ3ViaWNEZXRhaWxzIGV4dGVuZHMgYmNkX2NvbGxhcHNpYmxlUGFyZW50IHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSBcImpzLWJjZC1kZXRhaWxzXCI7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gXCJCZWxsQ3ViaWNEZXRhaWxzXCI7XG5cbiAgICAvKiogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMuZGV0YWlscyA9IGVsZW1lbnQ7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGVsZW1lbnQgdG8gbWFrZSBhbmltYXRpb24gZ28gYnJyclxuICAgICAgICAvLyBTbGlnaHRseSBvdmVyLWNvbXBsaWNhdGVkIGJlY2F1c2UsIHVoLCBET00gZGlkbid0IHdhbnQgdG8gY29vcGVyYXRlLlxuICAgICAgICB0aGlzLmRldGFpbHNfaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLmNsYXNzTGlzdC5hZGQoc3Rycy5jbGFzc0RldGFpbHNJbm5lcik7XG5cbiAgICAgICAgLy8gVGhlIGBjaGlsZHJlbmAgSFRNTENvbGxlY3Rpb24gaXMgbGl2ZSwgc28gd2UncmUgZmV0Y2hpbmcgZWFjaCBlbGVtZW50IGFuZCB0aHJvd2luZyBpdCBpbnRvIGFuIGFycmF5Li4uXG4gICAgICAgIGNvbnN0IHRlbXBfY2hpbGRyZW5BcnI6Q2hpbGROb2RlW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMuZGV0YWlscy5jaGlsZE5vZGVzKXtcbiAgICAgICAgICAgIHRlbXBfY2hpbGRyZW5BcnIucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAuLi5hbmQgYWN0dWFsbHkgbW92aW5nIHRoZSBlbGVtZW50cyBpbnRvIHRoZSBuZXcgZGl2IGhlcmUuXG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0ZW1wX2NoaWxkcmVuQXJyKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsc19pbm5lci5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGV0YWlscy5hcHBlbmRDaGlsZCh0aGlzLmRldGFpbHNfaW5uZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLmFkamFjZW50KSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wX3N1bW1hcnkgPSB0aGlzLnNlbGYucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIGlmICghdGVtcF9zdW1tYXJ5IHx8ICF0ZW1wX3N1bW1hcnkuY2xhc3NMaXN0LmNvbnRhaW5zKEJlbGxDdWJpY1N1bW1hcnkuY3NzQ2xhc3MpKSAvKiBUaHJvdyBhbiBlcnJvciovIHtjb25zb2xlLmxvZyhzdHJzLmVyckl0ZW0sIHRoaXMpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiW0JDRC1ERVRBSUxTXSBFcnJvcjogQWRqYWNlbnQgRGV0YWlscyBlbGVtZW50IG11c3QgYmUgcHJlY2VkZWQgYnkgYSBTdW1tYXJ5IGVsZW1lbnQuXCIpO31cbiAgICAgICAgICAgIHRoaXMuc3VtbWFyeSA9IHRlbXBfc3VtbWFyeSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBfc3VtbWFyeSA9IHRoaXMuc2VsZi5vd25lckRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5qcy1iY2Qtc3VtbWFyeVtmb3I9XCIke3RoaXMuZGV0YWlscy5pZH1cImApO1xuICAgICAgICAgICAgaWYgKCF0ZW1wX3N1bW1hcnkpIC8qIFRocm93IGFuIGVycm9yKi8ge2NvbnNvbGUubG9nKHN0cnMuZXJySXRlbSwgdGhpcyk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJbQkNELURFVEFJTFNdIEVycm9yOiBOb24tYWRqYWNlbnQgRGV0YWlscyBlbGVtZW50cyBtdXN0IGhhdmUgYSBTdW1tYXJ5IGVsZW1lbnQgd2l0aCBhIGBmb3JgIGF0dHJpYnV0ZSBtYXRjaGluZyB0aGUgRGV0YWlscyBlbGVtZW50J3MgaWQuXCIpO31cbiAgICAgICAgICAgIHRoaXMuc3VtbWFyeSA9IHRlbXBfc3VtbWFyeSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wZW5JY29uczkwZGVnID0gdGhpcy5zdW1tYXJ5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ29wZW4taWNvbi05MENDJyk7XG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcih0aGlzLnJlRXZhbE9uU2l6ZUNoYW5nZS5iaW5kKHRoaXMpKS5vYnNlcnZlKHRoaXMuZGV0YWlsc19pbm5lcik7XG5cbiAgICAgICAgdGhpcy5kZXRhaWxzX2lubmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uVHJhbnNpdGlvbkVuZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBiY2RfQ29tcG9uZW50VHJhY2tlci5yZWdpc3RlckNvbXBvbmVudCh0aGlzLCBCZWxsQ3ViaWNEZXRhaWxzLCB0aGlzLmRldGFpbHMpO1xuICAgICAgICB0aGlzLnJlRXZhbCh0cnVlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5zZWxmLmNsYXNzTGlzdC5hZGQoJ2luaXRpYWxpemVkJyk7XG5cbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKHRoaXMuc2VsZiwgdGhpcywgdGhpcy5zdW1tYXJ5LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZUV2YWxPblNpemVDaGFuZ2UoZXZlbnQ6IHVua25vd24pIHtcbiAgICAgICAgdGhpcy5yZUV2YWwodHJ1ZSwgdHJ1ZSk7XG4gICAgfVxufVxuYmNkQ29tcG9uZW50cy5wdXNoKEJlbGxDdWJpY0RldGFpbHMpO1xuXG5leHBvcnQgY2xhc3MgQmVsbEN1YmljU3VtbWFyeSBleHRlbmRzIGJjZF9jb2xsYXBzaWJsZVBhcmVudCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLWJjZC1zdW1tYXJ5JztcbiAgICBzdGF0aWMgcmVhZG9ubHkgYXNTdHJpbmcgPSAnQmVsbEN1YmljU3VtbWFyeSc7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OkhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnN1bW1hcnkgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLnN1bW1hcnkuYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3cuY2xpY2tFdnQsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc3VtbWFyeS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIHRoaXMuaGFuZGxlS2V5LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9wZW5JY29uczkwZGVnID0gdGhpcy5zdW1tYXJ5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ29wZW4taWNvbi05MENDJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRqYWNlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBfZGV0YWlscyA9IHRoaXMuc2VsZi5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICBpZiAoISh0ZW1wX2RldGFpbHMgJiYgdGVtcF9kZXRhaWxzLmNsYXNzTGlzdC5jb250YWlucyhCZWxsQ3ViaWNEZXRhaWxzLmNzc0NsYXNzKSkpIC8qIFRocm93IGFuIGVycm9yKi8ge2NvbnNvbGUubG9nKHN0cnMuZXJySXRlbSwgdGhpcyk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJbQkNELVNVTU1BUlldIEVycm9yOiBBZGphY2VudCBTdW1tYXJ5IGVsZW1lbnQgbXVzdCBiZSBwcm9jZWVkZWQgYnkgYSBEZXRhaWxzIGVsZW1lbnQuXCIpO31cbiAgICAgICAgICAgIHRoaXMuZGV0YWlscyA9IHRlbXBfZGV0YWlscyBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBfZGV0YWlscyA9IHRoaXMuc2VsZi5vd25lckRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc3VtbWFyeS5nZXRBdHRyaWJ1dGUoJ2ZvcicpID8/ICcnKTtcbiAgICAgICAgICAgIGlmICghdGVtcF9kZXRhaWxzKSAvKiBUaHJvdyBhbiBlcnJvciovIHtjb25zb2xlLmxvZyhzdHJzLmVyckl0ZW0sIHRoaXMpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiW0JDRC1TVU1NQVJZXSBFcnJvcjogTm9uLWFkamFjZW50IERldGFpbHMgZWxlbWVudHMgbXVzdCBoYXZlIGEgc3VtbWFyeSBlbGVtZW50IHdpdGggYSBgZm9yYCBhdHRyaWJ1dGUgbWF0Y2hpbmcgdGhlIERldGFpbHMgZWxlbWVudCdzIGlkLlwiKTt9XG4gICAgICAgICAgICB0aGlzLmRldGFpbHMgPSB0ZW1wX2RldGFpbHMgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpdmVydGVkQ29tcGxldGlvbigpO1xuXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZSh0aGlzLnNlbGYsIHRoaXMsIHRoaXMuZGV0YWlscywgZmFsc2UsIHRydWUpO1xuICAgIH1cblxuICAgIGRpdmVydGVkQ29tcGxldGlvbigpe3JlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+e1xuXG4gICAgICAgIGNvbnN0IHRlbXBfaW5uZXIgPSB0aGlzLmRldGFpbHMucXVlcnlTZWxlY3RvcihgLiR7c3Rycy5jbGFzc0RldGFpbHNJbm5lcn1gKTtcbiAgICAgICAgaWYgKCF0ZW1wX2lubmVyKSB7dGhpcy5kaXZlcnRlZENvbXBsZXRpb24oKTsgcmV0dXJuO31cbiAgICAgICAgICAgIGVsc2UgdGhpcy5kZXRhaWxzX2lubmVyID0gdGVtcF9pbm5lciBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICBiY2RfQ29tcG9uZW50VHJhY2tlci5yZWdpc3RlckNvbXBvbmVudCh0aGlzLCBCZWxsQ3ViaWNTdW1tYXJ5LCB0aGlzLmRldGFpbHMpO1xuICAgICAgICB0aGlzLnJlRXZhbCh0cnVlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5zZWxmLmNsYXNzTGlzdC5hZGQoJ2luaXRpYWxpemVkJyk7XG4gICAgfSk7fVxuXG4gICAgY29ycmVjdEZvY3VzKGtleURvd24/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy5pc09wZW4oKSkgZm9jdXNBbnlFbGVtZW50KHRoaXMuc3VtbWFyeSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLmlzT3BlbigpIHx8ICFrZXlEb3duKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge3JlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN1bW1hcnkuYmx1cigpO1xuICAgICAgICB9KTt9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudD86TW91c2VFdmVudCl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IFByb3BlcnR5ICdwYXRoJyBhbmQgJ3BvaW50ZXJUeXBlJyBETyBleGlzdCBvbiB0eXBlICdNb3VzZUV2ZW50JywgYnV0IG5vdCBpbiBGaXJlZm94IG9yIHByZXN1bWFibHkgU2FmYXJpXG4gICAgICAgIGlmICghZXZlbnQgfHwgKCgncG9pbnRlclR5cGUnIGluIGV2ZW50KSAmJiAhZXZlbnQucG9pbnRlclR5cGUpIHx8IChldmVudC5wYXRoICYmIGV2ZW50LnBhdGg/LnNsaWNlKDAsIDUpLm1hcCgoZWw6SFRNTEVsZW1lbnQpID0+IGVsLnRhZ05hbWUgPT09ICdBJykuaW5jbHVkZXModHJ1ZSkpKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgdGhpcy5jb3JyZWN0Rm9jdXMoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXkoZXZlbnQ6S2V5Ym9hcmRFdmVudCl7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICcgJyB8fCBldmVudC5rZXkgPT09ICdFbnRlcicpIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PntcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgICAgICB0aGlzLmNvcnJlY3RGb2N1cyh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuYmNkQ29tcG9uZW50cy5wdXNoKEJlbGxDdWJpY1N1bW1hcnkpO1xuXG4vKiogU2ltcGxlIE1ETCBDbGFzcyB0byBoYW5kbGUgbWFraW5nIEpTT04gcHJldHR5IGFnYWluXG4gICAgVGFrZXMgdGhlIGlubmVyVGV4dCBvZiB0aGUgZWxlbWVudCBhbmQgcGFyc2VzIGl0IGFzIEpTT04sIHRoZW4gcmUtc2VyaWFsaXplcyBpdCB3aXRoIDIgc3BhY2VzIHBlciBpbmRlbnQuXG4qL1xuZXhwb3J0IGNsYXNzIGJjZF9wcmV0dHlKU09OIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtYmNkLXByZXR0eUpTT04nO1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdiY2RfcHJldHR5SlNPTic7XG4gICAgZWxlbWVudF86SFRNTEVsZW1lbnQ7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudDpIVE1MRWxlbWVudCkge1xuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgbnVsbCwgZmFsc2UsIHRydWUpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgICAgICBjb25zdCByYXdfanNvbiA9IGVsZW1lbnQuaW5uZXJUZXh0O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShyYXdfanNvbik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50Xy5pbm5lclRleHQgPSBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQoJ2luaXRpYWxpemVkJyk7XG4gICAgfVxufVxuYmNkQ29tcG9uZW50cy5wdXNoKGJjZF9wcmV0dHlKU09OKTtcbi8qXG5cblxuJCRcXCAgICAgICQkXFwgICAgICAgICAgICAgICAgICQkXFwgICAgICAgICAgICQkXFwgICAgICAgJCRcXCAkJCQkJCQkXFwgICQkXFwgICAgICAgICAgICQkXFxcbiQkJFxcICAgICQkJCB8ICAgICAgICAgICAgICAgICQkIHwgICAgICAgICAgJCQgfCAgICAgJCQgIHwkJCAgX18kJFxcIFxcX198ICAgICAgICAgICQkIHxcbiQkJCRcXCAgJCQkJCB8ICQkJCQkJFxcICAgJCQkJCQkJCB8ICQkJCQkJFxcICAkJCB8ICAgICQkICAvICQkIHwgICQkIHwkJFxcICAkJCQkJCRcXCAgJCQgfCAkJCQkJCRcXCAgICQkJCQkJFxcXG4kJFxcJCRcXCQkICQkIHwkJCAgX18kJFxcICQkICBfXyQkIHwgXFxfX19fJCRcXCAkJCB8ICAgJCQgIC8gICQkIHwgICQkIHwkJCB8IFxcX19fXyQkXFwgJCQgfCQkICBfXyQkXFwgJCQgIF9fJCRcXFxuJCQgXFwkJCQgICQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfCAkJCQkJCQkIHwkJCB8ICAkJCAgLyAgICQkIHwgICQkIHwkJCB8ICQkJCQkJCQgfCQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfFxuJCQgfFxcJCAgLyQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkICBfXyQkIHwkJCB8ICQkICAvICAgICQkIHwgICQkIHwkJCB8JCQgIF9fJCQgfCQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfFxuJCQgfCBcXF8vICQkIHxcXCQkJCQkJCAgfFxcJCQkJCQkJCB8XFwkJCQkJCQkIHwkJCB8JCQgIC8gICAgICQkJCQkJCQgIHwkJCB8XFwkJCQkJCQkIHwkJCB8XFwkJCQkJCQgIHxcXCQkJCQkJCQgfFxuXFxfX3wgICAgIFxcX198IFxcX19fX19fLyAgXFxfX19fX19ffCBcXF9fX19fX198XFxfX3xcXF9fLyAgICAgIFxcX19fX19fXy8gXFxfX3wgXFxfX19fX19ffFxcX198IFxcX19fX19fLyAgXFxfX19fJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxfX19fXyovXG5cblxuXG5leHBvcnQgY2xhc3MgQkNETW9kYWxEaWFsb2cgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLWJjZC1tb2RhbCc7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JlbGxDdWJpYyBNb2RhbCc7XG5cbiAgICBzdGF0aWMgb2JmdXNjYXRvcjogSFRNTERpdkVsZW1lbnQ7XG4gICAgc3RhdGljIG1vZGFsc1RvU2hvdzogQkNETW9kYWxEaWFsb2dbXSA9IFtdO1xuICAgIHN0YXRpYyBzaG93bk1vZGFsOiBCQ0RNb2RhbERpYWxvZ3xudWxsID0gbnVsbDtcblxuICAgIGVsZW1lbnRfOkhUTUxEaWFsb2dFbGVtZW50fEhUTUxFbGVtZW50O1xuICAgIGNsb3NlQnlDbGlja091dHNpZGU6Ym9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6SFRNTERpYWxvZ0VsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKGVsZW1lbnQsIHRoaXMsIG51bGwsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmFyaWFNb2RhbCA9ICd0cnVlJztcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZGlhbG9nJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9ICd0cnVlJztcblxuICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keSA/PyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXTtcblxuICAgICAgICAvLyBNb3ZlIGVsZW1lbnQgdG8gdGhlIHRvcCBvZiB0aGUgYm9keSAoanVzdCBvbmUgbW9yZSB0aGluZyB0byBtYWtlIHN1cmUgaXQgc2hvd3MgYWJvdmUgZXZlcnl0aGluZyBlbHNlKVxuICAgICAgICBib2R5LnByZXBlbmQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCFCQ0RNb2RhbERpYWxvZy5vYmZ1c2NhdG9yKSB7XG4gICAgICAgICAgICBCQ0RNb2RhbERpYWxvZy5vYmZ1c2NhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBCQ0RNb2RhbERpYWxvZy5vYmZ1c2NhdG9yLmNsYXNzTGlzdC5hZGQobWRsLk1hdGVyaWFsTGF5b3V0LmNzc0NsYXNzZXMuT0JGVVNDQVRPUiwgJ2pzLWJjZC1tb2RhbC1vYmZ1c2NhdG9yJyk7XG4gICAgICAgICAgICBib2R5LmFwcGVuZENoaWxkKEJDRE1vZGFsRGlhbG9nLm9iZnVzY2F0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbG9zZUJ5Q2xpY2tPdXRzaWRlID0gIXRoaXMuZWxlbWVudF8uaGFzQXR0cmlidXRlKCduby1jbGljay1vdXRzaWRlJyk7XG5cbiAgICAgICAgYWZ0ZXJEZWxheSgxMDAwLCBmdW5jdGlvbiAodGhpczogQkNETW9kYWxEaWFsb2cpIHsgLy8gTGV0cyB0aGUgRE9NIHNldHRsZSBhbmQgZ2l2ZXMgSmF2YVNjcmlwdCBhIGNoYW5jZSB0byBtb2RpZnkgdGhlIGVsZW1lbnRcblxuICAgICAgICAgICAgY29uc3QgY2xvc2VCdXR0b25zID0gdGhpcy5lbGVtZW50Xy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy1iY2QtbW9kYWwtY2xvc2UnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGNsb3NlQnV0dG9ucykge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy5jbGlja0V2dCwgdGhpcy5ib3VuZEhpZGVGdW5jdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmhhc0F0dHJpYnV0ZSgnb3Blbi1ieS1kZWZhdWx0JykpIHRoaXMuc2hvdygpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHN0YXRpYyBldmFsUXVldWUoZGVsYXk6IG51bWJlciA9IDEwMCk6dm9pZCB7XG5cbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiPT09PT09PT09PT09PT09PT09PT09PT09XFxuRXZhbHVhdGluZyBtb2RhbCBxdWV1ZS4uLlxcbj09PT09PT09PT09PT09PT09PT09PT09PVwiKTtcblxuICAgICAgICAvL2NvbnN0IHdpbGxFeGl0ID0ge1xuICAgICAgICAvLyAgICBzaG93bk1vZGFsOiB0aGlzLnNob3duTW9kYWwsXG4gICAgICAgIC8vICAgIG1vZGFsc1RvU2hvdzogdGhpcy5tb2RhbHNUb1Nob3csXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgIHNob3duTW9kYWxfYm9vbDogISF0aGlzLm1vZGFsc1RvU2hvdy5sZW5ndGgsXG4gICAgICAgIC8vICAgIG1vZGFsc1RvU2hvd19sZW5ndGhCb29sOiAhdGhpcy5tb2RhbHNUb1Nob3cubGVuZ3RoXG4gICAgICAgIC8vfTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKCdXaWxsIGV4aXQ/JywgISEodGhpcy5zaG93bk1vZGFsIHx8ICF0aGlzLm1vZGFsc1RvU2hvdy5sZW5ndGgpLCB3aWxsRXhpdCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2hvd25Nb2RhbCB8fCAhdGhpcy5tb2RhbHNUb1Nob3cubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbW9kYWwgPSBCQ0RNb2RhbERpYWxvZy5tb2RhbHNUb1Nob3cuc2hpZnQoKTsgaWYgKCFtb2RhbCkgcmV0dXJuIHRoaXMuZXZhbFF1ZXVlKCk7XG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLnNob3duTW9kYWwgPSBtb2RhbDtcblxuICAgICAgICAvL2NvbnNvbGUuZGVidWcoXCJTaG93aW5nIG1vZGFsOlwiLCBtb2RhbCk7XG5cbiAgICAgICAgYWZ0ZXJEZWxheShkZWxheSwgbW9kYWwuc2hvd19mb3JSZWFsLmJpbmQobW9kYWwpKTtcbiAgICB9XG5cbiAgICBzaG93KCl7XG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLm1vZGFsc1RvU2hvdy5wdXNoKHRoaXMpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoXCJbQkNELU1PREFMXSBNb2RhbHMgdG8gc2hvdyAoYWZ0ZXIgYXNzaWdubWVudCk6XCIsIGJjZE1vZGFsRGlhbG9nLm1vZGFsc1RvU2hvdyk7XG4gICAgICAgIEJDRE1vZGFsRGlhbG9nLmV2YWxRdWV1ZSgpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoXCJbQkNELU1PREFMXSBNb2RhbHMgdG8gc2hvdyAoYWZ0ZXIgZXZhbCk6XCIsIGJjZE1vZGFsRGlhbG9nLm1vZGFsc1RvU2hvdyk7XG4gICAgfVxuXG4gICAgLyoqIEV2ZW50IHNlbnQganVzdCBiZWZvcmUgdGhlIG1vZGFsIGlzIHNob3duXG4gICAgICAgIElmIHRoaXMgZXZlbnQgaXMgY2FuY2VsZWQgb3IgYFByZXZlbnREZWZhdWx0KClgIGlzIGNhbGxlZCwgdGhlIG1vZGFsIHdpbGwgbm90IGJlIHNob3duLlxuXG4gICAgICAgIFRoZSBldmVudCBpcyBmaXJzdCBzZW50IGZvciB0aGUgY2xhc3MgYW5kLCBpZiBub3QgY2FuY2VsZWQgYW5kIGlmIGBQcmV2ZW50RGVmYXVsdCgpYCB3YXMgbm90IGNhbGxlZCwgdGhlIGV2ZW50IGlzIHNlbnQgZm9yIHRoZSBlbGVtZW50LlxuICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IGJlZm9yZVNob3dFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYmVmb3JlU2hvdycsIHtjYW5jZWxhYmxlOiB0cnVlLCBidWJibGVzOiBmYWxzZSwgY29tcG9zZWQ6IGZhbHNlfSk7XG5cbiAgICAvKiogRXZlbnQgc2VudCBqdXN0IGFmdGVyIHRoZSBtb2RhbCBpcyBzaG93blxuXG4gICAgICAgIFRoZSBldmVudCBpcyBmaXJzdCBzZW50IGZvciB0aGUgY2xhc3MgYW5kLCBpZiBub3QgY2FuY2VsZWQgYW5kIGlmIFByZXZlbnREZWZhdWx0KCkgd2FzIG5vdCBjYWxsZWQsIHRoZSBldmVudCBpcyBzZW50IGZvciB0aGUgZWxlbWVudC5cbiAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBhZnRlclNob3dFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYWZ0ZXJTaG93Jywge2NhbmNlbGFibGU6IGZhbHNlLCBidWJibGVzOiBmYWxzZSwgY29tcG9zZWQ6IGZhbHNlfSk7XG5cbiAgICBwcml2YXRlIHNob3dfZm9yUmVhbCgpIHtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1NT0RBTF0gU2hvd2luZyBtb2RhbDpcIiwgdGhpcyk7XG4gICAgICAgIC8qICdCZWZvcmUnIEV2ZW50ICovIGlmICghdGhpcy5kaXNwYXRjaEV2ZW50KEJDRE1vZGFsRGlhbG9nLmJlZm9yZVNob3dFdmVudCkgfHwgIXRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5iZWZvcmVTaG93RXZlbnQpKSByZXR1cm47XG5cbiAgICAgICAgQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvci5jbGFzc0xpc3QuYWRkKG1kbC5NYXRlcmlhbExheW91dC5jc3NDbGFzc2VzLklTX0RSQVdFUl9PUEVOKTtcbiAgICAgICAgQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvci5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy5jbGlja0V2dCwgdGhpcy5ib3VuZEhpZGVGdW5jdGlvbik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hcmlhSGlkZGVuID0gJ2ZhbHNlJztcblxuICAgICAgICBpZiAoJ3Nob3cnIGluIHRoaXMuZWxlbWVudF8pIHRoaXMuZWxlbWVudF8uc2hvdygpO1xuICAgICAgICBlbHNlIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdvcGVuJywgJycpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoXCJbQkNELU1PREFMXSBNb2RhbCBzaG93bjpcIiwgdGhpcyk7XG5cbiAgICAgICAgLyogJ0FmdGVyJyBFdmVudCAqLyAgaWYgKHRoaXMuZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5hZnRlclNob3dFdmVudCkpIHRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5hZnRlclNob3dFdmVudCk7XG5cbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1NT0RBTF0gTW9kYWxzIHRvIHNob3cgKGFmdGVyIHNob3cpOlwiLCBiY2RNb2RhbERpYWxvZy5tb2RhbHNUb1Nob3cpO1xuICAgIH1cblxuICAgIC8qKiBFdmVudCBzZW50IGp1c3QgYmVmb3JlIHRoZSBtb2RhbCBpcyBoaWRkZW5cbiAgICAgICAgSWYgdGhpcyBldmVudCBpcyBjYW5jZWxlZCBvciBgUHJldmVudERlZmF1bHQoKWAgaXMgY2FsbGVkLCB0aGUgbW9kYWwgd2lsbCBub3QgYmUgc2hvd24uXG5cbiAgICAgICAgVGhlIGV2ZW50IGlzIGZpcnN0IHNlbnQgZm9yIHRoZSBjbGFzcyBhbmQsIGlmIG5vdCBjYW5jZWxlZCBhbmQgaWYgYFByZXZlbnREZWZhdWx0KClgIHdhcyBub3QgY2FsbGVkLCB0aGUgZXZlbnQgaXMgc2VudCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgYmVmb3JlSGlkZUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdiZWZvcmVIaWRlJywge2NhbmNlbGFibGU6IHRydWUsIGJ1YmJsZXM6IGZhbHNlLCBjb21wb3NlZDogZmFsc2V9KTtcblxuICAgIC8qKiBFdmVudCBzZW50IGp1c3QgYWZ0ZXIgdGhlIG1vZGFsIGlzIGhpZGRlblxuXG4gICAgICAgIFRoZSBldmVudCBpcyBmaXJzdCBzZW50IGZvciB0aGUgY2xhc3MgYW5kLCBpZiBub3QgY2FuY2VsZWQgYW5kIGlmIFByZXZlbnREZWZhdWx0KCkgd2FzIG5vdCBjYWxsZWQsIHRoZSBldmVudCBpcyBzZW50IGZvciB0aGUgZWxlbWVudC5cbiAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBhZnRlckhpZGVFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnYWZ0ZXJIaWRlJywge2NhbmNlbGFibGU6IGZhbHNlLCBidWJibGVzOiBmYWxzZSwgY29tcG9zZWQ6IGZhbHNlfSk7XG5cbiAgICAvLyBTdG9yaW5nIHRoZSBib3VuZCBmdW5jdGlvbiBsZXRzIHVzIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXIgZnJvbSB0aGUgb2JmdXNjYXRvciBhZnRlciB0aGUgbW9kYWwgaXMgaGlkZGVuXG4gICAgYm91bmRIaWRlRnVuY3Rpb24gPSB0aGlzLmhpZGUuYmluZCh0aGlzKTtcblxuICAgIGhpZGUoZXZ0PzogRXZlbnQpe1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoXCJbQkNELU1PREFMXSBIaWRpbmcgbW9kYWw6XCIsIHRoaXMpO1xuICAgICAgICBpZiAoZXZ0KSBldnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8qICdCZWZvcmUnIEV2ZW50ICovIGlmICghdGhpcy5kaXNwYXRjaEV2ZW50KEJDRE1vZGFsRGlhbG9nLmJlZm9yZUhpZGVFdmVudCkgfHwhdGhpcy5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KEJDRE1vZGFsRGlhbG9nLmJlZm9yZUhpZGVFdmVudCkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnRfLmFyaWFIaWRkZW4gPSAndHJ1ZSc7XG5cbiAgICAgICAgaWYgKCdjbG9zZScgaW4gdGhpcy5lbGVtZW50XykgdGhpcy5lbGVtZW50Xy5jbG9zZSgpO1xuICAgICAgICBlbHNlIHRoaXMuZWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKCdvcGVuJyk7XG5cbiAgICAgICAgQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvci5jbGFzc0xpc3QucmVtb3ZlKG1kbC5NYXRlcmlhbExheW91dC5jc3NDbGFzc2VzLklTX0RSQVdFUl9PUEVOKTtcbiAgICAgICAgQkNETW9kYWxEaWFsb2cub2JmdXNjYXRvci5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdy5jbGlja0V2dCwgdGhpcy5ib3VuZEhpZGVGdW5jdGlvbik7XG5cbiAgICAgICAgQkNETW9kYWxEaWFsb2cuc2hvd25Nb2RhbCA9IG51bGw7XG5cbiAgICAgICAgLyogJ0FmdGVyJyBFdmVudCAqLyAgaWYgKHRoaXMuZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5hZnRlckhpZGVFdmVudCkpIHRoaXMuZWxlbWVudF8uZGlzcGF0Y2hFdmVudChCQ0RNb2RhbERpYWxvZy5hZnRlckhpZGVFdmVudCk7XG5cbiAgICAgICAgQkNETW9kYWxEaWFsb2cuZXZhbFF1ZXVlKCk7XG4gICAgfVxuXG59XG5iY2RDb21wb25lbnRzLnB1c2goQkNETW9kYWxEaWFsb2cpO1xuXG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXFxuJCQgIF9fJCRcXCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4kJCB8ICAkJCB8ICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJCQkJCRcXCAgICQkJCQkJCQgfCAkJCQkJCRcXCAgJCRcXCAgJCRcXCAgJCRcXCAkJCQkJCQkXFxcbiQkIHwgICQkIHwkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJCB8JCQgIF9fJCRcXCAkJCB8ICQkIHwgJCQgfCQkICBfXyQkXFxcbiQkIHwgICQkIHwkJCB8ICBcXF9ffCQkIC8gICQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfCQkIC8gICQkIHwkJCB8ICQkIHwgJCQgfCQkIHwgICQkIHxcbiQkIHwgICQkIHwkJCB8ICAgICAgJCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwgJCQgfCAkJCB8JCQgfCAgJCQgfFxuJCQkJCQkJCAgfCQkIHwgICAgICBcXCQkJCQkJCAgfCQkJCQkJCQgIHxcXCQkJCQkJCQgfFxcJCQkJCQkICB8XFwkJCQkJFxcJCQkJCAgfCQkIHwgICQkIHxcblxcX19fX19fXy8gXFxfX3wgICAgICAgXFxfX19fX18vICQkICBfX19fLyAgXFxfX19fX19ffCBcXF9fX19fXy8gIFxcX19fX19cXF9fX18vIFxcX198ICBcXF9ffFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxfKi9cblxuXG5cbmV4cG9ydCBlbnVtIG1lbnVDb3JuZXJzIHtcbiAgICB1bmFsaWduZWQgPSAnbWRsLW1lbnUtLXVuYWxpZ25lZCcsXG4gICAgdG9wTGVmdCA9ICdtZGwtbWVudS0tYm90dG9tLWxlZnQnLFxuICAgIHRvcFJpZ2h0ID0gJ21kbC1tZW51LS1ib3R0b20tcmlnaHQnLFxuICAgIGJvdHRvbUxlZnQgPSAnbWRsLW1lbnUtLXRvcC1sZWZ0JyxcbiAgICBib3R0b21SaWdodCA9ICdtZGwtbWVudS0tdG9wLXJpZ2h0J1xufVxuXG50eXBlIG9wdGlvbk9iaiA9IG9iak9mPEZ1bmN0aW9ufG51bGw+XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCQ0REcm9wZG93biBleHRlbmRzIG1kbC5NYXRlcmlhbE1lbnUge1xuXG4gICAgYWJzdHJhY3Qgb3B0aW9ucygpOiBvcHRpb25PYmo7XG5cbiAgICBkb1Jlb3JkZXI6Ym9vbGVhbjtcblxuICAgIG9wdGlvbnNfOiBvcHRpb25PYmo7XG4gICAgb3B0aW9uc19rZXlzOiBzdHJpbmdbXTtcblxuICAgIHNlbGVjdGVkT3B0aW9uOiBzdHJpbmcgPSAnJztcblxuICAgIG92ZXJyaWRlIGVsZW1lbnRfOiBIVE1MRWxlbWVudDtcblxuICAgIHNlbGVjdGlvblRleHRFbGVtZW50czogdW5kZWZpbmVkIHwgSFRNTENvbGxlY3Rpb25PZjxIVE1MRWxlbWVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBFbGVtZW50LCBidXR0b25FbGVtZW50PzogRWxlbWVudHxudWxsLCBkb1Jlb3JkZXI6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIHRoaXMuZG9SZW9yZGVyID0gZG9SZW9yZGVyO1xuICAgICAgICBpZiAoZG9SZW9yZGVyKSB0aGlzLkNvbnN0YW50Xy5DTE9TRV9USU1FT1VUID0gMDtcblxuICAgICAgICBpZiAodGhpcy5mb3JFbGVtZW50Xykge1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xz8ucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3cuY2xpY2tFdnQsIHRoaXMuYm91bmRGb3JDbGlja18pO1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xz8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuYm91bmRGb3JLZXlkb3duXyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnV0dG9uRWxlbWVudCAmJiBidXR0b25FbGVtZW50ICE9PSB0aGlzLmZvckVsZW1lbnRfKSB7XG4gICAgICAgICAgICB0aGlzLmZvckVsZW1lbnRfID0gYnV0dG9uRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmZvckVsZW1lbnRfKSB7XG4gICAgICAgICAgICB0aGlzLmZvckVsZW1lbnRfLmFyaWFIYXNQb3B1cCA9ICd0cnVlJztcblxuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy5jbGlja0V2dCwgdGhpcy5ib3VuZEZvckNsaWNrXyk7XG4gICAgICAgICAgICB0aGlzLmZvckVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmJvdW5kRm9yS2V5ZG93bl8pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIltCQ0QtRFJPUERPV05dIEluaXRpYWxpemluZyBkcm9wZG93bjpcIiwgdGhpcyk7XG5cbiAgICAgICAgY29uc3QgdGVtcE9wdGlvbnMgPSB0aGlzLm9wdGlvbnMoKTtcbiAgICAgICAgdGhpcy5vcHRpb25zXyA9IHRlbXBPcHRpb25zO1xuICAgICAgICB0aGlzLm9wdGlvbnNfa2V5cyA9IE9iamVjdC5rZXlzKHRoaXMub3B0aW9uc18pO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRPcHRpb24gPSB0aGlzLm9wdGlvbnNfa2V5c1swXSA/PyAnJztcblxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnNfa2V5cykge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZU9wdGlvbihvcHRpb24pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uVGV4dEVsZW1lbnRzID0gdGhpcy5mb3JFbGVtZW50Xz8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYmNkLWRyb3Bkb3duX3ZhbHVlJykgYXMgSFRNTENvbGxlY3Rpb25PZjxIVE1MRWxlbWVudD47XG5cbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIHRoaXMudXBkYXRlT3B0aW9ucygpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmZvY3VzT3V0SGFuZGxlci5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZWdpc3RlclVwZ3JhZGUoZWxlbWVudCwgdGhpcywgdGhpcy5mb3JFbGVtZW50XywgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZm9jdXNPdXRIYW5kbGVyKGV2dDogRm9jdXNFdmVudCl7XG4gICAgICAgIGlmICgoZXZ0LnJlbGF0ZWRUYXJnZXQgYXMgRWxlbWVudHxudWxsKT8ucGFyZW50RWxlbWVudCAhPT0gdGhpcy5lbGVtZW50XykgdGhpcy5oaWRlKCk7XG4gICAgfVxuXG4gICAgc2VsZWN0QnlTdHJpbmcob3B0aW9uOiBzdHJpbmcpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiW0JDRC1EUk9QRE9XTl0gU2VsZWN0aW5nIG9wdGlvbjpcIiwgb3B0aW9uKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uc19rZXlzLmluY2x1ZGVzKG9wdGlvbikpIHRoaXMuc2VsZWN0ZWRPcHRpb24gPSBvcHRpb247XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJbQkNELURST1BET1dOXSBTZWxlY3RlZCBvcHRpb246XCIsIHRoaXMuc2VsZWN0ZWRPcHRpb24pO1xuICAgICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVPcHRpb25zKCkge1xuICAgICAgICBjb25zdCBjaGlsZHJlbjogSFRNTExJRWxlbWVudFtdID0gWy4uLih0aGlzLmVsZW1lbnRfIGFzIEhUTUxFbGVtZW50KS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKSBdO1xuXG4gICAgICAgIGlmICh0aGlzLmRvUmVvcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZ29sZGVuQ2hpbGQgPSBjaGlsZHJlbi5maW5kKChlbG0pID0+IChlbG0gYXMgSFRNTExJRWxlbWVudCkuaW5uZXJUZXh0ID09PSB0aGlzLnNlbGVjdGVkT3B0aW9uKTtcbiAgICAgICAgICAgIGlmICghZ29sZGVuQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltCQ0QtRFJPUERPV05dIEVycm9yaW5nIGluc3RhbmNlOlwiLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoZSBzZWxlY3RlZCBvcHRpb24gaW4gdGhlIGRyb3Bkb3duLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm1ha2VTZWxlY3RlZChnb2xkZW5DaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZW1vbkNoaWxkcmVuID0gdGhpcy5kb1Jlb3JkZXIgPyBjaGlsZHJlbi5maWx0ZXIoKGVsbSkgPT4gKGVsbSBhcyBIVE1MTElFbGVtZW50KS5pbm5lclRleHQgIT09IHRoaXMuc2VsZWN0ZWRPcHRpb24pIDogY2hpbGRyZW47XG4gICAgICAgIGRlbW9uQ2hpbGRyZW4uc29ydCggKGEsIGIpID0+IHRoaXMub3B0aW9uc19rZXlzLmluZGV4T2YoYS5pbm5lclRleHQpIC0gdGhpcy5vcHRpb25zX2tleXMuaW5kZXhPZihiLmlubmVyVGV4dCkgKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGRlbW9uQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8ucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgdGhpcy5tYWtlTm90U2VsZWN0ZWQoY2hpbGQpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVPcHRpb24ob3B0aW9uOiBzdHJpbmcsIGNsaWNrQ2FsbGJhY2s/OiBGdW5jdGlvbnxudWxsLCBhZGRUb0xpc3Q6IGJvb2xlYW4gPSBmYWxzZSk6IEhUTUxMSUVsZW1lbnQge1xuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGxpLmlubmVyVGV4dCA9IG9wdGlvbjtcbiAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgnbWRsLW1lbnVfX2l0ZW0nKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlckl0ZW0obGkpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBfY2xpY2tDYWxsYmFjayA9IGNsaWNrQ2FsbGJhY2sgPz8gdGhpcy5vcHRpb25zX1tvcHRpb25dID8/IG51bGw7XG5cbiAgICAgICAgaWYgKGFkZFRvTGlzdCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZChsaSk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNfa2V5cy5wdXNoKG9wdGlvbik7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNfW29wdGlvbl0gPSB0ZW1wX2NsaWNrQ2FsbGJhY2s7XG4gICAgICAgIH1cblxuICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy5jbGlja0V2dCwgdGVtcF9jbGlja0NhbGxiYWNrPy5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLm9uQ3JlYXRlT3B0aW9uPy4ob3B0aW9uKTtcbiAgICAgICAgcmV0dXJuIGxpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIG9uSXRlbVNlbGVjdGVkKG9wdGlvbjogSFRNTExJRWxlbWVudCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkT3B0aW9uID0gb3B0aW9uLmlubmVyVGV4dDtcbiAgICAgICAgdGhpcy51cGRhdGVPcHRpb25zKCk7XG4gICAgfVxuXG4gICAgb25DcmVhdGVPcHRpb24/KG9wdGlvbjogc3RyaW5nKTogdm9pZFxuXG4gICAgbWFrZVNlbGVjdGVkKG9wdGlvbjogSFRNTExJRWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5kb1Jlb3JkZXIpIG9wdGlvbi5jbGFzc0xpc3QuYWRkKCdtZGwtbWVudV9faXRlbS0tZnVsbC1ibGVlZC1kaXZpZGVyJyk7XG4gICAgICAgIG9wdGlvbi5ibHVyKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbG0gb2YgdGhpcy5zZWxlY3Rpb25UZXh0RWxlbWVudHMgPz8gW10pIHtcbiAgICAgICAgICAgIGVsbS5pbm5lclRleHQgPSBvcHRpb24uaW5uZXJUZXh0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWFrZU5vdFNlbGVjdGVkKG9wdGlvbjogSFRNTExJRWxlbWVudCkge1xuICAgICAgICBvcHRpb24uY2xhc3NMaXN0LnJlbW92ZSgnbWRsLW1lbnVfX2l0ZW0tLWZ1bGwtYmxlZWQtZGl2aWRlcicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX29wdGlvbkVsZW1lbnRzOiB1bmRlZmluZWQgfCBIVE1MQ29sbGVjdGlvbk9mPEhUTUxMSUVsZW1lbnQ+O1xuICAgIGdldCBvcHRpb25FbGVtZW50cygpOiBIVE1MQ29sbGVjdGlvbk9mPEhUTUxMSUVsZW1lbnQ+IHsgcmV0dXJuIHRoaXMuX29wdGlvbkVsZW1lbnRzID8/PSB0aGlzLmVsZW1lbnRfLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpIGFzIEhUTUxDb2xsZWN0aW9uT2Y8SFRNTExJRWxlbWVudD47IH1cblxuICAgIGhhc1Nob3duT3JIaWRkZW5UaGlzRnJhbWU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIG92ZXJyaWRlIHNob3coZXZ0OiBhbnkpe1xuICAgICAgICBpZiAodGhpcy5oYXNTaG93bk9ySGlkZGVuVGhpc0ZyYW1lKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzU2hvd25PckhpZGRlblRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmhhc1Nob3duT3JIaWRkZW5UaGlzRnJhbWUgPSBmYWxzZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9PT0gJ2ZhbHNlJykgcmV0dXJuO1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJbQkNELURST1BET1dOXSBTaG93aW5nIGRyb3Bkb3duOlwiLCB0aGlzLCBldnQpO1xuXG4gICAgICAgIGlmIChldnQgaW5zdGFuY2VvZiBLZXlib2FyZEV2ZW50IHx8IGV2dCBpbnN0YW5jZW9mIFBvaW50ZXJFdmVudCAmJiBldnQucG9pbnRlcklkID09PSAtMSB8fCAnbW96SW5wdXRTb3VyY2UnIGluIGV2dCAmJiBldnQubW96SW5wdXRTb3VyY2UgIT09IDEpXG4gICAgICAgICAgICB0aGlzLm9wdGlvbkVsZW1lbnRzWzBdPy5mb2N1cygpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9ICdmYWxzZSc7XG4gICAgICAgIHRoaXMuZWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgICBpZiAodGhpcy5mb3JFbGVtZW50XykgdGhpcy5mb3JFbGVtZW50Xy5hcmlhRXhwYW5kZWQgPSAndHJ1ZSc7XG5cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMub3B0aW9uRWxlbWVudHMpIGl0ZW0udGFiSW5kZXggPSAwO1xuXG4gICAgICAgIHRoaXMuZm9yRWxlbWVudF8/LnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8/LnRvb2x0aXA/LmhpZGUoKTtcblxuICAgICAgICBzdXBlci5zaG93KGV2dCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgaGlkZSgpe1xuICAgICAgICBpZiAodGhpcy5oYXNTaG93bk9ySGlkZGVuVGhpc0ZyYW1lKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFzU2hvd25PckhpZGRlblRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmhhc1Nob3duT3JIaWRkZW5UaGlzRnJhbWUgPSBmYWxzZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9PT0gJ3RydWUnKSByZXR1cm47XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIltCQ0QtRFJPUERPV05dIEhpZGluZyBkcm9wZG93bjpcIiwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25FbGVtZW50c1swXT8uYmx1cigpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXJpYUhpZGRlbiA9ICd0cnVlJztcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgICAgICBpZiAodGhpcy5mb3JFbGVtZW50XykgdGhpcy5mb3JFbGVtZW50Xy5hcmlhRXhwYW5kZWQgPSAnZmFsc2UnO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLm9wdGlvbkVsZW1lbnRzKSBpdGVtLnRhYkluZGV4ID0gLTE7XG5cbiAgICAgICAgc3VwZXIuaGlkZSgpO1xuICAgIH1cbn1cbi8qXG5cblxuJCQkJCQkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4kJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkIHxcbiQkIHwgICQkIHwgJCQkJCQkXFwgICAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJCB8ICQkJCQkJFxcICAkJFxcICAkJFxcICAkJFxcICQkJCQkJCRcXFxuJCQgfCAgJCQgfCQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkICBfXyQkIHwkJCAgX18kJFxcICQkIHwgJCQgfCAkJCB8JCQgIF9fJCRcXFxuJCQgfCAgJCQgfCQkIHwgIFxcX198JCQgLyAgJCQgfCQkIC8gICQkIHwkJCAvICAkJCB8JCQgLyAgJCQgfCQkIHwgJCQgfCAkJCB8JCQgfCAgJCQgfFxuJCQgfCAgJCQgfCQkIHwgICAgICAkJCB8ICAkJCB8JCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfCAkJCB8ICQkIHwkJCB8ICAkJCB8XG4kJCQkJCQkICB8JCQgfCAgICAgIFxcJCQkJCQkICB8JCQkJCQkJCAgfFxcJCQkJCQkJCB8XFwkJCQkJCQgIHxcXCQkJCQkXFwkJCQkICB8JCQgfCAgJCQgfFxuXFxfX19fX19fLyBcXF9ffCAgICAgICBcXF9fX19fXy8gJCQgIF9fX18vICBcXF9fX19fX198IFxcX19fX19fLyAgXFxfX19fX1xcX19fXy8gXFxfX3wgIFxcX198XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9ffFxuXG4kJFxcICAgICQkXFwgICAgICAgICAgICAgICAgICAgICAkJFxcICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4kJCB8ICAgJCQgfCAgICAgICAgICAgICAgICAgICAgXFxfX3wgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuJCQgfCAgICQkIHwgJCQkJCQkXFwgICAkJCQkJCRcXCAgJCRcXCAgJCQkJCQkXFwgICQkJCQkJCRcXCAgJCQkJCQkXFwgICAgJCQkJCQkJFxcXG5cXCQkXFwgICQkICB8IFxcX19fXyQkXFwgJCQgIF9fJCRcXCAkJCB8IFxcX19fXyQkXFwgJCQgIF9fJCRcXCBcXF8kJCAgX3wgICQkICBfX19fX3xcbiBcXCQkXFwkJCAgLyAgJCQkJCQkJCB8JCQgfCAgXFxfX3wkJCB8ICQkJCQkJCQgfCQkIHwgICQkIHwgICQkIHwgICAgXFwkJCQkJCRcXFxuICBcXCQkJCAgLyAgJCQgIF9fJCQgfCQkIHwgICAgICAkJCB8JCQgIF9fJCQgfCQkIHwgICQkIHwgICQkIHwkJFxcICBcXF9fX18kJFxcXG4gICBcXCQgIC8gICBcXCQkJCQkJCQgfCQkIHwgICAgICAkJCB8XFwkJCQkJCQkIHwkJCB8ICAkJCB8ICBcXCQkJCQgIHwkJCQkJCQkICB8XG4gICAgXFxfLyAgICAgXFxfX19fX19ffFxcX198ICAgICAgXFxfX3wgXFxfX19fX19ffFxcX198ICBcXF9ffCAgIFxcX19fXy8gXFxfX19fX18qL1xuXG5cblxuZXhwb3J0IGNsYXNzIGJjZERyb3Bkb3duX0F3ZXNvbWVCdXR0b24gZXh0ZW5kcyBCQ0REcm9wZG93biB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JDRCAtIERlYnVnZ2VyXFwncyBBbGwtUG93ZXJmdWwgQnV0dG9uJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtYmNkLWRlYnVnZ2Vycy1hbGwtcG93ZXJmdWwtYnV0dG9uJztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgb3B0aW9ucygpOiBvYmpPZjxGdW5jdGlvbnxudWxsPiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnVmlldyBEZWJ1ZyBQYWdlJzogKCkgPT4ge2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWJ1Zy1saW5rJyk/LmNsaWNrKCk7fVxuICAgICAgICB9O1xuICAgIH1cbn1cbmJjZENvbXBvbmVudHMucHVzaChiY2REcm9wZG93bl9Bd2Vzb21lQnV0dG9uKTtcbi8qXG5cblxuXG4kJCQkJCQkJFxcICAgICAgICAgICAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgJCQkJCQkXFwgICAgJCRcXCAgICAgICAgICAgICAgICAkJCQkJCRcXCAgICQkJCQkJFxcXG5cXF9fJCQgIF9ffCAgICAgICAgICAkJCB8ICAgICAgICAgICAgICAgICAgICAgICQkICBfXyQkXFwgICAkJCB8ICAgICAgICAgICAgICAkJCAgX18kJFxcICQkICBfXyQkXFxcbiAgICQkIHwgICAgJCQkJCQkXFwgICQkJCQkJCRcXCAgICQkJCQkJCRcXCAgICAgICAkJCAvICBcXF9ffCQkJCQkJFxcICAgJCRcXCAgICQkXFwgJCQgLyAgXFxfX3wkJCAvICBcXF9ffFxuICAgJCQgfCAgICBcXF9fX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffCAgICAgIFxcJCQkJCQkXFwgIFxcXyQkICBffCAgJCQgfCAgJCQgfCQkJCRcXCAgICAgJCQkJFxcXG4gICAkJCB8ICAgICQkJCQkJCQgfCQkIHwgICQkIHxcXCQkJCQkJFxcICAgICAgICAgXFxfX19fJCRcXCAgICQkIHwgICAgJCQgfCAgJCQgfCQkICBffCAgICAkJCAgX3xcbiAgICQkIHwgICAkJCAgX18kJCB8JCQgfCAgJCQgfCBcXF9fX18kJFxcICAgICAgICQkXFwgICAkJCB8ICAkJCB8JCRcXCAkJCB8ICAkJCB8JCQgfCAgICAgICQkIHxcbiAgICQkIHwgICBcXCQkJCQkJCQgfCQkJCQkJCQgIHwkJCQkJCQkICB8ICAgICAgXFwkJCQkJCQgIHwgIFxcJCQkJCAgfFxcJCQkJCQkICB8JCQgfCAgICAgICQkIHxcbiAgIFxcX198ICAgIFxcX19fX19fX3xcXF9fX19fX18vIFxcX19fX19fXy8gICAgICAgIFxcX19fX19fLyAgICBcXF9fX18vICBcXF9fX19fXy8gXFxfX3wgICAgICBcXF9ffFxuXG5cblxuKi9cblxuZXhwb3J0IGNsYXNzIEJDRFRhYkJ1dHRvbiBleHRlbmRzIG1kbC5NYXRlcmlhbEJ1dHRvbiB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGFzU3RyaW5nID0gJ0JDRCAtIFRhYiBMaXN0IEJ1dHRvbic7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLXRhYi1saXN0LWJ1dHRvbic7XG5cbiAgICBzdGF0aWMgYW5jaG9yVG9TZXQgPSAnJztcblxuICAgIG92ZXJyaWRlIGVsZW1lbnRfOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBib3VuZFRhYjpIVE1MRGl2RWxlbWVudDtcbiAgICBuYW1lOnN0cmluZyA9ICcnO1xuICAgIHNldEFuY2hvcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSAhPT0gJ0JVVFRPTicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgQmVsbEN1YmljIFRhYiBCdXR0b24gbXVzdCBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gYSA8YnV0dG9uPiBlbGVtZW50LicpO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgQmVsbEN1YmljIFRhYiBCdXR0b24gbXVzdCBoYXZlIGEgbmFtZSBhdHRyaWJ1dGUuJyk7XG5cbiAgICAgICAgY29uc3QgYm91bmRUYWIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXYudGFiLWNvbnRlbnRbbmFtZT1cIiR7bmFtZX1cIl1gKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgaWYgKCFib3VuZFRhYikgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ291bGQgbm90IGZpbmQgYSB0YWIgd2l0aCB0aGUgbmFtZSBcIiR7bmFtZX1cIi5gKTtcbiAgICAgICAgaWYgKCFib3VuZFRhYi5wYXJlbnRFbGVtZW50KSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUYWIgd2l0aCBuYW1lIFwiJHtuYW1lfVwiIGhhcyBubyBwYXJlbnQgZWxlbWVudCFgKTtcblxuICAgICAgICBlbGVtZW50LmlubmVyVGV4dCA9IG5hbWU7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuXG4gICAgICAgIHN1cGVyKGVsZW1lbnQpOyAvLyBOb3cgd2UgY2FuIHVzZSBgdGhpc2AhXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZShlbGVtZW50LCB0aGlzLCBib3VuZFRhYiwgZmFsc2UsIHRydWUpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgICAgICB0aGlzLmJvdW5kVGFiID0gYm91bmRUYWI7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgdGhpcy5zZXRBbmNob3IgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ/Lmhhc0F0dHJpYnV0ZSgnZG8tdGFiLWFuY2hvcicpID8/IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3cuY2xpY2tFdnQsIHRoaXMub25DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIHRoaXMub25LZXlQcmVzcy5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ0NyZWF0ZWQgdGFiIGJ1dHRvbjonLCB0aGlzKTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKCdJcyB0aGlzIHRhZyBwcmUtc2VsZWN0ZWQgYnkgdGhlIGFuY2hvcj8nLCB3aW5kb3cubG9jYXRpb24uaGFzaC50b0xvd2VyQ2FzZSgpID09PSBgI3RhYi0ke25hbWV9YC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgaWYgKHRoaXMuc2V0QW5jaG9yICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnRvTG93ZXJDYXNlKCkgPT09IGAjdGFiLSR7bmFtZX1gLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgoKSA9PiB7dGhpcy5tYWtlU2VsZWN0ZWQoKTt9KS5iaW5kKHRoaXMpICk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMubWFrZVNlbGVjdGVkKDApO1xuICAgIH1cblxuICAgIC8qKiBAcmV0dXJucyB0aGUgaW5kZXggb2YgdGhpcyB0YWIgKDAtYmFzZWQpIG9yIC0xIGlmIG5vdCBmb3VuZCAqL1xuICAgIGZpbmRUYWJOdW1iZXIoYnV0dG9uXz86IEVsZW1lbnQpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBidXR0b24gPSBidXR0b25fID8/IHRoaXMuZWxlbWVudF87XG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZygnZmluZFRhYk51bWJlcjogLSBidXR0b246JywgYnV0dG9uLCAnYXJyYXk6JywgWy4uLihidXR0b24ucGFyZW50RWxlbWVudD8uY2hpbGRyZW4gPz8gW10pXSwgJ2luZGV4OicsIFsuLi4oYnV0dG9uLnBhcmVudEVsZW1lbnQ/LmNoaWxkcmVuID8/IFtdKV0uaW5kZXhPZihidXR0b24pKTtcbiAgICAgICAgcmV0dXJuIFsuLi4oYnV0dG9uLnBhcmVudEVsZW1lbnQ/LmNoaWxkcmVuID8/IFtdKV0uaW5kZXhPZihidXR0b24pO1xuICAgIH1cblxuICAgIG1ha2VTZWxlY3RlZCh0YWJOdW1iZXJfPzogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRhYk51bWJlciA9IHRhYk51bWJlcl8gPz8gdGhpcy5maW5kVGFiTnVtYmVyKCk7XG4gICAgICAgIGlmICh0YWJOdW1iZXIgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoZSB0YWIgbnVtYmVyLicpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ21ha2VTZWxlY3RlZDogdGFiTnVtYmVyOicsIHRhYk51bWJlcik7XG5cbiAgICAgICAgY29uc3Qgc2libGluZ3NBbmRTZWxmID0gWy4uLih0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQ/LmNoaWxkcmVuID8/IFtdKV07XG4gICAgICAgIGlmICghc2libGluZ3NBbmRTZWxmW3RhYk51bWJlcl0gfHwgc2libGluZ3NBbmRTZWxmW3RhYk51bWJlcl0hLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHJldHVybjtcblxuICAgICAgICBmb3IgKGNvbnN0IHNpYmxpbmcgb2Ygc2libGluZ3NBbmRTZWxmKSB7XG4gICAgICAgICAgICBpZiAoc2libGluZyA9PT0gdGhpcy5lbGVtZW50Xykge1xuICAgICAgICAgICAgICAgIHNpYmxpbmcuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIHNpYmxpbmcuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5ib3VuZFRhYi5wYXJlbnRFbGVtZW50KSByZXR1cm47IC8vIEkgd291bGQgd29ycnkgYWJvdXQgcmFjZSBjb25kaXRpb25zLCBidXQgYnJvd3NlcnMgcnVuIHdlYnNpdGVzIGluIGFuIEV2ZW50IExvb3AuXG5cbiAgICAgICAgY29uc3QgdGFiX3NpYmxpbmdzQW5kVGFiID0gWy4uLnRoaXMuYm91bmRUYWIucGFyZW50RWxlbWVudC5jaGlsZHJlbl07XG4gICAgICAgIGZvciAoY29uc3QgdGFiIG9mIHRhYl9zaWJsaW5nc0FuZFRhYikge1xuXG4gICAgICAgICAgICBpZiAodGFiID09PSB0aGlzLmJvdW5kVGFiKSB7XG4gICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIHRhYi5jbGFzc0xpc3QucmVtb3ZlKCd0YWItY29udGVudC0taGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgaWYgKCdpbmVydCcgaW4gKHRhYiBhcyBIVE1MRWxlbWVudCkpICh0YWIgYXMgSFRNTEVsZW1lbnQpLmluZXJ0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0YWIuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgdGFiLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB0YWIucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFRhYi5wYXJlbnRFbGVtZW50LnN0eWxlLm1hcmdpbkxlZnQgPSBgLSR7dGFiTnVtYmVyfTAwdndgO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYWRkSGlkZGVuKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFiLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5hZGQoJ3RhYi1jb250ZW50LS1oaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCdpbmVydCcgaW4gKHRhYiBhcyBIVE1MRWxlbWVudCkpICh0YWIgYXMgSFRNTEVsZW1lbnQpLmluZXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFiLnBhcmVudEVsZW1lbnQhLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBhZGRIaWRkZW4sIHtvbmNlOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgYWZ0ZXJEZWxheSgyNTAsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGFiLnBhcmVudEVsZW1lbnQ/LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBhZGRIaWRkZW4pO1xuICAgICAgICAgICAgICAgICAgICBhZGRIaWRkZW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgICAgICAgICAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuICAgICAgICAgICAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNldEFuY2hvcikge1xuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBVUkwgaGFzaCAtIGlmIHRoZSB0YWIgaXMgbm90IHRoZSBmaXJzdCB0YWIsIHRoZW4gYWRkIHRoZSB0YWIgbmFtZSB0byB0aGUgaGFzaC4gT3RoZXJ3aXNlLCByZW1vdmUgdGhlIGhhc2guXG4gICAgICAgICAgICBCQ0RUYWJCdXR0b24uYW5jaG9yVG9TZXQgPSB0YWJOdW1iZXIgPT0gMCA/ICcnIDogYCN0YWItJHt0aGlzLm5hbWV9YC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgQkNEVGFiQnV0dG9uLnNldEFuY2hvckluM0FuaW1GcmFtZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBTZXRzIGB3aW5kb3cubG9jYXRpb24uaGFzaGAgdG8gdGhlIHZhbHVlIG9mIGBiY2RUYWJCdXR0b24uYW5jaG9yVG9TZXRgIGluIHRocmVlIGFuaW1hdGlvbiBmcmFtZXMuICovXG4gICAgc3RhdGljIHNldEFuY2hvckluM0FuaW1GcmFtZXMoKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4geyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChCQ0RUYWJCdXR0b24uYW5jaG9yVG9TZXQgPT09ICcnKSB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2Ugd2luZG93LmxvY2F0aW9uLmhhc2ggPSBCQ0RUYWJCdXR0b24uYW5jaG9yVG9TZXQ7XG4gICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uQ2xpY2soZXZlbnQ/OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMubWFrZVNlbGVjdGVkKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYmx1cigpO1xuICAgIH1cblxuICAgIG9uS2V5UHJlc3MoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyB8fCBldmVudC5rZXkgPT09ICcgJykge1xuICAgICAgICAgICAgdGhpcy5vbkNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5iY2RDb21wb25lbnRzLnB1c2goQkNEVGFiQnV0dG9uKTtcblxuXG5cblxuLyokJCQkJCQqXFwgICAgICAgICAgICAgICAgICAgICQkXFwgICAkJFxcICAgICAkJFxcXG5cXF9fJCQgIF9ffCAgICAgICAgICAgICAgICAgICAgJCQgfCAgJCQgfCAgICBcXF9ffFxuICAgJCQgfCAgICAkJCQkJCRcXCAgICQkJCQkJFxcICAkJCB8JCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgICQkJCQkJCRcXFxuICAgJCQgfCAgICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCB8XFxfJCQgIF98ICAkJCB8JCQgIF9fJCRcXCAkJCAgX19fX198XG4gICAkJCB8ICAgJCQgLyAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8ICAgICQkIHwkJCAvICAkJCB8XFwkJCQkJCRcXFxuICAgJCQgfCAgICQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkXFwgJCQgfCQkIHwgICQkIHwgXFxfX19fJCRcXFxuICAgJCQgfCAgIFxcJCQkJCQkICB8XFwkJCQkJCQgIHwkJCB8ICBcXCQkJCQgIHwkJCB8JCQkJCQkJCAgfCQkJCQkJCQgIHxcbiAgIFxcX198ICAgIFxcX19fX19fLyAgXFxfX19fX18vIFxcX198ICAgXFxfX19fLyBcXF9ffCQkICBfX19fLyBcXF9fX19fX18vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF8qL1xuXG5cbmV4cG9ydCBjbGFzcyBCQ0RUb29sdGlwIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgYXNTdHJpbmcgPSAnQkNEIC0gVG9vbHRpcCc7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLWJjZC10b29sdGlwJztcblxuICAgIHJlbGF0aW9uOiAncHJlY2VkaW5nJyB8ICdwcm9jZWVkaW5nJyB8ICdjaGlsZCcgfCAnc2VsZWN0b3InO1xuICAgIHBvc2l0aW9uOiAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0JyA9ICd0b3AnO1xuXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgYm91bmRFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBnYXBCcmlkZ2VFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAgIG9wZW5EZWxheU1TOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7IGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXJvbGUnLCAndG9vbHRpcCcpO1xuXG4gICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnanMtYmNkLXRvb2x0aXBfZ2FwLWJyaWRnZScpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5nYXBCcmlkZ2VFbGVtZW50KTtcblxuICAgICAgICB0aGlzLm9wZW5EZWxheU1TID0gIHBhcnNlSW50KGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdvcGVuLWRlbGF5LW1zJykgPz8gJzQwMCcpO1xuXG5cbiAgICAgICAgY29uc3QgdGVtcFJlbGF0aW9uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAtcmVsYXRpb24nKSA/PyAncHJvY2VlZGluZyc7XG5cbiAgICAgICAgbGV0IHRlbXBFbGVtZW50O1xuXG4gICAgICAgIHN3aXRjaCAodGVtcFJlbGF0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdwcmVjZWRpbmcnOiB0ZW1wRWxlbWVudCA9IGVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Byb2NlZWRpbmcnOiB0ZW1wRWxlbWVudCA9IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZzsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjaGlsZCc6IHRlbXBFbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50OyBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0b3InOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndG9vbHRpcC1zZWxlY3RvcicpID8/ICcnO1xuICAgICAgICAgICAgICAgIHRlbXBFbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/PyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGJyZWFrOyB9XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0b29sdGlwLXJlbGF0aW9uIGF0dHJpYnV0ZSEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVsYXRpb24gPSB0ZW1wUmVsYXRpb247XG5cbiAgICAgICAgaWYgKCF0ZW1wRWxlbWVudCB8fCAhKHRlbXBFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpICkgdGhyb3cgbmV3IEVycm9yKCdUT09MVElQIC0gQ291bGQgbm90IGZpbmQgYSB2YWxpZCBIVE1MIEVsZW1lbnQgdG8gYmluZCB0byEnKTtcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQgPSB0ZW1wRWxlbWVudDtcbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKGVsZW1lbnQsIHRoaXMsIHRoaXMuYm91bmRFbGVtZW50LCB0cnVlLCB0cnVlKTtcblxuICAgICAgICBjb25zdCB0ZW1wUG9zID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3Rvb2x0aXAtcG9zaXRpb24nKTtcblxuICAgICAgICBzd2l0Y2ggKHRlbXBQb3MpIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6ICBjYXNlICdib3R0b20nOiAgY2FzZSAnbGVmdCc6ICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRlbXBQb3M7IGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdG9vbHRpcC1wb3NpdGlvbiBhdHRyaWJ1dGUhJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBib3VuZEVudGVyID0gdGhpcy5oYW5kbGVIb3ZlckVudGVyLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnN0IGJvdW5kTGVhdmUgPSB0aGlzLmhhbmRsZUhvdmVyTGVhdmUuYmluZCh0aGlzKTtcbiAgICAgICAgY29uc3QgYm91bmRUb3VjaCA9IHRoaXMuaGFuZGxlVG91Y2guYmluZCh0aGlzKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBib3VuZExlYXZlKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgcHJldmVudFByb3BhZ2F0aW9uKTtcblxuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgIGJvdW5kRW50ZXIpOyAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgIGJvdW5kRW50ZXIpO1xuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgIGJvdW5kTGVhdmUpOyAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgIGJvdW5kTGVhdmUpO1xuXG4gICAgICAgIHRoaXMuYm91bmRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAgYm91bmRUb3VjaCwge3Bhc3NpdmU6IHRydWV9KTsgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAgYm91bmRUb3VjaCwge3Bhc3NpdmU6IHRydWV9KTtcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgICBib3VuZFRvdWNoLCB7cGFzc2l2ZTogdHJ1ZX0pOyB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgICBib3VuZFRvdWNoLCB7cGFzc2l2ZTogdHJ1ZX0pO1xuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICAgIGJvdW5kVG91Y2gsIHtwYXNzaXZlOiB0cnVlfSk7IHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICAgIGJvdW5kVG91Y2gsIHtwYXNzaXZlOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuYm91bmRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgYm91bmRUb3VjaCwge3Bhc3NpdmU6IHRydWV9KTsgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgYm91bmRUb3VjaCwge3Bhc3NpdmU6IHRydWV9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB0aGlzLmhpZGUoKTtcbiAgICB9XG4gICAgcmVhZG9ubHkgYm91bmRLZXlEb3duID0gdGhpcy5oYW5kbGVLZXlEb3duLmJpbmQodGhpcyk7XG5cbiAgICBoYW5kbGVUb3VjaChldmVudDogVG91Y2hFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPiAwKSB0aGlzLmhhbmRsZUhvdmVyRW50ZXIodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgICAgZWxzZSB0aGlzLmhhbmRsZUhvdmVyTGVhdmUoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVIb3ZlckVudGVyKGV2ZW50PzogTW91c2VFdmVudHxGb2N1c0V2ZW50LCBieXBhc3NXYWl0PzogdHJ1ZSkge1xuICAgICAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ID8gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChldmVudD8ueCA/PyAwLCBldmVudD8ueSA/PyAwKSA6IGV2ZW50Py50YXJnZXQ7XG5cbiAgICAgICAgaWYgKHRhcmdldEVsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIChcbiAgICAgICAgICAgIHRhcmdldEVsZW1lbnQudXBncmFkZXNfcHJvdG8/LmRyb3Bkb3duXG4gICAgICAgICAgICB8fCB0YXJnZXRFbGVtZW50LnRhcmdldGluZ0NvbXBvbmVudHNfcHJvdG8/LmRyb3Bkb3duPy5jb250YWluZXJfLmNsYXNzTGlzdC5jb250YWlucygnaXMtdmlzaWJsZScpXG4gICAgICAgICkpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNob3dQYXJ0MSgpO1xuXG4gICAgICAgIGFmdGVyRGVsYXkoYnlwYXNzV2FpdCA/IDAgOiA2MDAsIGZ1bmN0aW9uKHRoaXM6IEJDRFRvb2x0aXApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlXycpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNob3dQYXJ0MigpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgfVxuXG4gICAgc2hvd1BhcnQxKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlXycpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuYm91bmRLZXlEb3duLCB7b25jZTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIHNob3dQYXJ0MigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHRoaXMuc2V0UG9zaXRpb24uYmluZCh0aGlzKSwge29uY2U6IHRydWV9KTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMuc2hvd1BhcnQxKCk7XG4gICAgICAgIHRoaXMuc2hvd1BhcnQyKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlSG92ZXJMZWF2ZShldmVudD86IE1vdXNlRXZlbnR8Rm9jdXNFdmVudCkgeyB0aGlzLmhpZGUoKTsgfVxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmJvdW5kS2V5RG93bik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZV8nKTtcblxuICAgICAgICBhZnRlckRlbGF5KDEwLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZV8nKSlcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBTZXR0aW5nIHBvc2l0aW9uIG9mIHRvb2x0aXAgdG8gdGhlICR7dGhpcy5wb3NpdGlvbn0gb2YgYCwgdGhpcy5ib3VuZEVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAnbm9uZSAhaW1wb3J0YW50JztcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSAhaW1wb3J0YW50JztcblxuICAgICAgICAvLyBGb3JjZSByZWNhbGMgb2Ygc3R5bGVzXG4gICAgICAgIGNvbnN0IHRpcFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KTtcblxuICAgICAgICBjb25zdCB0aXBQYWRkaW5nUmlnaHQgPSAgcGFyc2VJbnQodGlwU3R5bGUucGFkZGluZ1JpZ2h0KTtcbiAgICAgICAgY29uc3QgdGlwUGFkZGluZ0xlZnQgPSAgIHBhcnNlSW50KHRpcFN0eWxlLnBhZGRpbmdMZWZ0KTtcbiAgICAgICAgY29uc3QgdGlwUGFkZGluZ1RvcCA9ICAgIHBhcnNlSW50KHRpcFN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICBjb25zdCB0aXBQYWRkaW5nQm90dG9tID0gcGFyc2VJbnQodGlwU3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKCdSZWNhbGN1bGF0ZWQgc3R5bGVzOicsIHt0cmFuc2Zvcm06IHRpcFN0eWxlLnRyYW5zZm9ybSwgdHJhbnNpdGlvbjogdGlwU3R5bGUudHJhbnNpdGlvbiwgd2lkdGg6IHRpcFN0eWxlLndpZHRoLCBoZWlnaHQ6IHRpcFN0eWxlLmhlaWdodCwgb2Zmc2V0TGVmdDogdGhpcy5lbGVtZW50Lm9mZnNldExlZnQsIG9mZnNldFRvcDogdGhpcy5lbGVtZW50Lm9mZnNldFRvcCwgb2Zmc2V0V2lkdGg6IHRoaXMuZWxlbWVudC5vZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0OiB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0fSk7XG5cbiAgICAgICAgY29uc3QgZWxlbVJlY3QgPSB0aGlzLmJvdW5kRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgdGlwUmVjdCA9IHt3aWR0aDogdGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoLCBoZWlnaHQ6IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHR9O1xuXG4gICAgICAgIC8vY29uc29sZS5kZWJ1ZygnRWxlbWVudCByZWN0OicsIGVsZW1SZWN0KTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKCdFbGVtZW50IHJlY3RzOicsIHRoaXMuYm91bmRFbGVtZW50LmdldENsaWVudFJlY3RzKCkpO1xuICAgICAgICAvL2NvbnNvbGUuZGVidWcoJ1Rvb2x0aXAgcmVjdDonLCB0aXBSZWN0KTtcbiAgICAgICAgLy9jb25zb2xlLmRlYnVnKCdUb29sdGlwIHJlY3RzOicsIHRoaXMuZWxlbWVudC5nZXRDbGllbnRSZWN0cygpKTtcblxuICAgICAgICAvKiogVGhlIHRvcCBwb3NpdGlvbiAtIHNldCB0byB0aGUgbWlkZGxlIG9mIHRoZSBCb3VuZCBFbGVtZW50ICovXG4gICAgICAgIGxldCB0b3AgPSBlbGVtUmVjdC50b3AgICsgKGVsZW1SZWN0LmhlaWdodCAvIDIpO1xuICAgICAgICAvKiogVGhlIHRvcCBtYXJnaW4gLSB0aGUgbmVnYXRpdmUgaGVpZ2h0IG9mIHRoZSB0b29sdGlwICovXG4gICAgICAgIGNvbnN0IG1hcmdpblRvcCA9IHRpcFJlY3QuaGVpZ2h0IC8gLTI7XG5cbiAgICAgICAgLyoqIFRoZSBsZWZ0IHBvc2l0aW9uIC0gc2V0IHRvIHRoZSBtaWRkbGUgb2YgdGhlIEJvdW5kIEVsZW1lbnQgKi9cbiAgICAgICAgbGV0IGxlZnQgPSAgZWxlbVJlY3QubGVmdCArIChlbGVtUmVjdC53aWR0aCAgLyAyKTtcbiAgICAgICAgLyoqIFRoZSBsZWZ0IG1hcmdpbiAtIHRoZSBuZWdhdGl2ZSB3aWR0aCBvZiB0aGUgdG9vbHRpcCAqL1xuICAgICAgICBjb25zdCBtYXJnaW5MZWZ0ID0gICB0aXBSZWN0LndpZHRoIC8gLTI7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhgTGVmdCBQb3NpdGlvbjogJHtsZWZ0ICsgbWFyZ2luTGVmdH0sIHB1c2hpbmc/ICR7bGVmdCArIG1hcmdpbkxlZnQgPCA4fTsgUmlnaHQgUG9zaXRpb246ICR7bGVmdCArIG1hcmdpbkxlZnQgKyB0aXBSZWN0LndpZHRofSwgcHVzaGluZz8gJHtsZWZ0ICsgbWFyZ2luTGVmdCArIHRpcFJlY3Qud2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCAtIDh9YCk7XG5cbiAgICAgICAgLy8gUGFkZGluZyBvZiAxNnB4IG9uIHRoZSBsZWZ0IGFuZCByaWdodCBvZiB0aGUgZG9jdW1lbnRcblxuICAgICAgICBzd2l0Y2ggKHRoaXMucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuXG5cblxuICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50LnN0eWxlLndpZHRoID0gYCR7TWF0aC5tYXgodGlwUmVjdC53aWR0aCwgZWxlbVJlY3Qud2lkdGgpfXB4YDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUubGVmdCA9IGAke01hdGgubWluKGVsZW1SZWN0LmxlZnQsIGxlZnQgKyBtYXJnaW5MZWZ0KSAtIGxlZnQgLSBtYXJnaW5MZWZ0fXB4YDtcblxuICAgICAgICAgICAgICAgIGlmIChsZWZ0ICsgbWFyZ2luTGVmdCA8IDgpIGxlZnQgKz0gOCAtIGxlZnQgLSBtYXJnaW5MZWZ0O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YDtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubWFyZ2luTGVmdCA9IGAke21hcmdpbkxlZnR9cHhgO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG5cbiAgICAgICAgICAgICAgICB0b3AgKz0gOCAtIHRvcCAtIG1hcmdpblRvcDtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHtNYXRoLm1heCh0aXBSZWN0LmhlaWdodCwgZWxlbVJlY3QuaGVpZ2h0KX1weGA7XG4gICAgICAgICAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50LnN0eWxlLndpZHRoID0gJzE3cHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FwQnJpZGdlRWxlbWVudC5zdHlsZS50b3AgPSBgJHtNYXRoLm1pbihlbGVtUmVjdC50b3AsIHRvcCArIG1hcmdpblRvcCkgLSB0b3AgLSBtYXJnaW5Ub3B9cHhgO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRvcCArIG1hcmdpblRvcCA8IDgpIHRvcCArPSA4IC0gdG9wIC0gbWFyZ2luVG9wO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IGAke3RvcH1weGA7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLm1hcmdpblRvcCA9IGAke21hcmdpblRvcH1weGA7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhgRmluYWwgTGVmdCBQb3NpdGlvbjogJHtsZWZ0ICsgbWFyZ2luTGVmdCAtICh0aXBSZWN0LndpZHRoIC8gMil9YCk7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnBvc2l0aW9uKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6ICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wICA9IGAke2VsZW1SZWN0LnRvcCAgLSB0aXBSZWN0LmhlaWdodCAtIDE2fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUudG9wICA9IGAkezE2ICArIHRpcFJlY3QuaGVpZ2h0fXB4YDtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdib3R0b20nOiB0aGlzLmVsZW1lbnQuc3R5bGUudG9wICA9IGAke2VsZW1SZWN0LnRvcCAgKyBlbGVtUmVjdC5oZWlnaHQgKyAxNn1weGA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYXBCcmlkZ2VFbGVtZW50LnN0eWxlLnRvcCAgPSBgLTE2cHhgO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6ICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBgJHtlbGVtUmVjdC5sZWZ0IC0gdGlwUmVjdC53aWR0aCAtIDE2fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUubGVmdCA9IGAkezE2ICsgdGlwUmVjdC53aWR0aH1weGA7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdyaWdodCc6ICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IGAke2VsZW1SZWN0LmxlZnQgKyBlbGVtUmVjdC53aWR0aCArIDE2fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhcEJyaWRnZUVsZW1lbnQuc3R5bGUubGVmdCA9IGAtMTZweGA7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICB9XG5cbn1cbmJjZENvbXBvbmVudHMucHVzaChCQ0RUb29sdGlwKTtcblxuXG5cbi8qXG5cblxuXG4kJFxcICAgICAgJCRcXCAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCQkJCRcXCAgJCRcXFxuJCQkXFwgICAgJCQkIHxcXF9ffCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkICBfXyQkXFwgJCQgfFxuJCQkJFxcICAkJCQkIHwkJFxcICAkJCQkJCQkXFwgICQkJCQkJCRcXCAgICAgICAgICAgJCQgLyAgXFxfX3wkJCB8ICQkJCQkJFxcICAgJCQkJCQkJFxcICAkJCQkJCQkXFwgICQkJCQkJFxcICAgJCQkJCQkJFxcXG4kJFxcJCRcXCQkICQkIHwkJCB8JCQgIF9fX19ffCQkICBfX19fX3wgICAgICAgICAgJCQgfCAgICAgICQkIHwgXFxfX19fJCRcXCAkJCAgX19fX198JCQgIF9fX19ffCQkICBfXyQkXFwgJCQgIF9fX19ffFxuJCQgXFwkJCQgICQkIHwkJCB8XFwkJCQkJCRcXCAgJCQgLyAgICAgICAgICAgICAgICAkJCB8ICAgICAgJCQgfCAkJCQkJCQkIHxcXCQkJCQkJFxcICBcXCQkJCQkJFxcICAkJCQkJCQkJCB8XFwkJCQkJCRcXFxuJCQgfFxcJCAgLyQkIHwkJCB8IFxcX19fXyQkXFwgJCQgfCAgICAgICAgICAgICAgICAkJCB8ICAkJFxcICQkIHwkJCAgX18kJCB8IFxcX19fXyQkXFwgIFxcX19fXyQkXFwgJCQgICBfX19ffCBcXF9fX18kJFxcXG4kJCB8IFxcXy8gJCQgfCQkIHwkJCQkJCQkICB8XFwkJCQkJCQkXFwgJCRcXCAgICAgICBcXCQkJCQkJCAgfCQkIHxcXCQkJCQkJCQgfCQkJCQkJCQgIHwkJCQkJCQkICB8XFwkJCQkJCQkXFwgJCQkJCQkJCAgfFxuXFxfX3wgICAgIFxcX198XFxfX3xcXF9fX19fX18vICBcXF9fX19fX198XFxfX3wgICAgICAgXFxfX19fX18vIFxcX198IFxcX19fX19fX3xcXF9fX19fX18vIFxcX19fX19fXy8gIFxcX19fX19fX3xcXF9fX19fXyovXG5cblxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgYmNkRHluYW1pY1RleHRBcmVhX2Jhc2Uge1xuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmVnaXN0ZXJVcGdyYWRlKGVsZW1lbnQsIHRoaXMsIG51bGwsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgICAgICB0aGlzLmFkanVzdCgpO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kQWRqdXN0ID0gdGhpcy5hZGp1c3QuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgYm91bmRBZGp1c3QpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYm91bmRBZGp1c3QpO1xuXG4gICAgICAgIGNvbnN0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKGJvdW5kQWRqdXN0KTtcbiAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsZW1lbnQpO1xuXG4gICAgICAgIC8vIEhvcGVmdWxseSByZXNvbHZlIGFuIGVkZ2UtY2FzZSBjYXVzaW5nIHRoZSB0ZXh0IGFyZWEgdG8gbm90IGluaXRpYWxseSBzaXplIGl0c2VsZiBwcm9wZXJseVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYm91bmRBZGp1c3QpO1xuICAgIH1cblxuICAgIGFic3RyYWN0IGFkanVzdCgpOiBhbnk7XG5cbn1cblxuZXhwb3J0IGNsYXNzIGJjZER5bmFtaWNUZXh0QXJlYUhlaWdodCBleHRlbmRzIGJjZER5bmFtaWNUZXh0QXJlYV9iYXNlIHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgYXNTdHJpbmcgPSAnQkNEIC0gRHluYW1pYyBUZXh0QXJlYSAtIEhlaWdodCc7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNzc0NsYXNzID0gJ2pzLWR5bmFtaWMtdGV4dGFyZWEtaGVpZ2h0JztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGFkanVzdCgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudCkuaGVpZ2h0OyAvLyBGb3JjZSB0aGUgYnJvd3NlciB0byByZWNhbGN1bGF0ZSB0aGUgc2Nyb2xsIGhlaWdodFxuXG4gICAgICAgIGNvbnN0IHBhZGRpbmdQWCA9IHBhcnNlSW50KHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3BhZGRpbmdQWCcpID8/ICcwJyk7XG4gICAgICAgIGlmIChpc05hTihwYWRkaW5nUFgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBwYWRkaW5nUFggYXR0cmlidXRlIG9mIHRoZSBkeW5hbWljIHRleHQgYXJlYSBpcyBub3QgYSBudW1iZXI6JywgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5lbGVtZW50LnNjcm9sbEhlaWdodCArIHBhZGRpbmdQWH1weGA7XG4gICAgfVxuXG59XG5iY2RDb21wb25lbnRzLnB1c2goYmNkRHluYW1pY1RleHRBcmVhSGVpZ2h0KTtcblxuZXhwb3J0IGNsYXNzIGJjZER5bmFtaWNUZXh0QXJlYVdpZHRoIGV4dGVuZHMgYmNkRHluYW1pY1RleHRBcmVhX2Jhc2Uge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgLSBEeW5hbWljIFRleHRBcmVhIC0gV2lkdGgnO1xuICAgIHN0YXRpYyByZWFkb25seSBjc3NDbGFzcyA9ICdqcy1keW5hbWljLXRleHRhcmVhLXdpZHRoJztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5hZGp1c3QuYmluZCh0aGlzKSkub2JzZXJ2ZSh0aGlzLmVsZW1lbnQpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGFkanVzdCgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJyc7XG4gICAgICAgIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KS53aWR0aDsgLy8gRm9yY2UgdGhlIGJyb3dzZXIgdG8gcmVjYWxjdWxhdGUgdGhlIHNjcm9sbCBoZWlnaHRcblxuICAgICAgICBjb25zdCBwYWRkaW5nUFggPSBwYXJzZUludCh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdwYWRkaW5nUFgnKSA/PyAnMCcpO1xuICAgICAgICBpZiAoaXNOYU4ocGFkZGluZ1BYKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdUaGUgcGFkZGluZ1BYIGF0dHJpYnV0ZSBvZiB0aGUgZHluYW1pYyB0ZXh0IGFyZWEgaXMgbm90IGEgbnVtYmVyOicsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gYG1pbigke3RoaXMuZWxlbWVudC5zY3JvbGxXaWR0aCArIHBhZGRpbmdQWH1weCwgMTAwY3FtaW4pYDtcbiAgICB9XG5cbn1cbmJjZENvbXBvbmVudHMucHVzaChiY2REeW5hbWljVGV4dEFyZWFXaWR0aCk7XG5cbmNsYXNzIFJlbGF0aXZlRmlsZVBpY2tlciB7XG4gICAgc3RhdGljIGFzU3RyaW5nID0gJ0JDRCAtIFJlbGF0aXZlIEZpbGUgUGlja2VyJztcbiAgICBzdGF0aWMgY3NzQ2xhc3MgPSAnanMtcmVsYXRpdmUtZmlsZS1waWNrZXInO1xuXG4gICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcbiAgICBidXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xuXG4gICAgcmVsYXRpdmVUbz86IGZzLkZvbGRlcnx7ZGlyZWN0b3J5OiBmcy5Gb2xkZXJ9fHN0cmluZ1tdO1xuICAgIGdldCBkaXJlY3RvcnkoKTogZnMuRm9sZGVyfHVuZGVmaW5lZCB7XG4gICAgICAgIGlmICghdGhpcy5yZWxhdGl2ZVRvKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoJ2hhbmRsZScgaW4gdGhpcy5yZWxhdGl2ZVRvKSByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvO1xuICAgICAgICBpZiAoJ2RpcmVjdG9yeScgaW4gdGhpcy5yZWxhdGl2ZVRvKSByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvLmRpcmVjdG9yeTtcbiAgICAgICAgcmV0dXJuIFNldHRpbmdzR3JpZC5nZXRTZXR0aW5nKHRoaXMucmVsYXRpdmVUbywgJ2RpcmVjdG9yeScpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQsIHJlbGF0aXZlVG8/OiBmcy5Gb2xkZXJ8e2RpcmVjdG9yeTogZnMuRm9sZGVyfSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLnJlbGF0aXZlVG8gPSByZWxhdGl2ZVRvO1xuXG4gICAgICAgIGlmICghcmVsYXRpdmVUbykge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVUb0F0dHIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgncmVsYXRpdmUtdG8nKTtcbiAgICAgICAgICAgIGlmICghcmVsYXRpdmVUb0F0dHIpIHRocm93IG5ldyBFcnJvcignVGhlIHJlbGF0aXZlIGZpbGUgcGlja2VyIG11c3QgaGF2ZSBhIHJlbGF0aXZlLXRvIGF0dHJpYnV0ZSBvciBoYXZlIGEgZm9sZGVyIHNwZWNpZmllZCBhdCBjcmVhdGlvbi4nKTtcblxuICAgICAgICAgICAgdGhpcy5yZWxhdGl2ZVRvID0gcmVsYXRpdmVUb0F0dHIuc3BsaXQoJy4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZShlbGVtZW50LCB0aGlzLCBudWxsLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuYm91bmRPbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuYm91bmRPbkNoYW5nZSk7XG5cblxuICAgICAgICAvKiBDcmVhdGUgdGhlIGZvbGxvd2luZyBidXR0b246XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibWRsLWJ1dHRvbiBtZGwtanMtYnV0dG9uIG1kbC1idXR0b24tLWZhYiBtZGwtanMtcmlwcGxlLWVmZmVjdCBqcy1yZWxhdGl2ZS1maWxlLXBpY2tlci0tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+ZWRpdF9kb2N1bWVudDwvaT5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAqL1xuXG4gICAgICAgIHRoaXMuYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHRoaXMuYnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgdGhpcy5idXR0b24uY2xhc3NMaXN0LmFkZChcbiAgICAgICAgICAgIC8qIE1ETCAgKi8gJ21kbC1idXR0b24nLCAnbWRsLWpzLWJ1dHRvbicsICdtZGwtYnV0dG9uLS1mYWInLCAnbWRsLWpzLXJpcHBsZS1lZmZlY3QnLFxuICAgICAgICAgICAgLyogTWluZSAqLyAnanMtcmVsYXRpdmUtZmlsZS1waWNrZXItLWJ1dHRvbidcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xuICAgICAgICBpY29uLmNsYXNzTGlzdC5hZGQoJ21hdGVyaWFsLWljb25zJyk7XG4gICAgICAgIGljb24udGV4dENvbnRlbnQgPSAnZWRpdF9kb2N1bWVudCc7XG5cbiAgICAgICAgdGhpcy5idXR0b24uYXBwZW5kQ2hpbGQoaWNvbik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZnRlcih0aGlzLmJ1dHRvbik7XG5cbiAgICAgICAgdGhpcy5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3cuY2xpY2tFdnQsIHRoaXMuYm91bmRPbkJ1dHRvbkNsaWNrKTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ29uQ2hhbmdlJywgdGhpcy5lbGVtZW50LnZhbHVlLCB0aGlzKTtcbiAgICB9XG4gICAgcmVhZG9ubHkgYm91bmRPbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcblxuICAgIGFzeW5jIG9uQnV0dG9uQ2xpY2soKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbkJ1dHRvbkNsaWNrJywgdGhpcy5lbGVtZW50LnZhbHVlLCB0aGlzKTtcblxuICAgICAgICBsZXQgZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGU7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBbZmlsZUhhbmRsZV0gPSBhd2FpdCB3aW5kb3cuc2hvd09wZW5GaWxlUGlja2VyKHttdWx0aXBsZTogZmFsc2V9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgJiYgZSBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiBlLm5hbWUgPT09ICdBYm9ydEVycm9yJykgcmV0dXJuOyAvLyBUaGUgdXNlciBjYW5jZWxlZCB0aGUgZmlsZSBwaWNrZXIgKHdoaWNoIGlzIGZpbmUpXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RoZSBmaWxlIHBpY2tlciB0aHJldyBzb21lIHNvcnQgb2YgZXJyb3InLCBlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWVBcnIgPSBhd2FpdCB0aGlzLmRpcmVjdG9yeT8uaGFuZGxlLnJlc29sdmUoZmlsZUhhbmRsZSk7XG4gICAgICAgIGlmICghbmFtZUFycikgcmV0dXJuIGNvbnNvbGUuZGVidWcoJ1RoZSBmaWxlIHBpY2tlciByZXR1cm5lZCBhIGZpbGUgdGhhdCBpcyBub3QgaW4gdGhlIHNwZWNpZmllZCBkaXJlY3RvcnknLCBmaWxlSGFuZGxlLCB0aGlzLmRpcmVjdG9yeSk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gbmFtZUFyci5qb2luKCcvJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgIH1cbiAgICByZWFkb25seSBib3VuZE9uQnV0dG9uQ2xpY2sgPSB0aGlzLm9uQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbn1cbmJjZENvbXBvbmVudHMucHVzaChSZWxhdGl2ZUZpbGVQaWNrZXIpO1xuXG5jbGFzcyBSZWxhdGl2ZUltYWdlUGlja2VyIGV4dGVuZHMgUmVsYXRpdmVGaWxlUGlja2VyIHtcbiAgICBzdGF0aWMgb3ZlcnJpZGUgcmVhZG9ubHkgYXNTdHJpbmcgPSAnQkNEIC0gUmVsYXRpdmUgSW1hZ2UgUGlja2VyJztcbiAgICBzdGF0aWMgb3ZlcnJpZGUgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtcmVsYXRpdmUtaW1hZ2UtcGlja2VyJztcblxuICAgIGltYWdlRWxlbT86IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgbm9JbWFnZUVsZW0/OiBTVkdTVkdFbGVtZW50O1xuICAgIHJlbGF0aW9uOiAncHJldmlvdXMnfCduZXh0J3wncGFyZW50J3wnc2VsZWN0b3InO1xuXG4gICAgc3RhdGljIG5vSW1hZ2VEb2M/OiBEb2N1bWVudCB8IFByb21pc2U8c3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQsIHJlbGF0aXZlVG8/OiBmcy5Gb2xkZXJ8e2RpcmVjdG9yeTogZnMuRm9sZGVyfSkge1xuICAgICAgICBzdXBlcihlbGVtZW50LCByZWxhdGl2ZVRvKTtcblxuICAgICAgICB0aGlzLnJlbGF0aW9uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JlbGF0aW9uJykgYXMgJ3ByZXZpb3VzJ3wnbmV4dCd8J3BhcmVudCd8J3NlbGVjdG9yJyA/PyAncHJldmlvdXMnO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5yZWxhdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdwcmV2aW91cyc6XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0gPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0gPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLm5leHRFbGVtZW50U2libGluZyBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdwYXJlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VFbGVtID0gZWxlbWVudC5wYXJlbnRFbGVtZW50IGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdG9yJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NlbGVjdG9yJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxlY3RvcikgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmVsYXRpdmUgaW1hZ2UgcGlja2VyIG11c3QgaGF2ZSBhIHNlbGVjdG9yIGF0dHJpYnV0ZSBpZiB0aGUgcmVsYXRpb24gaXMgc2V0IHRvIHNlbGVjdG9yLicpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0gPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIGFzIEhUTUxJbWFnZUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZWxhdGl2ZSBpbWFnZSBwaWNrZXIgbXVzdCBoYXZlIGEgcmVsYXRpb24gYXR0cmlidXRlIHRoYXQgaXMgZWl0aGVyIHByZXZpb3VzLCBuZXh0LCBwYXJlbnQsIG9yIHNlbGVjdG9yLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmVhdGVOb0ltYWdlRWxlbSgpO1xuXG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZShlbGVtZW50LCB0aGlzLCB0aGlzLmltYWdlRWxlbSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY3JlYXRlTm9JbWFnZUVsZW0oKSB7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcmVxdWVzdCBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0XG4gICAgICAgIFJlbGF0aXZlSW1hZ2VQaWNrZXIubm9JbWFnZURvYyA/Pz0gZmV0Y2goJ2h0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20vcy9pL3Nob3J0LXRlcm0vcmVsZWFzZS9tYXRlcmlhbHN5bWJvbHNyb3VuZGVkL2ltYWdlL2RlZmF1bHQvNDhweC5zdmcnKS50aGVuKHIgPT4gci50ZXh0KCkpO1xuXG4gICAgICAgIGxldCBzdmc6IHVuZGVmaW5lZHxTVkdTVkdFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdCB0byBmaW5pc2ggaWYgaXQgaGFzIG5vdCBhbHJlYWR5XG4gICAgICAgIGlmIChSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2MgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBjb25zdCBzdHIgPSBhd2FpdCBSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2M7XG4gICAgICAgICAgICBSZWxhdGl2ZUltYWdlUGlja2VyLm5vSW1hZ2VEb2MgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHN0ciwgJ3RleHQvaHRtbCcpO1xuICAgICAgICAgICAgc3ZnID0gUmVsYXRpdmVJbWFnZVBpY2tlci5ub0ltYWdlRG9jLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpIGFzIFNWR1NWR0VsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIGNoYW5nZSB3aWR0aCBhbmQgaGVpZ2h0IHRvIHZpZXdCb3hcbiAgICAgICAgICAgIHN2Zy5yZW1vdmVBdHRyaWJ1dGUoJ3dpZHRoJyk7IHN2Zy5yZW1vdmVBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgndmlld0JveCcsICcwIDAgNDggNDgnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN2ZyA/Pz0gUmVsYXRpdmVJbWFnZVBpY2tlci5ub0ltYWdlRG9jLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpIGFzIFNWR1NWR0VsZW1lbnQ7XG4gICAgICAgIGlmICghc3ZnKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoZSBTVkcgZWxlbWVudCBpbiB0aGUgU1ZHIGRvY3VtZW50LicpO1xuXG4gICAgICAgIHRoaXMubm9JbWFnZUVsZW0gPSBzdmcuY2xvbmVOb2RlKHRydWUpIGFzIFNWR1NWR0VsZW1lbnQ7XG4gICAgICAgIHRoaXMubm9JbWFnZUVsZW0uY2xhc3NMaXN0LmFkZCgnanMtcmVsYXRpdmUtaW1hZ2UtcGlja2VyLS1uby1pbWFnZScpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VFbGVtPy5iZWZvcmUodGhpcy5ub0ltYWdlRWxlbSk7XG5cbiAgICAgICAgdGhpcy5pbWFnZUVsZW0/LnNyYyA/IHRoaXMuc2hvd0ltYWdlKCkgOiB0aGlzLmhpZGVJbWFnZSgpO1xuICAgIH1cblxuICAgIGhpZGVJbWFnZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VFbGVtKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0uYXJpYURpc2FibGVkID0gJ3RydWUnO1xuICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0uYXJpYUhpZGRlbiA9ICd0cnVlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub0ltYWdlRWxlbSkge1xuICAgICAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIHRoaXMubm9JbWFnZUVsZW0uYXJpYURpc2FibGVkID0gJ2ZhbHNlJztcbiAgICAgICAgICAgIHRoaXMubm9JbWFnZUVsZW0uYXJpYUhpZGRlbiA9ICdmYWxzZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93SW1hZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlRWxlbSkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICB0aGlzLmltYWdlRWxlbS5hcmlhRGlzYWJsZWQgPSAnZmFsc2UnO1xuICAgICAgICAgICAgdGhpcy5pbWFnZUVsZW0uYXJpYUhpZGRlbiA9ICdmYWxzZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9JbWFnZUVsZW0pIHtcbiAgICAgICAgICAgIHRoaXMubm9JbWFnZUVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHRoaXMubm9JbWFnZUVsZW0uYXJpYURpc2FibGVkID0gJ3RydWUnO1xuICAgICAgICAgICAgdGhpcy5ub0ltYWdlRWxlbS5hcmlhSGlkZGVuID0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGFzdFZhbHVlOiBzdHJpbmcgPSAnJztcbiAgICBvdmVycmlkZSBhc3luYyBvbkNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdFZhbHVlID09PSB0aGlzLmVsZW1lbnQudmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5sYXN0VmFsdWUgPSB0aGlzLmVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgc3VwZXIub25DaGFuZ2UoKTtcblxuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLmRpcmVjdG9yeTtcblxuICAgICAgICBpZiAoIXRoaXMuaW1hZ2VFbGVtKVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuaW5mbygnVGhlIHJlbGF0aXZlIGltYWdlIHBpY2tlciBkb2VzIG5vdCBoYXZlIGFuIGltYWdlIGVsZW1lbnQgdG8gdXBkYXRlLicsIHRoaXMpO1xuXG4gICAgICAgIGlmICghZGlyKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVJbWFnZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuaW5mbygnVGhlIHJlbGF0aXZlIGltYWdlIHBpY2tlciBkb2VzIG5vdCBoYXZlIGEgZGlyZWN0b3J5IHRvIHVwZGF0ZSB0aGUgaW1hZ2UgZnJvbS4nLCB0aGlzLCBkaXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZUhhbmRsZV8gPSBkaXIuZ2V0RmlsZSh0aGlzLmVsZW1lbnQudmFsdWUpO1xuICAgICAgICBjb25zdCBmc18gPSBsb2FkRlMoKTtcbiAgICAgICAgY29uc3QgW2ZpbGVIYW5kbGUsIGZzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtmaWxlSGFuZGxlXywgZnNfXSk7XG5cbiAgICAgICAgaWYgKCFmaWxlSGFuZGxlIHx8IGZpbGVIYW5kbGUgaW5zdGFuY2VvZiBmcy5JbnZhbGlkTmFtZUVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVJbWFnZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuaW5mbygnVGhlIHJlbGF0aXZlIGltYWdlIHBpY2tlciBkb2VzIG5vdCBoYXZlIGEgZmlsZSBoYW5kbGUgdG8gdXBkYXRlIHRoZSBpbWFnZSB3aXRoLicsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbWFnZUVsZW0uc3JjID0gYXdhaXQgZnMucmVhZEZpbGVBc0RhdGFVUkkoZmlsZUhhbmRsZSk7XG4gICAgICAgIHRoaXMuc2hvd0ltYWdlKCk7XG4gICAgfVxufVxuYmNkQ29tcG9uZW50cy5wdXNoKFJlbGF0aXZlSW1hZ2VQaWNrZXIpO1xuXG5cbi8qJCQkJCRcXCAgICAgICAgICAgICAgJCRcXCAgICAgICAkJFxcICAgICAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCQkJCRcXCAgICAgICAgICAgICQkXFwgICAgICAgJCRcXFxuJCQgIF9fJCRcXCAgICAgICAgICAgICAkJCB8ICAgICAgJCQgfCAgICBcXF9ffCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkICBfXyQkXFwgICAgICAgICAgIFxcX198ICAgICAgJCQgfFxuJCQgLyAgXFxfX3wgJCQkJCQkXFwgICQkJCQkJFxcICAgJCQkJCQkXFwgICAkJFxcICQkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJFxcICAgICAgICQkIC8gIFxcX198ICQkJCQkJFxcICAkJFxcICAkJCQkJCQkIHxcblxcJCQkJCQkXFwgICQkICBfXyQkXFwgXFxfJCQgIF98ICBcXF8kJCAgX3wgICQkIHwkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fX19ffCAgICAgICQkIHwkJCQkXFwgJCQgIF9fJCRcXCAkJCB8JCQgIF9fJCQgfFxuIFxcX19fXyQkXFwgJCQkJCQkJCQgfCAgJCQgfCAgICAgICQkIHwgICAgJCQgfCQkIHwgICQkIHwkJCAvICAkJCB8XFwkJCQkJCRcXCAgICAgICAgJCQgfFxcXyQkIHwkJCB8ICBcXF9ffCQkIHwkJCAvICAkJCB8XG4kJFxcICAgJCQgfCQkICAgX19fX3wgICQkIHwkJFxcICAgJCQgfCQkXFwgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8IFxcX19fXyQkXFwgICAgICAgJCQgfCAgJCQgfCQkIHwgICAgICAkJCB8JCQgfCAgJCQgfFxuXFwkJCQkJCQgIHxcXCQkJCQkJCRcXCAgIFxcJCQkJCAgfCAgXFwkJCQkICB8JCQgfCQkIHwgICQkIHxcXCQkJCQkJCQgfCQkJCQkJCQgIHwgICAgICBcXCQkJCQkJCAgfCQkIHwgICAgICAkJCB8XFwkJCQkJCQkIHxcbiBcXF9fX19fXy8gIFxcX19fX19fX3wgICBcXF9fX18vICAgIFxcX19fXy8gXFxfX3xcXF9ffCAgXFxfX3wgXFxfX19fJCQgfFxcX19fX19fXy8gICAgICAgIFxcX19fX19fLyBcXF9ffCAgICAgIFxcX198IFxcX19fX19fX3xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkXFwgICAkJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcX19fX18qL1xuXG5cbmludGVyZmFjZSBzZXR0aW5nc0dyaWRPYmoge1xuICAgIHR5cGU6ICdib29sJ3wnc3RyaW5nJ1xuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0b29sdGlwPzogc3RyaW5nIHwge1xuICAgICAgICB0ZXh0OiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uOiAndG9wJ3wnYm90dG9tJ3wnbGVmdCd8J3JpZ2h0J1xuICAgIH07XG4gICAgb3B0aW9ucz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG59XG5cbmNvbnN0IHNldHRpbmdzVG9VcGRhdGU6ICgoKSA9PiB1bmtub3duKVtdID0gW107XG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3MoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXR0aW5nc1RvVXBkYXRlLmxlbmd0aDsgaSsrKVxuICAgICAgICBzZXR0aW5nc1RvVXBkYXRlW2ldISgpO1xufVxuXG50eXBlIHNldHRpbmdzR3JpZCA9IFJlY29yZDxzdHJpbmcsIHNldHRpbmdzR3JpZE9iaj5cbmV4cG9ydCBjbGFzcyBTZXR0aW5nc0dyaWQge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgLSBTZXR0aW5ncyBHcmlkJztcbiAgICBzdGF0aWMgcmVhZG9ubHkgY3NzQ2xhc3MgPSAnanMtc2V0dGluZ3MtZ3JpZCc7XG5cbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBzZXR0aW5nVGVtcGxhdGU6IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgc2V0dGluZ3NQYXRoOiBzdHJpbmdbXTtcbiAgICBzZXR0aW5nczogc2V0dGluZ3NHcmlkO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHJlZ2lzdGVyVXBncmFkZShlbGVtZW50LCB0aGlzLCBudWxsLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IEpTT04ucGFyc2UoZWxlbWVudC5pbm5lclRleHQpIGFzIHNldHRpbmdzR3JpZDtcbiAgICAgICAgZWxlbWVudC5pbm5lclRleHQgPSAnJztcblxuICAgICAgICBjb25zdCBzZXR0aW5nc0VsZW1JRCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZW1wbGF0ZUlEXCIpO1xuICAgICAgICBpZiAoIXNldHRpbmdzRWxlbUlEKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5ncyBHcmlkIGlzIG1pc3NpbmcgdGhlIGRhdGEtdGVtcGxhdGVJRCBhdHRyaWJ1dGUhXCIpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdUZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNldHRpbmdzRWxlbUlEKTtcbiAgICAgICAgaWYgKCFzZXR0aW5nVGVtcGxhdGUgfHwgIShzZXR0aW5nVGVtcGxhdGUgaW5zdGFuY2VvZiBIVE1MVGVtcGxhdGVFbGVtZW50KSkgdGhyb3cgbmV3IEVycm9yKGBTZXR0aW5ncyBHcmlkIGNhbm5vdCBmaW5kIGEgVEVNUExBVEUgZWxlbWVudCB3aXRoIHRoZSBJRCBcIiR7c2V0dGluZ3NFbGVtSUR9XCIhYCk7XG5cbiAgICAgICAgdGhpcy5zZXR0aW5nVGVtcGxhdGUgPSBzZXR0aW5nVGVtcGxhdGUuY29udGVudDtcblxuICAgICAgICB0aGlzLnNldHRpbmdzUGF0aCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1zZXR0aW5nc1BhdGhcIik/LnNwbGl0KCcuJykgPz8gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBzZXR0aW5nc10gb2YgT2JqZWN0LmVudHJpZXModGhpcy5zZXR0aW5ncykpXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNldHRpbmcoa2V5LCBzZXR0aW5ncyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmhpZGRlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNyZWF0ZVNldHRpbmcoa2V5OiBzdHJpbmcsIHNldHRpbmdzOiBzZXR0aW5nc0dyaWRPYmopIHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnNldHRpbmdUZW1wbGF0ZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKCFjaGlsZHJlblswXSkgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZ3MgR3JpZCB0ZW1wbGF0ZSBpcyBtaXNzaW5nIGEgcm9vdCBlbGVtZW50IVwiKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjaGlsZHJlbik7XG5cbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgICAgICAgY29uc3QgY2xvbmUgPSBjaGlsZC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICB0aGlzLnVwZ3JhZGVFbGVtZW50KGNsb25lLCBrZXksIHNldHRpbmdzKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgd2Fzbid0IHJlbW92ZWQsIGdpdmUgJ2VyIGEgdG9vbHRpcFxuICAgICAgICAgICAgaWYgKGNsb25lLnBhcmVudEVsZW1lbnQgJiYgc2V0dGluZ3MudG9vbHRpcCkgdGhpcy5jcmVhdGVUb29sdGlwKGNsb25lLCBzZXR0aW5ncy50b29sdGlwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVRvb2x0aXAoZWxlbWVudDogSFRNTEVsZW1lbnQsIHRvb2x0aXA6IE5vbk51bGxhYmxlPHNldHRpbmdzR3JpZE9ialsndG9vbHRpcCddPikge1xuICAgICAgICAvLzxkaXYgY2xhc3M9XCJqcy1iY2QtdG9vbHRpcFwiIHRvb2x0aXAtcmVsYXRpb249XCJwcm9jZWVkaW5nXCIgdG9vbHRpcC1wb3NpdGlvbj1cImJvdHRvbVwiPjxwPlxuICAgICAgICAvLyAgICBUT09MVElQIElOTkVSIEhUTUxcbiAgICAgICAgLy88L3A+PC9kaXY+XG4gICAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKCdqcy1iY2QtdG9vbHRpcCcpO1xuICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZSgndG9vbHRpcC1yZWxhdGlvbicsICdwcm9jZWVkaW5nJyk7XG4gICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCd0b29sdGlwLXBvc2l0aW9uJywgdHlwZW9mIHRvb2x0aXAgPT09ICdvYmplY3QnID8gdG9vbHRpcC5wb3NpdGlvbiA6ICdib3R0b20nKTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykpLmlubmVySFRNTCA9IHR5cGVvZiB0b29sdGlwID09PSAnb2JqZWN0JyA/IHRvb2x0aXAudGV4dCA6IHRvb2x0aXA7XG5cbiAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZWxlbSk7XG4gICAgICAgIG1kbC5jb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVFbGVtZW50KGVsZW0pO1xuICAgIH1cblxuICAgIHVwZ3JhZGVFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQsIGtleTogc3RyaW5nLCBzZXR0aW5nczogc2V0dGluZ3NHcmlkT2JqKSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgJiYgJ2dldEF0dHJpYnV0ZScgaW4gZWxlbWVudCkpIHJldHVybiA7Ly9jb25zb2xlLmVycm9yKFwiQSBTZXR0aW5ncyBHcmlkIGVsZW1lbnQgd2FzIG5vdCBhY3R1YWxseSBhbiBlbGVtZW50IVwiLCBlbGVtZW50KTtcblxuICAgICAgICBjb25zdCBmaWx0ZXJUeXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0dGluZy1maWx0ZXInKTsgICAgICAgICAgICAgLy8gZXMgbGludC1kaXNhYmxlLW5leHQtbGluZSBzb25hcmpzL25vLW5lc3RlZC10ZW1wbGF0ZS1saXRlcmFsc1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBVcGdyYWRpbmcgY2hpbGQgd2l0aCB0eXBlICR7ZmlsdGVyVHlwZSA/IGAke2ZpbHRlclR5cGV9OmA6Jyd9JHtkaXNwbGF5VHlwZX1gLCBlbGVtZW50LCBzZXR0aW5ncyk7XG5cbiAgICAgICAgaWYgKGZpbHRlclR5cGUgJiYgZmlsdGVyVHlwZSAhPT0gc2V0dGluZ3MudHlwZSkgcmV0dXJuIGVsZW1lbnQucmVtb3ZlKCk7Ly9jb25zb2xlLndhcm4oXCJSZW1vdmluZyBlbGVtZW50IGZyb20gdHJlZTpcIiwgKGVsZW1lbnQucmVtb3ZlKCksIGVsZW1lbnQpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGVsZW1lbnQuY2hpbGRyZW4pIHRoaXMudXBncmFkZUVsZW1lbnQoY2hpbGQsIGtleSwgc2V0dGluZ3MpO1xuXG4gICAgICAgIGNvbnN0IGRpc3BsYXlUeXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0dGluZy1kaXNwbGF5Jyk7XG4gICAgICAgIGlmICghZGlzcGxheVR5cGUpIHJldHVybiA7Ly9jb25zb2xlLndhcm4oJ0EgU2V0dGluZ3MgR3JpZCBlbGVtZW50IGlzIG1pc3NpbmcgdGhlIGBkYXRhLXNldHRpbmctZGlzcGxheWAgYXR0cmlidXRlIScsIGVsZW1lbnQpO1xuXG4gICAgICAgIHN3aXRjaChkaXNwbGF5VHlwZSkge1xuICAgICAgICAgICAgY2FzZSgnaWQnKTpcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gYHNldHRpbmctLSR7a2V5fWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UoJ2xhYmVsJyk6XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBzZXR0aW5ncy5uYW1lO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlKCdjaGVja2JveCcpOlxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkgZWxlbWVudC5jaGVja2VkID0gISF0aGlzLmdldFNldHRpbmcoa2V5LCB0cnVlKTtcbiAgICAgICAgICAgICAgICBlbHNlIHRocm93IG5ldyBFcnJvcihcIlNldHRpbmdzIEdyaWQgdGVtcGxhdGUgaGFzIGEgY2hlY2tib3ggdGhhdCBpcyBub3QgYW4gSU5QVVQgZWxlbWVudCFcIik7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgoKSA9PiB0aGlzLnNldFNldHRpbmcoa2V5LCBlbGVtZW50LmNoZWNrZWQpKS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBzZXR0aW5nc1RvVXBkYXRlLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jaGVja2VkICE9PSAhIXRoaXMuZ2V0U2V0dGluZyhrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGljaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlKCdkcm9wZG93bicpOlxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChCQ0RTZXR0aW5nc0Ryb3Bkb3duLmNzc0NsYXNzKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1vcHRpb25zJywgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3Mub3B0aW9ucykpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXNldHRpbmdzLXBhdGgnLCAgSlNPTi5zdHJpbmdpZnkodGhpcy5zZXR0aW5nc1BhdGgpKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1zZXR0aW5nJywgIGtleSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBBIFNldHRpbmdzIEdyaWQgZWxlbWVudCBoYXMgYW4gdW5rbm93biBkaXNwbGF5IHR5cGU6ICR7ZGlzcGxheVR5cGV9YCwgZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NvbnNvbGUubG9nKGBVcGdyYWRlZCBlbGVtZW50IHdpdGggdHlwZSAke2Rpc3BsYXlUeXBlfS4gUGFzc2luZyBvZmYgdG8gTURMIGNvbXBvbmVudCBoYW5kbGVyLi4uYCk7XG4gICAgICAgIG1kbC5jb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBGdWxseSB1cGdyYWRlZCBlbGVtZW50IHdpdGggdHlwZSAke2Rpc3BsYXlUeXBlfSFgKTtcbiAgICB9XG5cbiAgICBnZXRTZXR0aW5nPFRSZXR1cm5WYWx1ZSA9IHN0cmluZ3xib29sZWFufG51bWJlcnxudWxsPihrZXk6IHN0cmluZ3xudW1iZXIsIHN1cHByZXNzRXJyb3IgPSBmYWxzZSk6IFRSZXR1cm5WYWx1ZXx1bmRlZmluZWQgeyByZXR1cm4gU2V0dGluZ3NHcmlkLmdldFNldHRpbmc8VFJldHVyblZhbHVlPih0aGlzLnNldHRpbmdzUGF0aCwga2V5LCBzdXBwcmVzc0Vycm9yKTsgfVxuXG4gICAgc3RhdGljIGdldFNldHRpbmc8VFJldHVyblZhbHVlID0gc3RyaW5nfGJvb2xlYW58bnVtYmVyfG51bGw+KHNldHRpbmdzUGF0aDogc3RyaW5nW10sIGtleTogc3RyaW5nfG51bWJlciwgc3VwcHJlc3NFcnJvciA9IGZhbHNlKTogVFJldHVyblZhbHVlfHVuZGVmaW5lZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudERpciA9IHdpbmRvdztcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIHNldHRpbmdzUGF0aCkgLy9AdHMtaWdub3JlOiBUaGUgcGF0aCBpcyBkeW5hbWljYWxseSBwdWxsZWQgZnJvbSB0aGUgSFRNTCBkb2N1bWVudCwgc28gaXQncyBub3QgcG9zc2libGUgdG8ga25vdyB3aGF0IGl0IHdpbGwgYmUgYXQgY29tcGlsZSB0aW1lXG4gICAgICAgICAgICAgICAgY3VycmVudERpciA9IGN1cnJlbnREaXI/LltkaXJdO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudERpciA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoYFNldHRpbmdzIEdyaWQgY2Fubm90IGZpbmQgdGhlIHNldHRpbmdzIHBhdGggXCIke3NldHRpbmdzUGF0aC5qb2luKCcuJyl9XCIhYCk7XG5cbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZTogIFRoZSBwYXRoIGlzIGR5bmFtaWNhbGx5IHB1bGxlZCBmcm9tIHRoZSBIVE1MIGRvY3VtZW50LCBzbyBpdCdzIG5vdCBwb3NzaWJsZSB0byBrbm93IHdoYXQgaXQgd2lsbCBiZSBhdCBjb21waWxlIHRpbWVcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50RGlyW2tleV07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghc3VwcHJlc3NFcnJvcikgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRTZXR0aW5nKGtleTogc3RyaW5nfG51bWJlciwgdmFsdWU6c3RyaW5nfGJvb2xlYW58bnVtYmVyfG51bGx8dW5kZWZpbmVkLCBzdXBwcmVzc0Vycm9yID0gZmFsc2UpOiB2b2lkIHsgU2V0dGluZ3NHcmlkLnNldFNldHRpbmcodGhpcy5zZXR0aW5nc1BhdGgsIGtleSwgdmFsdWUsIHN1cHByZXNzRXJyb3IpOyB9XG5cbiAgICBzdGF0aWMgc2V0U2V0dGluZyhzZXR0aW5nc1BhdGg6IHN0cmluZ1tdLCBrZXk6IHN0cmluZ3xudW1iZXIsIHZhbHVlOnN0cmluZ3xib29sZWFufG51bWJlcnxudWxsfHVuZGVmaW5lZCwgc3VwcHJlc3NFcnJvciA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudERpciA9IHdpbmRvdztcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIHNldHRpbmdzUGF0aCkgLy9AdHMtaWdub3JlOiBUaGUgcGF0aCBpcyBkeW5hbWljYWxseSBwdWxsZWQgZnJvbSB0aGUgSFRNTCBkb2N1bWVudCwgc28gaXQncyBub3QgcG9zc2libGUgdG8ga25vdyB3aGF0IGl0IHdpbGwgYmUgYXQgY29tcGlsZSB0aW1lXG4gICAgICAgICAgICAgICAgY3VycmVudERpciA9IGN1cnJlbnREaXI/LltkaXJdO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudERpciA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoYFNldHRpbmdzIEdyaWQgY2Fubm90IGZpbmQgdGhlIHNldHRpbmdzIHBhdGggXCIke3NldHRpbmdzUGF0aC5qb2luKCcuJyl9XCIhYCk7XG5cbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZTogVGhlIHBhdGggaXMgZHluYW1pY2FsbHkgcHVsbGVkIGZyb20gdGhlIEhUTUwgZG9jdW1lbnQsIHNvIGl0J3Mgbm90IHBvc3NpYmxlIHRvIGtub3cgd2hhdCBpdCB3aWxsIGJlIGF0IGNvbXBpbGUgdGltZVxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnREaXJba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIXN1cHByZXNzRXJyb3IpIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxufVxuYmNkQ29tcG9uZW50cy5wdXNoKFNldHRpbmdzR3JpZCk7XG5cbi8qKiBWYXJpYWJsZSB0byB3b3JrIGFyb3VuZCB0aGUgY29tcGxleGl0aWVzIG9mIENvbnN0cnVjdG9ycyBhbmQgd2hhdG5vdCAqL1xubGV0IHRlbXBLZXlNYXAgPSB7fTtcbmV4cG9ydCBjbGFzcyBCQ0RTZXR0aW5nc0Ryb3Bkb3duIGV4dGVuZHMgQkNERHJvcGRvd24ge1xuICAgIHN0YXRpYyByZWFkb25seSBhc1N0cmluZyA9ICdCQ0QgU2V0dGluZ3MgRHJvcGRvd24nO1xuICAgIHN0YXRpYyByZWFkb25seSBjc3NDbGFzcyA9ICdqcy1iY2Qtc2V0dGluZ3MtZHJvcGRvd24nO1xuXG4gICAgc2V0dGluZ3NQYXRoOnN0cmluZ1tdID0gSlNPTi5wYXJzZSh0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXR0aW5ncy1wYXRoJykgPz8gJ1tdJyk7XG4gICAgc2V0dGluZ0tleSA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdkYXRhLXNldHRpbmcnKSA/PyAnJztcbiAgICBrZXlNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdDb25zdHJ1Y3RpbmcgQkNEU2V0dGluZ3NEcm9wZG93bicsIGVsZW1lbnQpO1xuICAgICAgICBzdXBlcihlbGVtZW50LCBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcpO1xuICAgICAgICB0aGlzLmtleU1hcCA9IHRlbXBLZXlNYXA7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1tCQ0QtRFJPUERPV05dIEtleSBtYXAgaXMgbm93JywgdGhpcy5rZXlNYXApO1xuICAgICAgICAvL3RoaXMuc2VsZWN0QnlTdHJpbmcoU2V0dGluZ3NHcmlkLmdldFNldHRpbmcodGhpcy5zZXR0aW5nc1BhdGgsIHRoaXMuc2V0dGluZ0tleSkgPz8gJycpO1xuICAgICAgICBzZXR0aW5nc1RvVXBkYXRlLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RCeVN0cmluZyhTZXR0aW5nc0dyaWQuZ2V0U2V0dGluZyh0aGlzLnNldHRpbmdzUGF0aCwgdGhpcy5zZXR0aW5nS2V5KSA/PyAnJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHNlbGVjdEJ5U3RyaW5nKG9wdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1tCQ0QtRFJPUERPV05dIFNlbGVjdGluZyBieSBzdHJpbmcnLCBvcHRpb24sICdha2EnLCB0aGlzLmtleU1hcD8uW29wdGlvbl0sIHtrZXlNYXA6IHRoaXMua2V5TWFwfSk7XG4gICAgICAgIHN1cGVyLnNlbGVjdEJ5U3RyaW5nKHRoaXMua2V5TWFwW29wdGlvbl0gPz8gb3B0aW9uKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBvcHRpb25zKCk6IG9wdGlvbk9iaiB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IG9wdGlvbk9iaiA9IHt9O1xuICAgICAgICBPYmplY3QuZW50cmllczxzdHJpbmc+KEpTT04ucGFyc2UodGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3B0aW9ucycpID8/ICdbXScpKS5mb3JFYWNoKChbbGl0ZXJhbE5hbWUsIHByZXR0eU5hbWVdKSA9PiB7XG4gICAgICAgICAgICBvcHRpb25zW3ByZXR0eU5hbWUudG9TdHJpbmcoKV0gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NHcmlkLnNldFNldHRpbmcodGhpcy5zZXR0aW5nc1BhdGgsIHRoaXMuc2V0dGluZ0tleSwgbGl0ZXJhbE5hbWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnW0JDRC1EUk9QRE9XTl0gQWRkaW5nIG9wdGlvbicsIGxpdGVyYWxOYW1lLCAnYWthJywgcHJldHR5TmFtZSk7XG4gICAgICAgICAgIHRoaXMua2V5TWFwID8/PSB7fTtcbiAgICAgICAgICAgIHRoaXMua2V5TWFwW2xpdGVyYWxOYW1lXSA9IHByZXR0eU5hbWU7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdbQkNELURST1BET1dOXSBLZXkgbWFwIGlzIG5vdycsIHRoaXMua2V5TWFwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlbXBLZXlNYXAgPSB0aGlzLmtleU1hcDtcblxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG59XG5iY2RDb21wb25lbnRzLnB1c2goQkNEU2V0dGluZ3NEcm9wZG93bik7XG53aW5kb3cuQkNEU2V0dGluZ3NEcm9wZG93biA9IEJDRFNldHRpbmdzRHJvcGRvd247XG5cblxuXG4vKiQkJCQkXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcXG4kJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJCB8XG4kJCAvICBcXF9ffCAkJCQkJCRcXCAgJCQkJCQkXFwkJCQkXFwgICAkJCQkJCRcXCAgICQkJCQkJFxcICAkJCQkJCQkXFwgICAkJCQkJCRcXCAgJCQkJCQkJFxcICAkJCQkJCRcXFxuJCQgfCAgICAgICQkICBfXyQkXFwgJCQgIF8kJCAgXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkICBfXyQkXFwgJCQgIF9fJCRcXCAkJCAgX18kJFxcIFxcXyQkICBffFxuJCQgfCAgICAgICQkIC8gICQkIHwkJCAvICQkIC8gJCQgfCQkIC8gICQkIHwkJCAvICAkJCB8JCQgfCAgJCQgfCQkJCQkJCQkIHwkJCB8ICAkJCB8ICAkJCB8XG4kJCB8ICAkJFxcICQkIHwgICQkIHwkJCB8ICQkIHwgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfCQkICAgX19fX3wkJCB8ICAkJCB8ICAkJCB8JCRcXFxuXFwkJCQkJCQgIHxcXCQkJCQkJCAgfCQkIHwgJCQgfCAkJCB8JCQkJCQkJCAgfFxcJCQkJCQkICB8JCQgfCAgJCQgfFxcJCQkJCQkJFxcICQkIHwgICQkIHwgIFxcJCQkJCAgfFxuIFxcX19fX19fLyAgXFxfX19fX18vIFxcX198IFxcX198IFxcX198JCQgIF9fX18vICBcXF9fX19fXy8gXFxfX3wgIFxcX198IFxcX19fX19fX3xcXF9ffCAgXFxfX3wgICBcXF9fX18vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQkIHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9ffFxuXG4kJCQkJCQkXFwgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICAgICAgICAgICAkJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXCAgICAgJCRcXFxuJCQgIF9fJCRcXCAgICAgICAgICAgICAgICAgICAgIFxcX198ICAgICAgICAgICAgJCQgfCAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfCAgICBcXF9ffFxuJCQgfCAgJCQgfCAkJCQkJCRcXCAgICQkJCQkJFxcICAkJFxcICAkJCQkJCQkXFwgJCQkJCQkXFwgICAgJCQkJCQkXFwgICAkJCQkJCRcXCAgJCQkJCQkXFwgICAkJFxcICAkJCQkJCRcXCAgJCQkJCQkJFxcXG4kJCQkJCQkICB8JCQgIF9fJCRcXCAkJCAgX18kJFxcICQkIHwkJCAgX19fX198XFxfJCQgIF98ICAkJCAgX18kJFxcICBcXF9fX18kJFxcIFxcXyQkICBffCAgJCQgfCQkICBfXyQkXFwgJCQgIF9fJCRcXFxuJCQgIF9fJCQ8ICQkJCQkJCQkIHwkJCAvICAkJCB8JCQgfFxcJCQkJCQkXFwgICAgJCQgfCAgICAkJCB8ICBcXF9ffCAkJCQkJCQkIHwgICQkIHwgICAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8XG4kJCB8ICAkJCB8JCQgICBfX19ffCQkIHwgICQkIHwkJCB8IFxcX19fXyQkXFwgICAkJCB8JCRcXCAkJCB8ICAgICAgJCQgIF9fJCQgfCAgJCQgfCQkXFwgJCQgfCQkIHwgICQkIHwkJCB8ICAkJCB8XG4kJCB8ICAkJCB8XFwkJCQkJCQkXFwgXFwkJCQkJCQkIHwkJCB8JCQkJCQkJCAgfCAgXFwkJCQkICB8JCQgfCAgICAgIFxcJCQkJCQkJCB8ICBcXCQkJCQgIHwkJCB8XFwkJCQkJCQgIHwkJCB8ICAkJCB8XG5cXF9ffCAgXFxfX3wgXFxfX19fX19ffCBcXF9fX18kJCB8XFxfX3xcXF9fX19fX18vICAgIFxcX19fXy8gXFxfX3wgICAgICAgXFxfX19fX19ffCAgIFxcX19fXy8gXFxfX3wgXFxfX19fX18vIFxcX198ICBcXF9ffFxuICAgICAgICAgICAgICAgICAgICAkJFxcICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICBcXCQkJCQkJCAgfFxuICAgICAgICAgICAgICAgICAgICAgXFxfX19fXyovXG5cblxuXG4vKiogUmVnaXN0ZXJzIGEgc2luZ2xlIE1ETCBjb21wb25lbnQgdGhhdCBoYXMgdGhlIHN0YXRpYyByZWFkb25seSBwcm9wZXJ0aWVzIGBjc3NDbGFzc2AgYW5kIGBhc1N0cmluZ2AgZGVmaW5lZFxuICAgIEBwYXJhbSBjb21wb25lbnQgVGhlIEJDRENvbXBvbmVudCB0byByZWdpc3RlclxuICAgIEB0aHJvd3Mgbm90aGluZyAtIHRoaXMgZnVuY3Rpb24gZ3JhY2VmdWxseSBoYW5kbGVzIGVycm9ycyBpbiB0aGUgZm9ybSBvZiBgY29uc29sZS5lcnJvcmAgY2FsbHMgaW5zdGVhZCBvZiB0aHJvd2luZyBhY3R1YWwgZXJyb3JzXG4gICAgQHJldHVybnMgd2hldGhlciBvciBub3QgYW4gZXJyb3Igb2NjdXJyZWQgd2l0aCB0aGUgZXJyb3IgYXMgdGhlIHJldHVybiB2YWx1ZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJDRENvbXBvbmVudChjb21wb25lbnQ6QkNEQ29tcG9uZW50SSk6Ym9vbGVhbnxFcnJvciB7XG4gICAgdHJ5e1xuXG4gICAgICAgIG1kbC5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBjb21wb25lbnQsXG4gICAgICAgICAgICBjbGFzc0FzU3RyaW5nOiBjb21wb25lbnQuYXNTdHJpbmcsXG4gICAgICAgICAgICBjc3NDbGFzczogY29tcG9uZW50LmNzc0NsYXNzLFxuICAgICAgICAgICAgd2lkZ2V0OiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgbWRsLmNvbXBvbmVudEhhbmRsZXIudXBncmFkZUVsZW1lbnRzKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29tcG9uZW50LmNzc0NsYXNzKSk7XG5cbiAgICB9Y2F0Y2goZTp1bmtub3duKXtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIltCQ0QtQ29tcG9uZW50c10gRXJyb3IgcmVnaXN0ZXJpbmcgY29tcG9uZW50XCIsIGNvbXBvbmVudC5hc1N0cmluZywgXCJ3aXRoIGNsYXNzXCIsIGNvbXBvbmVudC5jc3NDbGFzcywgXCI6XFxuXCIsIGUpO1xuICAgICAgICByZXR1cm4gZSBhcyBFcnJvcjtcblxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKiogVGVsbCBNREwgYWJvdXQgb3VyIHNoaW55IG5ldyBjb21wb25lbnRzXG4gICAgQHBhcmFtIGNvbXBvbmVudHMgVGhlIGNvbXBvbmVudHMgdG8gcmVnaXN0ZXIuIERlZmF1bHRzIHRvIHRoZSBnbG9iYWwgYmNkQ29tcG9uZW50cyBhcnJheSBpZiBub3Qgc3BlY2lmaWVkLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJDRENvbXBvbmVudHMoLi4uY29tcG9uZW50czpCQ0RDb21wb25lbnRJW10pOnZvaWR7XG5cbiAgICBjb25zdCBjb21wb25lbnRBcnIgPSBjb21wb25lbnRzLmxlbmd0aCA/IGNvbXBvbmVudHMgOiBiY2RDb21wb25lbnRzO1xuXG4gICAgLy8gVGVsbCBtZGwgYWJvdXQgb3VyIHNoaW55IG5ldyBjb21wb25lbnRzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wb25lbnRBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVnaXN0ZXJCQ0RDb21wb25lbnQoY29tcG9uZW50QXJyW2ldISk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmRlYnVnKFwiW0JDRC1Db21wb25lbnRzXSBSZWdpc3RlcmVkIHRoZSBmb2xsb3dpbmcgY29tcG9uZW50czpcIiwgY29tcG9uZW50QXJyLm1hcChjID0+IGBcXG4gICAgJHtjLmFzU3RyaW5nfWApLmpvaW4oJycpKTtcbn1cbi8qXG5cblxuXG4kJCQkJCQkXFwgICAkJCQkJCRcXCAgJCRcXCAgICAgICQkXFwgICAgICAgICAkJCQkJCQkXFwgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCRcXFxuJCQgIF9fJCRcXCAkJCAgX18kJFxcICQkJFxcICAgICQkJCB8ICAgICAgICAkJCAgX18kJFxcICAgICAgICAgICAgICAgICAgICAgICAgICAgJCQgfFxuJCQgfCAgJCQgfCQkIC8gICQkIHwkJCQkXFwgICQkJCQgfCAgICAgICAgJCQgfCAgJCQgfCAkJCQkJCRcXCAgICQkJCQkJFxcICAgJCQkJCQkJCB8JCRcXCAgICQkXFxcbiQkIHwgICQkIHwkJCB8ICAkJCB8JCRcXCQkXFwkJCAkJCB8JCQkJCQkXFwgJCQkJCQkJCAgfCQkICBfXyQkXFwgIFxcX19fXyQkXFwgJCQgIF9fJCQgfCQkIHwgICQkIHxcbiQkIHwgICQkIHwkJCB8ICAkJCB8JCQgXFwkJCQgICQkIHxcXF9fX19fX3wkJCAgX18kJDwgJCQkJCQkJCQgfCAkJCQkJCQkIHwkJCAvICAkJCB8JCQgfCAgJCQgfFxuJCQgfCAgJCQgfCQkIHwgICQkIHwkJCB8XFwkICAvJCQgfCAgICAgICAgJCQgfCAgJCQgfCQkICAgX19fX3wkJCAgX18kJCB8JCQgfCAgJCQgfCQkIHwgICQkIHxcbiQkJCQkJCQgIHwgJCQkJCQkICB8JCQgfCBcXF8vICQkIHwgICAgICAgICQkIHwgICQkIHxcXCQkJCQkJCRcXCBcXCQkJCQkJCQgfFxcJCQkJCQkJCB8XFwkJCQkJCQkIHxcblxcX19fX19fXy8gIFxcX19fX19fLyBcXF9ffCAgICAgXFxfX3wgICAgICAgIFxcX198ICBcXF9ffCBcXF9fX19fX198IFxcX19fX19fX3wgXFxfX19fX19ffCBcXF9fX18kJCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkJFxcICAgJCQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwkJCQkJCQgIHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXF9fX19fXy9cbiQkJCQkJFxcICAgICAgICAgICAkJFxcICAgJCRcXCAgICAgJCRcXCAgICAgICAgICAgJCRcXCAkJFxcICAgICAgICAgICAgICAgICAgICAgICAkJFxcICAgICAkJFxcXG5cXF8kJCAgX3wgICAgICAgICAgXFxfX3wgICQkIHwgICAgXFxfX3wgICAgICAgICAgJCQgfFxcX198ICAgICAgICAgICAgICAgICAgICAgICQkIHwgICAgXFxfX3xcbiAgJCQgfCAgJCQkJCQkJFxcICAkJFxcICQkJCQkJFxcICAgJCRcXCAgJCQkJCQkXFwgICQkIHwkJFxcICQkJCQkJCQkXFwgICQkJCQkJFxcICAkJCQkJCRcXCAgICQkXFwgICQkJCQkJFxcICAkJCQkJCQkXFxcbiAgJCQgfCAgJCQgIF9fJCRcXCAkJCB8XFxfJCQgIF98ICAkJCB8IFxcX19fXyQkXFwgJCQgfCQkIHxcXF9fX18kJCAgfCBcXF9fX18kJFxcIFxcXyQkICBffCAgJCQgfCQkICBfXyQkXFwgJCQgIF9fJCRcXFxuICAkJCB8ICAkJCB8ICAkJCB8JCQgfCAgJCQgfCAgICAkJCB8ICQkJCQkJCQgfCQkIHwkJCB8ICAkJCQkIF8vICAkJCQkJCQkIHwgICQkIHwgICAgJCQgfCQkIC8gICQkIHwkJCB8ICAkJCB8XG4gICQkIHwgICQkIHwgICQkIHwkJCB8ICAkJCB8JCRcXCAkJCB8JCQgIF9fJCQgfCQkIHwkJCB8ICQkICBfLyAgICQkICBfXyQkIHwgICQkIHwkJFxcICQkIHwkJCB8ICAkJCB8JCQgfCAgJCQgfFxuJCQkJCQkXFwgJCQgfCAgJCQgfCQkIHwgIFxcJCQkJCAgfCQkIHxcXCQkJCQkJCQgfCQkIHwkJCB8JCQkJCQkJCRcXCBcXCQkJCQkJCQgfCAgXFwkJCQkICB8JCQgfFxcJCQkJCQkICB8JCQgfCAgJCQgfFxuXFxfX19fX198XFxfX3wgIFxcX198XFxfX3wgICBcXF9fX18vIFxcX198IFxcX19fX19fX3xcXF9ffFxcX198XFxfX19fX19fX3wgXFxfX19fX19ffCAgIFxcX19fXy8gXFxfX3wgXFxfX19fX18vIFxcX198ICBcXF9ffFxuXG5cblxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGJjZF91bml2ZXJzYWxKU19pbml0KCk6dm9pZCB7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUmVnaXN0ZXIgYWxsIHRoZSB0aGluZ3MhXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHJlZ2lzdGVyQkNEQ29tcG9uZW50cygpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE1vZGlmeSBsaW5rcyBub3QgaW4gdGhlIG1haW4gbmF2IHRvIG5vdCBzZW5kIGEgcmVmZXJyZXJcbiAgICAvLyAoYWxsb3dzIGZvciBmYW5jeSBkcmF3ZXIgc3R1ZmYpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGZvciAoY29uc3QgbGluayBvZiBbLi4uZG9jdW1lbnQubGlua3NdKXtcbiAgICAgICAgaWYgKHdpbmRvdy5sYXlvdXQuZHJhd2VyXz8uY29udGFpbnMobGluaykpIGxpbmsucmVsICs9IFwiIG5vb3BlbmVyXCI7XG4gICAgICAgIGVsc2UgbGluay5yZWwgKz0gXCIgbm9vcGVuZXIgbm9yZWZlcnJlclwiO1xuICAgIH1cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBSYW5kb20gdGV4dCB0aW1lIVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIGNvbnN0IHJhbmRvbVRleHRGaWVsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmFuZG9taXplZC10ZXh0LWZpZWxkXCIpO1xuICAgIGlmICghcmFuZG9tVGV4dEZpZWxkKSB0aHJvdyBuZXcgRXJyb3IoXCJObyByYW5kb20gdGV4dCBmaWVsZCBmb3VuZCFcIik7XG5cbiAgICBjb25zdCBxdW90ZSA9IHF1b3Rlcy5nZXRSYW5kb21RdW90ZSgpO1xuICAgIHJhbmRvbVRleHRGaWVsZC5pbm5lckhUTUwgPSB0eXBlb2YgcXVvdGUgPT09IFwic3RyaW5nXCIgPyBxdW90ZSA6IHF1b3RlWzFdITtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBJbXBvcnQgTGF6eS1Mb2FkZWQgU3R5bGVzXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGFmdGVyRGVsYXkoMTAwLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhenlTdHlsZXMgPSBKU09OLnBhcnNlKGBbJHtkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGF6eS1zdHlsZXMnKT8uaW5uZXJUZXh0ID8/ICcnfV1gKSBhcyBzdHJpbmdbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHN0eWxlIG9mIGxhenlTdHlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgICAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICAgICAgICAgIGxpbmsuaHJlZiA9IHN0eWxlO1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdsYXp5LXN0eWxlcy1ub3QtbG9hZGVkJyk7XG4gICAgICAgIHdpbmRvdy5sYXp5U3R5bGVzTG9hZGVkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTZXQgbWFpbiBjb250ZW50IGRpdiB0byByZXNwZWN0IHRoZSBmb290ZXIgZm9yIG1vYmlsZVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIE5PVEU6IFRoaXMgY29kZSBoYXMgYmVlbiBjb21waWxlZCwgbWluaWZpZWQsIGFuZCByZWxvY2F0ZWQgdG8gdGhlIHBhZ2UgSFRNTCBpdHNlbGZcblxuICAgIC8vY29uc3QgZm9vdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvb3RlcicpIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgIC8vXG4gICAgLy9pZiAoIWZvb3RlcikgdGhyb3cgbmV3IEVycm9yKCdObyBtYWluIG9yIGZvb3RlciBkaXYgZm91bmQhJyk7XG4gICAgLy9mdW5jdGlvbiByZXNpemVNYWluKCkge1xuICAgIC8vICAgIGNvbnN0IGZvb3RlckhlaWdodCA9IChmb290ZXIhLmZpcnN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50KT8ub2Zmc2V0SGVpZ2h0ID8/IDA7XG4gICAgLy8gICAgZm9vdGVyIS5zdHlsZS5oZWlnaHQgPSBgJHtmb290ZXJIZWlnaHR9cHhgO1xuICAgIC8vfVxuICAgIC8vY29uc3QgY29udFJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHJlc2l6ZU1haW4pO1xuICAgIC8vcmVzaXplTWFpbigpO1xuICAgIC8vY29udFJlc2l6ZU9ic2VydmVyLm9ic2VydmUoZm9vdGVyLmZpcnN0RWxlbWVudENoaWxkID8/IGZvb3Rlcik7XG59XG53aW5kb3cuYmNkX2luaXRfZnVuY3Rpb25zLnVuaXZlcnNhbCA9IGJjZF91bml2ZXJzYWxKU19pbml0O1xuIl19