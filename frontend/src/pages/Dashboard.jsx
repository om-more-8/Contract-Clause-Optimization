import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import * as d3 from "d3";

export default function Dashboard() {
  // ============================
  // 1. STATE (STATIC MOCK DATA)
  // ============================
  const [avgSimilarity] = useState(83);

  const riskTrend = [
    { month: "1m", high: 2, medium: 4, low: 15 },
    { month: "2m", high: 3, medium: 5, low: 11 },
    { month: "3m", high: 2, medium: 3, low: 12 },
    { month: "4m", high: 1, medium: 6, low: 16 },
    { month: "5m", high: 4, medium: 5, low: 14 },
    { month: "6m", high: 2, medium: 8, low: 11 },
    { month: "7m", high: 3, medium: 6, low: 13 },
    { month: "8m", high: 2, medium: 4, low: 9 },
    { month: "9m", high: 1, medium: 5, low: 16 },
    { month: "10m", high: 4, medium: 7, low: 18 },
    { month: "11m", high: 3, medium: 6, low: 15 },
    { month: "12m", high: 2, medium: 4, low: 14 },
  ];

  const categoryFrequency = [
    { category: "Intellectual Property", count: 4 },
    { category: "Termination", count: 6 },
    { category: "Representations", count: 9 },
    { category: "Liability", count: 3 },
  ];

  const pieData = [
    { name: "Intellectual Property", value: 20, color: "#FFA500" },
    { name: "Liability", value: 18, color: "#5A54E2" },
    { name: "Payment", value: 22, color: "#1FA87A" },
    { name: "Representations", value: 25, color: "#6AA7FF" },
    { name: "Termination", value: 15, color: "#E84258" },
  ];

  const heatmapRows = ["Liability", "Payment", "IP", "Termination"];
  const heatmapCols = ["High", "Medium", "Low"];

  const heatmapData = [
    [3, 2, 6],
    [1, 4, 10],
    [2, 1, 5],
    [2, 3, 4],
  ];

  const recentEvaluations = [
    { file: "agreement1.pdf", risk: "Medium", time: "2025-12-06 13:22" },
    { file: "nda.pdf", risk: "Low", time: "2025-12-05 09:13" },
    { file: "service-contract.docx", risk: "High", time: "2025-12-02 18:40" },
  ];

  // Generate heatmap color scale
  const maxVal = Math.max(...heatmapData.flat());
  const colorScale = d3
    .scaleLinear()
    .domain([0, maxVal])
    .range(["#FFE5E5", "#C62828"]); // warm Seaborn-like red palette

  // ============================
  // CARD WRAPPER STYLE
  // ============================
  const Card = ({ children, className }) => (
    <div
      className={`bg-white shadow-lg rounded-2xl p-6 ${className}`}
      style={{ backdropFilter: "none" }}
    >
      {children}
    </div>
  );

  // ============================
  // SIMILARITY GAUGE (fixed)
  // ============================
  const Gauge = () => {
    const radius = 80;
    const stroke = 14;

    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - avgSimilarity / 100);

    return (
      <svg width="220" height="220">
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#EFEFEF"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#6A00FF"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text
          x="110"
          y="115"
          textAnchor="middle"
          fontSize="28"
          fill="#1A1A1A"
          fontWeight="700"
        >
          {avgSimilarity}%
        </text>
        <text
          x="110"
          y="150"
          textAnchor="middle"
          fontSize="14"
          fill="#777"
        >
          Avg similarity
        </text>
      </svg>
    );
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* ======================== */}
      {/* DASHBOARD HEADING */}
      {/* ======================== */}
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Dashboard</h1>

      {/* ======================== */}
      {/* METRIC CARDS */}
      {/* ======================== */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><p>Total Evaluations</p><h2 className="text-3xl font-bold">28</h2></Card>
        <Card><p>High Risk</p><h2 className="text-3xl font-bold">8</h2></Card>
        <Card><p>Medium Risk</p><h2 className="text-3xl font-bold">10</h2></Card>
        <Card><p>Low Risk</p><h2 className="text-3xl font-bold">25</h2></Card>
      </div>

      {/* ======================== */}
      {/* RISK TREND + GAUGE */}
      {/* ======================== */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        
        {/* RISK TREND (big card) */}
        <Card className="col-span-2">
          <h3 className="text-xl font-semibold mb-3">Risk trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={riskTrend} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="low" stroke="#00AEEF" strokeWidth={3} dot />
              <Line type="monotone" dataKey="medium" stroke="#F6A100" strokeWidth={3} dot />
              <Line type="monotone" dataKey="high" stroke="#FF4747" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* GAUGE */}
        <Card>
          <h3 className="text-xl font-semibold mb-3">Similarity Gauge</h3>
          <div className="flex justify-center items-center">
            <Gauge />
          </div>
        </Card>

      </div>

      {/* ======================== */}
      {/* CATEGORY FREQUENCY + PIE CHART */}
      {/* ======================== */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* BIG CATEGORY FREQUENCY BAR CHART */}
        <Card className="col-span-2">
          <h3 className="text-xl font-semibold mb-3">Category frequency</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryFrequency}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#5A54E2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* PIE CHART (small card) */}
        <Card>
          <h3 className="text-xl font-semibold mb-3">Category share</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} style={{ transition: "0.3s" }} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

      </div>

      {/* ======================== */}
      {/* TRUE HEATMAP */}
      {/* ======================== */}
      <Card className="mb-6">
        <h3 className="text-xl font-semibold mb-4">High-risk heatmap</h3>

        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2"></th>
                {heatmapCols.map((col) => (
                  <th key={col} className="p-2 text-gray-700 text-sm">{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {heatmapRows.map((row, i) => (
                <tr key={row}>
                  <td className="p-2 pr-4 text-gray-700 text-sm">{row}</td>

                  {heatmapCols.map((_, j) => (
                    <td
                      key={j}
                      className="w-20 h-14 border"
                      style={{
                        background: colorScale(heatmapData[i][j]),
                        transition: "0.3s",
                      }}
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Rows = categories, Columns = severity (High / Medium / Low), Color intensity = frequency.
        </p>
      </Card>

      {/* ======================== */}
      {/* RECENT EVALUATIONS */}
      {/* ======================== */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">Recent evaluations</h3>
        {recentEvaluations.map((item, i) => (
          <div key={i} className="p-3 border-b last:border-b-0 flex justify-between">
            <p className="font-medium">{item.file}</p>
            <span className="text-gray-700">{item.risk}</span>
            <span className="text-gray-500 text-sm">{item.time}</span>
          </div>
        ))}
      </Card>

    </div>
  );
}
