if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        localCoord = position.coords;
        objLocalCoord = {
            lat: localCoord.latitude,
            lng: localCoord.longitude,
        };

        let platform = new H.service.Platform({
            apikey: window.hereApiKey,
        });

        let defaultLayers = platform.createDefaultLayers();

        let map = new H.Map(
            document.getElementById("mapContainer"),
            defaultLayers.vector.normal.map,
            {
                zoom: 13,
                center: objLocalCoord,
                pixelRatio: window.devicePixelRatio || 1,
            }
        );
        window.addEventListener("resize", () => map.getViewPort().resize());
        let ui = H.ui.UI.createDefault(map, defaultLayers);
        let mapEvents = new H.mapevents.MapEvents(map);
        let behavior = new H.mapevents.Behavior(mapEvents);
        // zoom setting
        let mapSettings = ui.getControl("mapsettings");
        let zoom = ui.getControl("zoom");
        let scalebar = ui.getControl("scalebar");

        mapSettings.setAlignment("top-left");
        zoom.setAlignment("top-left");
        scalebar.setAlignment("top-left");
        // Draggable marker functions
        function addDragableMarker(map, behavior) {
            let inputLat = document.getElementById("lat");
            let inputLng = document.getElementById("lng");

            if (inputLat.value != "" && inputLng.value != "") {
                objLocalCoord = {
                    lat: inputLat.value,
                    lng: inputLng.value,
                };
            }
            let marker = new H.map.Marker(objLocalCoord, {
                volatility: true,
            });
            marker.draggable = true;
            map.addObject(marker);

            map.addEventListener(
                "dragstart",
                function (ev) {
                    let target = ev.target,
                        pointer = ev.currentPointer;
                    if (target instanceof H.map.Marker) {
                        let targetPosition = map.geoToScreen(
                            target.getGeometry()
                        );
                        target["offset"] = new H.math.Point(
                            pointer.viewportX - targetPosition.x,
                            pointer.viewportY - targetPosition.y
                        );
                        behavior.disable();
                    }
                },
                false
            );

            map.addEventListener(
                "drag",
                function (ev) {
                    let target = ev.target,
                        pointer = ev.currentPointer;
                    if (target instanceof H.map.Marker) {
                        target.setGeometry(
                            map.screenToGeo(
                                pointer.viewportX - target["offset"].x,
                                pointer.viewportY - target["offset"].y
                            )
                        );
                    }
                },
                false
            );

            map.addEventListener(
                "dragend",
                function (ev) {
                    let target = ev.target;
                    if (target instanceof H.map.Marker) {
                        behavior.enable();
                        let resultCoord = map.screenToGeo(
                            ev.currentPointer.viewportX,
                            ev.currentPointer.viewportY
                        );
                        // console.log(resultCoord)
                        inputLat.value = resultCoord.lat.toFixed(5);
                        inputLng.value = resultCoord.lng.toFixed(5);
                    }
                },
                false
            );
        }

        if (window.action == "submit") {
            addDragableMarker(map, behavior);
        }

        // browse location codespace
        let spaces = [];

        const fetchSpaces = function (latitude, longitude, radius) {
            return new Promise(function (resolve, reject) {
                resolve(
                    fetch(
                        `/api/spaces?lat=${latitude}&lng=${longitude}&rad=${radius}`
                    )
                        .then((res) => res.json())
                        .then(function (data) {
                            data.forEach(function (value, index) {
                                let marker = new H.map.Marker({
                                    lat: value.latitude,
                                    lng: value.longitude,
                                });
                                spaces.push(marker);
                            });
                        })
                );
            });
        };

        function clearSpace() {
            map.removeObjects(spaces);
            spaces = [];
        }

        function init(latitude, longitude, radius) {
            clearSpace();
            fetchSpaces(latitude, longitude, radius).then(function () {
                map.addObjects(spaces);
            });
        }

        if (window.action == "browse") {
            map.addEventListener(
                "dragend",
                function (ev) {
                    let resultCoord = map.screenToGeo(
                        ev.currentPointer.viewportX,
                        ev.currentPointer.viewportY
                    );
                    init(resultCoord.lat, resultCoord.lng, 20);
                },
                false
            );
            init(objLocalCoord.lat, objLocalCoord.lng, 20);
        }

        // Route locations
        let urlParams = new URLSearchParams(window.location.search);

        function calculateRouteAtoB(platform) {
            let router = platform.getRoutingService(),
                routeRequestParam = {
                    mode: "fastest;car",
                    representation: "display",
                    routeattributes: "summary",
                    maneuverattributes: "direction,action",
                    waypoint0: urlParams.get("from"),
                    waypoint1: urlParams.get("to"),
                };

            router.calculateRoute(routeRequestParam, onSuccess, onError);
        }

        function onSuccess(result) {
            route = result.response.route[0];

            addRouteShapeToMap(route);
            addSummaryToPanel(route.summary);
        }

        function onError(err) {
            alert("Can't reach the remote server" + err);
        }

        function addRouteShapeToMap(route) {
            let linestring = new H.geo.LineString(),
                routeShape = route.shape,
                startPoint,
                endPoint,
                polyline,
                routeline,
                svgStartMark,
                iconStart,
                startMarker,
                svgEndMark,
                iconEnd,
                endMarker;

            routeShape.forEach(function (point) {
                let parts = point.split(",");
                linestring.pushLatLngAlt(parts[0], parts[1]);
            });
            startPoint = route.waypoint[0].mappedPosition;
            endPoint = route.waypoint[1].mappedPosition;
            polyline = new H.map.Polyline(linestring, {
                style: {
                    lineWidth: 5,
                    strokeColor: "#5d54a4",
                    lineTailCap: "arrow-tail",
                    lineHeadCap: "arrow-head",
                },
            });

            routeline = new H.map.Polyline(linestring, {
                style: {
                    lineWidth: 5,
                    fillColor: "white",
                    strokeColor: "rgba(255,255,255,1)",
                    lineDash: [0, 2],
                    lineTailCap: "arrow-tail",
                    lineHeadCap: "arrow-head",
                },
            });

            svgStartMark = `<svg id="Capa_1" enable-background="new 0 0 511 511" height="512" viewBox="0 0 511 511" width="512" xmlns="http://www.w3.org/2000/svg"><g><circle cx="255.5" cy="225" r="136"/><path d="m415.306 66.193c-42.685-42.685-99.439-66.193-159.806-66.193s-117.121 23.508-159.806 66.193c-42.686 42.687-66.194 99.44-66.194 159.807 0 106.499 74.454 198.443 177.887 220.849l48.113 64.151 48.114-64.152c103.432-22.406 177.886-114.349 177.886-220.848 0-60.367-23.508-117.12-66.194-159.807zm-159.806-7.193c91.533 0 166 74.468 166 166s-74.467 166-166 166-166-74.468-166-166 74.467-166 166-166z"/></g></svg>`;

            iconStart = new H.map.Icon(svgStartMark, {
                size: { h: 45, w: 45 },
            });
            startMarker = new H.map.Marker(
                {
                    lat: startPoint.latitude,
                    lng: startPoint.longitude,
                },
                { icon: iconStart }
            );

            svgEndMark = `<svg id="Capa_1" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m482 226c0-124.816-101.184-226-226-226l-113 226 113 286 49.008-65.345c101.251-22.389 176.992-112.67 176.992-220.655z" fill="#cc3245"/><path d="m30 226c0 107.985 75.741 198.266 176.991 220.655l49.009 65.345v-512c-124.816 0-226 101.184-226 226z" fill="#ff3e3a"/><path d="m256 60-83 166 83 166c91.679 0 166-74.321 166-166s-74.321-166-166-166z" fill="#c4f3ff"/><path d="m90 226c0 91.679 74.321 166 166 166v-332c-91.679 0-166 74.321-166 166z" fill="#fff"/></g></svg>`;

            iconEnd = new H.map.Icon(svgEndMark, {
                size: { h: 45, w: 45 },
            });
            endMarker = new H.map.Marker(
                {
                    lat: endPoint.latitude,
                    lng: endPoint.longitude,
                },
                { icon: iconEnd }
            );

            // add polyline to the map
            map.addObjects([polyline, routeline, startMarker, endMarker]);

            // add zoom to bounding rectangle
            map.getViewModel().setLookAtData({
                bounds: polyline.getBoundingBox(),
            });
        }

        function addSummaryToPanel(summary) {
            const sumDiv = document.getElementById("summary");
            const markup = `
                <ul> 
                    <li> Total Distance: ${summary.distance / 1000}Km</li>
                    <li> Travel Time: ${summary.travelTime.toMMSS()} (In Current Traffic)</li>
                </ul>
            `;

            sumDiv.innerHTML = markup;
        }

        if (window.action == "direction") {
            calculateRouteAtoB(platform);
            Number.prototype.toMMSS = function () {
                return (
                    Math.floor(this / 60) +
                    " minutes " +
                    (this % 60) +
                    " seconds. "
                );
            };
        }
    });
    // open url direction
    function openDirection(lat, lng, id) {
        window.open(
            `/space/${id}?from=${objLocalCoord.lat},${objLocalCoord.lng}&to=${lat},${lng}`,
            "_self"
        );
    }
} else {
    console.error("Geolocation is not support for this browser!");
}
