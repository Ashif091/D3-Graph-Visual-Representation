"use client"

import {useEffect, useRef} from "react"
import * as d3 from "d3"
const D3Graph: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {

    const width = containerRef.current?.offsetWidth || 600
    const height = containerRef.current?.offsetHeight || 400

    const nodes = [
      {id: "a", label: "Gokul"},
      {id: "b", label: "Node B"},
      {id: "c", label: "Node C"},
      {id: "d", label: "Node D"},
      {id: "e", label: "Node e"},
      {id: "f", label: "Node f"},
      {id: "g", label: "Node g"},
    ]

    const links = [
      {source: "a", target: "b"},
      {source: "b", target: "c"},
      {source: "c", target: "d"},
      {source: "c", target: "f"},
      {source: "f", target: "g"},
      {source: "g", target: "e"},
      {source: "g", target: "f"},
      {source: "g", target: "a"},
    ]

    const svg = d3
      .select("#d3")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(
        d3
          .zoom()
          .scaleExtent([0.01, 4])
          .on("zoom", (event) => {
            svg.attr("transform", event.transform)
          })
      )
      .append("g")

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", "#666")
      .call(drag(simulation))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)

    const label = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dy", "1.5em")
      .attr("x", 12)
      .attr("fill", "#fff")
      .text((d) => d.label)

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)

      label.attr("x", (d) => d.x).attr("y", (d) => d.y)
    })

    function drag(simulation) {
      return d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
    }

    function handleMouseOver(event, d) {
      node.attr("fill", (n) => (n.id === d.id ? "#7356ef" : "#ccc"))

      // __________________
      link.attr("stroke", (l) =>
        l.source.id === d.id || l.target.id === d.id ? "#7356ef" : "#ccc"
      )
      //   ____________________
      label.attr("fill", (n) =>
        n.id === d.id ||
        links.some(
          (link) =>
            (link.source.id === d.id && link.target.id === n.id) ||
            (link.target.id === d.id && link.source.id === n.id)
        )
          ? "#fff"
          : "#4e4e4e"
      )
      // _________________________
      node.attr("opacity", (n) =>
        n.id === d.id ||
        links.some(
          (link) =>
            (link.source.id === d.id && link.target.id === n.id) ||
            (link.target.id === d.id && link.source.id === n.id)
        )
          ? 1
          : 0.2
      )
      link.attr("stroke-opacity", (l) =>
        l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
      )
    }

    function handleMouseOut() {
      node.attr("fill", "#666").attr("opacity", 1)
      link.attr("stroke", "#999").attr("stroke-opacity", 0.6)
      label.attr("fill", "#fff").attr("opacity", 1)
    }
    return () => {
      d3.select("#d3").selectAll("*").remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="d3"
      className="w-[100%] h-[30rem] border border-gray-200"
    ></div>
  )
}

export default D3Graph
