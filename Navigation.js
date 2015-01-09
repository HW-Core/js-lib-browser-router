/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

hw2.define([
    "hw2!PATH_JS_LIB:browser/router/include.js",
    "hw2!PATH_JS_LIB:browser/uri/Uri.js",
    "hw2!PATH_JS_LIB:browser/event/EventHandler.js"
], function Navigation () {
    var $ = this;
    return $.class([
        /**
         * Private variables
         */
        $.private({
            justLoading: null,
            pages: [],
            selPrefix: null
        }),
        /**
         * Public members
         */
        $.public({
            __construct: function (options) {
                options = options || {};

                /**
                 * Options definitions
                 */
                this._i.pages = options.pages || [];
                this._i.selPrefix = options.selPrefix || ".nav-";
                this._i.tmpl = options.selPrefix || ".nav-";

                /**
                 * back or forward browser events
                 */
                window.addEventListener("popstate", function (e) {
                    this.i.loadPage(this.i.getPage());
                });

                this.i.loadPage(this.getPage());
            },
            attachListner: function () {
                $.Browser.EventHandler.onBodyLoad(function () {
                    this._i.pages.forEach(function (page) {
                        $.Browser.JQ(this._i.selPrefix + page).each(function (id, el) {
                            var element = $.Browser.JQ(el);
                            var evt = $.Browser.JQ._data(el, 'events');
                            if (!evt || !evt.mousedown) {
                                element.mousedown(function (evt) {
                                    if (event.which === 1) // left mouse click
                                        this.i.loadPage(page);
                                });
                            }
                        });
                    });
                });
            },
            loadPage: function (page) {
                if (!this._i.justLoading || this._i.justLoading !== page) {
                    this._i.justLoading = page;
                    $.Browser.Loader.load("pages/" + page + ".html", this.i.attachListner, {selector: "#dyn-content"});
                }
            },
            getPage: function () {
                return new $.Browser.Uri(document.location.href).getFragment() || "home";
            },
            jump: function (h) {
                var top = document.getElementById(h).offsetTop;
                window.scrollTo(0, top);
            }
        })
    ]);
});