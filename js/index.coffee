class BubbleChart
  constructor: (data) ->
    @data = data
    @width = 960
    @height = 750

    @tooltip = CustomTooltip("player_tooltip")

    @vis = d3.select("#vis").append("svg")
      .attr("width", @width)
      .attr("height", @height)

    @force = d3.layout.force()
      .gravity(-0.01)
      .charge((d) -> -Math.pow(d.radius, 2.0) * 1.5)
      .size([@width, @height])

    # this is necessary so graph and model stay in sync
    # http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout
    @nodes = @force.nodes()

    this.do_teams()
    this.do_schools()
    this.do_positions()
    this.split_buttons()

  do_teams: ->
    teams = []

    @data.forEach (d) => # from data, add all unique teams to array
      if teams.indexOf(d.team) < 0
        teams.push d.team

    teams = teams.sort()

    d3.select("#team-select").selectAll('option').data(teams).enter()
      .append("option")
      .attr("value", (d) -> d)
      .text((d) -> d)

    $("#team-select").select2({
      placeholder: 'Select a Team',
      width: 'resolve'
    }).on("change", (e) => this.toggleField('team', e))

  do_schools: ->
    schools = []

    @data.forEach (d) => # from data, add all unique schools to array
      if schools.indexOf(d.school) < 0
        schools.push d.school

    d3.select("#school-select").selectAll('option').data(schools).enter()
      .append("option")
      .attr("value", (d) -> d)
      .text((d) -> d)

    $("#school-select").select2({
      placeholder: 'Select a School',
      width: 'resolve'
    }).on("change", (e) => this.toggleField('school', e))


    
  do_positions: ->
    positions = []

    @data.forEach (d) => # from data, add all unique positions to array
      if positions.indexOf(d.position) < 0
        positions.push d.position

    d3.select("#position-select").selectAll('option').data(positions).enter()
      .append("option")
      .attr("value", (d) -> d)
      .text((d) -> d)

    $("#position-select").select2({
      placeholder: 'Select a Position',
      width: 'resolve'
    }).on("change", (e) => this.toggleField('position', e))

  # select2 passes in object e, which contains either .added or .removed based on action
  # e.added.id && e.removed.id are the values of the options,
  # eg. team name or school name
  toggleField: (field, e) =>
    if typeof e.added != 'undefined'
      if typeof e.added.id != 'undefined'
        this.add_nodes(field, e.added.id)
      else # a group was added

        this.remove_nodes('radius', 8) # hacky way to clear the board

        e.added.forEach (item) =>
          this.add_nodes(field, item.id)
    else if typeof e.removed != 'undefined'
      this.remove_nodes(field, e.removed.id)

  add_nodes: (field, val) =>
    @data.forEach (d) =>
      if d[field] == val
        node = {
          id: d.id
          radius: 8
          name: d.name
          team: d.team
          school: d.school
          position: d.position
          x: Math.random() * 900
          y: Math.random() * 800
          tarx: @width/2.0
          tary: @height/2.0
        }
        @nodes.push node
    this.update()

  remove_nodes: (field, val) =>
    # this was the only array iterator + removal I could get to work
    len = @nodes.length
    while (len--)
      if @nodes[len][field] == val
        @nodes.splice(len, 1)
    this.update()

  split_buttons: () =>
    $('#split-school').on("click", (e) => this.split_by_school())
    $('#split-team').on("click", (e) => this.split_by_team())
    $('#split-position').on("click", (e) => this.split_by_position())

  split_by_school: () =>
    curr_schools = []

    # first get number of unique schools
    @circles.each (c) =>
      if curr_schools.indexOf(c.school) < 0
        curr_schools.push c.school

    # then determine what spots all the schools should go to
    num_rows = Math.round(Math.sqrt(curr_schools.length)) + 1
    num_cols = curr_schools.length / (num_rows - 1)

    curr_row = 0
    curr_col = 0

    # padding because the clumps tend to float off the screen
    width_2 = @width - 200
    height_2 = @height - 130

    curr_schools.forEach (s, i) =>
      curr_schools[i] = { school: s, tarx: 50 + (0.5 + curr_col) * (width_2 / num_cols), tary: 70 + (0.5 + curr_row) * (height_2 / num_rows)}
      curr_col++
      if curr_col >= num_cols
        curr_col = 0
        curr_row++

    # then update all circles tarx and tary appropriately
    @circles.each (c) =>
      curr_schools.forEach (s) =>
        if s.school == c.school
          c.tarx = s.tarx
          c.tary = s.tary

    # then update
    this.update()

  split_by_team: () =>
    curr_teams = []

    # first get number of unique teams
    @circles.each (c) =>
      if curr_teams.indexOf(c.team) < 0
        curr_teams.push c.team

    # then determine what spots all the teams should go to
    num_rows = Math.round(Math.sqrt(curr_teams.length)) + 1
    num_cols = curr_teams.length / (num_rows - 1)

    curr_row = 0
    curr_col = 0

    # padding because the clumps tend to float off the screen
    width_2 = @width - 200
    height_2 = @height - 130

    curr_teams.forEach (s, i) =>
      curr_teams[i] = { team: s, tarx: 50 + (0.5 + curr_col) * (width_2 / num_cols), tary: 70 + (0.5 + curr_row) * (height_2 / num_rows)}
      curr_col++
      if curr_col >= num_cols
        curr_col = 0
        curr_row++

    # then update all circles tarx and tary appropriately
    @circles.each (c) =>
      curr_teams.forEach (s) =>
        if s.team == c.team
          c.tarx = s.tarx
          c.tary = s.tary

    # then update
    this.update()

  split_by_position: () =>
    curr_positions = []

    # first get number of unique positions
    @circles.each (c) =>
      if curr_positions.indexOf(c.position) < 0
        curr_positions.push c.position

    # then determine what spots all the positions should go to
    num_rows = Math.round(Math.sqrt(curr_positions.length)) + 1
    num_cols = curr_positions.length / (num_rows - 1)

    curr_row = 0
    curr_col = 0

    # padding because the clumps tend to float off the screen
    width_2 = @width - 200
    height_2 = @height - 130

    curr_positions.forEach (s, i) =>
      curr_positions[i] = { position: s, tarx: 50 + (0.5 + curr_col) * (width_2 / num_cols), tary: 70 + (0.5 + curr_row) * (height_2 / num_rows)}
      curr_col++
      if curr_col >= num_cols
        curr_col = 0
        curr_row++

    # then update all circles tarx and tary appropriately
    @circles.each (c) =>
      curr_positions.forEach (s) =>
        if s.position == c.position
          c.tarx = s.tarx
          c.tary = s.tary

    # then update
    this.update()


  update: () =>
    @circles = @vis.selectAll("circle")
      .data(@nodes, (d) -> d.id)

    # create new circles as needed
    that = this
    @circles.enter().append("circle")
      .attr("r", 0)
      .attr("stroke-width", 3)
      .attr("id", (d) -> "bubble_#{d.id}")
      .attr("class", (d) -> d.team.toLowerCase().replace(/\s/g, '_').replace('.',''))
      .on("mouseover", (d,i) -> that.show_details(d,i,this))
      .on("mouseout", (d,i) -> that.hide_details(d,i,this))

    # Fancy transition to make bubbles appear to 'grow in'
    @circles.transition().duration(2000).attr("r", (d) -> d.radius)

    # this is IMPORTANT otherwise removing nodes won't work
    @circles.exit().remove()

    @force.on "tick", (e) =>
      @circles.each(this.move_towards_target(e.alpha))
        .attr("cx", (d) -> d.x)
        .attr("cy", (d) -> d.y)

    @force.start()

  # move node towards the target defined in (tarx,tary)
  move_towards_target: (alpha) =>
    (d) =>
      d.x = d.x + (d.tarx - d.x) * (0.7) * alpha
      d.y = d.y + (d.tary - d.y) * (0.7) * alpha

  show_details: (data, i, element) =>
    content = "<div class='tooltip-name'>#{data.name}</div>"
    content +="#{data.team}<br/>"
    content +="#{data.school}<br/>"
    content +="#{data.position}"
    @tooltip.showTooltip(content,d3.event)

  hide_details: (data, i, element) =>
    @tooltip.hideTooltip()

root = exports ? this

$ ->
  chart = null

  render_vis = (csv) ->
    chart = new BubbleChart csv

  d3.csv "data/players.csv", render_vis

  render_conf = (csv) ->
    conferences = []
    d3.csv.parseRows(csv).forEach (r) =>
      conferences.push { name: r[0], teams: r.slice(1) }
    d3.select("#school-select-wrapper").selectAll('button').data(conferences).enter()
      .append("button")
      .attr("value", (d) -> d.name)
      .text((d) -> d.name)
      .on("click", (d) -> $("#school-select").select2('val', d.teams, true))

  d3.text "data/conferences.csv", render_conf