import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuPage } from "./MenuPage";
import { BubbleMiniGamePage } from "./BubbleMiniGamePage";
import { VictoryPage } from "./VictoryPage";
import Admin from './Admin';
import { Treasure } from './Treasure';


function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/bubble-minigame" element={<BubbleMiniGamePage />} />
          <Route path="/victory" element={<VictoryPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/treasure" element={<Treasure />} />
        </Routes>
      </Router>
  )
}

export default App;
