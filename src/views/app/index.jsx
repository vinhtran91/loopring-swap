import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout";
import { ThemeProvider } from "styled-components";
import { GlobalStyle, FullScreenOverlay } from "./styled.js";
import { useDispatch, useSelector } from "react-redux";
import MewConnect from "@myetherwallet/mewconnect-web-client";
import Web3Modal from "web3modal";
import { INFURA_ID } from "../../env";
import { useCallback } from "react";
import { WalletConnectionDrawer } from "../../components/wallet-connection-drawer";
import { initializeWeb3 } from "../../actions/web3";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login } from "../../actions/loopring";

const commonColors = {
    error: "#c62828",
    warning: "#FF6F00",
    primary: "rgb(28, 96, 255)",
    divider: "rgba(0, 0, 0, 0.1)",
};

const light = {
    ...commonColors,
    background: "rgb(237, 242, 247)",
    foreground: "rgb(223, 230, 239)",
    textLight: "#999999",
    text: "#0e062d",
    textInverted: "#F1F9D2",
    shadow: "rgba(0, 0, 0, 0.4)",
    placeholder: "#b3b3b3",
    loader: "#a6a6a6",
};

const dark = {
    ...commonColors,
    background: "rgb(21, 22, 24)",
    foreground: "rgba(0, 0, 0, .65)",
    textLight: "#4d4d4d",
    text: "#F1F9D2",
    textInverted: "#0e062d",
    shadow: "rgba(0, 0, 0, 0.4)",
    placeholder: "#666666",
    loader: "#595959",
};

const lightWeb3ModalTheme = {
    background: light.background,
    main: light.text,
    secondary: light.text,
    hover: light.foreground,
};

const darkWeb3ModalTheme = {
    background: dark.background,
    main: dark.text,
    secondary: dark.text,
    hover: dark.foreground,
};

const web3ModalOptions = {
    cacheProvider: false,
    providerOptions: {
        mewconnect: {
            package: MewConnect,
            options: {
                infuraId: INFURA_ID,
            },
        },
    },
};

export const getWeb3Modal = () => new Web3Modal(web3ModalOptions);

export let selectedTheme = light;

export const App = () => {
    const dispatch = useDispatch();

    const {
        web3Instance,
        selectedAccount: selectedWeb3Account,
        loopringAccount,
    } = useSelector((state) => ({
        web3Instance: state.web3.instance,
        selectedAccount: state.web3.selectedAccount,
        loopringAccount: state.loopring.account,
    }));

    const [lightTheme, setLightTheme] = useState(true);
    const [connectingWallet, setConnectingWallet] = useState(false);

    // setting up local storage-saved theme
    useEffect(() => {
        const cachedTheme =
            localStorage.getItem("loopring-swap-theme") || "light";
        const lightTheme = cachedTheme === "light";
        setLightTheme(lightTheme);
        web3ModalOptions.theme = lightTheme
            ? lightWeb3ModalTheme
            : darkWeb3ModalTheme;
    }, [dispatch]);

    const handleConnectingWallet = useCallback(() => {
        setConnectingWallet(true);
    }, []);

    const handleConnectingWalletClose = useCallback(() => {
        setConnectingWallet(false);
    }, []);

    const handleConnectWallet = useCallback(() => {
        dispatch(initializeWeb3());
    }, [dispatch]);

    const handleLogin = useCallback(() => {
        dispatch(login(web3Instance, selectedWeb3Account));
    }, [dispatch, selectedWeb3Account, web3Instance]);

    return (
        <ThemeProvider theme={lightTheme ? light : dark}>
            <GlobalStyle />
            <Layout
                onConnectingWallet={handleConnectingWallet}
                selectedWeb3Account={selectedWeb3Account}
                loggedIn={!!loopringAccount}
            ></Layout>
            <FullScreenOverlay open={connectingWallet} />
            <WalletConnectionDrawer
                open={connectingWallet}
                onClose={handleConnectingWalletClose}
                onConnectWallet={handleConnectWallet}
                selectedWeb3Account={selectedWeb3Account}
                onLogin={handleLogin}
                loggedIn={!!loopringAccount}
            />
            <ToastContainer
                className="custom-toast-root"
                toastClassName="custom-toast-container"
                bodyClassName="custom-toast-body"
                position="top-right"
                closeButton={false}
                transition={Slide}
                limit={3}
            />
        </ThemeProvider>
    );
};