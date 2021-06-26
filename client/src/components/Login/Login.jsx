import React, { useState } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import { purple, pink } from "@material-ui/core/colors";
import "./Login.module.css";
import Input from "@material-ui/core/Input";
import { Grid } from "@material-ui/core";
import SwipeableViews from "react-swipeable-views";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { useHistory, Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  card: {
    width: "500px",
    position: "relative",
    left: "25%",
    height: "400px",
    margin: "5%",
    borderRadius: "10px",
    backgroundColor: pink[50],
  },
  name: {
    margin: "5%",
  },
}));

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {/* {console.log(children)} */}
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const Login = ({ room, name, setRoom, setName }) => {
  const classes = useStyles();
  const theme = useTheme();

  let history = useHistory();
  const [value, setValue] = useState(0);
  // const [room, setRoom] = useState("");
  // const [name, setName] = useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  return (
    <div className="root">
      <Card className={classes.card}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="white"
            variant="fullWidth"
          >
            <Tab label="Create room" {...a11yProps(0)} />
            <Tab label="Join room" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            <form>
              <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="center"
              >
                <Grid>
                  <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={classes.name}
                  ></TextField>
                </Grid>
                <Grid>
                  <TextField
                    label="Room Name"
                    variant="outlined"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className={classes.name}
                  ></TextField>
                </Grid>
                <Grid>
                  <Link
                    onClick={(e) =>
                      !name ||
                      !room ||
                      name.indexOf(" ") != -1 ||
                      room.indexOf(" ") != -1
                        ? e.preventDefault()
                        : null
                    }
                    to={`/room/${room}`}
                  >
                    <Button> Create Room</Button>
                  </Link>
                </Grid>
              </Grid>
            </form>
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <form>
              <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="center"
              >
                <Grid>
                  <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={classes.name}
                  ></TextField>
                </Grid>
                <Grid>
                  <TextField
                    label="Room Name"
                    variant="outlined"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className={classes.name}
                  ></TextField>
                </Grid>
                <Grid>
                  <Link
                    onClick={(e) =>
                      !name ||
                      !room ||
                      name.indexOf(" ") != -1 ||
                      room.indexOf(" ") != -1
                        ? e.preventDefault()
                        : null
                    }
                    // to={`/room?name=${name}&room=${room}`}
                    to={`/room/${room}`}
                  >
                    <Button> Join Room</Button>
                  </Link>
                </Grid>
              </Grid>
            </form>
          </TabPanel>
        </SwipeableViews>
      </Card>
    </div>
  );
};

export default Login;
