import { Route, Switch } from 'wouter';
import { AlbumsPage } from './pages/AlbumsPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/albums" component={AlbumsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
