import React from "react";
import ContractEvaluator from "./components/ContractEvaluator";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-800 tracking-tight drop-shadow-sm">
          ⚖️ CogniClause – Smart Contract Risk Evaluator
        </h1>
        <ContractEvaluator />
        <footer className="text-center mt-10 text-gray-500 text-sm">
          © 2025 CogniClause | AI-Powered Legal Clause Analyzer
        </footer>
      </div>
    </div>
  );
}
