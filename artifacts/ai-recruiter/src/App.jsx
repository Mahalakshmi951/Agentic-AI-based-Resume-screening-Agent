import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

const queryClient = new QueryClient();

function Router() {
  return (/*#__PURE__*/
    _jsxs(Switch, { children: [/*#__PURE__*/
      _jsx(Route, { path: "/", component: Home }), /*#__PURE__*/
      _jsx(Route, { component: NotFound })] }
    ));

}

function App() {
  return (/*#__PURE__*/
    _jsx(QueryClientProvider, { client: queryClient, children: /*#__PURE__*/
      _jsxs(TooltipProvider, { children: [/*#__PURE__*/
        _jsx(WouterRouter, { base: import.meta.env.BASE_URL.replace(/\/$/, ""), children: /*#__PURE__*/
          _jsx(Router, {}) }
        ), /*#__PURE__*/
        _jsx(Toaster, {})] }
      ) }
    ));

}

export default App;