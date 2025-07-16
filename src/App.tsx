import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuPage } from "./MenuPage";
import { BubbleMiniGamePage } from "./BubbleMiniGamePage";
import { VictoryPage } from "./VictoryPage";
import Admin from './Admin';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Treasure } from './Treasure';


const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/bubble-minigame" element={<BubbleMiniGamePage />} />
          <Route path="/victory" element={<VictoryPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/treasure" element={<Treasure />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App;
