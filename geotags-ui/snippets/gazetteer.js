// TODO componentize
$('input[name="search-communes"]').on(
    'keyup',
    function(e) {
        var url, target = $(e.target), val = target.val();
        if (val) {
            // url = '/v1/search/communes?q=' + val + '&bbox=' + map.getBounds().toBBoxString();
            url = '/v1/search/communes?q=' + val ;
            $.getJSON(url, function(data) {
                var element = $("#search-results").empty().show();
                data.results.forEach(function(d) {
                    var item = $("<li>" + d.text + "</li>");
                    item.on("click", function(e) {
                        map.fitBounds(L.latLngBounds(
                            L.latLng(d.south_west.lat, d.south_west.lon),
                            L.latLng(d.north_east.lat, d.north_east.lon)));
                        target.val(d.text);
                        element.hide();
                    });
                    element.append(item);
                });
            });
        } else {
            $("#search-results").empty();
        }
    });