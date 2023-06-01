import {GlobalProvider} from './context/GlobalState'
import {TokenPurchase, LockedToken, UnLocked, Banner, Information} from './components/index';

export default function App() {
 
  return (
    <GlobalProvider>
      <div className="flex flex-col min-h-screen">
      <header className="header px-8">
        <div className="logo">CoinPinver Golden Eagle (CPGE)</div>
      </header>
      <main className="main">
        <Banner />
        <Information/>
       <div className="flex flex-col md:flex-row md:justify-between gap-3">
          <TokenPurchase />
          <LockedToken />
          <UnLocked />
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2023 CoinPinver Golden Eagle (CPGE). Todos los derechos reservados.</p>
      </footer>
    </div>
    </GlobalProvider>
  )
}