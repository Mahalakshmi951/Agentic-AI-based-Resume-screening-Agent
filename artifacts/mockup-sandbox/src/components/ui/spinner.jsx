import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";import { jsx as _jsx } from "react/jsx-runtime";

function Spinner({ className, ...props }) {
  return (/*#__PURE__*/
    _jsx(Loader2Icon, {
      role: "status",
      "aria-label": "Loading",
      className: cn("size-4 animate-spin", className), ...
      props }
    ));

}

export { Spinner };