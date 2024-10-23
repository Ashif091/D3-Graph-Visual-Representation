"use client"

import {useEffect, useRef, useState} from "react"
import * as d3 from "d3"
import {useRouter} from "next/navigation"
import axios from "axios"

interface NodeData {
  id: string
  label: string
  link: string[]
}
const D3Graph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<NodeData[]>([])
  const router = useRouter()
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await axios.get<NodeData[]>(
          "http://localhost:3001/api/documents"
        )
        setNodes(response.data)
      } catch (error) {
        console.error("Failed to fetch nodes", error)
      }
    }

    fetchNodes()
  }, [])

  useEffect(() => {
    if (nodes.length === 0) return
    const width = containerRef.current?.offsetWidth || 600
    const height = containerRef.current?.offsetHeight || 400

    const links = nodes.flatMap((node) =>
      node.link.map((targetId) => ({
        source: node.id,
        target: targetId,
      }))
    )

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
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-100))
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
      .on("click", handleClick)

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
      .text((d: any) => d.label)

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)

      label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y)
    })

    function drag(simulation) {
      return d3
        .drag()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
    }

    function handleMouseOver(event: any, d: any) {
      node.attr("fill", (n: any) => (n.id === d.id ? "#7356ef" : "#ccc"))

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
    function handleClick(event: any, d: any) {
      router.push(`/documents/${d.id}`)
    }
    return () => {
      d3.select("#d3").selectAll("*").remove()
    }
  }, [nodes])

  return (
    <div
      ref={containerRef}
      id="d3"
      className="w-[100%] h-[30rem] border border-gray-200"
    ></div>
  )
} 

export default D3Graph
