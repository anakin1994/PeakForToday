import React from "react";
import { Route } from "react-router";
import PeaksFinder from "./components/PeaksFinder";

export default () => <Route exact path="/" component={PeaksFinder} />;
