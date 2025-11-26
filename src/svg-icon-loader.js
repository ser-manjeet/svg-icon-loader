(function (global) {
    "use strict";

    const SVGIconLoader = {
        cache: new Map(),
        options: {
            selector: ".svg-icon-wrap",
            attribute: "icon",
            urlBase: null,
            warn: true,
        },

        init(customOptions = {}) {
            this.options = { ...this.options, ...customOptions };
            const { selector, attribute } = this.options;

            const elements = document.querySelectorAll(selector);
            if (!elements.length) return;

            elements.forEach(el => {
                const iconName = el.dataset[attribute];
                if (!iconName) return;

                if (this.cache.has(iconName)) {
                    this.inject(el, this.cache.get(iconName));
                    return;
                }

                const inlineScript = document.querySelector(
                    `script[data-icon="${iconName}"]`
                );

                if (inlineScript) {
                    const svg = inlineScript.innerHTML.trim();
                    this.cache.set(iconName, svg);
                    this.inject(el, svg);
                    return;
                }

                if (this.options.urlBase) {
                    this.loadRemote(iconName)
                        .then(svg => {
                            if (svg) this.inject(el, svg);
                        })
                        .catch(err => {
                            if (this.options.warn) {
                                console.warn("[SVGIconLoader] Fetch failed:", err);
                            }
                        });
                    return;
                }

                if (this.options.warn) {
                    console.warn(`[SVGIconLoader] Icon "${iconName}" not found.`);
                }
            });
        },

        inject(el, svg) {
            if (!svg) return;
            el.innerHTML = svg;
        },

        async loadRemote(iconName) {
            const url = `${this.options.urlBase}/${iconName}.svg`;

            const response = await fetch(url);
            if (!response.ok) {
                if (this.options.warn) {
                    console.warn(`[SVGIconLoader] Remote icon "${iconName}" failed.`);
                }
                return null;
            }

            const svg = await response.text();
            this.cache.set(iconName, svg);
            return svg;
        }
    };

    function ready(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(() => SVGIconLoader.init());
    global.SVGIconLoader = SVGIconLoader;

})(window);
