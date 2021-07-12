import React from "react";
import {
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AppsIcon from "@material-ui/icons/Apps";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

const useStyles = makeStyles((theme) => ({
  title: {
    marginLeft: "2%",
    right: "50%",
    fontSize: "26px",
    fontWeight: "700",
  },
}));

const TopBar = () => {
  const classes = useStyles();
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Grid
            container
            direction="row"
            // justify="space-between"
            alignItems="center"
          >
            {/* <IconButton edge="start" color="inherit" aria-label="menu">
              <AppsIcon />
            </IconButton> */}
            <img src="https://img.icons8.com/fluent/50/000000/microsoft-teams-2019.png" />

            <Typography className={classes.title} variant="h6">
              Microsoft Teams
            </Typography>
            {/* <IconButton className={classes.accIcon} color="inherit">
              <AccountCircleIcon />
            </IconButton> */}
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default TopBar;
