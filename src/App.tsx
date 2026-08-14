import { Route, Switch } from 'wouter';
import { AlbumsPage } from './pages/AlbumsPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/albums" component={AlbumsPage} />
      <Route path="/register" component={RegisterPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
