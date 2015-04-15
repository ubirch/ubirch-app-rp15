function ubirchTopo() {
    var REFRESH = 30000;
    var $app = $('.app'),
        $map = $('.map', $app),
        $detail = $('.detail',$app);

    function resize() {
        var width = d3.select($map[0]).node().getBoundingClientRect().width,
            height = d3.select($map[0]).node().getBoundingClientRect().height,
            svg = d3.select('svg');

        svg
            .attr('width', width)
            .attr('height', height);

        var height = $detail.height();
        $detail.css({backgroundSize:(height+50)+"px"});
    }

    var timeout = null;

    function showDetail(detailData, forceClose) {
        var $detailContent = $('.content', $detail),
            className = 'visible',
			countryCode = detailData.name.toLowerCase(),
			convertCountries = {uk:'gb'},
            html = '<i class="flag flag-'+(countryCode in convertCountries ? convertCountries[countryCode] : countryCode)+'"></i> <span>' + detailData.country + '</span>',
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
            $leaf = $('.leaf',$credits),
            className = 'is-open',
            className2 = 'is-closing';

        $credits.on('click', function(){
            if($credits.hasClass(className)){
                $credits.addClass(className2);
                window.setTimeout(function(){
                    $credits.removeClass(className2);
                    $credits.removeClass(className);
                    $leaf.css({width: '',height: ''});
                },450);
            } else {
                $leaf.css({width: $(window).width(),height: $(window).height()});
                $credits.addClass(className);
            }
        });
    })();

    var sensors = {};

    function apiLoop(country) {
        var info = sensors[country];
        if (!info) return;
        if (!info['feed']) {
            console.log("WARN: feed for "+country+" is missing!");
            return;
        }
        // check if we have a position 0 == map1, 1 == map2
        if(info['pos'][0].indexOf("path") != 0) {
            console.log("WARN: can't locate position for "+country+"!");
            return;
        }

        $.ajax(info['feed']+".json?results=1").done(function (data) {
            var channel = data['channel'], feeds = data['feeds'];
            if(!channel || !feeds || feeds.length == 0) {
                console.log("no data returned for "+country+" feed");
                return;
            }
            try {
                var name = channel['name'];
                if (name != country) console.log("WARN: wrong country queried!");

                var r = feeds[0]['field1'],
                    g = feeds[0]['field2'],
                    b = feeds[0]['field3'];

                d3.select('#' + info['pos'][0])
                    .attr('stroke', '#ffffff')
                    .attr('fill', 'rgb(' + r + "," + g + "," + b + ")")
                    .on('click', function () {
                        showDetail({'name': name, country: channel['description']});
                    });
            } catch(e) {
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

    d3.xml('img/Finding_Lights_Republica2015_Map_150415_1.svg', 'image/svg+xml', function (xml) {
        d3.select($map[0]).node().appendChild(xml.documentElement);
        resize();
        d3.select(window).on('resize', resize);

        d3.json("js/sensors.json", function (data) {
            sensors = data;
            $.each(sensors, function(k) { setTimeout(function() { apiLoop(k); }, 0); });
        });

        // country border
        //d3.select('#grenzen').selectAll('polyline').attr('stroke', '#333333');
    });
    //d3.xml('img/Finding_Lights_Republica2015_Map_150415_2.svg', 'image/svg+xml', function (xml) {
    //    d3.select($map[0]).node().appendChild(xml.documentElement);
    //
    //});
}
