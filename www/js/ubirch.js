function ubirchTopo(el) {
  var width = d3.select(el).node().getBoundingClientRect().width,
      height = d3.select(el).node().getBoundingClientRect().height;

  d3.xml("img/Finding_Lights_Republica2015_Map_150410_1.svg", "image/svg+xml", function(xml) {
    d3.select(el).node().appendChild(xml.documentElement);
    d3.select("svg").attr("width", width).attr("height", height);

    d3.select(window).on("resize", function() {
      var w = d3.select(el).node().getBoundingClientRect().width,
          h = d3.select(el).node().getBoundingClientRect().height;
      d3.select("svg").attr("width", w).attr("height", h);
    });

    d3.select("#grenzen").selectAll("polyline").attr("stroke", "#ff0000");
    d3.select("#EU").selectAll("path").attr("fill", "#eeeeee");
    d3.select("#path258_13_").attr("fill", "#aa00ff");
  });
}
