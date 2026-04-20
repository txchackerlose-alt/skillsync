import React from "react";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      minHeight: "100vh",
      background: "var(--bg)"
    }}>
      <Spinner text="Loading..." />
    </div>
  );
}
