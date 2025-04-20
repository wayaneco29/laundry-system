import plugin from "preline";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "node_modules/preline/dist/*.js",
  ],
  plugins: [plugin],
};
