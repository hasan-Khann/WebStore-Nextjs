import { toast } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

export function showToast({ type = "info", title, msg, action = null, duration = 5000 }) {
  const handler = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast,
  }[type] || toast;

  const styleMap = {
    success: {
      background: "#1f2937",
      color: "#22c55e",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    error: {
      background: "#1f2937",
      color: "#ef4444",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    warning: {
      background: "#1f2937",
      color: "#facc15",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    info: {
      background: "#1f2937",
      color: "#60a5fa",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
  };

  const iconMap = {
    success: <CheckCircle size={24} color={styleMap.success.color} />,
    error: <XCircle size={24} color={styleMap.error.color} />,
    warning: <AlertTriangle size={24} color={styleMap.warning.color} />,
    info: <Info size={24} color={styleMap.info.color} />,
  };

  handler(title || "E-store", {
    description: msg,
    duration: duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    style: styleMap[type] || styleMap.info,
    icon: iconMap[type] || iconMap.info,
  });
}
