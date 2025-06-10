// Test script to verify Agent button visibility logic
// This script tests the conditions for showing/hiding the Agent button

const testCases = [
  {
    name: "Not logged in",
    isLoggedIn: false,
    userRole: null,
    expectedAgentButtonVisible: false,
  },
  {
    name: "Logged in as customer",
    isLoggedIn: true,
    userRole: "customer",
    expectedAgentButtonVisible: true,
  },
  {
    name: "Logged in as agent",
    isLoggedIn: true,
    userRole: "agent",
    expectedAgentButtonVisible: false,
  },
  {
    name: "Logged in as admin",
    isLoggedIn: true,
    userRole: "admin",
    expectedAgentButtonVisible: true,
  },
];

console.log("🧪 Testing Agent button visibility logic...\n");

testCases.forEach((testCase, index) => {
  // Simulate the condition from hero-section.tsx: isLoggedIn && userRole !== 'agent'
  const agentButtonVisible =
    testCase.isLoggedIn && testCase.userRole !== "agent";

  const passed = agentButtonVisible === testCase.expectedAgentButtonVisible;
  const status = passed ? "✅ PASS" : "❌ FAIL";

  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  isLoggedIn: ${testCase.isLoggedIn}`);
  console.log(`  userRole: ${testCase.userRole}`);
  console.log(
    `  Expected Agent button visible: ${testCase.expectedAgentButtonVisible}`
  );
  console.log(`  Actual Agent button visible: ${agentButtonVisible}`);
  console.log(`  Result: ${status}\n`);
});

console.log("🎯 Summary:");
console.log(
  "- Agent button should be visible for logged-in users who are NOT already agents"
);
console.log(
  '- This prevents agents from seeing a redundant "Agent" registration button'
);
console.log("- Customers and admins can still see the button to become agents");
