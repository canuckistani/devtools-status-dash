var queryTpl = {
  "product": ["Firefox", "Add-on SDK"],
  "include_fields": "id, product, component, summary, status, assigned_to",
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

  renderNav();

  renderContainers(function() {
    $('.result-block').html("<h3>Loading...<h3>");
  });

  var functions = _.map(flags, function(flag) {
    return function(callback) {
      fetch(flag.id, flag.label);
    };
  });

  async.parallel(functions, function(e, r) {
    console.log(r);
    console.log("all finished");
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

function renderContainers(callback) {
  var results_tpl = $('#result-containers-tpl').html();
  var results_block = Handlebars.compile(results_tpl);
  var _rendered = results_block({flags: flags});
  $('#results-container').html(_rendered);
  if (callback) {
    callback();
  }
}

function fetch(id, label, callback) {
  flags_block_tpl = $('#flag-block-tpl').html();
  var flag = flags[id];

  _tmp = queryTpl;
  _tmp.whiteboard = flag.flag;

  bugzilla.searchBugs(_tmp, function(e, r) {
    if (e) throw e;
    result = {data: r, label: label, id: id};
    renderTable(result);
  });
}

function setSelected(id, value) {
  var list = $('#'+id).get();
}

function deriveIdFromLabel(label) {
  return label.toLowerCase().replace(/\s/g, '-');
}

function renderTable(result, callback) {
  console.log(result);
  var table_tpl = Handlebars.compile(flags_block_tpl);
  var table = table_tpl({result: result});
  $('#'+result.id).html(table);
}