import React from 'react';

import ReactDOM from 'react-dom/client';

import './index.css';

const App = React.lazy(() =>
  import(/* webpackChunkName: "App" */ './App').then(module => ({
    default: module.App,
  }))
);

const loader = (
  <div className="container">
    <div className="loading">
      <span className="pulse spinner">
        Lottery dApp is loading. Almost done.
        <br />
        Please wait.
      </span>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={loader}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
