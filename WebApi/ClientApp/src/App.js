import React from "react";
import { Route } from "react-router";
import Layout from "./components/Layout";
import PeaksFinder from "./components/PeaksFinder";

export default () => (
  <Layout>
    <Route exact path="/" component={PeaksFinder} />
  </Layout>
);
