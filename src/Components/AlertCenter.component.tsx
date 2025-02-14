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
  toggle: boolean;
}

const AlertCenter: React.FC<AlertCenterProps> = ({ bikes, toggle }) => {
  const [masterAlerts, setMasterAlerts] = useState<TriggeredAlert[]>([]);

  useEffect(() => {
    // when the parent toggles this, run Alert cycle.
    console.log("   toggled.");
    console.log(JSON.stringify(bikes));
    runAlertCycle(bikes);
  }, [toggle]);

  function setAlertStatus(id: string, status: string) {
    const statusStr = localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    let statusList: AlertStatus[] =
      statusStr.length > 2 ? JSON.parse(statusStr) : [];

    const alert = statusList.findIndex((item) => item.id === id);
    if (alert > -1) {
      statusList[alert].status = status;
      localStorage.setItem(
        "BikeMaintTrackerAlertStatus",
        JSON.stringify(statusList)
      );
    }
  }

  function showNotification(title: string, options: Object) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  }

  const handleAlertOkClick = async (id: string) => {
    setAlertStatus(id, "cleared");
    await runAlertCycle(bikes);
  };

  const handleNewClick = async (id: string) => {
    setAlertStatus(id, "acknowledged");
    await runAlertCycle(bikes);
  };

  // Alert state table:
  //  id
  //  status    created
  //            triggered, show on alert list and NOT in alert popup again, add repeat alert if appropriate
  //            acknowledged (shown), 'New' clicked by user
  //            cleared by user ('OK' clicked), remove from alerts list

  /*
    
      localStorage.setItem("BikeMaintTrackerAlertStatus", '[{"id": "a01", "status": "created"},{"id": "a02", "status": "created"}]');
    
    
      It is very helpful to have a good software design, to guide the development, to have a plan.
      Even agile, with rapid prototypes and releasable code every few weeks should have a solid
      plan and software design.  
      */
  const runAlertCycle = async (bikes: Bike[]) => {
    // Check for alerts and handle any that are ready for a status update
    if (bikes.length === 0) return;
    // Get all alerts for this user
    const alerts = await BikeService.getAlerts(
      "123e4567-e89b-12d3-a456-426614174000",
      ""
    );
    setMasterAlerts([]);
    // Get current list of alert statuses
    const alertStatusStr =
      localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    let alertStatusSet: AlertStatus[] =
      alertStatusStr.length > 2 ? JSON.parse(alertStatusStr) : [];
    const today: Date = new Date();

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
      const currentAlertStatus = alertStatusSet.find(
        (alertStat) => alertStat.id === alert.id
      );
      console.log("       status: " + currentAlertStatus?.status);

      if (!currentAlertStatus) {
        continue;
      }
      // Skip alerts that have been cleared by user already.
      if (currentAlertStatus.status === "cleared") continue;

      // Find the bike referenced by this alert
      var idx = bikes.findIndex((bike) => {
        return bike.id === alert.bikeID;
      });
      if (idx > -1) {
        // The bike was found
        let triggered: boolean = currentAlertStatus.status === "triggered";
        //let acknowledged: boolean =
        //  currentAlertStatus.status === "acknowledged";
        let created: boolean = currentAlertStatus.status === "created";
        let isNew: boolean = false; // assume not a new trigger

        // If not already triggered, check to see if we should trigger this alert based on miles.
        if (alert.miles && bikes[idx].totalMiles >= alert.miles) {
          // Trigger on number of miles
          if (created) {
            currentAlertStatus.status = "triggered";
            // save the whole set at the end
            isNew = true;
            triggered = true;
          }

          // Set a master alert for this alert, so that it shows up on main page
          setMasterAlerts((prev) => [
            ...prev,
            {
              alertID: alert.id,
              userID: "123e4567-e89b-12d3-a456-426614174000",
              bikeID: alert.bikeID,
              bikeName: alert.bikeName,
              reason: "Bike has reached " + alert.miles + " miles",
              description: alert.description,
              isNew: isNew || triggered,
            },
          ]);
        } else if (
          alert.date &&
          alert.date.toDateString() <= today.toDateString()
        ) {
          // Trigger on date
          console.log("  ----- trigger on date ----");
          if (created) {
            // Change alert from created status to triggered.
            // update the BikeMaintTrackerAlertStatus JSON
            currentAlertStatus.status = "triggered";
            // save the whole set at the end
            isNew = true;
            triggered = true;
          }
          console.log("      isNew = " + isNew);

          setMasterAlerts((prev) => [
            ...prev,
            {
              alertID: alert.id,
              userID: "123e4567-e89b-12d3-a456-426614174000",
              bikeID: alert.bikeID,
              bikeName: alert.bikeName,
              reason: "Date is on or after " + alert.date?.toLocaleDateString(),
              description: alert.description,
              isNew: isNew || triggered,
            },
          ]);
        }
        if (isNew) {
          // Check alert and if it was repeating, add the next cycle
          // Clone the alert and push to the next cycle.
          showNotification("You have new alerts in Bike Maintenance Tracker!", {
            body: "Please check the Alert Center in Bike Maintenance Tracker to see alerts.",
            requireInteraction: true,
          });

          let save = false;
          let cloned: Alert = { ...alert, id: uuidv4() }; // clone the alert
          if (alert.miles && alert.repeatMiles && alert.repeatMiles > 0) {
            cloned.miles = alert.miles + alert.repeatMiles;
            save = true;
          } else if (alert.date && alert.repeatDays && alert.repeatDays > 0) {
            const current = dayjs(alert.date);
            cloned.date = current.add(alert.repeatDays, "day").toDate();
            save = true;
          }
          if (save) {
            // alert was cloned, find the bike for this and add it to the alerts.  Then save.
            const success = await BikeService.addAlert(cloned);
            alertStatusSet.push({ id: cloned.id, status: "created" });
          }
        }
      }
    }
    localStorage.setItem(
      "BikeMaintTrackerAlertStatus",
      JSON.stringify(alertStatusSet)
    );
  };

  // 15 minute timer:
  const timer = setInterval(() => {
    console.log("interval triggered");
    runAlertCycle(bikes);
  }, 900000);

  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardContent>
        <>
          <TableContainer component={Paper}>
            <Typography variant="h6" component="div" sx={{ padding: 2 }}>
              Alert Center
            </Typography>
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
                      <CustomTableCell>{alert.bikeName}</CustomTableCell>
                      <CustomTableCell>{alert.description}</CustomTableCell>
                      <CustomTableCell>{alert.reason}</CustomTableCell>
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
                        ) : (
                          <SmallButton
                            variant="contained"
                            color="primary"
                            size="small" // Make the button small
                            onClick={() => handleAlertOkClick(alert.alertID)}
                          >
                            OK
                          </SmallButton>
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
