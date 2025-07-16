import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuPage } from "./MenuPage";
import { BubbleMiniGamePage } from "./BubbleMiniGamePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/bubble-minigame" element={<BubbleMiniGamePage />} />
      </Routes>
    </Router>
  )
}

export default App;
