"use client"
import CytoscapeGraph from "../components/CytoscapeGraph"

const Home: React.FC = () => {
  return (
    <div className="w-20rem h-20rem">
      <h1>BEDROCK Graph Visual Representation</h1>
      <CytoscapeGraph />
    </div>
  )
}

export default Home
