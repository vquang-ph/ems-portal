import AppProvider from "./AppProvider";

interface AppProps {
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  return <AppProvider>{children}</AppProvider>;
};

export default App;
