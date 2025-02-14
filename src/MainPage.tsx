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
  const [userName, setUserName] = useState("BCM");
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

/*  Strategy and purpose:
    Create a great, useable maintenance tracker app.  Learn, experiment and try out the
    latest React and C# (or Golang) techniques.  Use as a demo app to show people.
    Let Vini do a code review.  Let 4B guys use app (local storage to start).
    Eventually, set up as a series of microservices, and perhaps message queue, even
    though this is not totally necessary for the code.  Use as a way to demo my skills.
    Network like crazy, talking to 10 people a week.  Set goals.  Work on speed,
    divide and conquer.  Seek out internal recruiters and those I have worked with
    before and had good rapport with.  
    Leverage my skills and discuss my work experience.  Show that I have the latest
    technical skills and ability, but also leadership ability.  Be aggressive and 
    show off a little bit.  Show what God has done in my life.
    Talk with other people who have been technical managers to get their ideas,
    map out a career direction for the next 3 to 5 years.

*/

/*  Sample code

import React from 'react';
import { useQuery } from 'react-query';

const fetchMyData = async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
};

const MyComponent = () => {
  const { data, error, isLoading } = useQuery('myData', fetchMyData);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default MyComponent;



import React, { createContext, useContext } from 'react';

const DataContext = createContext([]);

const ParentComponent = () => {
  const data = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

  return (
    <DataContext.Provider value={data}>
      <ChildComponent />
    </DataContext.Provider>
  );
};

const ChildComponent = () => {
  const data = useContext(DataContext);

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default ParentComponent;


import React, { useState, useEffect } from 'react';

const MyComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};



import React, { useState, useEffect } from 'react';

const MyComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};


import React, { useState } from 'react';

const Counter = () => {
  // Declare a state variable named 'count', initialized to 0
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)} style={{ marginLeft: '10px' }}>Decrement</button>
    </div>
  );
};

export default Counter;


localStorage.setItem("lastname", "Smith");
localStorage.getItem("lastname");


*/