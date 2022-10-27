import {
  STATE,
  MY_MODAL,
  SET_TIMER,
  CALL_CONTRACT,
  UPDATE_ACCOUNT,
  CHANGE_CHAINID,
  UPDATE_MYLISTS,
  UPDATE_SELLLISTS,
  UPDATE_MYBALANCE,
  CONNECTION_FAILED,
  REFRESH_SELLLISTS,
} from "../actions";

const initialState = {
  wallet: false,
  isUser: false,
  myModal: false,
  chainId: false,
  network: false,
  networkId: false,
  owner: null,
  account: null,
  errorMessage: null,
  LeeTrioNFTContract: null,
  LeeTrioTokenContract: null,
  LeeTrioUtilsContract: null,
  sellLists: [],
  myNFTLists: [],
  timer: 0,
  myBalance: 0,
};

const state = (state = initialState, action) => {
  switch (action.type) {
    case STATE:
      return {
        ...state,
        network: action.payload.network,
        networkId: action.payload.networkId,
        owner: action.payload.owner,
        timer: action.payload.timer,
        sellLists: action.payload.sellLists,
        errorMessage: action.payload.errorMessage,
      };
    case CONNECTION_FAILED:
      return {
        ...initialState,
        errorMessage: action.payload.errorMessage,
      };
    case CALL_CONTRACT:
      return {
        ...state,
        LeeTrioNFTContract: action.payload.LeeTrioNFTContract,
        LeeTrioTokenContract: action.payload.LeeTrioTokenContract,
        LeeTrioUtilsContract: action.payload.LeeTrioUtilsContract,
      };
    case UPDATE_ACCOUNT:
      return {
        ...state,
        wallet: action.payload.wallet,
        account: action.payload.account,
        isUser: action.payload.isUser,
        myNFTLists: action.payload.myNFTLists,
        myBalance: action.payload.myBalance,
      };
    case UPDATE_SELLLISTS:
      return {
        ...state,
        sellLists: action.payload.sellLists,
      };
    case UPDATE_MYLISTS:
      return {
        ...state,
        myNFTLists: action.payload.myNFTLists,
      };
    case UPDATE_MYBALANCE:
      return {
        ...state,
        myBalance: action.payload.myBalance,
      };
    case MY_MODAL:
      return {
        ...state,
        myModal: {
          myModal: action.payload.myModal,
          tokenId: action.payload.tokenId,
          price: action.payload.price,
        },
      };
    case SET_TIMER:
      return {
        ...state,
        timer: action.payload.timer,
      };
    case CHANGE_CHAINID:
      return {
        ...state,
        chainId: action.payload.chainId,
      };
    case REFRESH_SELLLISTS:
      return {
        ...state,
        sellLists: action.payload.sellLists,
      };
    default:
      return state;
  }
};

export default state;
