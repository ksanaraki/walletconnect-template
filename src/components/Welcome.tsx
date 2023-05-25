import React from "react";
import { Store } from "../store/store-reducer";

import { styled } from "@mui/material/styles";
import { Box, Button, Link, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";

import * as config from "../config/config";
import * as utils from "../helpers/utils";
import {
  updateQueryResultsAction,
  updateRefreshingAction
} from "../store/actions";

const ActionButton = styled(Button)({
  marginTop: "20px",
  marginLeft: "20px",
  padding: "6px 12px"
});

interface IProps {}

const Welcome: React.FC<IProps> = () => {
  const { state, dispatch } = React.useContext(Store);

  // Welcome.tsx
  const refreshPoolBalance = async () => {
    updateRefreshingAction(dispatch, {
      status: true,
      message: "Sending transaction..."
    });
    const poolReadContractInstance = await utils.getReadContractInstance(
      state.wallet.browserWeb3Provider
    );
    const responseCurrentStakedTokens = await poolReadContractInstance[
      "stakedWantTokens"
    ](15, state.wallet.address);
    const responseUserInfo = await poolReadContractInstance["userInfo"](
      15,
      state.wallet.address
    );
    updateRefreshingAction(dispatch, {
      status: false,
      message: "Complete"
    });
    updateQueryResultsAction(dispatch, {
      ...state.queryResults,
      currentStaked: utils.hexToIntForToken(responseCurrentStakedTokens),
      initialStaked: utils.hexToIntForToken(responseUserInfo.totalDeposit),
      currentPoolValue:
        utils.hexToIntForToken(responseCurrentStakedTokens) * 0.86,
      tokenIncrement:
        ((utils.hexToIntForToken(responseCurrentStakedTokens) -
          utils.hexToIntForToken(responseUserInfo.totalDeposit)) /
          utils.hexToIntForToken(responseUserInfo.totalDeposit)) *
        100
    });
  };

  // Welcome.tsx
  const refreshQueryResults = async () => {
    updateRefreshingAction(dispatch, {
      status: true,
      message: "Querying chain data..."
    });
    const lastBlockNumber = await utils.getLastBlockNumber(
      state.wallet.serverWeb3Provider
    );
    const croBalance = await utils.getCroBalance(
      state.wallet.serverWeb3Provider,
      state.wallet.address
    );

    updateRefreshingAction(dispatch, {
      status: false,
      message: "Complete"
    });
    updateQueryResultsAction(dispatch, {
      ...state.queryResults,
      lastBlockNumber: lastBlockNumber,
      croBalance: croBalance
    });
  };

  const renderLastTransaction = () => {
    if (state.queryResults.lastTxHash) {
      return (
        <div>
          <Typography variant="body1" component="div" gutterBottom>
            Last transaction:{" "}
            <Link
              href={
                config.configVars.rpcNetwork.blockExplorerUrl +
                "tx/" +
                state.queryResults.lastTxHash
              }
              target="_blank"
              rel="noopener"
              color="inherit"
            >
              View in block explorer
            </Link>
          </Typography>
        </div>
      );
    }
  };

  const renderButtons = () => {
    if (state.wallet.connected) {
      return (
        <div>
          <ActionButton variant="contained" onClick={refreshPoolBalance}>
            Refresh Balance of Pool
          </ActionButton>
          <ActionButton variant="contained" onClick={refreshQueryResults}>
            Refresh Balance
          </ActionButton>
        </div>
      );
    } else {
      return null;
    }
  };

  // This is used to display more details about the Redux state on the web page, for debugging purposes
  // You can activate by changing the mode to "debug" in config/config.ts
  const renderDebugInfo = () => {
    if (config.configVars.mode === "debug") {
      return (
        <Typography variant="body1" component="div" gutterBottom>
          Debug info:{" "}
          {JSON.stringify({
            walletProviderName: state.wallet.walletProviderName,
            address: state.wallet.address,
            chainId: state.wallet.chaindId,
            connected: state.wallet.connected,
            ...state.queryResults
          })}
        </Typography>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      <Box
        sx={{
          flexGrow: 1,
          m: 5,
          minHeight: "500px"
        }}
      >
        <Paper elevation={0}>
          <Typography variant="h5" component="div" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            User's Ethereum address:{" "}
            {state.wallet.address ? state.wallet.address : "Not connected"}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Chain ID:{" "}
            {state.wallet.chainId ? state.wallet.chainId : "Not connected"}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Wallet provider:{" "}
            {state.wallet.walletProviderName
              ? state.wallet.walletProviderName
              : "Not connected"}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Last block number:{" "}
            {state.queryResults.lastBlockNumber
              ? state.queryResults.lastBlockNumber
              : "Not connected"}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            User's CRO balance: {state.queryResults.croBalance}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            User's Pool Initial Staked value: {state.queryResults.initialStaked}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            User's Pool current staked value: {state.queryResults.currentStaked}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            User's Pool current % increment: {state.queryResults.tokenIncrement}
            %
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            User's Pool current value: {state.queryResults.currentPoolValue}
          </Typography>
          {renderLastTransaction()}
          {renderButtons()}
          {renderDebugInfo()}
        </Paper>
      </Box>
    </div>
  );
};

export default Welcome;
