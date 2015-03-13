hw2.define([
    "hw2!PATH_JS_LIB:browser/router/include.js",
    "hw2!PATH_JS_LIB:browser/uri/Uri.js",
    "hw2!PATH_JS_LIB:browser/event/EventHandler.js"
], function Router () {
    var $ = this;

    return $.Router = $.class.extends($.Object)([
        /**
         * Private variables
         */
        $.private({
            routeInfo: null,
            isSpa: false,
            eventHandler: false
        }),
        /**
         * Internal Class
         */
        $.public.static({RouteInfo: $.class([
                $.private({
                    uri: null,
                    component: null,
                    path: null,
                    params: null
                }),
                $.public({
                    __construct: function (uri, component, path, params) {
                        this._i.uri = uri;
                        this._i.component = component;
                        this._i.path = path;
                        this._i.params = params;
                    },
                    getUri: function () {
                        return this._i.uri;
                    },
                    getComponent: function () {
                        return this._i.component;
                    },
                    getPath: function () {
                        return this._i.path;
                    },
                    getParams: function () {
                        return this._i.params;
                    },
                    /**
                     * rebuild the route
                     * @returns {String}
                     */
                    getRoute: function () {
                        return this._i.component + "/" + this._i.path.join("/") + "?" + this._i.params.join("=");
                    }
                })
            ])
        }),
        /**
         * Public members
         */
        $.public({
            __construct: function (isSpa) {
                var that=this;
                this._i.isSpa = isSpa;
                this._i.eventHandler = new $.EventHandler();

                var uri = $.Browser.Uri.I(false, isSpa);

                var route = "";
                if (isSpa) {
                    route = this._i.uri.getFragment();
                } else {
                    //[TODO] must be undecoded
                    // var undecoded=undecodefunction(this._i.uri.getParam("_escaped_fragment_"));
                    //$.Uri.parseUrl(undecoded);
                }

                var pInfo = route.path.split("/");
                var component = pInfo[0] || "main";
                var path = pInfo.length > 1 ? pInfo.slice(1) : "";

                this._i.routeInfo = new this.s.RouteInfo(uri, component, path, route.getParsedQuery());

                /**
                 * back or forward browser events
                 */
                window.addEventListener("popstate", function (e) {
                    // [TODO] update routeInfo and cast update trigger
                });
            },
            addListner: function (obj) {
                this._i.eventHandler.bind(obj);
            },
            removeListner: function (obj) {
                this._i.eventHandler.unbind(obj);
            },
            updateParams: function (params, remove, refresh, search) {
                if (typeof search === "undefined")
                    search = document.location.search.substr(1);

                $.Browser.JQ.each(params, function (key, value) {
                    search = this._s.updateParam(search, key, value, remove);
                });

                //this will reload the page, it's likely better to store this until finished
                if (refresh)
                    document.location.search = search;
                else
                    window.history.pushState("", "", document.location.pathname + "?" + search);
            },
            updateParam: function (key, value, remove, refresh, search) {
                var tmp = {};
                tmp[key] = value;
                this.s.updateParams(tmp, remove, refresh, search);
            },
            setRoute: function (element, routeInfo, reload) {
                var that = this;
                if (typeof element === 'string') {
                    element = document.querySelector(element);
                }

                if (!element) {
                    throw new Error("This element is not valid!");
                }

                function update () {
                    if (reload) {
                        window.location.assign(routeInfo.getUri().toString());
                    } else {
                        var urlPath="";
                        var results=that._i.eventHandler.trigger("update", routeInfo);
                        urlPath=buildUrl(results);
                    }
                }

                if (reload && element.tagName.toUppercase() === "A") {
                    element.href = routeInfo.getUri().toString();
                } else {
                    element.addEventListener("click", update);
                }
            },

            /**
             * 
             * @param {type} path
             * @param {type} params
             * @param {type} component : if not specified, use the current one
             * @returns {undefined}
             */
            createRoute: function (path, params, component) {
                var uri = ""; //updateuri;
                this._i.routeInfo = new this.s.RouteInfo(uri, component || this._i.routeInfo.getComponent(), path, params);
            },
            jump: function (h) {
                var top = document.getElementById(h).offsetTop;
                window.scrollTo(0, top);
            }
        })
    ]);
});