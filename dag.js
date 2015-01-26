// Generated by CoffeeScript 1.8.0
(function() {
  var boxFocus, boxHeight, boxWidth, boxof, buildGrids, createDAG, dat, drawDAG, esc, grids, keydown, main, node, nodes, pathof, xMax, xgrid, yMax, ygrid;

  esc = function(name) {
    return name.replace(/\//g, '_');
  };

  boxof = function(name) {
    return "rect#" + esc(name);
  };

  pathof = function(from, to) {
    return "path#" + esc(from) + "-" + esc(to);
  };

  boxFocus = "";

  nodes = [];

  for (node in gostd) {
    dat = gostd[node];
    dat.name = node;
    nodes.push(dat);
  }

  xgrid = 130;

  ygrid = 30;

  boxWidth = 120;

  boxHeight = 20;

  grids = [];

  xMax = 0;

  yMax = 0;

  main = function() {
    var cmpNode, layout, xpush;
    cmpNode = function(a, b) {
      if (a.x < b.x) {
        return -1;
      }
      if (a.x > b.x) {
        return 1;
      }
      if (a.y < b.y) {
        return -1;
      }
      if (a.y > b.y) {
        return 1;
      }
      return 0;
    };
    nodes.sort(cmpNode);
    xpush = function() {
      var n, name, push, pushWorthy, revNodes, tryPush, xmax, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      xmax = 0;
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        dat = nodes[_i];
        if (dat.x > xmax) {
          xmax = dat.x;
        }
      }
      tryPush = function(name) {
        var out, sub, worthy, _j, _len1, _ref;
        node = gostd[name];
        if (node.x === xmax) {
          return {
            able: false,
            worthy: false
          };
        }
        worthy = false;
        _ref = node.outs;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          out = _ref[_j];
          if (gostd[out].x > node.x + 1) {
            worthy = true;
            continue;
          }
          sub = tryPush(out);
          if (!sub.able) {
            return {
              able: false,
              worthy: false
            };
          }
          if (sub.worthy) {
            worthy = true;
          }
        }
        return {
          able: true,
          worthy: worthy
        };
      };
      pushWorthy = function(name) {
        var ret;
        ret = tryPush(name);
        return ret.worthy;
      };
      push = function(name) {
        var out, _j, _len1, _ref;
        node = gostd[name];
        _ref = node.outs;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          out = _ref[_j];
          if (gostd[out].x > node.x + 1) {
            continue;
          }
          push(out);
        }
        node.newx = node.x + 1;
      };
      revNodes = nodes.slice().reverse();
      for (_j = 0, _len1 = revNodes.length; _j < _len1; _j++) {
        dat = revNodes[_j];
        name = dat.name;
        while (pushWorthy(name)) {
          for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
            n = nodes[_k];
            n.newx = n.x;
          }
          push(name);
          for (_l = 0, _len3 = nodes.length; _l < _len3; _l++) {
            n = nodes[_l];
            n.x = n.newx;
          }
        }
      }
    };
    xpush();
    layout = function() {
      var col, cols, i, n, out, tak, taken, xmax, xmin, xthis, y, ymax, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref;
      xmax = 0;
      ymax = 0;
      for (node in gostd) {
        dat = gostd[node];
        if (dat.x > xmax) {
          xmax = dat.x;
        }
        if (dat.y > ymax) {
          ymax = dat.y;
        }
      }
      taken = [];
      cols = [];
      for (i = _i = 0; 0 <= xmax ? _i <= xmax : _i >= xmax; i = 0 <= xmax ? ++_i : --_i) {
        taken.push({});
        cols.push([]);
      }
      for (node in gostd) {
        dat = gostd[node];
        cols[dat.x].push(dat);
      }
      for (_j = 0, _len = cols.length; _j < _len; _j++) {
        col = cols[_j];
        col.sort(function(a, b) {
          if (a.outs.length > b.outs.length) {
            return -1;
          }
          if (a.outs.length < b.outs.length) {
            return 1;
          }
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        });
      }
      for (_k = 0, _len1 = cols.length; _k < _len1; _k++) {
        col = cols[_k];
        for (_l = 0, _len2 = col.length; _l < _len2; _l++) {
          dat = col[_l];
          xthis = dat.x;
          xmax = dat.x;
          xmin = -1;
          _ref = dat.outs;
          for (_m = 0, _len3 = _ref.length; _m < _len3; _m++) {
            out = _ref[_m];
            n = gostd[out];
            if (n.x > xmax) {
              xmax = n.x;
            }
            if (xmin === -1 || n.x < xmin) {
              xmin = n.x;
            }
          }
          tak = taken[xthis];
          y = 0;
          while (y in tak) {
            y = y + 1;
          }
          tak[y] = true;
          xmax = xmax - 1;
          dat.newy = y;
          dat.xto = xmax;
        }
      }
      for (node in gostd) {
        dat = gostd[node];
        dat.y = dat.newy;
      }
    };
    layout();
    createDAG();
    drawDAG();
    buildGrids();
  };

  buildGrids = function() {
    var i, j, lst, _i, _j, _k, _l, _len, _len1;
    xMax = 0;
    yMax = 30;
    grids = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      if (node.x > xMax) {
        xMax = node.x;
      }
    }
    for (i = _j = 0; 0 <= xMax ? _j <= xMax : _j >= xMax; i = 0 <= xMax ? ++_j : --_j) {
      lst = [];
      for (j = _k = 0; 0 <= yMax ? _k <= yMax : _k >= yMax; j = 0 <= yMax ? ++_k : --_k) {
        lst.push(false);
      }
      grids.push(lst);
    }
    for (_l = 0, _len1 = nodes.length; _l < _len1; _l++) {
      node = nodes[_l];
      grids[node.x][node.y] = true;
    }
  };

  createDAG = function() {
    var b, clickFunc, dragFunc, hoverFunc, lab, lightIns, lightOuts, output, p, path, paths, svg, _i, _j, _k, _len, _len1, _len2, _ref;
    svg = d3.select("svg#main");
    paths = [];
    for (node in gostd) {
      dat = gostd[node];
      _ref = dat.outs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        output = _ref[_i];
        paths.push({
          n: esc(node) + "-" + esc(output)
        });
      }
    }
    for (_j = 0, _len1 = paths.length; _j < _len1; _j++) {
      path = paths[_j];
      p = svg.append("path");
      p.attr("d", "");
      p.attr("id", "BG-" + path.n);
      p.attr("class", "bg");
    }
    for (_k = 0, _len2 = paths.length; _k < _len2; _k++) {
      path = paths[_k];
      p = svg.append("path");
      p.attr("d", "");
      p.attr("id", path.n);
      p.attr("class", "dep");
    }
    lightIns = function(name, first) {
      var boxin, depin, input, _l, _len3, _ref1;
      if (first) {
        boxin = "box in";
        depin = "dep in";
      } else {
        boxin = "box in2";
        depin = "dep in2";
      }
      _ref1 = gostd[name].ins;
      for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
        input = _ref1[_l];
        svg.select(boxof(input)).attr("class", boxin);
        svg.select(pathof(input, name)).attr("class", depin);
        lightIns(input, false);
      }
    };
    lightOuts = function(name, first) {
      var boxout, depout, _l, _len3, _ref1;
      if (first) {
        boxout = "box out";
        depout = "dep out";
      } else {
        boxout = "box out2";
        depout = "dep out2";
      }
      _ref1 = gostd[name].outs;
      for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
        output = _ref1[_l];
        svg.select(boxof(output)).attr("class", boxout);
        svg.select(pathof(name, output)).attr("class", depout);
        lightOuts(output, false);
      }
    };
    hoverFunc = function(name) {
      return function(d) {
        svg.selectAll("rect").attr("class", "box");
        svg.selectAll("path.dep").attr("class", "dep");
        svg.select(boxof(name)).attr("class", "box focus");
        lightIns(name, true);
        lightOuts(name, true);
      };
    };
    clickFunc = function(name) {
      var hover;
      hover = hoverFunc(name);
      return function(d) {
        hover();
        if (boxFocus === name) {
          return;
        }
        svg.select("text.lab#lab-" + esc(boxFocus)).classed({
          "focus": false
        });
        boxFocus = name;
        svg.select("text.lab#lab-" + esc(boxFocus)).classed({
          "focus": true
        });
      };
    };
    dragFunc = function(name) {
      return function(d) {
        var ydrag;
        ydrag = Math.floor(d3.event.y / ygrid);
        if (ydrag < 0) {
          ydrag = 0;
        }
        if (ydrag > yMax) {
          ydrag = yMax;
        }
        node = gostd[name];
        if (!grids[node.x][ydrag]) {
          node.y = ydrag;
        }
        drawDAG();
        buildGrids();
      };
    };
    for (node in gostd) {
      dat = gostd[node];
      b = svg.append("rect");
      b.attr("ry", 5);
      b.attr("ry", 5);
      b.attr("width", boxWidth);
      b.attr("height", boxHeight);
      b.attr("class", "box");
      b.attr("id", esc(node));
      lab = svg.append("text");
      lab.attr("class", "lab");
      lab.attr("id", "lab-" + esc(node));
      lab.text(node);
      b.on("mouseover", hoverFunc(dat.name));
      b.on("click", clickFunc(dat.name));
      lab.on("click", clickFunc(dat.name));
    }
  };

  drawDAG = function() {
    var b, fromx, fromy, lab, output, p, path, paths, svg, toNode, tox, toy, turnx, _i, _j, _k, _len, _len1, _len2, _ref;
    svg = d3.select("svg#main");
    paths = [];
    for (node in gostd) {
      dat = gostd[node];
      _ref = dat.outs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        output = _ref[_i];
        toNode = gostd[output];
        fromx = dat.x * xgrid + boxWidth;
        fromy = dat.y * ygrid + boxHeight / 2;
        tox = toNode.x * xgrid;
        toy = toNode.y * ygrid + boxHeight / 2;
        turnx = tox - 5;
        path = "M" + fromx + " " + fromy;
        path += " L" + turnx + " " + fromy;
        path += " L" + turnx + " " + toy;
        path += " L" + tox + " " + toy;
        paths.push({
          p: path,
          n: esc(node) + "-" + esc(output)
        });
      }
    }
    for (_j = 0, _len1 = paths.length; _j < _len1; _j++) {
      path = paths[_j];
      p = svg.select("path#BG-" + path.n);
      p.attr("d", path.p);
    }
    for (_k = 0, _len2 = paths.length; _k < _len2; _k++) {
      path = paths[_k];
      p = svg.select("path#" + path.n);
      p.attr("d", path.p);
    }
    for (node in gostd) {
      dat = gostd[node];
      b = svg.select("rect#" + esc(node));
      b.attr("x", dat.x * xgrid);
      b.attr("y", dat.y * ygrid);
      lab = svg.select("text#lab-" + esc(node));
      lab.attr("x", dat.x * xgrid + boxWidth / 2);
      lab.attr("y", dat.y * ygrid + boxHeight / 2 + 4);
    }
  };

  keydown = function(e) {
    var y;
    if (boxFocus === "") {
      return;
    }
    if (e.which === 38) {
      node = gostd[boxFocus];
      y = node.y - 1;
      while (y > 0) {
        if (!grids[node.x][y]) {
          node.y = y;
          drawDAG();
          buildGrids();
          break;
        }
        y = y - 1;
      }
      e.preventDefault();
    } else if (e.which === 40) {
      node = gostd[boxFocus];
      y = node.y + 1;
      while (y <= yMax) {
        if (!grids[node.x][y]) {
          node.y = y;
          drawDAG();
          buildGrids();
          break;
        }
        y = y + 1;
      }
      e.preventDefault();
    }
    return true;
  };

  $(document).keydown(keydown);

  $(document).ready(main);

}).call(this);
