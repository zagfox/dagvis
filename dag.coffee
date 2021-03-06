esc = (name) -> name.replace(/\//g, '_')
boxof = (name) -> "rect#" + esc(name)
pathof = (from, to) -> "path#"+esc(from)+"-"+esc(to)
boxFocus = ""
nodes = []
for node, dat of gostd
    dat.name = node
    nodes.push(dat)

xgrid = 130
ygrid = 30
boxWidth = 120
boxHeight = 20

grids = []
xMax = 0
yMax = 0

main = ->
    cmpNode = (a, b) ->
        return -1 if a.x < b.x
        return 1 if a.x > b.x
        return -1 if a.y < b.y
        return 1 if a.y > b.y
        return 0

    nodes.sort(cmpNode)

    xpush = ->
        xmax = 0
        for dat in nodes
            if dat.x > xmax
                xmax = dat.x

        tryPush = (name) ->
            node = gostd[name]
            if node.x == xmax
                return {able: false, worthy: false}
            worthy = false
            for out in node.outs
                if gostd[out].x > node.x + 1
                    worthy = true
                    continue
                sub = tryPush(out)
                if not sub.able
                    return {able: false, worthy: false}
                if sub.worthy
                    worthy = true
            return {able: true, worthy: worthy}

        pushWorthy = (name) ->
            ret = tryPush(name)
            return ret.worthy

        push = (name) ->
            
            node = gostd[name]
            for out in node.outs
                if gostd[out].x > node.x + 1
                    continue # no need to push this
                push(out)

            node.newx = node.x + 1

            return

        revNodes = nodes.slice().reverse()
        for dat in revNodes
            name = dat.name
            # if dat.ins.length > 0
            #     continue
            while pushWorthy(name)
                for n in nodes
                    n.newx = n.x
                push(name)
                for n in nodes
                    n.x = n.newx

        return

    xpush()

    layout = ->
        xmax = 0
        ymax = 0
        for node, dat of gostd
            if dat.x > xmax
                xmax = dat.x
            if dat.y > ymax
                ymax = dat.y

        taken = []
        cols = []
        for i in [0..xmax]
            taken.push({})
            cols.push([])

        for node, dat of gostd
            cols[dat.x].push(dat)

        for col in cols
            col.sort((a, b) ->
                return -1 if a.outs.length > b.outs.length
                return 1 if a.outs.length < b.outs.length
                return 1 if a.name > b.name
                return -1 if a.name < b.name
                return 0
            )
        for col in cols
            for dat in col
                xthis = dat.x
                xmax = dat.x
                xmin = -1
                for out in dat.outs
                    n = gostd[out]
                    if n.x > xmax
                        xmax = n.x
                    if xmin == -1 or n.x < xmin
                        xmin = n.x

                tak = taken[xthis]
                y = 0
                while y of tak
                    y = y + 1

                tak[y] = true
                
                xmax = xmax-1
                if true
                    if xmax > xthis
                        for i in [xthis+1..xmax]
                            taken[i][y] = true
                dat.newy = y
                dat.xto = xmax

        for node, dat of gostd
            dat.y = dat.newy # reassign y
            # if dat.outs.length == 0
            #     dat.y = dat.y + 1
        return

    layout()
    createDAG()
    drawDAG()
    buildGrids()
    return

buildGrids = ->
    xMax = 0
    yMax = 30
    grids = []
    for node in nodes
        if node.x > xMax
            xMax = node.x

    for i in [0..xMax]
        lst = []
        for j in [0..yMax]
            lst.push(false)
        grids.push(lst)

    for node in nodes
        grids[node.x][node.y] = true

    return

createDAG = ->
    svg = d3.select("svg#main")

    paths = []
    for node, dat of gostd
        for output in dat.outs
            paths.push({n:esc(node)+"-"+esc(output)})

    for path in paths
        p = svg.append("path")
        p.attr("d", "")
        p.attr("id", "BG-"+path.n)
        p.attr("class", "bg")

    for path in paths
        p = svg.append("path")
        p.attr("d", "")
        p.attr("id", path.n)
        p.attr("class", "dep")

    lightIns = (name, first) ->
        if first
            boxin = "box in"
            depin = "dep in"
        else
            boxin = "box in2"
            depin = "dep in2"

        for input in gostd[name].ins
            svg.select(boxof(input)).attr("class", boxin)
            svg.select(pathof(input, name)).attr("class", depin)
            lightIns(input, false)
        return

    lightOuts = (name, first) ->
        if first
            boxout = "box out"
            depout = "dep out"
        else
            boxout = "box out2"
            depout = "dep out2"

        for output in gostd[name].outs
            svg.select(boxof(output)).attr("class", boxout)
            svg.select(pathof(name, output)).attr("class", depout)
            lightOuts(output, false)
        return

    hoverFunc = (name) ->
        return (d) ->
            svg.selectAll("rect").attr("class", "box")
            svg.selectAll("path.dep").attr("class", "dep")
            svg.select(boxof(name)).attr("class", "box focus")
            lightIns(name, true)
            lightOuts(name, true)

            return

    clickFunc = (name) ->
        hover = hoverFunc(name)
        return (d) ->
            hover()

            if boxFocus == name
                return
            svg.select("text.lab#lab-"+esc(boxFocus)).classed({
                "focus": false,
            })
            boxFocus = name
            svg.select("text.lab#lab-"+esc(boxFocus)).classed({
                "focus": true,
            })
            return
    
    dragFunc = (name) ->
        return (d) ->
            ydrag = Math.floor(d3.event.y / ygrid)
            ydrag = 0 if ydrag < 0
            ydrag = yMax if ydrag > yMax
            
            node = gostd[name]
            if not grids[node.x][ydrag]
                node.y = ydrag
            
            drawDAG()
            buildGrids()

            return

    for node, dat of gostd
        b = svg.append("rect")
        b.attr("ry", 5)
        b.attr("ry", 5)
        b.attr("width", boxWidth)
        b.attr("height", boxHeight)
        b.attr("class", "box")
        b.attr("id", esc(node))

        lab = svg.append("text")
        lab.attr("class", "lab")
        lab.attr("id", "lab-"+esc(node))
        lab.text(node)

        b.on("mouseover", hoverFunc(dat.name))

        # b.on("drag", dragFunc(dat.name))
        # lab.on("drag", dragFunc(dat.name))
        b.on("click", clickFunc(dat.name))
        lab.on("click", clickFunc(dat.name))

    return


drawDAG = ->
    # we now start drawing
    svg = d3.select("svg#main")

    paths = []
    for node, dat of gostd
        for output in dat.outs
            toNode = gostd[output]

            fromx = dat.x * xgrid+boxWidth
            fromy = dat.y * ygrid+boxHeight / 2

            tox = toNode.x * xgrid
            toy = toNode.y * ygrid+boxHeight / 2
            
            turnx = tox - 5
            
            path = "M" + fromx + " " + fromy
            path += " L" + turnx + " " + fromy
            path += " L" + turnx + " " + toy
            path += " L" + tox + " " + toy
            paths.push({p:path, n:esc(node)+"-"+esc(output)})

    for path in paths
        p = svg.select("path#BG-"+path.n)
        p.attr("d", path.p)

    for path in paths
        p = svg.select("path#"+path.n)
        p.attr("d", path.p)

    for node, dat of gostd
        b = svg.select("rect#"+esc(node))
        b.attr("x", dat.x * xgrid)
        b.attr("y", dat.y * ygrid)

        lab = svg.select("text#lab-"+esc(node))
        lab.attr("x", dat.x * xgrid + boxWidth / 2)
        lab.attr("y", dat.y * ygrid + boxHeight / 2 + 4)

    return

keydown = (e) ->
    if boxFocus == ""
        return

    if e.which == 38
        # up
        node = gostd[boxFocus]
        y = node.y - 1
        while y > 0
            if not grids[node.x][y]
                node.y = y
                drawDAG()
                buildGrids()
                break
            y = y - 1
        e.preventDefault()
    else if e.which == 40
        # down
        node = gostd[boxFocus]
        y = node.y + 1
        while y <= yMax
            if not grids[node.x][y]
                node.y = y
                drawDAG()
                buildGrids()
                break
            y = y + 1
        e.preventDefault()
    
    return true

$(document).keydown(keydown)
$(document).ready(main)
