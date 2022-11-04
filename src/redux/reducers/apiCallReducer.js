import {
  GET_INIT_DATA,
  RESET_INIT_DATA,
  GET_USER_DATA,
  UPDATE_LAYOUT,
} from "../types/apiCallTypes";

const initialState = {
  initDataLoaded: false,
  userInfo: {},
};

export const apiCallReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GET_INIT_DATA:
      return {
        ...state,
        initDataLoaded: true,
        userInfo: {
          user: action.payload.user,
          detailed_user: action.payload.detailed_user,
          aux_data: action.payload.aux_data,
        },
      };
    case RESET_INIT_DATA:
      return {
        ...state,
        initDataLoaded: false,
        userInfo: {},
      };
    case GET_USER_DATA:
      return {
        ...state,
        userInfo: action.payload,
      };
    default:
      return state;
  }
};
