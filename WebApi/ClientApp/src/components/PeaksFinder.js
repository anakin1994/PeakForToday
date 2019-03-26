import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/PeaksInRadius";
import AwesomeDebouncePromise from "awesome-debounce-promise";

class PeaksFinder extends Component {
  componentWillMount() {
    // This method runs when the component is first added to the page
    const latitude = 49.314246;
    const longitude = -122.978473;
    const radiusKm = 10;

    this.props.requestPeaksInRadius(latitude, longitude, radiusKm);
  }

  requestPeaksInRadiusDebounced = AwesomeDebouncePromise(
    this.props.requestPeaksInRadius,
    500
  );

  requestPeaksNearDebounced = AwesomeDebouncePromise(
    this.props.requestPeaksNear,
    500
  );

  handleLatitudeChange = async event => {
    const { longitude, radiusKm } = this.props;
    await this.requestPeaksInRadiusDebounced(
      event.target.value,
      longitude,
      radiusKm
    );
  };

  handleLongitudeChange = async event => {
    const { latitude, radiusKm } = this.props;
    await this.requestPeaksInRadiusDebounced(
      latitude,
      event.target.value,
      radiusKm
    );
  };

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
    const { latitude, longitude, radiusKm, location } = this.props;
    return (
      <div>
        {
          <input
            type="text"
            name="location"
            placeholder="Where are you?"
            onChange={this.handleLocationChange}
          />
        }
        <input
          type="text"
          name="latitude"
          value={latitude}
          onChange={this.handleLatitudeChange}
        />
        <input
          type="text"
          name="longitude"
          value={longitude}
          onChange={this.handleLongitudeChange}
        />
        <input
          type="text"
          name="radiusKm"
          placeholder="How far can you drive?"
          onChange={this.handleRadiusChange}
        />
        <h1>Peaks in radius</h1>
        {renderPeaksTable(this.props)}
        {renderPagination(this.props)}
      </div>
    );
  }
}

function renderPeaksTable(props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Elevation</th>
          <th>Distance</th>
          <th>Hike Distance</th>
          <th>Elevation Gain</th>
          <th>Estimated Time</th>
        </tr>
      </thead>
      <tbody>
        {props.peaks.map(peak => (
          <tr key={peak.id}>
            <td>{peak.name}</td>
            <td>{Math.round(peak.elevationMeters)} m</td>
            <td>{peak.distanceKm.toFixed(2)} km</td>
            <td>
              {peak.hikeDistanceKm
                ? `${peak.hikeDistanceKm.toFixed(2)} km`
                : `No data`}
            </td>
            <td>
              {peak.elevationGain
                ? `${Math.round(peak.elevationGain)} m`
                : `No data`}
            </td>
            <td>
              {peak.estimatedTimeHours
                ? `${peak.estimatedTimeHours.toFixed(2)} h`
                : `No data`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderPagination(props) {
  return (
    <p className="clearfix text-center">
      {props.isLoading ? <span>Loading...</span> : []}
    </p>
  );
}

export default connect(
  state => state.peaksInRadius,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(PeaksFinder);
