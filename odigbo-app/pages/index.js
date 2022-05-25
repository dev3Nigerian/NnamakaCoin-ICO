import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import Image from "next/image";
import Odigbo from "../public/0.jpg";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  // Create a BigNumber '0'
  const zero = BigNumber.from(0);

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  // keeps track of the number of tokens to be claimed
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  // keeps track of number of Odigbo tokens owned by address
  const [balanceOfOdigboTokens, setBalanceOfOdigboTokens] = useState(zero);
  // amount of token ussr wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  //check is currently connected user is owner
  const [isOwner, setIsOwner] = useState(false)

  const [tokensMinted, setTokensMinted] = useState(zero);
  const web3ModalRef = useRef();


  // getTokensToBeClaimed: Checks the balance of tokens that can be claimed by user.

  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      // instance of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        // amount keeps track of unclaimed tokens
        let amount = 0;
        // for all NFTs in balance, check if tokens have been claimed and increase amount if tokens have not been claimed for any NFT
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);

          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };

  // getBalanceOfOdigboToken: checks the balance of odigbo token held by an address
  const getBalanceOfOdigboTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.getBalanceOf(address);
      setBalanceOfOdigboTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfOdigboTokens(zero);
    }
  };

  // mintOdigboToken: mints 'amount' of tokens to a given address
  const mintOdigboToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.002 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait(true);
      setLoading(false);
      window.alert("Successfully minted Odigbo Token");
      await getBalanceOfOdigboTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  const claimOdigboToken = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Successfully claimed Odigbo tokens");
      await getBalanceOfOdigboTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  // Retrieves how many tokens have been minted out of total supply
  const getTotalTokensMinted = async () => {
    try {
      const provider = getProviderOrSigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
    }
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
      // call the owner function from the contract
      const _owner = await tokenContract.owner();
      // we get signer to extract address of currently connected Metamask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to signer which is connected to Metamask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change Network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // Connects the metamask wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfOdigboTokens();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);


  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}></button>
        </div>
      );
    }
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className={styles.button} onClick={withdrawCoins}>
            Withdraw Coins
          </button>
        </div>
      );
    }
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimOdigboToken}>
            Cliam Tokens
          </button>
        </div>
      );
    }
    // Show mint if user has no tokens to claim
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))} className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintOdigboToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Odigbo Token</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to the Odigbo ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Odigbo tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your Wallet
            </button>
          )}
        </div>
        <div className={styles.image}>
          <Image src={Odigbo} alt="Picture of Token" width={500} height={400} />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Odigbo Faithful
      </footer>
    </div>
  );
}



