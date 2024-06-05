import React from "react";
import { GlobalStyle } from "./globalStyles/GlobalStyle";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "./page/PageNotFound";

import Delphi from "./page/Delphi";
function App() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Delphi />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
