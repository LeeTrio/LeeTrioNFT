/* Libraries */
import Web3 from "web3";
import axios from "axios";
import { utils } from "ethers";

import sleep from "../../utils/sleep";

/* Contracts */
import Utils from "../../contracts/Utils.json";
import LeeTrioNFT from "../../contracts/LeeTrioNFT.json";
import LeeTrioToken from "../../contracts/LeeTrioToken.json";

/* ACTIONS */
export const STATE = "STATE";
export const MY_MODAL = "MU_MODAL";
export const SET_TIMER = "SET_TIMER";
export const CALL_CONTRACT = "CALL_CONTRACT";
export const UPDATE_MYLISTS = "UPDATE_MYLISTS";
export const UPDATE_ACCOUNT = "UPDATE_ACCOUNT";
export const CHANGE_CHAINID = "CHANGE_CHAINID";
export const UPDATE_SELLLISTS = "UPDATE_SELLLISTS";
export const UPDATE_MYBALANCE = "UPDATE_MYBALANCE";
export const REFRESH_SELLLISTS = "REFRESH_SELLLISTS";
export const CONNECTION_FAILED = "CONNECTION_FAILED";

export const SET_NFTS = "SET_NFTS";
export const SELECTED_NFT = "SELECTED_NFT";

const rpcUrl = process.env.CLIENT_RPC_URL;

/* ACTION CREATOR */
export const connectSuccess = (payload) => {
  return {
    type: STATE,
    payload: payload,
  };
};

export const connectFailed = (payload) => {
  return {
    type: CONNECTION_FAILED,
    payload: payload,
  };
};

export const callContract = (payload) => {
  return {
    type: CALL_CONTRACT,
    payload: payload,
  };
};

export const updateAccounts = (payload) => {
  return {
    type: UPDATE_ACCOUNT,
    payload: payload,
  };
};

export const updateSellLists = (payload) => {
  console.log(payload);
  return {
    type: UPDATE_SELLLISTS,
    payload: payload,
  };
};

export const setNfts = (payload) => {
  return {
    type: SET_NFTS,
    payload: payload,
  };
};

export const selectNfts = (payload) => {
  return {
    type: SELECTED_NFT,
    payload: payload,
  };
};

export const updateMyLists = (payload) => {
  console.log(payload);
  return {
    type: UPDATE_MYLISTS,
    payload: payload,
  };
};

export const updateMyBalance = (payload) => {
  return {
    type: UPDATE_MYBALANCE,
    payload: payload,
  };
};

export const mymodal = (payload) => {
  return {
    type: MY_MODAL,
    payload: payload,
  };
};

export const setTimer = (payload) => {
  return {
    type: SET_TIMER,
    payload: payload,
  };
};

export const changeChainId = (payload) => {
  return {
    type: CHANGE_CHAINID,
    payload: payload,
  };
};

export const refreshSellLists = (payload) => {
  return {
    type: REFRESH_SELLLISTS,
    payload: payload,
  };
};

/* connect */
export function connect() {
  return async (dispatch) => {
    try {
      const web3 = new Web3(rpcUrl || "http://localhost:7545");

      await web3.eth.net
        .isListening()
        .then(async (res) => {
          const givenNetworkId = await web3.eth.net.getId();
          const networkId = Object.keys(LeeTrioNFT.networks)[0];

          console.log("givenNetworkId", givenNetworkId);
          console.log("networkId", networkId);

          if (
            parseInt(givenNetworkId === parseInt(networkId)) &&
            res === true
          ) {
            const networkDataNFT = LeeTrioNFT.networks[networkId];
            const LeeTrioABI = LeeTrioNFT.abi;
            const LeeTrioAddress = networkDataNFT.address;
            const LeeTrioNFTContract = new web3.eth.Contract(
              LeeTrioABI,
              LeeTrioAddress
            );

            const owner = await LeeTrioNFTContract.methods.owner().call();
            const lists = await LeeTrioNFTContract.methods.sellLists().call();
            const listsForm = await Promise.all(
              lists.map(async (v) => {
                const tokenURI = await LeeTrioNFTContract.methods
                  .tokenURI(v.tokenId)
                  .call();
                const meta = await axios.get(tokenURI).then((res) => res.data);
                const item = {
                  fileUrl: await meta.image,
                  formInput: {
                    tokenId: v.tokenId,
                    price: utils.formatEther(v.price),
                    sell: v.sell,
                    name: await meta.name,
                    description: await meta.description,
                  },
                };
                return item;
              })
            );

            await axios
              .post("http://localhost:5000/user/owner", {
                addres: owner,
              })
              .then((res) => {
                dispatch(
                  connectSuccess({
                    network: true,
                    networkId: parseInt(givenNetworkId),
                    owner: owner,
                    timer: parseInt(res.data.count),
                    sellLists: listsForm,
                    errorMessage: "",
                  })
                );
              });
          } else {
            dispatch(connectFailed("접속 네트워크를 확인하세요."));
          }
        })
        .catch((error) => {
          console.error(error);
          dispatch(connectFailed("접속네트워크를 확인하세요."));
        });
    } catch (error) {
      console.error(error);
      dispatch(connectFailed("연결 실패"));
    }
  };
}

export function getWeb3(Provider) {
  return async (dispatch) => {
    try {
      if (Provider !== undefined) {
        const web3 = new Web3(Provider);
        const givenNetworkId = await web3.eth.net.getId();
        const networkId = Object.keys(LeeTrioNFT.networks)[0];

        if (
          parseInt(givenNetworkId) === parseInt(networkId) ||
          parseInt(givenNetworkId) === 1337
        ) {
          const networkDataNFT = LeeTrioNFT.networks[networkId];
          const networkDataToken = LeeTrioToken.networks[networkId];
          const networkDataUtils = Utils.networks[networkId];

          const LeeTrioNFTABI = LeeTrioNFT.abi;
          const LeeTrioNFTAddress = networkDataNFT.address;
          const LeeTrioNFTContract = new web3.eth.Contract(
            LeeTrioNFTABI,
            LeeTrioNFTAddress
          );

          const LeeTrioTokenABI = LeeTrioToken.abi;
          const LeeTrioTokenAddress = networkDataToken.addres;
          const LeeTrioTokenContract = new web3.eth.Contract(
            LeeTrioTokenABI,
            LeeTrioTokenAddress
          );

          const LeeTrioUtilsABI = Utils.abi;
          const LeeTrioUtilsAddress = networkDataUtils.address;
          const LeeTrioUtilsContract = new web3.eth.Contract(
            LeeTrioUtilsABI,
            LeeTrioUtilsAddress
          );

          dispatch(
            callContract({
              LeeTrioNFTContract: LeeTrioNFTContract,
              LeeTrioTokenContract: LeeTrioTokenContract,
              LeeTrioUtilsContract: LeeTrioUtilsContract,
            })
          );
        } else {
          dispatch(
            callContract({
              LeeTrioNFTContract: "dismatch",
              LeeTrioTokenContract: "dismatch",
              LeeTrioUtilsContract: "dismatch",
            })
          );
        }
      } else {
        dispatch(
          callContract({
            LeeTrioNFTContract: null,
            LeeTrioTokenContract: null,
            LeeTrioUtilsContract: null,
          })
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(connectFailed("getWeb3 failed"));
    }
  };
}
