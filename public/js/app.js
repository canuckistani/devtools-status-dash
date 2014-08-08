var queryTpl = {
  "product": "Firefox",
  "include_fields": "id, component, summary, status, assigned_to",
  "order": "bug_id"
};

var flags = {
  "statusbacklog": {
    "label": "Backlog",
    "flag": "[status:backlog]",
    "id": "statusbacklog"
  },
  "statusplanned": {
    "label": "Planned",
    "flag": "[status:planned]",
    "id": "statusplanned"
  },
  "statusinflight": {
    "label": "In Flight",
    "flag": "[status:inflight]",
    "id": "statusinflight"
  },
  "statuslandedoff": {
    "label": "Landed - preffed off",
    "flag": "[status:landedoff]",
    "id": "statuslandedoff"
  },
  "statuslandedon": {
    "label": "Landed - preffed on",
    "flag": "[status:landedon]",
    "id": "statuslandedon"
  },
  "statusshipped": {
    "label": "Shipped",
    "flag": "[status:shipped]",
    "id": "statusshipped"
  },
  "statusonhold": {
    "label": "On Hold",
    "flag": "[status:onhold]",
    "id": "statusonhold"
  }
};

$(function() {
  // $('#results-container').html("<h3>Loading...<h3>");

  // $('body').scrollspy({ target: '#top-nav' });

  var defaultFlag = flags[_.first(_.keys(flags))].id; // first one.
  var _current = sessionStorage.getItem('current-flag') || defaultFlag;

  renderNav(_current);
  renderContainers();

  if (_current !== defaultFlag) {
    sessionStorage.setItem('current-flag', _current);
  }

  var functions = _.map(flags, function(flag) {
    return function(callback) {
      fetch(flag.id, flag.label, callback);
    };
  });

  async.parallel(functions, function(e, r) {
    console.log(r);
    _.each(r, function(item) {
      renderTable(item, function(output) {
        $('#table-'+item.id).html(output);
      });
    });
  });

  // fetch(_current, flags[_current].label, function() { console.log("made it"); });
});

var bugzilla = bz.createClient(),
    flags, flags_tpl;

function renderNav(current) {
  flags_tpl = $('#flag-list-tpl').html();
  var list = Handlebars.compile(flags_tpl);
  $('#top-nav').html(list({flags: flags, current: current}));
  $('body').scrollspy({ target: '#top-nav' });
}

function renderContainers() {
  var results_tpl = $('#result-containers-tpl').html();
  var results_block = Handlebars.compile(results_tpl);
  var _rendered = results_block({flags: flags});
  // console.log(_rendered);
  $('#results-container').html(_rendered);
}

function fetch(id, label, callback) {
  // caching the templates in globals.
  // debugger;
  flags_block_tpl = $('#flag-block-tpl').html();

  var flag = flags[id];

  _tmp = queryTpl;
  _tmp.whiteboard = flag.flag;

  bugzilla.searchBugs(_tmp, function(e, r) {
    // console.log("in search callback");
    if (e) throw e;
    // callback(null, {label: label, flag: flag, data: r});
    result = {data: r, label: label, id: id};
    // console.log("result", result);
    renderTable(result);
    // renderTable(result, function(e, r) {
    //   // $('#bug-table').html(r);
    //   // console.log(r);
    //   $('#table-'+flag.id).html(r);

    //   // if (callback) {
    //   //   callback();
    //   // }
    // });
  });
}

function setSelected(id, value) {
  var list = $('#'+id).get();

}

function deriveIdFromLabel(label) {
  return label.toLowerCase().replace(/\s/g, '-');
}

function renderTable(result, callback) {
  // var data_tpl = Handlebars.compile($('#table-data-tpl').html());
  // var rows = data_tpl({datarows: result});
  console.log(result);
  var table_tpl = Handlebars.compile(flags_block_tpl);
  var table = table_tpl({result: result});
  $('#table-'+result.id).html(table);
  if (callback) {
    callback(null, table);
  }
}