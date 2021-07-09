import React from "react";
import { Card, Grid, Paper } from "@material-ui/core";
import styles from "./Chat.module.css"; // Import css modules stylesheet as styles
import { Typography } from "@material-ui/core";

const Chat = () => {
  return (
    <div>
      <Grid className={styles.Grid}>
        <div elevation={3} className={styles.chatTitle}>
          <Typography className={styles.chatTitleText}> Chat </Typography>
        </div>
        <div className={styles.chatBox}>MID</div>
        <div elevation={3} className={styles.chatBottom}>
          Bottom
        </div>
      </Grid>
    </div>
  );
};

export default Chat;
