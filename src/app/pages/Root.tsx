import { Outlet } from "react-router";

export default function Root() {
  return (
    <div style={{ width: "100vw", overflowX: "hidden", background: "#000" }}>
      <Outlet />
    </div>
  );
}
