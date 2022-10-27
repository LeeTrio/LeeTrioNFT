import React, { useState, useEffect } from "react";

import { useDispatch } from "react-redux";
import { connect } from "./redux/actions/index";

import Header from "./components/header/Header";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(connect());
  }, [dispatch]);

  return (
    <>
      <Header />
    </>
  );
}

export default App;
