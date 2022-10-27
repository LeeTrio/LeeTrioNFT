import { SET_NFTS, SELECTED_NFT } from "../actions";

const initialState = {
  name: null,
  image: null,
  description: null,
};

const nftReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NFTS:
      return {
        ...initialState,
        name: action.payload.name,
        image: action.payload.image,
        description: action.payload.description,
      };
    default:
      return state;
  }
};

export default nftReducer;
