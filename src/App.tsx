import {
  Redirect,
  Route,
  HashRouter as Router,
  Switch,
} from 'react-router-dom';

import MainLayout from './components/Main';
import { allRoutes, defaultPath } from './routes';

const App = () => (
  <Router>
    <MainLayout>
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Redirect to={defaultPath} />}
        />
        {allRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} component={Component} />
        ))}
      </Switch>
    </MainLayout>
  </Router>
);

export default App;
