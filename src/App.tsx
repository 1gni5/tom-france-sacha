// import { CreateWordDialog } from './components/createWordDialog'
// import { Button } from './components/ui/button'
// import { WordTable } from './components/WordTable'

import { MenuPage } from "./MenuPage";

function isOffline() {
  return !navigator.onLine;
}

function App() {
  return (
    <>
      {/* <h1 className="text-2xl font-bold underline"> Hello World! </h1> */}
      <MenuPage></MenuPage>
      <div className="flex justify-between">
        <p>hello updated !</p>
        <p className="text-red-500">{isOffline() ? "Offline" : "Online"}</p>
      </div>

    </>
  )
}

export default App;
