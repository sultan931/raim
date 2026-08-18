import { Route, Switch } from 'wouter';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AlbumsPage } from './pages/AlbumsPage';
import { HomePage } from './pages/HomePage';
import { InvitePage } from './pages/InvitePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ParentPage } from './pages/ParentPage';
import { RegisterPage } from './pages/RegisterPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/albums" component={AlbumsPage} />
        <Route path="/parent" component={ParentPage} />
        <Route path="/invite/:token/:slug" component={InvitePage} />
        <Route path="/invite/:token" component={InvitePage} />
        <Route path="/register" component={RegisterPage} />
        <Route component={NotFoundPage} />
      </Switch>
      <MobileBottomNav />
    </>
  );
}
