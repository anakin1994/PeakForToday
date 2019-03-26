const requestPeaksInRadiusType = "REQUEST_PEAKS_IN_RADIUS";
const receivePeaksInRadiusType = "RECEIVE_PEAKS_IN_RADIUS";

const requestPeaksNearType = "REQUEST_PEAKS_NEAR";
const receivePeaksNearType = "RECEIVE_PEAKS_NEAR";

const initialState = { peaks: [], isLoading: false };

export const actionCreators = {
  requestPeaksInRadius: (latitude, longitude, radiusKm) => async (
    dispatch,
    getState
  ) => {
    dispatch({
      type: requestPeaksInRadiusType,
      latitude,
      longitude,
      radiusKm
    });

    const url = `api/Peaks/PeaksInRadius?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`;
    const response = await fetch(url);
    const peaksResponse = await response.json();

    dispatch({
      type: receivePeaksInRadiusType,
      radiusKm,
      peaksResponse
    });
  },

  requestPeaksNear: (location, radiusKm) => async (dispatch, getState) => {
    dispatch({ type: requestPeaksNearType, location, radiusKm });

    const url = `api/Peaks/PeaksNear?location=${location}&radiusKm=${radiusKm}`;
    const response = await fetch(url);
    const peaksResponse = await response.json();

    dispatch({
      type: receivePeaksNearType,
      location,
      radiusKm,
      peaksResponse
    });
  }
};

const peaksByDistance = (p1, p2) => {
  if (p1.distanceKm < p2.distanceKm) return -1;
  if (p1.distanceKm > p2.distanceKm) return 1;
  return 0;
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestPeaksInRadiusType) {
    return {
      ...state,
      latitude: action.latitude,
      longitude: action.longitude,
      radiusKm: action.radiusKm,
      isLoading: true
    };
  }

  if (action.type === receivePeaksInRadiusType) {
    return {
      ...state,
      latitude: action.peaksResponse.latitude,
      longitude: action.peaksResponse.longitude,
      radiusKm: action.radiusKm,
      peaks: action.peaksResponse.peaks.sort(peaksByDistance),
      isLoading: false
    };
  }

  if (action.type === requestPeaksNearType) {
    return {
      ...state,
      location: action.location,
      radiusKm: action.radiusKm,
      isLoading: true
    };
  }

  if (action.type === receivePeaksNearType) {
    return {
      ...state,
      location: action.location,
      latitude: action.peaksResponse.latitude,
      longitude: action.peaksResponse.longitude,
      radiusKm: action.radiusKm,
      peaks: action.peaksResponse.peaks.sort(peaksByDistance),
      isLoading: false
    };
  }

  return state;
};
