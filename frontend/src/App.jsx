import ContractEvaluator from "./components/ContractEvaluator";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          Contract Clause Optimizer (Frontend)
        </h1>
        <ContractEvaluator />
      </div>
    </div>
  );
}
