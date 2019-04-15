import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/PeaksInRadius";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import PeaksTable from "./PeaksTable";
import { withStyles } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";

const styles = theme => ({
  page: {
    backgroundImage: "url(background.jpg)",
    backgroundAttachment: "fixed",
    position: "fixed",
    width: "100%",
    height: "100%",
    backgroundPosition: "center",
    backgrounRepeat: "no-repeat",
    backgroundSize: "cover",
    zIndex: -1
  },
  root: {
    display: "flex",
    width: "auto",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 4,
    height: "100vh",
    opacity: 0.95,
    color: theme.palette.common.white
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    padding: theme.spacing.unit * 2,
    backgroundColor: "rgba(255,255,255,.99)",
    borderRadius: 16
  },
  input: {
    margin: theme.spacing.unit
  },
  formControl: {
    margin: theme.spacing.unit
  },
  progress: {
    padding: theme.spacing.unit * 8,
    marginLeft: "36%"
  },
  errorMessage: {
    paddingTop: theme.spacing.unit * 2
  },
  copyright: {
    color: theme.palette.common.white,
    position: "absolute",
    bottom: 5,
    right: 10
  }
});

class PeaksFinder extends Component {
  componentWillMount() {
    // This method runs when the component is first added to the page
    const location = "Vancouver";
    const radiusKm = 20;

    this.props.requestPeaksNear(location, radiusKm);
  }

  requestPeaksNearDebounced = AwesomeDebouncePromise(
    this.props.requestPeaksNear,
    500
  );

  handleRadiusChange = async event => {
    const { location } = this.props;
    await this.requestPeaksNearDebounced(location, event.target.value);
  };

  handleLocationChange = async event => {
    const { radiusKm } = this.props;
    this.requestPeaksNearDebounced(event.target.value, radiusKm);
  };

  render() {
    const {
      classes,
      isLoading,
      peaks,
      location,
      radiusKm,
      isError,
      tooManyPeaks
    } = this.props;
    return (
      <div>
        <div className={classes.page}>
          <Typography
            className={classes.copyright}
          >{`${"\u00A9"} Piotr Markowski 2019`}</Typography>
        </div>
        <div className={classes.root}>
          <CssBaseline />
          <main className={classes.content}>
            <Typography
              variant="h4"
              gutterBottom
              component="h2"
              color="inherit"
            >
              Find a peak for today
            </Typography>
            <div className={classes.container}>
              <FormControl className={classes.formControl}>
                <TextField
                  label="Location"
                  placeholder="Where are you?"
                  inputProps={{
                    "aria-label": "Location"
                  }}
                  variant="outlined"
                  onChange={this.handleLocationChange}
                  autoFocus
                />
              </FormControl>
              <FormControl className={classes.formControl}>
                <TextField
                  type="number"
                  label="Max distance (km)"
                  placeholder="How far can you drive?"
                  inputProps={{
                    "aria-label": "Max distance"
                  }}
                  variant="outlined"
                  onChange={this.handleRadiusChange}
                />
              </FormControl>
            </div>
            {isLoading ? (
              <div>
                <CircularProgress
                  className={classes.progress}
                  color="inherit"
                  size={300}
                />{" "}
              </div>
            ) : isError ? (
              <Typography
                variant="h4"
                component="h2"
                color="inherit"
                className={classes.errorMessage}
              >
                {tooManyPeaks
                  ? "Too many peaks in specified area. Please, try to narrow your search criteria."
                  : "Ooops, no peaks here..."}
              </Typography>
            ) : (
              <div className={classes.tableContainer}>
                <PeaksTable
                  peaks={peaks}
                  location={location}
                  radiusKm={radiusKm}
                />
              </div>
            )}
          </main>
        </div>
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
