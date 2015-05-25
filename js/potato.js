// Generated by CoffeeScript 1.9.2
(function() {
  var root,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Potato = (function() {
    var default_params;

    default_params = {
      split: true,
      color: true,
      size: true,
      "class": null
    };

    function Potato(data1, params) {
      this.data = data1;
      if (params == null) {
        params = default_params;
      }
      this.parse_numeric_string = bind(this.parse_numeric_string, this);
      this.update_position = bind(this.update_position, this);
      this.highlight_node = bind(this.highlight_node, this);
      this.hide_details = bind(this.hide_details, this);
      this.show_details = bind(this.show_details, this);
      this.move_towards_target = bind(this.move_towards_target, this);
      this.adjust_label_pos = bind(this.adjust_label_pos, this);
      this.update = bind(this.update, this);
      this.order_by = bind(this.order_by, this);
      this.size_by = bind(this.size_by, this);
      this.color_by = bind(this.color_by, this);
      this.split_by = bind(this.split_by, this);
      this.apply_filter = bind(this.apply_filter, this);
      this.reset = bind(this.reset, this);
      this.create_buttons = bind(this.create_buttons, this);
      this.remove_nodes = bind(this.remove_nodes, this);
      this.add_node = bind(this.add_node, this);
      this.apply_filters = bind(this.apply_filters, this);
      this.add_all = bind(this.add_all, this);
      this.create_filters = bind(this.create_filters, this);
      this.drag_select = bind(this.drag_select, this);
      this.zoom = bind(this.zoom, this);
      this.width = $(window).width();
      this.height = $(window).height() - 55;
      this.node_class = params["class"];
      $.each(this.data, (function(_this) {
        return function(i, d) {
          return d.node_id = i;
        };
      })(this));
      $("#vis").append("<div class='tooltip' id='node-tooltip'></div>").append("<div id='toolbar'><div id='modifiers'></div><div id='filter-select-buttons'></div></div>");
      $("#node-tooltip").hide();
      this.vis = d3.select("#vis").append("svg").attr("viewBox", "0 0 " + this.width + " " + this.height).attr("id", "vis-svg");
      this.zoom();
      this.force = d3.layout.force().gravity(-0.01).charge(function(d) {
        return -Math.pow(d.radius, 2.0) * 1.4;
      }).size([this.width, this.height]);
      this.nodes = this.force.nodes();
      this.labels = [];
      this.axis = [];
      this.mousedown = false;
      this.drag_select();
      this.create_filters();
      $.each(params, (function(_this) {
        return function(k, v) {
          if (k !== 'class' && v === true) {
            return _this.create_buttons(k);
          }
        };
      })(this));
      this.add_all();
    }

    Potato.prototype.zoom = function() {
      var zoomListener;
      zoomListener = d3.behavior.zoom().scaleExtent([.5, 10]).on("zoom", (function(_this) {
        return function() {
          var dy, radius_change;
          if (!_this.mousedown) {
            dy = d3.event.sourceEvent.deltaY;
            radius_change = dy > 0 ? 0.95 : 1.05;
            if ((_this.nodes[0].radius < 2 && radius_change < 1) || (_this.nodes[0].radius > 75 && radius_change > 1)) {
              return;
            }
            $.each(_this.nodes, function(i, n) {
              return n.radius *= radius_change;
            });
            return _this.update();
          }
        };
      })(this));
      return this.vis.call(zoomListener);
    };

    Potato.prototype.drag_select = function() {
      var that;
      that = this;
      return this.vis.on("mousedown", function() {
        var p;
        that.mousedown = true;
        d3.select(this).select("rect.select-box").remove();
        p = d3.mouse(this);
        return d3.select(this).append("rect").attr({
          rx: 6,
          ry: 6,
          "class": "select-box",
          x: p[0],
          y: p[1],
          width: 0,
          height: 0,
          x0: p[0],
          y0: p[1]
        });
      }).on("mousemove", function() {
        var d, p, s, x0, y0;
        s = d3.select(this).select("rect.select-box");
        if (!s.empty()) {
          p = d3.mouse(this);
          d = {
            x: parseInt(s.attr("x"), 10),
            y: parseInt(s.attr("y"), 10),
            width: parseInt(s.attr("width"), 10),
            height: parseInt(s.attr("height"), 10)
          };
          x0 = parseInt(s.attr("x0"), 10);
          y0 = parseInt(s.attr("y0"), 10);
          if (p[0] < x0) {
            d.width = x0 - p[0];
            d.x = p[0];
          } else {
            d.width = p[0] - d.x;
            d.x = x0;
          }
          if (p[1] < y0) {
            d.height = y0 - p[1];
            d.y = p[1];
          } else {
            d.height = p[1] - d.y;
            d.y = y0;
          }
          s.attr(d);
          return that.circles.each((function(_this) {
            return function(c) {
              if (c.x > d.x && c.x < d.x + d.width && c.y > d.y && c.y < d.y + d.height) {
                return that.highlight_node(d3.select("#bubble_" + c.id), true);
              } else {
                return that.highlight_node(d3.select("#bubble_" + c.id), false);
              }
            };
          })(this));
        }
      }).on("mouseup", (function(_this) {
        return function() {
          var nodes_to_remove, s, sx, sx2, sy, sy2;
          s = _this.vis.select("rect.select-box");
          sx = parseInt(s.attr('x'), 10);
          sx2 = sx + parseInt(s.attr('width'), 10);
          sy = parseInt(s.attr('y'), 10);
          sy2 = sy + parseInt(s.attr('height'), 10);
          nodes_to_remove = [];
          _this.circles.each(function(c) {
            that.highlight_node(d3.select("#bubble_" + c.id), false);
            if (c.x < sx || c.x > sx2 || c.y < sy || c.y > sy2) {
              return nodes_to_remove.push(c.id);
            }
          });
          if (nodes_to_remove.length > 0 && nodes_to_remove.length !== _this.nodes.length) {
            _this.remove_nodes(nodes_to_remove);
          }
          s.remove();
          return _this.mousedown = false;
        };
      })(this));
    };

    Potato.prototype.create_filters = function() {
      var reset_button, reset_tooltip, sorted_filters;
      sorted_filters = {};
      this.filter_names = [];
      $.each(this.data[0], (function(_this) {
        return function(d) {
          var d_mod;
          if (d !== 'node_id') {
            d_mod = d.replace(/\(|\)/g, " ");
            _this.filter_names.push({
              value: d_mod
            });
            return sorted_filters[d_mod] = [];
          }
        };
      })(this));
      this.data.forEach((function(_this) {
        return function(d) {
          return $.each(d, function(k, v) {
            var filter_exists, k_mod;
            k_mod = k.replace(/\(|\)/g, " ");
            if (k_mod !== 'node_id') {
              filter_exists = $.grep(sorted_filters[k_mod], function(e) {
                return e.filter === k_mod && e.value === v;
              });
              if (filter_exists.length === 0) {
                return sorted_filters[k_mod].push({
                  filter: k_mod,
                  value: v
                });
              }
            }
          });
        };
      })(this));
      this.categorical_filters = [];
      this.numeric_filters = [];
      $.each(sorted_filters, (function(_this) {
        return function(f, v) {
          if (isNaN(v[0].value.replace(/%/, "").replace(/,/g, ""))) {
            if (v.length !== _this.data.length && v.length < 500) {
              return _this.categorical_filters.push({
                value: f,
                type: 'cat'
              });
            }
          } else {
            return _this.numeric_filters.push({
              value: f,
              type: 'num'
            });
          }
        };
      })(this));
      $.each(this.categorical_filters, (function(_this) {
        return function(k, v) {
          return sorted_filters[v.value].sort(function(a, b) {
            if (a.value === b.value) {
              return 0;
            } else {
              return (a.value > b.value) || -1;
            }
          });
        };
      })(this));
      reset_tooltip = $("<div class='tooltip' id='reset-tooltip'>Click and drag on the canvas to select nodes.</div>");
      reset_button = $("<button id='reset-button' class='disabled-button modifier-button'><span id='reset-icon'>&#8635;</span> Reset Selection</button>");
      reset_button.on("click", (function(_this) {
        return function(e) {
          if (!reset_button.hasClass('disabled-button')) {
            return _this.add_all();
          }
        };
      })(this)).on("mouseover", (function(_this) {
        return function(e) {
          return reset_tooltip.show();
        };
      })(this)).on("mouseout", (function(_this) {
        return function(e) {
          return reset_tooltip.hide();
        };
      })(this));
      reset_button.append(reset_tooltip);
      reset_tooltip.hide();
      return $("#filter-select-buttons").append(reset_button);
    };

    Potato.prototype.add_all = function() {
      if (this.nodes.length !== this.data.length) {
        this.data.forEach((function(_this) {
          return function(d) {
            var temp_obj;
            if ($.grep(_this.nodes, function(e) {
              return e.id === d.node_id;
            }).length === 0) {
              temp_obj = {};
              $.each(d, function(k, v) {
                var k_mod;
                k_mod = k.replace(/\(|\)/g, " ");
                return temp_obj[k_mod] = v;
              });
              return _this.add_node(temp_obj);
            }
          };
        })(this));
      }
      $("#reset-button").addClass('disabled-button');
      this.update();
      return this.apply_filters();
    };

    Potato.prototype.apply_filters = function() {
      return $(".active-filter").each((function(_this) {
        return function(i, filterObj) {
          var dash_loc, filter_id, type, val;
          filter_id = $(filterObj).attr('id');
          dash_loc = filter_id.indexOf('-');
          type = filter_id.substr(0, dash_loc);
          val = filter_id.substr(dash_loc + 1);
          return _this.apply_filter(type, val, $(filterObj).attr('data-type'));
        };
      })(this));
    };

    Potato.prototype.add_node = function(d) {
      var vals;
      vals = {};
      $.each(this.filter_names, (function(_this) {
        return function(k, f) {
          return vals[f.value] = d[f.value];
        };
      })(this));
      return this.nodes.push({
        id: d.node_id,
        radius: 5,
        values: vals,
        color: "#777",
        "class": this.node_class != null ? d[this.node_class] : '',
        x: Math.random() * 900,
        y: Math.random() * 800,
        tarx: this.width / 2.0,
        tary: this.height / 2.0
      });
    };

    Potato.prototype.remove_nodes = function(nodes_to_remove) {
      var len;
      len = this.nodes.length;
      while (len--) {
        if (nodes_to_remove.indexOf(this.nodes[len]['id']) >= 0) {
          this.nodes.splice(len, 1);
        }
      }
      $("#reset-button").removeClass('disabled-button');
      this.update();
      return setTimeout(this.apply_filters, 200);
    };

    Potato.prototype.create_buttons = function(type) {
      var button_filters, type_upper;
      type_upper = type[0].toUpperCase() + type.slice(1);
      $("#modifiers").append("<div id='" + type + "-wrapper' class='modifier-wrapper'><button id='" + type + "-button' class='modifier-button'>" + type_upper + "<span class='button-arrow'>&#x25BC;</span><span id='" + type + "-hint' class='modifier-hint'></span></button><div id='" + type + "-menu' class='modifier-menu'></div></div>");
      $("#" + type + "-button").hover(function() {
        return $("#" + type + "-menu").slideDown(100);
      });
      $("#" + type + "-wrapper").mouseleave(function() {
        return $("#" + type + "-menu").slideUp(100);
      });
      $("#" + type + "-button").on("click", (function(_this) {
        return function() {
          return _this.reset(type);
        };
      })(this));
      button_filters = this.numeric_filters;
      if (type === "color" || type === "split") {
        button_filters = button_filters.concat({
          value: '',
          type: 'divider'
        }).concat(this.categorical_filters);
      }
      return d3.select("#" + type + "-menu").selectAll('div').data(button_filters).enter().append("div").text(function(d) {
        return d.value;
      }).attr("class", function(d) {
        if (d.type === 'divider') {
          return 'divider-option';
        } else {
          return "modifier-option " + type + "-option";
        }
      }).attr("data-type", function(d) {
        return "" + d.type;
      }).attr("id", function(d) {
        return type + "-" + d.value;
      }).on("click", (function(_this) {
        return function(d) {
          return _this.apply_filter(type, d.value, d.type);
        };
      })(this));
    };

    Potato.prototype.reset = function(type) {
      $("." + type + "-option").removeClass('active-filter');
      $("#" + type + "-hint").html("");
      if (type === 'color') {
        d3.select("#color-legend").selectAll("*").remove();
        this.circles.each(function(c) {
          return c.color = "#777";
        });
      } else if (type === 'size') {
        this.circles.each((function(_this) {
          return function(c) {
            return c.radius = 5;
          };
        })(this));
      } else if (type === 'split' || type === 'order') {
        while (this.axis.length > 0) {
          this.axis.pop();
        }
        while (this.labels.length > 0) {
          this.labels.pop();
        }
        this.circles.each((function(_this) {
          return function(c) {
            c.tarx = _this.width / 2.0;
            return c.tary = _this.height / 2.0;
          };
        })(this));
      }
      return this.update();
    };

    Potato.prototype.apply_filter = function(type, filter, data_type) {
      if (type === "split") {
        this.split_by(filter, data_type);
      }
      if (type === "color") {
        this.color_by(filter, data_type);
      }
      if (type === "size") {
        return this.size_by(filter);
      }
    };

    Potato.prototype.split_by = function(filter, data_type) {
      var curr_col, curr_row, curr_vals, height_2, num_cols, num_rows, width_2;
      if (this.circles === void 0 || this.circles.length === 0) {
        return;
      }
      this.reset('split');
      $("#split-hint").html("<br>" + filter);
      $("#split-" + filter).addClass('active-filter');
      if (data_type === "num") {
        return this.order_by(filter);
      } else {
        curr_vals = [];
        this.circles.each((function(_this) {
          return function(c) {
            if (curr_vals.indexOf(c['values'][filter]) < 0) {
              return curr_vals.push(c['values'][filter]);
            }
          };
        })(this));
        num_cols = Math.ceil(Math.sqrt(curr_vals.length));
        num_rows = Math.ceil(curr_vals.length / num_cols);
        curr_row = 0;
        curr_col = 0;
        width_2 = this.width * 0.8;
        height_2 = this.height * 0.8;
        curr_vals.sort();
        curr_vals.forEach((function(_this) {
          return function(s, i) {
            var label;
            curr_vals[i] = {
              split: s,
              tarx: (_this.width * 0.12) + (0.5 + curr_col) * (width_2 / num_cols),
              tary: (_this.height * 0.10) + (0.5 + curr_row) * (height_2 / num_rows)
            };
            label = {
              val: s,
              split: filter,
              x: curr_vals[i].tarx,
              y: curr_vals[i].tary,
              tarx: curr_vals[i].tarx,
              tary: curr_vals[i].tary
            };
            _this.labels.push(label);
            curr_col++;
            if (curr_col >= num_cols) {
              curr_col = 0;
              return curr_row++;
            }
          };
        })(this));
        this.circles.each((function(_this) {
          return function(c) {
            return curr_vals.forEach(function(s) {
              if (s.split === c['values'][filter]) {
                c.tarx = s.tarx;
                return c.tary = s.tary;
              }
            });
          };
        })(this));
        return this.update();
      }
    };

    Potato.prototype.color_by = function(filter, data_type) {
      var colors, curr_max, curr_vals, curr_vals_tuples, curr_vals_with_count, g, l_size, legend, non_zero_min, num_colors, numeric;
      if (this.circles === void 0 || this.circles.length === 0) {
        return;
      }
      this.reset('color');
      if ($("#color-legend").length < 1) {
        $("#vis").append("<div id='color-legend'></div>");
      }
      $("#color-hint").html("<br>" + filter);
      $("#color-" + filter).addClass('active-filter');
      curr_vals_with_count = {};
      numeric = data_type === 'num';
      this.circles.each((function(_this) {
        return function(c) {
          var val;
          val = c['values'][filter];
          if (curr_vals_with_count.hasOwnProperty(val)) {
            return curr_vals_with_count[val] += 1;
          } else {
            return curr_vals_with_count[val] = 1;
          }
        };
      })(this));
      curr_vals_tuples = [];
      $.each(curr_vals_with_count, (function(_this) {
        return function(k, c) {
          return curr_vals_tuples.push([k, c]);
        };
      })(this));
      curr_vals_tuples.sort(function(a, b) {
        return b[1] - a[1];
      });
      if (!numeric && curr_vals_tuples.length > 18) {
        curr_vals_tuples = curr_vals_tuples.slice(0, 18);
        curr_vals_tuples.push(['other', 0]);
      }
      curr_vals = [];
      $.each(curr_vals_tuples, (function(_this) {
        return function(c, arr) {
          var temp_val;
          temp_val = arr[0];
          if (numeric === true) {
            temp_val = _this.parse_numeric_string(temp_val);
          }
          return curr_vals.push(temp_val);
        };
      })(this));
      num_colors = curr_vals.length;
      if (numeric === true) {
        curr_max = d3.max(curr_vals, function(d) {
          return d;
        });
        non_zero_min = curr_max;
        $.each(curr_vals, (function(_this) {
          return function(k, c) {
            if (c > 0 && c < non_zero_min) {
              return non_zero_min = c;
            }
          };
        })(this));
        colors = d3.scale.linear().domain([non_zero_min, curr_max]).range(["#ccc", "#1f77b4"]);
      } else {
        colors = d3.scale.ordinal().domain(curr_vals).range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#dbdb8d', '#9edae5', '#777777']);
      }
      l_size = 30;
      legend = d3.select("#color-legend").append("svg").attr("width", 150).attr("height", colors.domain().length * l_size).style("padding", "20px 0 0 20px");
      g = legend.selectAll("g").data(colors.domain()).enter().append("g");
      g.append("rect").attr("y", function(d, i) {
        return i * l_size;
      }).attr("rx", l_size * 0.5).attr("ry", l_size * 0.5).attr("width", l_size * 0.5).attr("height", l_size * 0.5).style("fill", (function(_this) {
        return function(d) {
          return colors(d);
        };
      })(this));
      g.append("text").attr("x", 20).attr("y", function(d, i) {
        return i * l_size + 12;
      }).text(function(d) {
        return d;
      });
      this.nodes.forEach((function(_this) {
        return function(c) {
          return curr_vals.forEach(function(s) {
            var c_temp;
            c_temp = c['values'][filter];
            if (numeric === true) {
              c_temp = _this.parse_numeric_string(c_temp);
            }
            if (s === c_temp) {
              return c.color = String(colors(s));
            }
          });
        };
      })(this));
      return this.update();
    };

    Potato.prototype.size_by = function(filter) {
      var curr_max, curr_vals, non_zero_min, sizes;
      if (this.circles === void 0 || this.circles.length === 0) {
        return;
      }
      this.reset('size');
      $("#size-hint").html("<br>" + filter);
      $("#size-" + filter).addClass('active-filter');
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          return curr_vals.push(_this.parse_numeric_string(c['values'][filter]));
        };
      })(this));
      curr_max = d3.max(curr_vals, function(d) {
        return d;
      });
      non_zero_min = curr_max;
      $.each(curr_vals, (function(_this) {
        return function(k, v) {
          if (v > 0 && v < non_zero_min) {
            return non_zero_min = v;
          }
        };
      })(this));
      sizes = d3.scale.sqrt().domain([non_zero_min, curr_max]).range([3, 12]);
      this.circles.each((function(_this) {
        return function(c) {
          var s_val;
          s_val = _this.parse_numeric_string(c['values'][filter]);
          if (!isNaN(s_val) && s_val !== "") {
            c.radius = sizes(s_val);
            if (c.radius < 0) {
              return c.radius = 0;
            }
          } else {
            return c.radius = 0;
          }
        };
      })(this));
      return this.update();
    };

    Potato.prototype.order_by = function(filter) {
      var curr_max, curr_vals, non_zero_min, orders;
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          return curr_vals.push(_this.parse_numeric_string(c['values'][filter]));
        };
      })(this));
      curr_max = d3.max(curr_vals, function(d) {
        return d;
      });
      non_zero_min = curr_max;
      $.each(curr_vals, (function(_this) {
        return function(k, c) {
          if (c > 0 && c < non_zero_min) {
            return non_zero_min = c;
          }
        };
      })(this));
      orders = d3.scale.sqrt().domain([non_zero_min, curr_max]).range([220, this.width - 160]);
      if (non_zero_min === curr_max) {
        orders.range([this.width / 2.0, this.width / 2.0]);
      }
      this.circles.each((function(_this) {
        return function(c) {
          var s_val;
          s_val = _this.parse_numeric_string(c['values'][filter]);
          if (!isNaN(s_val) && s_val !== "") {
            return c.tarx = orders(parseFloat(s_val));
          } else {
            return c.tarx = -1000;
          }
        };
      })(this));
      this.labels.push({
        type: "order",
        val: non_zero_min,
        label_id: "head-label",
        split: filter,
        x: this.width / 2.0,
        y: 0,
        tarx: this.width / 2.0,
        tary: 0
      });
      this.labels.push({
        type: "order",
        val: filter,
        label_id: "text-label",
        x: this.width / 2.0,
        y: 0,
        tarx: this.width / 2.0,
        tary: 0
      });
      if (non_zero_min !== curr_max) {
        this.labels[0]['x'] = 220;
        this.labels[0]['tarx'] = 220;
        this.labels.push({
          type: "order",
          val: curr_max,
          label_id: "tail-label",
          split: filter,
          x: this.width - 160,
          y: 0,
          tarx: this.width - 160,
          tary: 0
        });
        this.axis.push({
          x1: 220,
          x2: this.width - 160,
          y1: 0,
          y2: 0
        });
      }
      return this.update();
    };

    Potato.prototype.update = function() {
      var axis, text, that;
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("stroke-width", function(d) {
        if (d["class"].length > 0) {
          return d.radius * 0.3;
        } else {
          return 0;
        }
      }).attr("id", function(d) {
        return "bubble_" + d.id;
      }).on("mouseover", function(d, i) {
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      }).attr("class", function(d) {
        if (d["class"].length > 0) {
          return d["class"].toLowerCase().replace(/\s/g, '_').replace('.', '');
        } else {
          return '';
        }
      });
      this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
      }).duration(500).attr("fill", function(d) {
        return d.color;
      }).attr("stroke", function(d) {
        return d3.rgb(d.color).darker();
      });
      this.circles.exit().remove();
      this.vis.selectAll(".split-labels").remove();
      text = this.vis.selectAll(".split-labels").data(this.labels);
      text.enter().append("text").attr("x", function(d) {
        return d.x;
      }).attr("y", function(d) {
        return d.y;
      }).attr("class", 'split-labels').attr("id", function(d) {
        return d.label_id;
      }).text(function(d) {
        return d.val;
      });
      text.exit().remove();
      this.vis.selectAll(".axis-label").remove();
      axis = this.vis.selectAll(".axis-label").data(this.axis);
      axis.enter().append("line").attr("x1", function(d) {
        return d.x1;
      }).attr("x2", function(d) {
        return d.x2;
      }).attr("y1", function(d) {
        return d.y1;
      }).attr("y2", function(d) {
        return d.y2;
      }).attr("stroke", "#999").attr("class", "axis-label");
      axis.exit().remove();
      this.force.on("tick", (function(_this) {
        return function(e) {
          var head_label, tail_label;
          _this.circles.each(_this.move_towards_target(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
          text.each(_this.adjust_label_pos());
          text.each(_this.move_towards_target(e.alpha)).attr("x", function(d) {
            return d.x;
          }).attr("y", function(d) {
            return d.y;
          });
          head_label = _this.vis.select("#head-label");
          tail_label = _this.vis.select("#tail-label");
          if ((head_label[0][0] != null) && (axis[0][0] != null)) {
            axis.attr("x1", parseInt(head_label.attr('x')) + 35);
            axis.attr("y1", head_label.attr('y') - 7);
            axis.attr("x2", tail_label.attr('x') - 40);
            return axis.attr("y2", tail_label.attr('y') - 7);
          }
        };
      })(this));
      return this.force.start();
    };

    Potato.prototype.adjust_label_pos = function() {
      return (function(_this) {
        return function(d) {
          var count, max_x, min_x, min_y, totx;
          min_y = 10000;
          min_x = 10000;
          max_x = 0;
          if (d.type === "order") {
            totx = 0;
            count = 0;
            _this.circles.each(function(c) {
              if ((c.y - c.radius) < min_y) {
                min_y = c.y - c.radius;
              }
              if (d.label_id !== "text-label" && d.val === parseFloat(c['values'][d.split])) {
                totx += c.x;
                return count += 1;
              }
            });
            if (d.label_id === "text-label") {
              return d.tary = min_y - 40;
            } else if (count > 0) {
              d.tary = min_y - 20;
              return d.tarx = totx / count;
            }
          } else {
            _this.circles.each(function(c) {
              if (d.val === c['values'][d.split]) {
                if ((c.y - c.radius) < min_y) {
                  min_y = c.y - c.radius;
                }
                if ((c.x - c.radius) < min_x) {
                  min_x = c.x - c.radius;
                }
                if ((c.x + c.radius) > max_x) {
                  return max_x = c.x + c.radius;
                }
              }
            });
            d.tary = min_y - 10;
            return d.tarx = (max_x - min_x) / 2.0 + min_x;
          }
        };
      })(this);
    };

    Potato.prototype.move_towards_target = function(alpha) {
      return (function(_this) {
        return function(d) {
          d.x = d.x + (d.tarx - d.x) * 0.5 * alpha;
          return d.y = d.y + (d.tary - d.y) * 0.5 * alpha;
        };
      })(this);
    };

    Potato.prototype.show_details = function(data, i, element) {
      var content;
      content = "";
      $.each(data.values, function(k, v) {
        return content += v + "<br/>";
      });
      $("#node-tooltip").html(content);
      this.update_position(d3.event, "node-tooltip");
      $("#node-tooltip").show();
      return this.highlight_node(d3.select(element), true);
    };

    Potato.prototype.hide_details = function(data, i, element) {
      $("#node-tooltip").hide();
      return this.highlight_node(d3.select(element), false);
    };

    Potato.prototype.highlight_node = function(element, highlight) {
      var s_width;
      if (element.attr("class").length <= 0) {
        if (highlight) {
          s_width = element.attr("r") * 0.3;
        } else {
          s_width = 0;
        }
        return element.attr("r", (function(_this) {
          return function(d) {
            return d.radius + (s_width / 2.0);
          };
        })(this)).attr("stroke-width", s_width);
      }
    };

    Potato.prototype.update_position = function(e, id) {
      var tth, ttleft, tttop, ttw, xOffset, yOffset;
      xOffset = 20;
      yOffset = 10;
      ttw = $("#" + id).width();
      tth = $("#" + id).height();
      ttleft = (e.pageX + xOffset * 2 + ttw) > $(window).width() ? e.pageX - ttw - xOffset * 2 : e.pageX + xOffset;
      tttop = (e.pageY + yOffset * 2 + tth) > $(window).height() ? e.pageY - tth - yOffset * 2 : e.pageY + yOffset;
      return $("#" + id).css('top', tttop + 'px').css('left', ttleft + 'px');
    };

    Potato.prototype.parse_numeric_string = function(str) {
      return parseFloat(str.replace(/%/, "").replace(/,/g, ""));
    };

    return Potato;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

}).call(this);
