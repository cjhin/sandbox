// Generated by CoffeeScript 1.7.1
(function() {
  var root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Potato = (function() {
    function Potato(data, params) {
      if (params == null) {
        params = {
          split: true,
          color: true,
          size: true
        };
      }
      this.safe_string = __bind(this.safe_string, this);
      this.update_position = __bind(this.update_position, this);
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.move_towards_target = __bind(this.move_towards_target, this);
      this.adjust_label_pos = __bind(this.adjust_label_pos, this);
      this.update = __bind(this.update, this);
      this.size_by = __bind(this.size_by, this);
      this.size_buttons = __bind(this.size_buttons, this);
      this.color_by = __bind(this.color_by, this);
      this.color_buttons = __bind(this.color_buttons, this);
      this.split_by = __bind(this.split_by, this);
      this.split_buttons = __bind(this.split_buttons, this);
      this.remove_nodes = __bind(this.remove_nodes, this);
      this.add_node = __bind(this.add_node, this);
      this.add_nodes_by_filter_range = __bind(this.add_nodes_by_filter_range, this);
      this.add_nodes_by_filter = __bind(this.add_nodes_by_filter, this);
      this.remove_filter = __bind(this.remove_filter, this);
      this.add_filter = __bind(this.add_filter, this);
      this.remove_all = __bind(this.remove_all, this);
      this.add_all = __bind(this.add_all, this);
      this.add_categorical_filter = __bind(this.add_categorical_filter, this);
      this.test_numeric = __bind(this.test_numeric, this);
      this.add_numeric_filter = __bind(this.add_numeric_filter, this);
      this.subset_selection = __bind(this.subset_selection, this);
      this.create_filters = __bind(this.create_filters, this);
      this.data = data;
      this.width = $(window).width();
      this.height = $(window).height() - 105;
      $.each(this.data, (function(_this) {
        return function(i, d) {
          return d.node_id = i;
        };
      })(this));
      $("#vis").append("<div class='tooltip' id='node-tooltip'></div>").append("<div id='toolbar'><div id='modifiers'></div><div id='filter-select-buttons'></div></div>");
      $("#node-tooltip").hide();
      this.vis = d3.select("#vis").append("svg").attr("viewBox", "0 0 " + this.width + " " + this.height).attr("id", "vis-svg");
      this.force = d3.layout.force().gravity(-0.01).charge(function(d) {
        return -Math.pow(d.radius, 2.0) * 1.5;
      }).size([this.width, this.height]);
      this.nodes = this.force.nodes();
      this.labels = [];
      this.curr_filters = [];
      this.create_filters();
      if (params.split) {
        this.split_buttons();
      }
      if (params.color) {
        this.color_buttons();
      }
      if (params.size) {
        this.size_buttons();
      }
      this.subset_selection();
    }

    Potato.prototype.create_filters = function() {
      var filter_counter;
      this.sorted_filters = {};
      this.filters = {};
      this.filter_names = [];
      $.each(this.data[0], (function(_this) {
        return function(d) {
          if (d !== 'node_id') {
            _this.filter_names.push({
              value: d
            });
            return _this.sorted_filters[d] = [];
          }
        };
      })(this));
      filter_counter = 1;
      this.data.forEach((function(_this) {
        return function(d) {
          return $.each(d, function(k, v) {
            var curr_filter, filter_exists;
            if (k !== 'node_id') {
              filter_exists = $.grep(_this.sorted_filters[k], function(e) {
                return e.filter === k && e.value === v;
              });
              if (filter_exists.length === 0) {
                curr_filter = {
                  id: filter_counter,
                  filter: k,
                  value: v
                };
                _this.sorted_filters[k].push(curr_filter);
                _this.filters[filter_counter] = curr_filter;
                return filter_counter += 1;
              }
            }
          });
        };
      })(this));
      this.categorical_filters = [];
      this.numeric_filters = [];
      $.each(this.sorted_filters, (function(_this) {
        return function(f, v) {
          if (isNaN(v[0].value)) {
            if (v.length !== _this.data.length && v.length < 500) {
              return _this.categorical_filters.push({
                value: f
              });
            }
          } else {
            return _this.numeric_filters.push({
              value: f
            });
          }
        };
      })(this));
      return $.each(this.categorical_filters, (function(_this) {
        return function(k, v) {
          return _this.sorted_filters[v.value].sort(function(a, b) {
            if (a.value === b.value) {
              return 0;
            } else {
              return (a.value > b.value) || -1;
            }
          });
        };
      })(this));
    };

    Potato.prototype.subset_selection = function() {
      var subset_select_button, that;
      $("#vis").append("<div id='subset-wrapper'><div id='subset-selection'> <div id='subset-help-text'> <button id='all-data'>Display All Data</button> <p>OR</p> Display data matching any of the selected values: </div> <div id='numeric-filters'></div> <div id='categorical-filters'></div> </div></div>");
      subset_select_button = $("<button id='subset-select-button'>Data Selection</button>");
      subset_select_button.click(function() {
        return $("#subset-wrapper").toggle();
      });
      $("#modifiers").append(subset_select_button);
      $("#subset-selection").height($(window).height() - 200).width($(window).width() - 300).css("margin-left", 100).css("margin-top", $("#toolbar").outerHeight() + 25);
      $("#subset-selection").click(function(e) {
        return e.stopPropagation();
      });
      $("#subset-wrapper").click(function() {
        return $("#subset-wrapper").hide();
      });
      that = this;
      $("#all-data").addClass("filter-0").on("click", function(e) {
        if ($(this).hasClass("active")) {
          return that.remove_all();
        } else {
          $(this).addClass("active");
          that.add_all();
          return $("#subset-wrapper").hide();
        }
      });
      $.each(this.numeric_filters, (function(_this) {
        return function(k, v) {
          return _this.add_numeric_filter(v.value, _this.sorted_filters[v.value]);
        };
      })(this));
      $.each(this.categorical_filters, (function(_this) {
        return function(k, v) {
          return _this.add_categorical_filter(v.value, _this.sorted_filters[v.value]);
        };
      })(this));
      return $("#subset-wrapper").show();
    };

    Potato.prototype.add_numeric_filter = function(k, v) {
      var dash, filter_group, filter_id, filter_max, filter_min, input_max, input_min;
      filter_id = "filter" + k;
      filter_group = $("<div class='filter-group-wrapper'><div class='filter-group-header'>" + k + "</div><form class='filter-numeric' id='" + filter_id + "'></form></div>");
      $("#numeric-filters").append(filter_group);
      filter_min = Math.floor(d3.min(v, function(d) {
        return parseFloat(d.value);
      }));
      filter_max = Math.ceil(d3.max(v, function(d) {
        return parseFloat(d.value);
      }));
      input_min = $("<input type='number' name='" + k + "' value=" + filter_min + " min=" + filter_min + " max=" + filter_max + ">");
      dash = $("<span>-</span>");
      input_max = $("<input type='number' name='" + k + "' value=" + filter_max + " min=" + filter_min + " max=" + filter_max + ">");
      return $("#" + filter_id).append(input_min).append(dash).append(input_max).append($("<input type='submit' value='apply'>")).submit((function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.test_numeric(e);
        };
      })(this));
    };

    Potato.prototype.test_numeric = function(e) {
      console.log(e.target[0].name);
      console.log(e.target[0].value);
      console.log(e.target[1].value);
      return this.add_nodes_by_filter_range(e.target[0].name, e.target[0].value, e.target[1].value);
    };

    Potato.prototype.add_categorical_filter = function(k, v) {
      var filter_group, filter_id, that;
      filter_id = "filter" + k;
      filter_group = $("<div class='filter-group-wrapper'><div class='filter-group-header'>" + k + "</div><div class='filter-group' id='" + filter_id + "'></div></div>");
      $("#categorical-filters").append(filter_group);
      that = this;
      return d3.select("#" + filter_id).selectAll('div').data(v).enter().append("div").attr("class", function(d) {
        return "filter-value filter-" + d.id;
      }).text(function(d) {
        return d.value;
      }).on("click", function(d) {
        if ($(this).hasClass("active")) {
          return that.remove_filter(d.id);
        } else {
          that.add_filter(d.id);
          return $(this).addClass("active");
        }
      });
    };

    Potato.prototype.add_all = function() {
      var filter_button;
      if (this.nodes.length !== this.data.length) {
        if (this.curr_filters.length > 0) {
          this.remove_all();
        }
        this.curr_filters.push({
          id: 0
        });
        filter_button = $("<button class='active filter-button filter-0'>All Data</button>");
        filter_button.on("click", (function(_this) {
          return function(e) {
            return _this.remove_all();
          };
        })(this));
        $("#filter-select-buttons").append(filter_button);
        return this.add_nodes_by_filter(null);
      }
    };

    Potato.prototype.remove_all = function() {
      return $.each(this.curr_filters, (function(_this) {
        return function(k, f) {
          return _this.remove_filter(f.id);
        };
      })(this));
    };

    Potato.prototype.add_filter = function(id) {
      var curr_filter, filter_button;
      curr_filter = this.filters[id];
      if (this.curr_filters.length === 1 && this.curr_filters[0].id === 0) {
        this.remove_all();
      }
      if (this.curr_filters.length === 0) {
        $("#filter-select-buttons").text("Current subsets: ");
      }
      this.curr_filters.push(curr_filter);
      filter_button = $("<button class='active filter-button filter-" + id + "'>" + curr_filter.value + "</button>");
      filter_button.on("click", (function(_this) {
        return function(e) {
          return _this.remove_filter(id);
        };
      })(this));
      $("#filter-select-buttons").append(filter_button);
      return this.add_nodes_by_filter(id);
    };

    Potato.prototype.remove_filter = function(id) {
      var curr_filter;
      curr_filter = this.filters[id];
      this.remove_nodes(id);
      $(".filter-" + id).each(function(k, v) {
        var f_obj;
        f_obj = $(v);
        if (f_obj.hasClass('filter-button')) {
          return f_obj.detach();
        } else {
          return f_obj.removeClass("active");
        }
      });
      if (this.curr_filters.length === 0) {
        return $("#filter-select-buttons").text("");
      }
    };

    Potato.prototype.add_nodes_by_filter = function(id) {
      var curr_filter, split_id;
      if (id) {
        curr_filter = this.filters[id];
      }
      this.data.forEach((function(_this) {
        return function(d) {
          if (id === null || d[curr_filter.filter] === curr_filter.value) {
            if ($.grep(_this.nodes, function(e) {
              return e.id === d.node_id;
            }).length === 0) {
              return _this.add_node(d);
            }
          }
        };
      })(this));
      this.update();
      split_id = $(".split-option.active").attr('id');
      if (split_id !== void 0) {
        return this.split_by(split_id.split('-')[1]);
      }
    };

    Potato.prototype.add_nodes_by_filter_range = function(id, min, max) {
      this.data.forEach((function(_this) {
        return function(d) {
          if (parseFloat(d[id]) >= min && parseFloat(d[id]) <= max) {
            if ($.grep(_this.nodes, function(e) {
              return e.id === d.node_id;
            }).length === 0) {
              return _this.add_node(d);
            }
          }
        };
      })(this));
      return this.update();
    };

    Potato.prototype.add_node = function(d) {
      var curr_class, curr_r, node, vals;
      vals = {};
      $.each(this.filter_names, (function(_this) {
        return function(k, f) {
          return vals[f.value] = d[f.value];
        };
      })(this));
      curr_class = '';
      curr_r = 5;
      if (d['team']) {
        curr_class = d.team;
        curr_r = 8;
      }
      node = {
        id: d.node_id,
        radius: curr_r,
        values: vals,
        color: "#777",
        "class": curr_class,
        x: Math.random() * 900,
        y: Math.random() * 800,
        tarx: this.width / 2.0,
        tary: this.height / 2.0
      };
      return this.nodes.push(node);
    };

    Potato.prototype.remove_nodes = function(id) {
      var curr_filter, len, should_remove;
      if (id === 0) {
        while (this.nodes.length > 0) {
          this.nodes.pop();
        }
        while (this.curr_filters.length > 0) {
          this.curr_filters.pop();
        }
      } else {
        curr_filter = this.filters[id];
        this.curr_filters = $.grep(this.curr_filters, (function(_this) {
          return function(e) {
            return e['filter'] !== curr_filter.filter || e['value'] !== curr_filter.value;
          };
        })(this));
        len = this.nodes.length;
        while (len--) {
          if (this.nodes[len]['values'][curr_filter.filter] === curr_filter.value) {
            should_remove = true;
            this.curr_filters.forEach((function(_this) {
              return function(k) {
                if (_this.nodes[len]['values'][k['filter']] === k['value']) {
                  return should_remove = false;
                }
              };
            })(this));
            if (should_remove === true) {
              this.nodes.splice(len, 1);
            }
          }
        }
      }
      return this.update();
    };

    Potato.prototype.split_buttons = function() {
      $("#modifiers").append("<div id='split-wrapper' class='modifier-wrapper'><button id='split-button' class='modifier-button'>Split By<span class='button-arrow'>&#x25BC;</span><span id='split-hint' class='modifier-hint'></span></button><div id='split-menu' class='modifier-menu'></div></div>");
      $("#split-button").hover(function() {
        return $("#split-menu").slideDown(100);
      });
      $("#split-wrapper").mouseleave(function() {
        return $("#split-menu").slideUp(100);
      });
      return d3.select("#split-menu").selectAll('div').data(this.categorical_filters).enter().append("div").text(function(d) {
        return d.value;
      }).attr("class", 'modifier-option split-option').attr("id", function(d) {
        return 'split-' + d.value;
      }).on("click", (function(_this) {
        return function(d) {
          return _this.split_by(d.value);
        };
      })(this));
    };

    Potato.prototype.split_by = function(split) {
      var curr_col, curr_row, curr_vals, height_2, num_cols, num_rows, width_2;
      if (this.circles === void 0 || this.circles.length === 0) {
        return;
      }
      $("#split-hint").html("<br>" + split);
      $(".split-option").removeClass('active');
      $("#split-" + split).addClass('active');
      while (this.labels.length > 0) {
        this.labels.pop();
      }
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          if (curr_vals.indexOf(c['values'][split]) < 0) {
            return curr_vals.push(c['values'][split]);
          }
        };
      })(this));
      num_rows = Math.round(Math.sqrt(curr_vals.length)) + 1;
      num_cols = curr_vals.length / (num_rows - 1);
      curr_row = 0;
      curr_col = 0;
      width_2 = this.width * 0.75;
      height_2 = this.height * 0.8;
      curr_vals.sort();
      curr_vals.forEach((function(_this) {
        return function(s, i) {
          var label;
          curr_vals[i] = {
            split: s,
            tarx: (_this.width * 0.08) + (0.5 + curr_col) * (width_2 / num_cols),
            tary: (_this.height * 0.15) + (0.5 + curr_row) * (height_2 / num_rows)
          };
          label = {
            val: s,
            split: split,
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
            if (s.split === c['values'][split]) {
              c.tarx = s.tarx;
              return c.tary = s.tary;
            }
          });
        };
      })(this));
      return this.update();
    };

    Potato.prototype.color_buttons = function() {
      $("#vis").append("<div id='color-legend'></div>");
      $("#modifiers").append("<div id='color-wrapper' class='modifier-wrapper'><button id='color-button' class='modifier-button'>Color By<span class='button-arrow'>&#x25BC;</span><span id='color-hint' class='modifier-hint'></span></button><div id='color-menu' class='modifier-menu'></div></div>");
      $("#color-button").hover(function() {
        return $("#color-menu").slideDown(100);
      });
      $("#color-wrapper").mouseleave(function() {
        return $("#color-menu").slideUp(100);
      });
      return d3.select("#color-menu").selectAll('div').data(this.categorical_filters).enter().append("div").text(function(d) {
        return d.value;
      }).attr("class", 'modifier-option color-option').attr("id", function(d) {
        return 'color-' + d.value;
      }).on("click", (function(_this) {
        return function(d) {
          return _this.color_by(d.value);
        };
      })(this));
    };

    Potato.prototype.color_by = function(split) {
      var colors, curr_vals, g, l_size, legend, num_colors;
      if (this.circles === void 0 || this.circles.length === 0) {
        return;
      }
      $("#color-hint").html("<br>" + split);
      $(".color-option").removeClass('active');
      $("#color-" + split).addClass('active');
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          if (curr_vals.indexOf(c['values'][split]) < 0) {
            return curr_vals.push(c['values'][split]);
          }
        };
      })(this));
      num_colors = curr_vals.length;
      colors = d3.scale.ordinal().domain(curr_vals).range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5']);
      d3.select("#color-legend").selectAll("*").remove();
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
      this.circles.each((function(_this) {
        return function(c) {
          return curr_vals.forEach(function(s) {
            if (s === c['values'][split]) {
              return c.color = String(colors(s));
            }
          });
        };
      })(this));
      return this.circles.attr("fill", function(d) {
        return d.color;
      });
    };

    Potato.prototype.size_buttons = function() {
      $("#modifiers").append("<div id='size-wrapper' class='modifier-wrapper'><button id='size-button' class='modifier-button'>Size By<span class='button-arrow'>&#x25BC;</span><span id='size-hint' class='modifier-hint'></span></button><div id='size-menu' class='modifier-menu'></div></div>");
      $("#size-button").hover(function() {
        return $("#size-menu").slideDown(100);
      });
      $("#size-wrapper").mouseleave(function() {
        return $("#size-menu").slideUp(100);
      });
      return d3.select("#size-menu").selectAll('div').data(this.numeric_filters).enter().append("div").text(function(d) {
        return d.value;
      }).attr("class", 'modifier-option size-option').attr("id", function(d) {
        return 'size-' + d.value;
      }).on("click", (function(_this) {
        return function(d) {
          return _this.size_by(d.value);
        };
      })(this));
    };

    Potato.prototype.size_by = function(split) {
      var curr_max, curr_vals, non_zero_min, sizes;
      if (this.circles === void 0 || this.circles.length === 0) {
        return;
      }
      $("#size-hint").html("<br>" + split);
      $(".size-option").removeClass('active');
      $("#size-" + split).addClass('active');
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          return curr_vals.push(parseFloat(c['values'][split]));
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
      sizes = d3.scale.sqrt().domain([non_zero_min, curr_max]).range([2, 20]).clamp(true);
      this.circles.each((function(_this) {
        return function(c) {
          var s_val;
          s_val = c['values'][split];
          if (!isNaN(s_val) && s_val !== "") {
            return c.radius = sizes(parseFloat(s_val));
          } else {
            return c.radius = 0;
          }
        };
      })(this));
      return this.update();
    };

    Potato.prototype.update = function() {
      var that;
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("stroke-width", 3).attr("id", function(d) {
        return "bubble_" + d.id;
      }).attr("fill", function(d) {
        return d.color;
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
      });
      this.circles.exit().remove();
      this.vis.selectAll(".split-labels").remove();
      this.text = this.vis.selectAll(".split-labels").data(this.labels);
      this.text.enter().append("text").attr("x", function(d) {
        return d.x;
      }).attr("y", function(d) {
        return d.y;
      }).attr("class", 'split-labels').text(function(d) {
        return d.val;
      });
      this.text.exit().remove();
      this.force.on("tick", (function(_this) {
        return function(e) {
          _this.circles.each(_this.move_towards_target(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
          _this.text.each(_this.adjust_label_pos());
          return _this.text.each(_this.move_towards_target(e.alpha)).attr("x", function(d) {
            return d.x;
          }).attr("y", function(d) {
            return d.y;
          });
        };
      })(this));
      return this.force.start();
    };

    Potato.prototype.adjust_label_pos = function() {
      return (function(_this) {
        return function(d) {
          var max_x, min_x, min_y;
          min_y = 10000;
          min_x = 10000;
          max_x = 0;
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
        };
      })(this);
    };

    Potato.prototype.move_towards_target = function(alpha) {
      return (function(_this) {
        return function(d) {
          d.x = d.x + (d.tarx - d.x) * 0.7 * alpha;
          return d.y = d.y + (d.tary - d.y) * 0.7 * alpha;
        };
      })(this);
    };

    Potato.prototype.show_details = function(data, i, element) {
      var content;
      content = "";
      $.each(data.values, function(k, v) {
        return content += "" + v + "<br/>";
      });
      $("#node-tooltip").html(content);
      this.update_position(d3.event);
      return $("#node-tooltip").show();
    };

    Potato.prototype.hide_details = function(data, i, element) {
      return $("#node-tooltip").hide();
    };

    Potato.prototype.update_position = function(e) {
      var tth, ttleft, tttop, ttw, xOffset, yOffset;
      xOffset = 20;
      yOffset = 10;
      ttw = $("#node-tooltip").width();
      tth = $("#node-tooltip").height();
      ttleft = (e.pageX + xOffset * 2 + ttw) > $(window).width() ? e.pageX - ttw - xOffset * 2 : e.pageX + xOffset;
      tttop = (e.pageY + yOffset * 2 + tth) > $(window).height() ? e.pageY - tth - yOffset * 2 : e.pageY + yOffset;
      return $("#node-tooltip").css('top', tttop + 'px').css('left', ttleft + 'px');
    };

    Potato.prototype.safe_string = function(input) {
      return input.toLowerCase().replace(/\s/g, '_').replace('.', '');
    };

    return Potato;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

}).call(this);
