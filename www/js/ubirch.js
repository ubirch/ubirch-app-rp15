function ubirchTopo(mapScale) {
    if (window.analytics) {
        window.analytics.startTrackerWithId('UA-61988119-1');
        window.analytics.trackView('Map View');
    }

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
        $app = $('.app'),
        $map = $('.map', $app),
        $detail = $('.detail', $app),
        updateContentTimeout = null,
        apiLoopTimeout = null,
        sensors = {};

    function resize() {
        $('.bg', $detail).css({backgroundSize: ($detail.height() + 50) + "px"});
        $('.credits .bg').css({maxHeight: ($app.height() - 150) + "px"});

        var winDim = {
                width: $(window).width(),
                height: $(window).height()
            },
            fontSize = 16;

        switch (true) {
            case winDim.width <= 400:
                fontSize = 10;
                break;
            case winDim.width <= 600:
                fontSize = 12;
                break;
            case winDim.width <= 1024:
                fontSize = 14;
                break;
        }

        $('.content', $app).css({fontSize: fontSize + 'px'});
    }

    function showDetail(details) {
        if (window.analytics) window.analytics.trackEvent('location', details.name);
        var $detailContent = $('.content', $detail),
            className = 'visible',
            countryCode = details.name.toLowerCase(),
            convertCountries = {uk: 'gb'},
            countryCodeRight = (countryCode in convertCountries ? convertCountries[countryCode] : countryCode),
            html = '<div class="body">' +
                '<span><i class="flag flag-' + countryCodeRight + '"></i> ' + details.country + '</span>' +
                '<div class="colors">' +
                '<div class="led" style="background-color: rgb(' + details.color[0] + ',0,0);">' + details.color[0] + '</div>' +
                '<div class="led" style="background-color: rgb(0,' + details.color[1] + ',0);">' + details.color[1] + '</div>' +
                '<div class="led" style="background-color: rgb(0,0,' + details.color[2] + ');">' + details.color[2] + '</div>' +
                '</div>' +
                '<p>' + (details.text || 'No text available') + '</p>' +
                '<a class="twitter" data-msg="Finding Europe with Lights #fewl #rp15 #' + countryCodeRight + '" data-href="https://twitter.com/intent/tweet?hashtags=fewl%20%23rp15%20%23' + countryCodeRight + '&text=Finding%20Europe%20with%20Lights&tw_p=tweetbutton&url=http%3A%2F%2Fubirch.com"></a>' +
                '</div>',
            updateContent = function () {
                $detailContent
                    .addClass(className)
                    .html(html);

                handleExternLinks($detailContent);
            };

        if ($detailContent.hasClass(className)) {
            $detailContent.removeClass(className);
            if (updateContentTimeout != null) window.clearTimeout(updateContentTimeout);
            updateContentTimeout = window.setTimeout(function () {
                updateContent();
            }, 600);
        } else
            updateContent();
    }

    (function handleCredits() {
        if (window.analytics) window.analytics.trackView('Credits');

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

        handleExternLinks($credits);
    })();

    function handleExternLinks($parent) {
        $('a[target=_blank]', $parent).on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (window.analytics) window.analytics.trackEvent('link', $(event.target).attr('href'));
            openLink($(event.target).attr('href'));
        });

        $('a.twitter', $parent).on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var element = $(this);
            if (window.analytics) window.analytics.trackEvent('twitter', element.data('href'));
            shareTwitter(element.data('msg'), element.data('href'));
        })
    }

    function openLink(href) {
        if (app.isPhonegap) {
            window.open(href, '_system', 'location=yes');
        } else {
            window.open(href, '_blank');
        }
    }

    function shareTwitter(msg, url) {
        if ('plugins' in window && 'socialsharing' in window.plugins)
            window.plugins.socialsharing.shareViaTwitter(msg);
        else
            openLink(url);
    }

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
                    //.attr('stroke', '#ffffff')
                    .attr('fill', 'rgb(' + r + "," + g + "," + b + ")")
                    .attr('class', 'with-cursor')
                    .on('click', function () {
                        showDetail({
                            name: name,
                            country: sensors[name]['country'],
                            text: channel['description'],
                            color: [r, g, b]
                        });
                    });

                $(window).trigger('map:ready');
            } catch (e) {
                if(window.analytics) window.analytics.trackException(e.message, false);
                console.log(e)
            }
        }).fail(function (e) {
            if(window.analytics) window.analytics.trackException("sensor api failed: "+ e.message, false);
            console.log(e);
        }).always(function () {
            if (apiLoopTimeout != null) window.clearTimeout(apiLoopTimeout);
            apiLoopTimeout = setTimeout(function () {
                apiLoop(country)
            }, REFRESH);
        });
    }

    function handleZoom(direction, forceClose) {
        var className = 'zoomed-in',
            middlePointY = $map.height() / 2,
            middlePointX = $map.width() / 2,
            scale = 1,
            position = [],
            transform = {x: 0, y: 0};

        if (!direction && $map.hasClass(className) || !direction && forceClose) {
            $map.attr('class', 'map');
            $('svg', $map).css({transform: ''});
        } else {
            var opponentDirection = '';
            if (direction) {
                var activeDirection = $map.attr('class').replace('map', '').replace(className, '').replace(/ /g, '');
                switch (true) {
                    case activeDirection === 'south-east':
                        opponentDirection = (direction === 'west') ? 'south' : 'east';
                        break;
                    case activeDirection === 'south-west':
                        opponentDirection = (direction === 'east') ? 'south' : 'west';
                        break;
                    case activeDirection === 'north-east':
                        opponentDirection = (direction === 'west') ? 'north' : 'east';
                        break;
                    case activeDirection === 'north-west':
                        opponentDirection = (direction === 'east') ? 'north' : 'west';
                        break;
                }
            }
            $map.attr('class', 'map');
            $map.addClass(className);
            scale = 2.5;

            if (d3.event != null && middlePointY >= d3.event.y || direction === 'north' || opponentDirection === 'north') {
                transform.y = "15%";
                position.push('north');
            } else if (d3.event != null && middlePointY <= d3.event.y || direction === 'south' || opponentDirection === 'south') {
                transform.y = "-30%";
                position.push('south');
            }
            if (d3.event != null && middlePointX >= d3.event.x || direction === 'west' || opponentDirection === 'west') {
                transform.x = "15%";
                position.push('west');
            } else if (d3.event != null && middlePointX <= d3.event.x || direction === 'east' || opponentDirection === 'east') {
                transform.x = "-15%";
                position.push('east');
            }
            $map.addClass(position.join('-'));
            $('svg', $map).css({transform: 'scale(' + scale + ') translate(' + transform.x + ', ' + transform.y + ')'});
        }
    }

    (function handleZoomDirections() {
        var arrows = $('.arrow', $map);

        arrows.click(function () {
            handleZoom($(this).data('go-to'));
        });
    })();

    d3.xml(MAPS[mapScale].file, 'image/svg+xml', function (xml) {
        d3.select($map[0]).node().appendChild(xml.documentElement);
        resize();
        d3.select(window).on('resize', resize);

        d3.select('svg').selectAll('path,rect').on('click', function () {
            handleZoom();
        });

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
