import React from "react";
import ContractEvaluator from "./components/ContractEvaluator";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">
        Contract Clause Risk Evaluator
      </h1>
      <ContractEvaluator />
    </div>
  );
}
