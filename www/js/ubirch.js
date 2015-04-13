function ubirchTopo() {
    var $app = $('.app'),
        $map = $('.map',$app);

    function resize(){
        var width = d3.select($map[0]).node().getBoundingClientRect().width,
            height = d3.select($map[0]).node().getBoundingClientRect().height,
            svg = d3.select('svg');

        svg
            .attr('width', width)
            .attr('height', height);
    }

    var timeout = null;
    function showDetail(detailData, forceClose){
        var $detailContent = $('.detail .content',$app),
            className = 'visible',
            html = '<h2>'+detailData.name+'</h2><span>'+detailData.country+'</span>',
            updateContent = function(){
                $detailContent
                    .addClass(className)
                    .html(html);
            };

        if($detailContent.hasClass(className)){
            $detailContent.removeClass(className);
            if(timeout != null)
                window.clearTimeout(timeout);
            timeout = window.setTimeout(function(){
                updateContent();
            },600);
        } else
            updateContent();
    }

    d3.xml('img/Finding_Lights_Republica2015_Map_150410_1.svg', 'image/svg+xml', function (xml) {
        d3.select($map[0]).node().appendChild(xml.documentElement);

        resize();
        d3.select(window).on('resize', resize);

        // country border
        d3.select('#grenzen').selectAll('polyline').attr('stroke', '#333333');
        // europe
        d3.select('#EU')
            .selectAll('path')
            .attr('fill','#eeeeee')
            .on('click',function(){
                showDetail({'name':'Anywhere',country:'europe'});
            });
        // berlin
        d3.select('#path258_13_')
            .attr('fill', '#aa00ff')
            .on('click',function(){
                showDetail({'name':'Berlin',country:'germany'});
            });
    });
}
