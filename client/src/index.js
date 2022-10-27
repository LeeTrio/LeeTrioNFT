import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { BrowserRouter } from "react-router-dom";

/* redux */
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import { applyMiddleware, legacy_createStore as createStore } from "redux";

import rootReducer from "./redux/reducers";

/* middleware */
const createStoreMiddleware = applyMiddleware(
  promiseMiddleware,
  thunk
)(createStore);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={createStoreMiddleware(rootReducer, composeWithDevTools())}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
