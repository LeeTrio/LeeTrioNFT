import React, { useState, useEffect, useRef } from "react";

import { Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";

import axios from "axios";
import Web3Modal from "web3modal";
import { ethers, utils } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { updateAccounts, changeChainId, getWeb3 } from "../../redux/actions";

import logoPng from "../../assets/logoPng.png";

const NAV__LINKS = [
  {
    display: "Home",
    url: "/",
  },
  {
    display: "Mint",
    url: "/mint",
  },
  {
    display: "Market",
    url: "/market",
  },
];

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "5bd970f2bf6047318bda7b13eb3c24ce",
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      infuraId: "5bd970f2bf6047318bda7b13eb3c24ce", // Required
    },
  },
  binancechainwallet: {
    package: true,
    options: {
      infuraId: "5bd970f2bf6047318bda7b13eb3c24ce", // Required
    },
  },
};

const web3Modal = new Web3Modal({
  network: "mainnet" || "binance" || "testnet",
  cacheProvider: true,
  providerOptions: providerOptions,
  theme: {
    background: "rgb(20, 19, 29)",
    main: "rgb(199, 199, 199)",
    secondary: "rgb(136, 136, 136)",
    border: "rgba(195, 195, 195, 0.14)",
    hover: "rgba(36, 9, 66, 0.596)",
  },
});

function Header() {
  const dispatch = useDispatch();

  const menuRef = useRef(null);
  const headerRef = useRef(null);

  const LeeTrioNFTContract = useSelector(
    (state) => state.state.LeeTrioNFTContract
  );
  const owner = useSelector((state) => state.state.owner);
  const isUser = useSelector((state) => state.state.isUser);

  const [isOwner, setIsOwner] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [chainId, setChainId] = useState();
  const [library, setLibrary] = useState();
  const [verified, setVerified] = useState();
  const [provider, setProvider] = useState();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signedMessage, setSignedMessage] = useState("");

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
    setMessage("");
    setSignature("");
    setIsOwner(false);
    setIsDisabled(false);
    setVerified(undefined);
  };

  const Navi = useNavigate();

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = async (accounts) => {
        Navi("/");
        console.log("accounts are changed", accounts);
        if (accounts.length !== 0) {
          const getAddress = utils.getAddress(accounts[0]);
          await axios
            .post("http://localhost:8080/user/login", {
              address: getAddress,
              owner: owner,
            })
            .then(async (res) => {
              const loadMyNFTLists = await myList(getAddress);
              console.log("loadMyNFTLists", loadMyNFTLists);

              dispatch(
                updateAccounts({
                  wallet: true,
                  account: getAddress,
                  isUser: res.data.nick === "noname" ? false : true,
                  myNFTLists: loadMyNFTLists,
                })
              );
            })
            .then(async () => {
              setAccount(getAddress);
              setIsDisabled(true);
            });
        } else {
          disconnect();
        }
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(parseInt(_hexChainId));
        dispatch(
          changeChainId({
            chainId: parseInt(_hexChainId),
          })
        );
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
        dispatch(
          updateAccounts({
            wallet: false,
            account: null,
            isUser: false,
            myNFTLists: [],
            myBalance: 0,
          })
        );
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, isUser]);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("header__shrink");
      } else {
        headerRef.current.classList.remove("header__shrink");
      }
    });
    return () => {
      window.removeEventListener("scroll");
    };
  }, []);

  useEffect(() => {
    if (owner === account) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [account, owner]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [owner]);

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      dispatch(getWeb3(provider));

      const selectAccount = utils.getAddress(accounts[0]);
      if (accounts) {
        setAccount(selectAccount);
      }

      setProvider(provider);
      setLibrary(library);
      setChainId(network);

      await axios
        .post("http://localhost:8080/user/login", {
          address: selectAccount,
          owner: owner,
        })
        .then(async (res) => {
          dispatch(
            updateAccounts({
              wallet: true,
              account: selectAccount,
              isUser: res.data.nick === "noname" ? false : true,
              myNFTLists: await myList(selectAccount),
            })
          );

          dispatch(
            changeChainId({
              chainId: network.chainId,
            })
          );

          setIsDisabled(true);
        });
    } catch (error) {
      console.error(error);
    }
  };

  async function myList(account) {
    if (LeeTrioNFTContract !== null && LeeTrioNFTContract !== "dismatch") {
      const MyNFTlists = await LeeTrioNFTContract.methods
        .MyNFTlists()
        .call({ from: account });

      const listsForm = await Promise.all(
        MyNFTlists.map(async (i) => {
          const tokenURI = await LeeTrioNFTContract.methods
            .tokenURI(i.tokenId)
            .call();
          const meta = await axios.get(tokenURI).then((res) => res.data);
          let item = {
            fileUrl: await meta.image,
            formInput: {
              tokenid: i.tokenId,
              price: utils.formatEther(i.price),
              sell: i.sell,
              name: await meta.name,
              description: await meta.description,
            },
          };
          return item;
        })
      );
      return await listsForm;
    } else {
      return [];
    }
  }

  const disconnect = () => {
    Navi("/");
    web3Modal.clearCachedProvider();
    refreshState();
    dispatch(
      updateAccounts({
        wallet: false,
        account: null,
        isUser: false,
        myNFTlists: [],
      })
    );
  };

  const toggleMenu = () => menuRef.current.classList.toggle("active__menu");

  const walletButton = (isDisabled) => {
    if (isDisabled === false) {
      return (
        <button className="connect_btn" onClick={connectWallet}>
          <span>
            <i className="ri-wallet-line"></i>
          </span>
          Connect Wallet
        </button>
      );
    }
  };

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <div className="navigation">
          <div className="nav__menu" ref={menuRef} onClick={toggleMenu}>
            <ul className="nav__list">
              {NAV__LINKS.map((item, index) => {
                if (item.display === "Create" || item.display === "Evolution") {
                  return (
                    <li
                      className="nav__item"
                      id={`nav__item__${item.display}`}
                      hidden={isUser || isOwner ? false : true}
                      key={index}
                      onClick={() => {
                        if (
                          LeeTrioNFTContract === null ||
                          LeeTrioNFTContract === "dismatch"
                        ) {
                          alert(
                            "접속네트워크를 확인하세요\n테스트넷 접속 필요"
                          );
                        }
                      }}
                    >
                      <NavLink
                        to={item.url}
                        className={(navClass) =>
                          navClass.isActive ? "active" : ""
                        }
                      >
                        {item.display}
                      </NavLink>
                    </li>
                  );
                } else {
                  return (
                    <li
                      className="nav__item"
                      id={`nav__item__${item.display}`}
                      key={index}
                    >
                      <NavLink
                        to={item.url}
                        className={(navClass) =>
                          navClass.isActive ? "active" : ""
                        }
                      >
                        {item.display}
                      </NavLink>
                    </li>
                  );
                }
              })}
            </ul>
          </div>

          <div className="nav__right">
            <span className="mobile__menu">
              <i className="ri-menu-line" onClick={toggleMenu}></i>
            </span>
            <div className="admin__btn" hidden={!isOwner}>
              <Link to="/admin">
                <i className="ri-admin-line"></i>
              </Link>
            </div>

            {isDisabled === false ? (
              walletButton(isDisabled)
            ) : (
              <div className="user__logined">
                <div className="mypage__user__icon">
                  <Link to="/mypage" hidden={!isUser}>
                    <i className="ri-user-3-line"></i>
                  </Link>

                  {/* </input> */}
                  <input
                    className="account__input"
                    type="button"
                    value={
                      account
                        ? `${account.slice(0, 7)}...${account.slice(
                            35
                          )} / Disconnect`
                        : false
                    }
                    onClick={disconnect}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

export default Header;
