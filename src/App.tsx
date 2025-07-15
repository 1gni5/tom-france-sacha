import { CreateWordDialog } from './components/createWordDialog'
import { Button } from './components/ui/button'
import { WordTable } from './components/WordTable'

function App() {

  return (
    <div className='bg-gradient-to-tr from-blue-500 via-purple-500 to-fuchsia-700 h-screen flex flex-col items-center justify-center gap-6'>
      <WordTable />
      <CreateWordDialog />
    </div >
  )
}

export default App
