
import React from 'react'
import rd3   from 'react-d3-library';
const RD3Component = rd3.Component;


const BUBBLES_DATA = {
  name : "root",
  children : [
    { name: '1', size: 100, color:'rgb(252, 45, 121)' },
    { name: '2', size: 100, color:'rgb(252, 182, 53)'  },
    { name: '3', size: 100, color:'rgb(193, 193, 193)' },
    { name: '4', size: 100, color:'rgb(74, 144, 226)'  },
    { name: '5', size: 100, color:'rgb(17, 205, 197)'  },
    { name: '6', size: 100, color:'rgb(252, 182, 53)'  },
    { name: '7', size: 100, color:'rgb(17, 205, 197)'  },
  ]
}


const BubblesD3 = (data, node) => {
    var w = 340, h = 680;

    var canvas = d3.select(node).append("svg")
      .attr("width",  "100vw")
      .attr("height", "100vh")
      .append("g")
      .attr("align", "center")

    var nodes = d3.layout.pack()
      .padding(20)
      .value(function(d) { return d.size; })
      .size([340, 380])
      .nodes(data);
    nodes.shift();

    var circles = canvas.selectAll('circles').data(nodes).enter().append('g').attr('class', 'circles')

    circles.append('circle')
        .attr('cx',    (d) => { return d.x; })
        .attr('cy',    (d) => { return d.y; })
        .attr('r',     (d) => { return d.r; })
        .attr('fill',  (d) => { return d.color; })
        .attr('index', (d, i) => { return i; })
        .on("mouseover", function(d) {
          d3.select(this).transition().ease('elastic').attr('r', (d) => { return d.r * 1.1; })
        }).on("mouseout", function(d) {
          d3.selectAll('circle').attr('hide', false).transition().delay(100).attr('opacity', 1)
          d3.select(this).transition().ease('quad').attr('r', (d) => { return d.r; })
        }).on("click", function(d) {
          d3.select('circles').transition().attr('opacity', 0)
          d3.selectAll('circle').transition().attr('opacity', 0).attr('hide', true)
          d3.select(this).attr('hide', false)
          d3.select(this).transition().attr('r', (d) => { return d.r * 100; })
        })

    circles.append('text')
        .attr('x',  (d) => { return d.x })
        .attr('y',  (d) => { return d.y })
        .attr('dy', (d) => { return "0.35em" })
        .attr('class', 'icon')
        .style("text-anchor", "middle")
        .text(function(d) { return '\uf207'; });

    return node;
}


const BubblesD3Node = () => {
    let node = document.createElement('div')
    return BubblesD3(BUBBLES_DATA, node)
}


class Bubbles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {d3: ''}
    }
    componentDidMount() {
        let node = BubblesD3Node()
        this.setState({d3: node});
    }
    componentDidUpdate(prevProps, prevState) {
        return false
    }
    render() {
        const style = {
            margin:    'auto'
        ,   boxSizing: 'border-box'
        ,   width:     '100%'
        ,   textAlign: 'center'
        ,   padding:   0
        }
        const inlineStyle = `
        .icon {
            font-family: FontAwesome;
            font-size: 4em;
            opacity: 0.5;
            pointer-events: none;
        }
        `
        return (
          <div style={style}>
            <style>{inlineStyle}</style>
            <RD3Component data={this.state.d3} />
          </div>
        )
    }
}


export default Bubbles;