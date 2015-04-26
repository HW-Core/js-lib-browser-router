hw2.define([
    "hw2!{PATH_JS_LIB}browser/router/include.js",
    "hw2!{PATH_JS_LIB}browser/uri/Uri.js",
    "hw2!{PATH_JS_LIB}browser/event/EventHandler.js"
], function Router () {
    var $ = this;

    return $.Router = $.class.extends($.Object)(
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
            $.public.static({RouteInfo: $.class.extends($.Browser.Uri)(
                        $.private({
                            isSpa: null,
                            route: null
                        }),
                        $.public({
                            __construct: function (isSpa) {
                                this.__super(isSpa);

                                this._i.isSpa = isSpa;
                                this._i.route = isSpa && this._i.fragment(true) || this._i;
                            },
                            getComponent: function () {
                                return this._i.route.segmentCoded(0);
                            },
                            setComponent: function (component) {
                                return this._i.route.segmentCoded(0, component);
                            },
                            getPath: function () {
                                return this._i.route.pathname().slice(1);
                            },
                            setPath: function (path) {
                                var component = this._i.getComponent();
                                return this._i.route.pathname(component + "/" + path);
                            },
                            getParams: function () {
                                return this._i.route.search(true);
                            },
                            setParams: function (info) {
                                return this._i.route.search(info);
                            },
                            getRoute: function () {
                                return this._i.route;
                            }
                        })
                        )
            }),
            /**
             * Public members
             */
            $.public({
                __construct: function (isSpa) {
                    var that = this;
                    this._i.isSpa = isSpa;
                    this._i.eventHandler = new $.EventHandler();
                    this._i.routeInfo = new this.s.RouteInfo(isSpa);

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
                setRouteByUrl: function (element, uri, reload) {
                    var isRoute = $.typeCompare(this.s.RouteInfo, uri, !reload);

                    if (typeof element === 'string') {
                        element = document.querySelector(element);
                    }

                    if (!element)
                        throw new Error("This element is not valid!");

                    if (reload && element.tagName.toUppercase() === "A") {
                        element.href = isRoute && uri.toString() || uri;
                    } else {
                        element.addEventListener("click", this.i.navigateByUrl.bind(this, uri, reload));
                    }
                },
                /**
                 * 
                 * @param {type} element
                 * @param {Object} routeInfo 
                 * component
                 * path
                 * params
                 * @param {type} reload
                 * @returns {undefined}
                 */
                setRoute: function (element, opt, reload) {
                    var route = this._i.buildRoute(opt);

                    this.i.setRouteByUrl(element, route, reload);
                },
                navigateByUrl: function (uri, reload) {
                    var that = this;
                    // if not reload, then typecompare will throw an error if it's not a RouteInfo obj.
                    var isRoute = $.typeCompare(this.s.RouteInfo, uri, !reload);

                    if (reload) {
                        window.location.assign(isRoute ? uri.toString() : uri);
                    } else {

                        var info = this._i.routeInfo.clone();

                        that._i.eventHandler.trigger("beforeUpdate")
                                .then(that._i.eventHandler.trigger("update", info))
                                .then(function (results) {
                                    var params = {};
                                    for (var key in results) {
                                        params = $.ObjUtils.merge(params, results[key]);
                                    }

                                    this._i.routeInfo.setParams(params);
                                    
                                    // update browser url
                                })
                                .then(that._i.eventHandler.trigger("afterUpdate"));
                    }
                },
                /**
                 * 
                 * @param {type} opt
                 * component
                 * path
                 * parameters
                 * @param {type} reload
                 * @returns {undefined}
                 */
                navigate: function (opt, reload) {
                    var route = this._i.buildRoute(opt);
                    this.i.navigateByUrl(route, reload);
                },
                jump: function (h) {
                    var top = document.getElementById(h).offsetTop;
                    window.scrollTo(0, top);
                }
            }),
            $.private({
                buildRoute: function (opt) {
                    var route = this._i.routeInfo.clone();
                    opt.component && route.setComponent(opt.component);
                    opt.path && route.setComponent(opt.path);
                    opt.params && route.setComponent(opt.params);
                    return route;
                }
            })
            );
});