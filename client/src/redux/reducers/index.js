import { combineReducers } from "redux";

import state from "./state";
import nftReducer from "./nftReducer";

const rootReducer = combineReducers({ state, nftReducer });

export default rootReducer;
