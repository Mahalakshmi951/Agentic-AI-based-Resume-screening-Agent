import { setBaseUrl } from "@workspace/api-client-react";
setBaseUrl("http://localhost:3000");
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";import { jsx as _jsx } from "react/jsx-runtime";

createRoot(document.getElementById("root")).render(/*#__PURE__*/_jsx(App, {}));