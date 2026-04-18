import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

export default function NotFound() {
  return (/*#__PURE__*/
    _jsx("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50", children: /*#__PURE__*/
      _jsx(Card, { className: "w-full max-w-md mx-4", children: /*#__PURE__*/
        _jsxs(CardContent, { className: "pt-6", children: [/*#__PURE__*/
          _jsxs("div", { className: "flex mb-4 gap-2", children: [/*#__PURE__*/
            _jsx(AlertCircle, { className: "h-8 w-8 text-red-500" }), /*#__PURE__*/
            _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "404 Page Not Found" })] }
          ), /*#__PURE__*/

          _jsx("p", { className: "mt-4 text-sm text-gray-600", children: "Did you forget to add the page to the router?" }

          )] }
        ) }
      ) }
    ));

}