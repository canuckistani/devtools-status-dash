var queryTpl = {
  "product": ["Firefox"],
  "include_fields": "id, component, summary, status, assigned_to, whiteboard, priority",
  "order": "bug_id"
};

var flags = {
  "devEdition40": {
    "label": "DevEdition-40",
    "flag": "devedition-40",
    "id": "devedition-40"
  }
}

$(function() {
  async.series([
      function(callback) {
        $('#results-container').html("<h3>Loading...<h3>");
        callback(null);
      }
    ], function() {
    fetch(flags.devEdition40, renderTable);
  });
});

var bugzilla = bz.createClient(),
    flags, flags_tpl;

function renderNav(current) {
  flags_tpl = $('#flag-list-tpl').html();
  var list = Handlebars.compile(flags_tpl);
  $('#top-nav').html(list({flags: flags, current: current}));
  $('body').scrollspy({ target: '#top-nav' });
}

function renderContainers(groups, callback) {
  var results_tpl = $('#result-containers-tpl').html();
  var results_block = Handlebars.compile(results_tpl);
  var _rendered = results_block({groups: groups});
  $('#results-container').html(_rendered);
  if (callback) {
    callback(null);
  }
}

function fetch(flag, callback) {
  flags_block_tpl = $('#flag-block-tpl').html();
  _tmp = queryTpl;
  _tmp.whiteboard = flag.flag;

  bugzilla.searchBugs(_tmp, function(e, r) {
    if (e) throw e;
    result = {data: r, label: flag.label, id: flag.id};

    renderTable(result, 'results-container', function() {
      console.log("BOOM");
    });
    // var grouped = _.groupBy(result.data, 'priority');
    // console.log("grouped", grouped);
    // // callback(null, result);
    // var functions = _.map(grouped, function(list, prio) {
    //   return function(callback) {
    //     renderTable(list, prio.toLowerCase(), callback);
    //   }
    // });

    // async.parallel(functions, function(err, result) {
    //   if (err) throw err;
    //   console.log("got here");
    // })
  });
}

function deriveIdFromLabel(label) {
  return label.toLowerCase().replace(/\s/g, '-');
}

function renderTable(result, id, callback) {
  var table_tpl = Handlebars.compile(flags_block_tpl);
  var table = table_tpl({result: result});
  $('#'+id).html(table);
  if (callback) { callback(null) }
}