const requestPeaksNearType = "REQUEST_PEAKS_NEAR";
const receivePeaksNearType = "RECEIVE_PEAKS_NEAR";

const responseErrorType = "RESPONSE_ERROR";

const initialState = { peaks: [], isLoading: false };

export const actionCreators = {
  requestPeaksNear: (location, radiusKm) => async (dispatch, getState) => {
    dispatch({ type: requestPeaksNearType, location, radiusKm });

    const url = `api/Peaks/PeaksNear?location=${location}&radiusKm=${radiusKm}`;
    const response = await fetch(url);
    if (response.ok) {
      const peaks = await response.json();
      dispatch({
        type: receivePeaksNearType,
        location,
        radiusKm,
        peaks
      });
    } else {
      dispatch({
        type: responseErrorType,
        location,
        radiusKm,
        tooManyPeaks: response.status === 429
      });
    }
  }
};

const peaksByDistance = (p1, p2) => {
  if (p1.distanceKm < p2.distanceKm) return -1;
  if (p1.distanceKm > p2.distanceKm) return 1;
  return 0;
};

export const reducer = (state, action) => {
  state = state || initialState;

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
      radiusKm: action.radiusKm,
      peaks: action.peaks.sort(peaksByDistance),
      isLoading: false,
      isError: false
    };
  }

  if (action.type === responseErrorType) {
    return {
      ...state,
      location: action.location,
      radiusKm: action.radiusKm,
      isLoading: false,
      isError: true,
      tooManyPeaks: action.tooManyPeaks
    };
  }

  return state;
};
