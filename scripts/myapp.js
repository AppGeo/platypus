(function (cartodb) {

  window.myapp = window.myapp || {};

  window.onload = function () {

        // the URL to your viz.json
    var diJSON = 'https://usac.cartodb.com/u/usac-admin/api/v3/viz/e2ed4a42-3ed6-11e6-b71a-0e5db1731f59/viz.json';


    var username = diJSON.match(/\/u\/(.+)\/api\/v\d\/|:\/\/(.+)\.cartodb\.com\/api/i)[1],
      myapp = window.myapp;

  // SQL client, inf needed
    myapp.sqlclient = new cartodb.SQL({
      user: username,
      protocol: 'https',
      sql_api_template: 'https://{user}.cartodb.com:443'
    });

    cartodb.deepInsights.createDashboard('#dashboard', diJSON, {
      no_cdn: false
    }, function(err, dashboard) {

      // DI map
      myapp.map = dashboard.getMap();

      // Leaflet map object
      myapp.Lmap = myapp.map.getNativeMap();

      // CartoDB layers
      myapp.layers = myapp.map.getLayers();

      // if the layer has an analysis node, its SQL is not exposed in the API
      myapp.layers.map(function(a) {
        if (a.attributes.sql == void 0) {
          var tmp = dashboard._dashboard.vis._analysisCollection.models.filter(function(b) {
            return b.id == a.attributes.source;
          })[0];
          if (tmp != void 0) {
            a.attributes.sql = tmp.attributes.query;
          } else {
            if (a.attributes.type == 'CartoDB') {
              console.warn('This may be a named map, check the privacy of the map and the datasets involved');
            }
          }
        }
        return a;
      });

      // Array of widgets’ data models
      myapp.widgetsdata = dashboard.getWidgets().map(function(a) {
        return a.dataviewModel
      });

      // Array of widgets views
      myapp.widgets = dashboard.getWidgets();

      /* function to add widgets
       * The options are described at: https://github.com/CartoDB/deep-insights.js/blob/master/doc/api.md
       */
      myapp.addWidget = function(type, layer_index, options) {
        try {
          var layer = myapp.layers[layer_index];
          switch (type) {
          case 'category':
            dashboard.createCategoryWidget(options, layer);
            break;
          case 'formula':
            dashboard.createFormulaWidget(options, layer);
            break;
          case 'histogram':
            dashboard.createHistogramWidget(options, layer);
            break;
          case 'timeseries':
            dashboard.createTimeSeriesWidget(options, layer);
            break;
          }
          return 'OK';
        } catch (error) {
          return error;
        }
      }
      myapp.addWidget('histogram', 1, {
        'title': 'number of households',
        'column': 'h7v001',
        'aggregation': 'count',
        'bins': 36,
        normalized: true,
        show_stats: true
      })
      myapp.addWidget('histogram', 1, {
        'title': 'pop density',
        'column': 'popden',
        'aggregation': 'count',
        'bins': 36,
        normalized: true,
        show_stats: true
      })
      myapp.addWidget('formula', 1, {
        'title': 'total',
        'column': 'h7v001',
        'operation': 'count',
        'suffix': ' house holds'
      })
      myapp.addWidget('formula', 1, {
        'title': 'average density',
        'column': 'popden',
        'operation': 'avg',
        'suffix': '%',
        show_stats: true
      })
      myapp.addWidget('category', 1, {
        'title': 'Segment 55',
        'column': 'x55',
        show_stats: true
      })
      myapp.addWidget('category', 1, {
        'title': 'Segment 10',
        'column': 'x10',
        show_stats: true
      })
            // myapp.addWidget('histogram', 1, {
            //   'title': 'men',
            //   'column': 't2_1',
            //   'aggregation': 'count'
            // })
            // myapp.addWidget('histogram', 1, {
            //   'title': 'pop',
            //   'column': 't1_1',
            //   'aggregation': 'count'
            // })
            /*
             *
             *       whatever
             *
             */

    });
  }

})(window.cartodb);
