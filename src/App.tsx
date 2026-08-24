import { useRoutes } from "react-router-dom";

import { routeConfig } from "@/router/config";

export function App() {
  return useRoutes(routeConfig);
}

export default App
