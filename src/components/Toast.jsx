import { useEffect } from "react";

export default function Toast({ message, onDone, duration = 2000 }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, onDone, duration]);

  return <div className="badge-toast">{message}</div>;
}
