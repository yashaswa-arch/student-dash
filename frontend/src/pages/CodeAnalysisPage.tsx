import React from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '../components/CodeEditor';

const CodeAnalysisPage: React.FC = () => {
  const sampleCode = `// Sample JavaScript function to analyze
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  console.log("Total calculated:", total);
  return total;
}

// Usage example
const cartItems = [
  { name: "Laptop", price: 999, quantity: 1 },
  { name: "Mouse", price: 25, quantity: 2 }
];

const result = calculateTotal(cartItems);
console.log("Final result:", result);`;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 py-8"
      >
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔍 Code Analysis
          </h1>
          <p className="text-blue-100 text-lg">
            Get instant feedback on your code with intelligent analysis and recommendations
          </p>
        </div>
      </motion.div>

      {/* Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 py-6 border-b border-gray-700"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                🔍
              </div>
              <span className="font-medium">Code Quality Analysis</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                💡
              </div>
              <span className="font-medium">Smart Suggestions</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                📚
              </div>
              <span className="font-medium">Learning Recommendations</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Code Editor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="h-[calc(100vh-200px)]"
      >
        <CodeEditor
          initialCode={sampleCode}
          language="javascript"
          onCodeChange={(code) => {
            // Handle code changes if needed
            console.log('Code changed:', code.length, 'characters');
          }}
        />
      </motion.div>
    </div>
  );
};

export default CodeAnalysisPage;