import React, { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import { useParams } from "react-router-dom";
import { privateAxios } from "../../utils/axios";
import { useNoteContext } from "../../contexts/NoteContext";

import "@xyflow/react/dist/style.css";
import { showToast } from "../../utils/toast";

// Define CustomNode component inline to avoid import issues
const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        background: "#3454c3",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        minWidth: "150px",
        textAlign: "center",
        fontWeight: "500",
      }}
    >
      {/* Top handle (for incoming connections) */}
      <Handle type="target" position={Position.Top} id="top" />

      {/* Node content */}
      {data.label}

      {/* Bottom handle (for outgoing connections) */}
      <Handle type="source" position={Position.Bottom} id="bottom" />

      {/* Right handle */}
      <Handle type="source" position={Position.Right} id="right" />

      {/* Left handle */}
      <Handle type="target" position={Position.Left} id="left" />
    </div>
  );
};

// Define CustomEdge component inline to avoid import issues
const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "#3454c340",
            color: "#fff",
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          {data?.label || ""}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const ReactFlowComponent = () => {
  const { id } = useParams();
  const { noteData } = useNoteContext();
  const [initialNodes, setInitialNodes] = useState([]);
  const [initialEdges, setInitialEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Process edges to add required properties
  const processEdges = useCallback((rawEdges) => {
    return rawEdges.map((edge) => ({
      ...edge,
      // Add source and target handles based on node positions
      sourceHandle: determineSourceHandle(edge),
      targetHandle: determineTargetHandle(edge),
      style: { stroke: "#ddd", strokeWidth: 2 },
    }));
  }, []);

  // Determine which handle to use based on the edge
  const determineSourceHandle = (edge) => {
    // Basic logic - can be improved based on actual node positions
    const sourceId = parseInt(edge.source);
    const targetId = parseInt(edge.target);

    // If target is numerically greater, likely below or to the right
    if (targetId > sourceId) {
      return "bottom"; // Default to bottom if target is "after" source
    } else {
      return "right"; // Otherwise use right
    }
  };

  const determineTargetHandle = (edge) => {
    // Basic logic - can be improved based on actual node positions
    const sourceId = parseInt(edge.source);
    const targetId = parseInt(edge.target);

    // If target is numerically greater, likely below or to the right
    if (targetId > sourceId) {
      return "top"; // Default to top if target is "after" source
    } else {
      return "left"; // Otherwise use left
    }
  };

  useEffect(() => {
    const processGraphData = async () => {
      try {
        setLoading(true);
        if (noteData && noteData.summary && noteData.summary.graph) {
          const parsedGraph = JSON.parse(noteData.summary.graph);

          if (parsedGraph.nodes) {
            setNodes(parsedGraph.nodes);
          }

          if (parsedGraph.edges) {
            const processedEdges = processEdges(parsedGraph.edges);
            setEdges(processedEdges);
          }

          setLoading(false);
          return;
        }

        // Fallback to fetching if data not available in context
        const response = await privateAxios.get(`/notes/${id}/`);

        if (response.data.summary && response.data.summary.graph) {
          const parsedGraph = JSON.parse(response.data.summary.graph);

          if (parsedGraph.nodes) {
            setNodes(parsedGraph.nodes);
          }

          if (parsedGraph.edges) {
            const processedEdges = processEdges(parsedGraph.edges);
            setEdges(processedEdges);
          }
        }
      } catch (error) {
        console.error("Failed to process graph data:", error);
        showToast.error("Server is currently busy");
      } finally {
        setLoading(false);
      }
    };

    processGraphData();
  }, [id, noteData, processEdges, setNodes, setEdges]);

  // Node types mapping
  const nodeTypes = {
    CustomNode,
  };

  // Edge types mapping
  const edgeTypes = {
    CustomEdge,
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#131313" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 0.8,
          includeHiddenNodes: false,
          duration: 500,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        style={{ background: "#131313" }}
        defaultEdgeOptions={{ type: "CustomEdge" }}
      >
        <Controls style={{ color: "black" }} />
        <Background color="#304884" gap={20} variant="dots" />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowComponent;
