// src/components/StatsGraph.jsx
import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

const StatsGraph = ({ stats }) => {
  if (!stats.length) return null;

  const summary = [
    { name: "Wins", value: stats.filter(s => s.result === "win").length },
    { name: "Losses", value: stats.filter(s => s.result === "lose").length },
    { name: "Ties", value: stats.filter(s => s.result === "tie").length },
  ];

  return (
    <div style={{ width: "90%", margin: "auto", color: "#fff" }}>
      <h3>📉 Balance Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={stats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="round" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Line dataKey="balance" stroke="#00ff99" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <h3>📊 Win/Loss Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={summary}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsGraph;
