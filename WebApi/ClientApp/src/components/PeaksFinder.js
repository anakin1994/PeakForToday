import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/PeaksInRadius";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import PeaksTable from "./PeaksTable";
import { withStyles } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

const styles = theme => ({
  root: {
    display: "flex"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: "100vh",
    overflow: "auto"
  },
  appBarSpacer: theme.mixins.toolbar,
  tableContainer: {
    height: 320
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  input: {
    margin: theme.spacing.unit
  },
  formControl: {
    margin: theme.spacing.unit
  }
});

class PeaksFinder extends Component {
  componentWillMount() {
    // This method runs when the component is first added to the page
    const location = "Vancouver";
    const radiusKm = 20;

    this.props.requestPeaksNear(location, radiusKm);
  }

  requestPeaksInRadiusDebounced = AwesomeDebouncePromise(
    this.props.requestPeaksInRadius,
    500
  );

  requestPeaksNearDebounced = AwesomeDebouncePromise(
    this.props.requestPeaksNear,
    500
  );

  handleRadiusChange = async event => {
    const { latitude, longitude } = this.props;
    await this.requestPeaksInRadiusDebounced(
      latitude,
      longitude,
      event.target.value
    );
  };

  handleLocationChange = async event => {
    const { radiusKm } = this.props;
    this.requestPeaksNearDebounced(event.target.value, radiusKm);
  };

  render() {
    const { classes, isLoading } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Typography variant="h4" gutterBottom component="h2">
            Find a peak for today
          </Typography>
          <div className={classes.container}>
            <FormControl className={classes.formControl}>
              <InputLabel>Location</InputLabel>
              <Input
                placeholder="Where are you?"
                inputProps={{
                  "aria-label": "Location"
                }}
                onChange={this.handleLocationChange}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel>Max distance (km)</InputLabel>
              <Input
                placeholder="How far can you drive?"
                inputProps={{
                  "aria-label": "Max distance"
                }}
                onChange={this.handleRadiusChange}
              />
            </FormControl>
          </div>
          {isLoading ? null : (
            <div className={classes.tableContainer}>
              <PeaksTable peaks={this.props.peaks} />
            </div>
          )}
        </main>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    state => state.peaksInRadius,
    dispatch => bindActionCreators(actionCreators, dispatch)
  )(PeaksFinder)
);
