import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import { lighten } from "@material-ui/core/styles/colorManipulator";

let counter = 0;
function createData(peak) {
  counter += 1;
  return {
    id: counter,
    name: peak.name,
    elevation: Math.round(peak.elevationMeters),
    distance: Math.round(peak.distanceKm * 100) / 100,
    hikeDistance:
      peak.hikeDistanceKm !== null
        ? Math.round(peak.hikeDistanceKm * 100) / 100
        : `No data`,
    elevationGain:
      peak.elevationGain !== null ? Math.round(peak.elevationGain) : `No data`,
    time:
      peak.estimatedTimeHours !== null
        ? Math.round(peak.estimatedTimeHours * 10) / 10
        : `No data`,
    latitude: peak.latitude,
    longitude: peak.longitude
  };
}

function desc(a, b, orderBy) {
  if (a[orderBy] === "No data") return 1;
  if (b[orderBy] === "No data") return -1;
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function asc(a, b, orderBy) {
  if (a[orderBy] === "No data") return 1;
  if (b[orderBy] === "No data") return -1;
  if (b[orderBy] < a[orderBy]) {
    return 1;
  }
  if (b[orderBy] > a[orderBy]) {
    return -1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => asc(a, b, orderBy);
}

const rows = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name"
  },
  {
    id: "distance",
    numeric: true,
    disablePadding: false,
    label: "Drive Distance (km)"
  },
  {
    id: "elevation",
    numeric: true,
    disablePadding: false,
    label: "Elevation (m)"
  },
  {
    id: "hikeDistance",
    numeric: true,
    disablePadding: false,
    label: "Hike Distance (km)"
  },
  {
    id: "elevationGain",
    numeric: true,
    disablePadding: false,
    label: "Elevation Gain (m)"
  },
  {
    id: "time",
    numeric: true,
    disablePadding: false,
    label: "Estimated Time (h)"
  }
];

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? "right" : "left"}
                padding={row.disablePadding ? "none" : "default"}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? "bottom-end" : "bottom-start"}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this
          )}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  spacer: {
    flex: "1 1 100%"
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: "0 0 auto"
  }
});

let EnhancedTableToolbar = props => {
  const { classes, location, radiusKm } = props;

  return (
    <Toolbar className={classNames(classes.root)}>
      <div className={classes.title}>
        {
          <Typography variant="h6" id="tableTitle">
            {`Peaks within ${radiusKm} km from ${location}`}
          </Typography>
        }
      </div>
      <div className={classes.spacer} />
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.string
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3
  },
  table: {
    minWidth: 1020
  },
  tableWrapper: {
    overflowX: "auto"
  }
});

class EnhancedTable extends React.Component {
  state = {
    order: "asc",
    orderBy: "distance",
    data: this.props.peaks.map(peak => createData(peak))
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  render() {
    const { classes, location, radiusKm } = this.props;
    const { data, order, orderBy } = this.state;

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar location={location} radiusKm={radiusKm} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy)).map(n => {
                return (
                  <TableRow hover tabIndex={-1} key={n.id}>
                    <TableCell
                      component="th"
                      scope="row"
                      component="a"
                      href={`bingmaps:?cp=${n.latitude}~${
                        n.longitude
                      }&sty=3d&rad=1000&pit=68&collection=point.${n.latitude}_${
                        n.longitude
                      }_${n.name.replace(" ", "%20")}`}
                    >
                      {n.name}
                    </TableCell>
                    <TableCell align="right">{n.distance}</TableCell>
                    <TableCell align="right">{n.elevation}</TableCell>
                    <TableCell align="right">{n.hikeDistance}</TableCell>
                    <TableCell align="right">{n.elevationGain}</TableCell>
                    <TableCell align="right">{n.time}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  peaks: PropTypes.arrayOf(PropTypes.object).isRequired,
  location: PropTypes.string,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EnhancedTable);
