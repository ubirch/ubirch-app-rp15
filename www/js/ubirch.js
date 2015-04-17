function ubirchTopo(mapScale) {
    var MAPS = [
        {
            file: 'img/Finding_Lights_Republica2015_Map_150415_1.svg',
            viewBox: '0 0 670 682',
            transform: 'scale(1.25) translate(-234 -120)'
        },
        {
            file: 'img/Finding_Lights_Republica2015_Map_150415_2.svg',
            viewBox: '0 0 1380 1500',
            transform: 'scale(1.16) translate(10 450)'
        }
    ];
    var REFRESH = 30000,
        mapDimensions = "934.011x661.642".split('x'),
        mapRatio = mapDimensions[0] / mapDimensions[1],
        $app = $('.app'),
        $map = $('.map', $app),
        $detail = $('.detail', $app),
        dayColor = '#333333',
        timeout = null,
        sensors = {};

    function resize() {
        //var mapMaskWidth = $map.width(),
        //    mapMaskHeight = $map.height(),
        //    svg = d3.select('svg');
        //
        //// portrait
        //if(mapMaskWidth < mapMaskHeight){
        //    mapMaskWidth = (mapMaskHeight-25) * mapRatio;
        //    $('svg',$map).css({marginLeft:($map.width() / 2) - (mapMaskWidth / 2)+'px'});
        //// landscape
        //} else {
        //    $('svg',$map).css({marginLeft:''});
        //}
        //
        //svg.attr('width', mapMaskWidth)
        //    .attr('height', mapMaskHeight);

        var height = $detail.height();
        $('.bg', $detail).css({backgroundSize: (height + 50) + "px"});

        var height = $app.height();
        $('.credits .bg').css({maxHeight: (height - 150) + "px"})
    }

    function showDetail(details) {
        var $detailContent = $('.content', $detail),
            className = 'visible',
            countryCode = details.name.toLowerCase(),
            convertCountries = {uk: 'gb'},
            html = '<div class="body">' +
                        '<i class="flag flag-' + (countryCode in convertCountries ? convertCountries[countryCode] : countryCode) + '"></i> ' +
                        details.country +
                        '<div class="colors">' +
                        '<span class="led" style="background-color: rgb('+details.color[0]+',0,0);">'+details.color[0]+'</span>'+
                        '<span class="led" style="background-color: rgb(0,'+details.color[1]+',0);">'+details.color[1]+'</span>'+
                        '<span class="led" style="background-color: rgb(0,0,'+details.color[2]+');">'+details.color[2]+'</span>' +
                        '</div>' +
                    '<p>' + (details.text || 'No text available') + '</p>' +
                    '</div>' ,
            updateContent = function () {
                $detailContent
                    .addClass(className)
                    .html(html);
            };

        if ($detailContent.hasClass(className)) {
            $detailContent.removeClass(className);
            if (timeout != null)
                window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                updateContent();
            }, 600);
        } else
            updateContent();
    }

    (function handleCredits() {
        var $credits = $('.credits'),
            $leaf = $('.leaf', $credits),
            classClose = 'close',
            classOpen = 'is-open',
            classClosed = 'is-closed';

        $credits.on('click', function () {
            if ($credits.hasClass(classOpen)) {
                $leaf.removeClass(classClose);
                $credits.addClass(classClosed);
                $credits.removeClass(classOpen);
                window.setTimeout(function () {
                    $credits.removeClass(classClosed);
                }, 500);
            } else {
                $leaf.addClass(classClose);
                $credits.addClass(classOpen);
            }
        });

        $('a', $credits).on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (app.isPhonegap) {
                window.open($(event.target).attr('href'), '_system', 'location=yes');
            } else {
                window.open($(event.target).attr('href'), '_blank');
            }
        });
    })();

    (function handleDayColor() {
        var dateNow = new Date(),
            hours = dateNow.getHours();

        $map.removeClass('night-time day-time');

        if (hours > 4 && hours < 18) {
            $map.addClass('day-time');
        } else {
            $map.addClass('night-time');
        }
    })();

    function apiLoop(country) {
        var info = sensors[country];
        if (!info) return;
        if (!info['feed']) {
            console.log("WARN: feed for " + country + " is missing!");
            return;
        }
        // check if we have a position 0 == map1, 1 == map2
        if (info['pos'][mapScale].indexOf("path") != 0) {
            console.log("WARN: can't locate position for " + country + "!");
            return;
        }

        $.ajax(info['feed'] + ".json?results=1").done(function (data) {
            var channel = data['channel'], feeds = data['feeds'];
            if (!channel || !feeds || feeds.length == 0) {
                console.log("no data returned for " + country + " feed");
                return;
            }
            try {
                var name = channel['name'];
                if (name != country)
                    console.log("WARN: wrong country queried!");

                var r = feeds[0]['field1'],
                    g = feeds[0]['field2'],
                    b = feeds[0]['field3'];

                d3.select('#' + info['pos'][mapScale])
                    .attr('stroke', '#ffffff')
                    .attr('fill', 'rgb(' + r + "," + g + "," + b + ")")
                    .on('click', function () {
                        showDetail({name: name, country: sensors[name]['country'], text: channel['description'], color: [r,g,b]});
                    });

                $(window).trigger('map:ready');
            } catch (e) {
                console.log(e)
            }
        }).fail(function (e) {
            console.log(e);
        }).always(function () {
            setTimeout(function () {
                apiLoop(country)
            }, REFRESH);
        });
    }

    function handleZoom(forceClose) {
        var className = 'zoom-in',
            middlePointY = $map.height() / 2,
            middlePointX = $map.width() / 2,
            scale = 1,
            transform = {x: 0, y: 0};

        if ($map.hasClass(className) || forceClose) {
            $map.removeClass(className);
            $('svg', $map).css({transform: ''});
        } else {
            $map.addClass(className);
            scale = 1.5;
            if (middlePointY > d3.event.y) {
                transform.y = "15%";
            } else {
                transform.y = "-25%";
            }
            if (middlePointX > d3.event.x) {
                transform.x = "15%";
            } else {
                transform.x = "-15%";
            }
            $('svg', $map).css({transform: 'scale(' + scale + ') translate(' + transform.x + ', ' + transform.y + ')'});
        }
    }

    d3.xml(MAPS[mapScale].file, 'image/svg+xml', function (xml) {
        d3.select($map[0]).node().appendChild(xml.documentElement);
        resize();
        d3.select(window).on('resize', resize);

        d3.select('svg').selectAll('path,rect').on('click', handleZoom);

        // load the sensors
        d3.json("js/sensors.json", function (data) {
            sensors = data;
            $.each(sensors, function (k) {
                setTimeout(function () {
                    apiLoop(k);
                }, 0);
            });
        });

        // prepare map (typ 0 is coarse, type 1 more detailed)
        d3.select($map[0]).select("svg")
            .attr("viewBox", MAPS[mapScale].viewBox)
            .attr("preserveAspectRatio", "xMidYMax meet");

        d3.select($map[0]).select("svg").selectAll("g")
            .attr("transform", MAPS[mapScale].transform);
    });
}
