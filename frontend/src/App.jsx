import AppRoutes from "./routes/AppRoutes";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <>
      <AppRoutes />

      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </>
  );
}

export default App;
