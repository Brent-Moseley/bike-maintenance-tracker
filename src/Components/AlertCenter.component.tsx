import {
  Card,
  CardContent,
  TableContainer,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableBody,
  keyframes,
  Button,
  TableCell,
  styled,
  Box,
  Checkbox,
  FormControlLabel,
  ButtonGroup,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Alert, Bike, BikeService } from "../services/BikeService";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

/*

Purpose:  This module handles all aspects of active alerts, including displaying a table in the UI,
    responding to user input, and running the alert cycle to determine if any alerts should be triggered.

*/

export interface TriggeredAlert {
  alertID: string;
  userID: string;
  bikeID: string;
  bikeName: string;
  reason: string; // Example:  > 1000 miles, date = 12/12/24, etc.
  description: string;
  isNew: boolean;
  isUpcoming: boolean;
}

export interface AlertStatus {
  id: string;
  status: string;
}

const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#009900",
  color: "#FFFFFF", // White text for better contrast
  fontWeight: "bold",
}));

const CustomTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover, // Default grey for odd rows
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#f9f9f9", // Lighter grey for even rows
  },
}));

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px",
}));

const SmallButton = styled(Button)(({ theme }) => ({
  padding: "2px 8px",
  minWidth: "30px",
  fontSize: "0.75rem",
}));

const OrangeButton = styled(Button)(({ theme }) => ({
  padding: "2px 8px",
  minWidth: "30px",
  fontSize: "0.75rem",
  backgroundColor: "#FFA500",
  color: "#FFFFFF",
  animation: `${fadeInOut} 2s infinite`,
  "&:hover": {
    backgroundColor: "#FF8C00",
  },
}));

const fadeInOut = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

interface AlertCenterProps {
  bikes: Bike[];
  user: string;
  toggle: boolean;
}

/*  Example of finding out if date is on an interval (ie every 90 days):

import dayjs from "dayjs";

const isDateInInterval = (startDate, intervalDays, givenDate) => {
  const start = dayjs(startDate);
  const date = dayjs(givenDate);

  // Calculate the difference in days
  const diffInDays = date.diff(start, "day");

  // Check if the difference is divisible by the interval
  return diffInDays >= 0 && diffInDays % intervalDays === 0;
};

// Example usage:
const startDate = "2025-04-15";
const intervalDays = 8;
const givenDate = "2025-04-23";

console.log(isDateInInterval(startDate, intervalDays, givenDate)); // true or false

If user wants to enable this, need to save the start date and start miles.  Alert cycle can then compare
against current date and miles.
-- or -- can just add these as regular alerts for the user, repeating.  User can delete any they don't want - more control.
For suspension service / check X number of hours, 

https://www.justtherightgear.com/service


Instead, just use the alert system already created, adding regular alerts based on a chart
Need an internal chart of miles or months frequency and the text to display.

560 miles, consider a lower leg service (assumes 9mph average all riding).
1350, do full shock and fork service.

Chart needs:  repeatMiles, repeatDays, description, longDescription.
Do UI filter where if repeatDays > 90, display as months.
Also add mouseover helper text for the standard alerts.

*/

const serviceIntervalsMtn = [
  {
    repeatMiles: 560,
    repeatDays: undefined,
    description: "Consider fork lower leg service",
    longDescription: "Depending on usage, consider a lower leg service for the fork. This involves cleaning the inside of the lower legs and replacing the bath oil of the fork."
  },
  {
    repeatMiles: 1350,
    repeatDays: undefined,
    description: "Consider full shock and fork service",
    longDescription: "Full fork and shock service, including replacing seals, damper oil, and inspecting internal components. This interval may vary based on the type of riding and conditions."
  },
  {
    repeatMiles: 125,
    repeatDays: undefined,
    description: "Check chain life and wear using a chain checker tool.",
    longDescription: "A well-maintained chain will shift better and extend the life of other drivetrain components."
  },
  {
    repeatMiles: 750,
    repeatDays: undefined,
    description: "Check cassette and chainrings for wear.",
    longDescription: "Look for worn or missing teeth. Poor shifting and a chain that 'skips' are both indicators of a worn cassette."
  },
  {
    repeatMiles: undefined,
    repeatDays: 365,
    description: "Check derailleur cables and housing.",
    longDescription: "Worn cables can lead to imprecise shifting and decreased performance as well as shifting that takes too much physical force."
  },
  {
    repeatMiles: undefined,
    repeatDays: 274,
    description: "Check derailleurs for shifting performance.",
    longDescription: "Check for proper alignment and function. Inspect jockey wheels for wear and replace if needed"
  },
  {
    repeatMiles: undefined,
    repeatDays: 548,
    description: "Inspect bottom bracket.",
    longDescription: "Unusual noises or excessive play may indicate a need for replacement."
  },
  {
    repeatMiles: undefined,
    repeatDays: 548,
    description: "Inspect pedals.",
    longDescription: "Ensure smooth rotation and replace if there is excessive play or grinding noises.  Test that shoes can clip in with the right tension."
  },
  {
    repeatMiles: undefined,
    repeatDays: 183,
    description: "Check cable tension and indexing.",
    longDescription: "Ensure proper tension and smooth, precise, quick gear shifting."
  },
  {
    repeatMiles: 200,
    repeatDays: undefined,
    description: "Inspect brake pads and rotors for wear.",
    longDescription: "Generally, pads should be replaced once they are down to one millimeter or less of material. Pads may need to be removed to adequately inspect. Rotors should be free from grooves and should be above the manufacturer recommended minimum thickness."
  },
  {
    repeatMiles: undefined,
    repeatDays: 183,
    description: "Inspect brake cables.",
    longDescription: "Look for wear, corrosion, or fraying. Replace if there are any signs of damage to ensure responsive braking."
  },
  {
    repeatMiles: undefined,
    repeatDays: 548,
    description: "Inspect bottom bracket.",
    longDescription: "Unusual noises or excessive play may indicate a need for replacement."
  },
  {
    repeatMiles: undefined,
    repeatDays: 730,
    description: "Replace brake fluid on hydraulic brakes.",
    longDescription: "Follow manufacturers recommendations."
  },
  {
    repeatMiles: 200,
    repeatDays: undefined,
    description: "Inspect tires.",
    longDescription: "Look for wear, worn or torn off knobs, cuts in sidewalls, bulging, or other damage. For good traction and safe riding, always replace tires that are worn or damaged."
  },
  {
    repeatMiles: undefined,
    repeatDays: 90,
    description: "Check tire sealant, if used.",
    longDescription: "To avoid any suprises and potential long walks back to the car, make sure both tires have adequate sealant."
  },
  {
    repeatMiles: undefined,
    repeatDays: 548,
    description: "Inspect bottom bracket.",
    longDescription: "Unusual noises or excessive play may indicate a need for replacement."
  },
  {
    repeatMiles: undefined,
    repeatDays: 183,
    description: "Check all bolts and fasteners for appropriate tightness.",
    longDescription: "Look bolts can rapidly become big problems on the trail, and lead to unsafe riding. Use a torque when, especially with carbon frames and components."
  },
  {
    repeatMiles: undefined,
    repeatDays: 365,
    description: "Inspect headset, bottom bracket, hubs, and frame linkage bearings.",
    longDescription: "Replace if there is noticable wear or they do not move freely."
  },
];

const serviceIntervalsGravel = [];

const serviceIntervalsRoad = [];


const AlertCenter: React.FC<AlertCenterProps> = ({ bikes, user, toggle }) => {
  const [masterAlerts, setMasterAlerts] = useState<TriggeredAlert[]>([]);
  const savedIncludeUpcoming = localStorage.getItem("includeUpcoming");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(
    savedIncludeUpcoming && savedIncludeUpcoming === "true" ? true : false
  );
  const [showAddServiceInt, setShowAddServiceInt] = useState<boolean>(true);   // default to false
  const [showingButtonsAddServiceInt, setShowingButtonsAddServiceInt] = useState<boolean>(false);

  useEffect(() => {
    // when the parent toggles this, run Alert cycle.
    console.log("  Alert cycle toggled.");
    runAlertCycle(bikes);
  }, [toggle]);

  const handleCheckboxChangeUpcoming = () => {
    const oldState = includeUpcoming;
    localStorage.setItem("includeUpcoming", !oldState ? "true" : "false");
    setIncludeUpcoming((prev) => !prev);
    runAlertCycle(bikes, !oldState);
  };

  async function setAlertStatus(id: string, status: string) {
    // const statusStr = localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    // let statusList: AlertStatus[] =
    //   statusStr.length > 2 ? JSON.parse(statusStr) : [];

    // const alert = statusList.findIndex((item) => item.id === id);
    // if (alert > -1) {
    //   statusList[alert].status = status;
    //   localStorage.setItem(
    //     "BikeMaintTrackerAlertStatus",
    //     JSON.stringify(statusList)
    //   );
    // }
    BikeService.setAlertStatus(user, id, status);
    //await BikeService.saveAlertTable(user);
  }

  function showNotification(title: string, options: Object) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  }

  const handleAlertOkClick = async (id: string) => {
    await setAlertStatus(id, "cleared");
    await runAlertCycle(bikes);  // ??
  };

  const handleNewClick = async (id: string) => {
    await setAlertStatus(id, "acknowledged");
    await runAlertCycle(bikes);
  };

  // Alert state table:
  //  id
  //  status    created
  //            triggered, show on alert list and NOT in alert popup again, add repeat alert if appropriate
  //                show 'New' button.
  //            acknowledged (shown), 'New' clicked by user
  //            cleared by user ('OK' clicked), remove from alerts list

  /*
    
      localStorage.setItem("BikeMaintTrackerAlertStatus", '[{"id": "a01", "status": "created"},{"id": "a02", "status": "created"}]');
    
    
      It is very helpful to have a good software design, to guide the development, to have a plan.
      Even agile, with rapid prototypes and releasable code every few weeks should have a solid
      plan and software design.  
      */
  const runAlertCycle = async (bikes: Bike[], include?: boolean) => {
    // Check for alerts and handle any that are ready for a status update
    if (bikes.length === 0) return;
    // Get all alerts for this user
    const alerts = await BikeService.getAlerts(user, "");
    //setMasterAlerts([]);
    // Get current list of alert statuses
    // const alertStatusStr =
    //   localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    // let alertStatusSet: AlertStatus[] =
    //   alertStatusStr.length > 2 ? JSON.parse(alertStatusStr) : [];
    const today: Date = new Date();

    let sortedAlerts: TriggeredAlert[] = [];
    let SendBrowserNotification = false;
    debugger;

    // Run through list of current lists for this user, rebuilding the trigger list
    for (let alert of alerts) {
      // Attempt to find status for this alert
      console.log(
        "   Checking alert " +
        alert.id +
        " with date " +
        alert.date?.toLocaleDateString() +
        "  " +
        alert.description
      );
      let currentAlertStatus = BikeService.getAlertStatus(alert.id);
      // const currentAlertStatus = alertStatusSet.find(
      //   (alertStat) => alertStat.id === alert.id
      // );
      console.log("       status: " + currentAlertStatus);

      // Skip alerts that have been cleared by user already.
      if (!currentAlertStatus || currentAlertStatus === "cleared") continue;

      let isFirstTriggered = false;     // Assume not the first time triggered.
      // Find the bike referenced by this alert
      var idx = bikes.findIndex((bike) => {
        return bike.id === alert.bikeID;
      });
      if (idx > -1) {
        // The bike was found
        let triggered: boolean = currentAlertStatus === "triggered";
        let acknowledged: boolean =
          currentAlertStatus === "acknowledged";
        let created: boolean = currentAlertStatus === "created";
        let isNew: boolean = false; // assume not a new trigger
        let isUpcoming: boolean = false; // assume date is not upcoming
        const todayjs = dayjs();
        const alertDate = dayjs(alert.date);
        const alertNeedsTriggeredOnDate =
          alert.date &&
          //alert.date.toLocaleDateString() <= today.toLocaleDateString();
          (alertDate.isBefore(todayjs) || alertDate.isSame(todayjs));
        const isAlertDateUpcoming =
          alert.date &&
          alertDate.isAfter(todayjs.add(0, "day")) &&
          alertDate.isBefore(todayjs.add(7, "day"));
        const alertNeedsTriggeredOnMiles = alert.miles && bikes[idx].totalMiles >= alert.miles;

        // If not already triggered, check to see if we should trigger this alert based on miles.
        if (alertNeedsTriggeredOnMiles) {
          // Trigger on number of miles
          if (created) {
            // Alert is in created state and is triggered on miles.
            currentAlertStatus = "triggered";
            await setAlertStatus(alert.id, currentAlertStatus);
            // save the whole set at the end
            isNew = true;
            SendBrowserNotification = true;
            isFirstTriggered = true;
          } else isNew = triggered;

          // Set a master alert for this alert, so that it shows up on main page
          sortedAlerts.push({
            alertID: alert.id,
            userID: user,
            bikeID: alert.bikeID,
            bikeName: alert.bikeName,
            reason: "Bike has reached " + alert.miles + " miles",
            description: alert.description,
            isNew: isNew,   // Show 'New' button
            isUpcoming: false,
          });
        } else if (alertNeedsTriggeredOnDate) {
          // Trigger on date
          console.log("  ----- trigger on date ----");
          if (created) {
            // Change alert from created status to triggered.
            currentAlertStatus = "triggered";
            await setAlertStatus(alert.id, currentAlertStatus);
            // save the whole set at the end
            isNew = true;
            SendBrowserNotification = true;
            isFirstTriggered = true;
          } else isNew = triggered;

          sortedAlerts.push({
            alertID: alert.id,
            userID: user,
            bikeID: alert.bikeID,
            bikeName: alert.bikeName,
            reason: "Date is on or after " + alert.date?.toLocaleDateString(),
            description: alert.description,
            isNew: isNew,   // Show 'New' button
            isUpcoming: false,
          });
        }
        else if (isAlertDateUpcoming) {
          // Alert is upcoming
          sortedAlerts.push({
            alertID: alert.id,
            userID: user,
            bikeID: alert.bikeID,
            bikeName: alert.bikeName,
            reason: "Upcoming alert for " + alert.date?.toLocaleDateString(),
            description: alert.description,
            isNew: false,
            isUpcoming: true,
          });
        }
        else if (triggered || acknowledged) {
          sortedAlerts.push({
            alertID: alert.id,
            userID: user,
            bikeID: alert.bikeID,
            bikeName: alert.bikeName,
            reason: alertNeedsTriggeredOnDate ? "Date is on or after " + alert.date?.toLocaleDateString() :
              "Bike has reached " + alert.miles + " miles",
            description: alert.description,
            isNew: triggered,   // problem
            isUpcoming: false,
          });
        }
      }
      const normal = sortedAlerts.filter((alert) => !alert.isUpcoming);
      const showAll = include !== undefined ? include : includeUpcoming;
      const upcoming = showAll ? sortedAlerts.filter((alert) => alert.isUpcoming) : [];
      setMasterAlerts([...normal, ...upcoming]);

      if (isFirstTriggered) {
        // Check alert and if it was repeating, add the next cycle
        // Clone the alert and push to the next cycle.

        let save = false;
        let cloned: Alert = { ...alert, id: uuidv4() }; // clone the alert
        if (alert.miles && alert.repeatMiles && alert.repeatMiles > 0) {
          cloned.miles = alert.miles + alert.repeatMiles;
          save = true;
        } else if (alert.date && alert.repeatDays && alert.repeatDays > 0) {
          const current = dayjs(alert.date);
          cloned.date = current.add(Math.round(alert.repeatDays * 30.4), "day").toDate();
          save = true;
        }
        if (save) {
          // alert was cloned, find the bike for this and add it to the alerts.  Then save.
          const success = await BikeService.addAlert(cloned);
          await BikeService.addAlertStatus(user, cloned.id, "created");
          //alertStatusSet.push({ id: cloned.id, status: "created" });
        }
      }
    }
    if (SendBrowserNotification) {
      showNotification("You have new alerts in Bike Maintenance Tracker!", {
        body: "Check the Alert Center in Bike Maintenance Tracker to see alerts.",
        requireInteraction: true,
      });
    }

    //}
    // localStorage.setItem(
    //   "BikeMaintTrackerAlertStatus",
    //   JSON.stringify(alertStatusSet)
    // );
  };

  // 15 minute timer:
  const timer = setInterval(() => {
    console.log("interval triggered");
    runAlertCycle(bikes);
  }, 900000);

  const handleAddSuggestedMtn = () => {

  };

  const handleAddSuggestedGravel = () => {

  };

  const handleAddSuggestedRoad = () => {

  };

  const handleAddSuggestedEnable = () => {
    setShowingButtonsAddServiceInt(true);
    setShowAddServiceInt(false);
  }

  const cancelAddSuggested = () => {
    setShowingButtonsAddServiceInt(false);
    setShowAddServiceInt(true);
  }

  // BCM Make alert.decription below clickable, then do a lookup to match description, and if match, show popup with long description.


  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardContent>
        <>
          <TableContainer component={Paper}>
            {/* <Typography variant="h6" component="div" sx={{ padding: 2 }}>
              Alert Center
            </Typography> */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                //border: '1px solid #ccc',
                //borderRadius: '4px',
              }}
            >
              <Typography variant="h6" component="div" sx={{ padding: 2 }}>
                Alert Center
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  display: "flex",
                  alignItems: "center",
                  gap: 2, // Space between button and checkbox
                  padding: "14px", // Adds inner space
                  border: "1px solid #e0e0e0", // Very light border
                  borderRadius: "8px", // Optional: Rounded corners for aesthetics
                }}
              >

                {showAddServiceInt && <Button
                  variant="contained"
                  size="small"
                  sx={{
                    margin: "3px",
                    minWidth: "58px", // Reduce the minimum width
                    height: "35px",   // Set a small height
                    padding: "2px 5px", // Reduce inner spacing
                    // Make text smaller
                  }}
                  onClick={handleAddSuggestedEnable}
                >
                  <Typography sx={{ lineHeight: "1.2", fontSize: "11.5px", }}>
                    Add Recommended<br /> Service Intervals
                  </Typography>
                </Button>}
                {showingButtonsAddServiceInt && <Box
                  sx={{
                    position: 'absolute', // Positions it relative to the nearest positioned ancestor
                    top: 0,
                    left: -280,
                    zIndex: 100,
                    width: 450,
                    bgcolor: 'white',
                    border: "3px solid #ccc",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 1)",
                    padding: "6px",
                    borderRadius: "8px",
                    display: "inline-block", // Keeps the box size tight around content
                    textAlign: "center", // Aligns label and button group
                  }}
                >
                  <Typography variant="subtitle1" sx={{ marginBottom: "8px" }}>
                    Add Recommended Service Intervals
                  </Typography>
                  <ButtonGroup variant="text">
                    <Button variant="contained" size="small" sx={{ margin: '3px' }} onClick={handleAddSuggestedMtn}>
                      Mountain Bike
                    </Button>
                    <Button variant="contained" size="small" sx={{ margin: '3px' }} onClick={handleAddSuggestedGravel}>
                      Gravel Bike
                    </Button>
                    <Button variant="contained" size="small" sx={{ margin: '3px' }} onClick={handleAddSuggestedRoad}>
                      Road Bike
                    </Button>
                    <Button variant="contained" size="small" sx={{ margin: '3px' }} onClick={cancelAddSuggested}>
                      Cancel
                    </Button>
                  </ButtonGroup>
                </Box>}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeUpcoming}
                      onChange={handleCheckboxChangeUpcoming}
                      name="rightAlignedCheckbox"
                      sx={{
                        transform: "scale(0.8)", // Adjust the scale to make the checkbox smaller
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">Include Upcoming</Typography>
                  }
                  sx={{
                    marginRight: 0,
                  }}
                />
              </Box>
            </Box>
            {masterAlerts.length > 0 ? (
              <Table sx={{ minWidth: 650 }} aria-label="alerts table">
                <TableHead>
                  <TableRow>
                    <HeaderCell sx={{ width: 140 }}>Bike</HeaderCell>
                    <HeaderCell sx={{ width: 280 }}>Description</HeaderCell>
                    <HeaderCell sx={{ width: 220 }}>Reason</HeaderCell>
                    <HeaderCell align="right">Actions</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {masterAlerts.map((alert) => (
                    <CustomTableRow key={alert.alertID}>
                      <CustomTableCell
                        sx={{
                          fontStyle: alert.isUpcoming ? "italic" : "normal",
                          color: alert.isUpcoming ? "#E19024" : "black",
                          fontWeight: alert.isUpcoming ? "bold" : "normal",
                        }}
                      >
                        {alert.bikeName}
                      </CustomTableCell>
                      <CustomTableCell
                        sx={{
                          fontStyle: alert.isUpcoming ? "italic" : "normal",
                          color: alert.isUpcoming ? "Cadmium Yellow" : "black",
                        }}
                      >
                        {alert.description}
                      </CustomTableCell>
                      <CustomTableCell
                        sx={{
                          fontStyle: alert.isUpcoming ? "italic" : "normal",
                          color: alert.isUpcoming ? "Cadmium Yellow" : "black",
                        }}
                      >
                        {alert.reason}
                      </CustomTableCell>
                      <CustomTableCell align="right">
                        {alert.isNew ? (
                          <OrangeButton
                            variant="contained"
                            size="small" // Make the button small
                            onClick={() => handleNewClick(alert.alertID)}
                            sx={{ marginLeft: 1 }} // Add margin to separate buttons
                          >
                            New
                          </OrangeButton>
                        ) : !alert.isUpcoming ? (
                          <SmallButton
                            variant="contained"
                            color="primary"
                            size="small" // Make the button small
                            onClick={() => handleAlertOkClick(alert.alertID)}
                          >
                            OK
                          </SmallButton>
                        ) : (
                          <span></span>
                        )}
                      </CustomTableCell>
                    </CustomTableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" sx={{ padding: 1 }}>
                There are no active alerts.
              </Typography>
            )}
          </TableContainer>
        </>
      </CardContent>
    </Card>
  );
};

export default AlertCenter;


/*

The counter measure is to build new confidence!!  Build my portfolio app to make it a great app and get a user
community going on it.  Dress very professionally, be very attractive, and work on all the ways to be attractive
to a new employer.  Be bold, think bold and remember all I have done!  Remember who I am!  

*/