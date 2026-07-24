import "./App.css";
import AppRoutes from "./routes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRoutes />

      {/* ✅ Sonner Toaster with custom CSS */}
      <Toaster
        position="bottom-right"
        expand
        closeButton
        toastOptions={{
          style: {
            background: "#111827",
            color: "#ffffff",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
          }
        }}
      />
    </>
  );
}

export default App;
