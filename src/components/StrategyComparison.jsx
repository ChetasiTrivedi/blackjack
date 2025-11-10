// src/components/StrategyComparison.jsx
import React from "react";
import { simulateStrategy } from "../utils/blackjackLogic";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StrategyComparison = () => {
  const flat = simulateStrategy("flat", 500);
  const martingale = simulateStrategy("martingale", 500);
  const random = simulateStrategy("random", 500);

  return (
    <div style={{ width: "90%", margin: "auto", color: "#fff", marginTop: "40px" }}>
      <h2>📊 Betting Strategy Comparison</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="round" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Line data={flat} dataKey="balance" stroke="#00ff88" name="Flat" dot={false} />
          <Line data={martingale} dataKey="balance" stroke="#ff8844" name="Martingale" dot={false} />
          <Line data={random} dataKey="balance" stroke="#4488ff" name="Random" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StrategyComparison;
