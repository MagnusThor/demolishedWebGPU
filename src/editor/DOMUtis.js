"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMUtils = void 0;
class DOMUtils {
    static get(query, parent) {
        return parent ? parent.querySelector(query) : document.querySelector(query);
    }
    static getAll(query, parent) {
        var results = new Array();
        let queryResult = parent ? parent.querySelectorAll(query) : document.querySelectorAll(query);
        for (let i = 0; i < queryResult.length; i++)
            results.push(queryResult.item(i));
        return results;
    }
    static on(event, element, fn, options) {
        typeof (element) === "string" ? element = DOMUtils.get(element) : element = element;
        element.addEventListener(event, (e) => {
            fn(e, element);
        }, options);
        return element;
    }
    static removeChilds(parent) {
        while (parent.firstChild) {
            parent.firstChild.remove();
        }
    }
    static toggleClasses(element, classes) {
        typeof (element) === "string" ? element = DOMUtils.get(element) : element = element;
        classes.forEach(className => {
            element.classList.toggle(className);
        });
        return this;
    }
    static create(p, textContent, attr) {
        let node;
        typeof (p) === "string" ? node = document.createElement(p) : node = p;
        if (textContent)
            node.textContent = textContent;
        if (attr) {
            Object.keys(attr).forEach((k) => {
                node.setAttribute(k, attr[k]);
            });
        }
        return node;
    }
    static prettify(text) {
        let result = text.replace(/^["'](.+(?=["']$))["']$/, '$1'); // remove qoutes at start and end of string
        return result;
    }
    static linkify(text) {
        text = DOMUtils.prettify(text);
        const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(regex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }
    static toDOM(html) {
        var d = document, i, a = d.createElement("div"), b = d.createDocumentFragment();
        a.innerHTML = html;
        while (i = a.firstChild)
            b.appendChild(i);
        return b;
    }
}
exports.DOMUtils = DOMUtils;
