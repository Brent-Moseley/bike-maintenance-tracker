import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountCircle from "@mui/icons-material/AccountCircle";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import BikeComponent from "./Components/Bike.component";
import { Alert, Bike, BikeService, MaintLog } from "./services/BikeService";

interface User {
  id: string;
  name: string;
  authToken: string;
}

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [bikeName, setBikeName] = useState("Santa Cruz Tallboy");
  const [bikeData, setBikeData] = useState<Bike[]>([]);
  const [maintData, setMaintData] = useState<MaintLog[]>([]);
  const [alertData, setAlertData] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const bikedata = await BikeService.getBikes("123e4567-e89b-12d3-a456-426614174000");
        setBikeData(bikedata);
        if (bikedata.length === 0) return;
        const maintdata = await BikeService.getMaintLog("123e4567-e89b-12d3-a456-426614174000", bikedata[0]?.id);
        setMaintData(maintdata);
        const alertdata = await BikeService.getAlerts("123e4567-e89b-12d3-a456-426614174000", bikedata[0]?.id);
        setAlertData(alertdata);
    };   
    fetchData();
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bike Maintenance Tracker
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ marginRight: "10px" }}
            >
              {userName}
            </Typography>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Paper
        elevation={3}
        style={{ padding: "20px", width: "80%", margin: "20px auto" }}
      >
        <BikeComponent></BikeComponent>
      </Paper>
    </>
  );
};

export default MainPage;

/*
    TODO:
*/

