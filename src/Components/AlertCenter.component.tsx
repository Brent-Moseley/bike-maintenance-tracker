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
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Alert, Bike, BikeService } from "../services/BikeService";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import ConfirmAutoAlertsModal from "./AutoAlertsPopup.component";
import { serviceIntervalsMtn } from "./serviceIntervalsMtn";

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
  currentBikeId: number;
  user: string;
  toggle: boolean;
}

const getLongDescription = (desc: string) => {
  let text = serviceIntervalsMtn.find((item) => item.description === desc);
  return text ? text.longDescription : "";
};

const serviceIntervalsGravel = [];

const serviceIntervalsRoad = [];

const AlertCenter: React.FC<AlertCenterProps> = ({
  bikes,
  currentBikeId,
  user,
  toggle,
}) => {
  const [masterAlerts, setMasterAlerts] = useState<TriggeredAlert[]>([]);
  const savedIncludeUpcoming = localStorage.getItem("includeUpcoming");
  const [includeUpcoming, setIncludeUpcoming] = useState<boolean>(
    savedIncludeUpcoming && savedIncludeUpcoming === "true" ? true : false
  );
  const [showAddServiceInt, setShowAddServiceInt] = useState<boolean>(true); // default to false
  const [showingButtonsAddServiceInt, setShowingButtonsAddServiceInt] =
    useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
    BikeService.setAlertStatus(user, id, status);
  }

  function showNotification(title: string, options: Object) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  }

  const handleAlertOkClick = async (id: string) => {
    await setAlertStatus(id, "cleared");
    await runAlertCycle(bikes); // ??
  };

  const handleNewClick = async (id: string) => {
    await setAlertStatus(id, "acknowledged");
    await runAlertCycle(bikes);
  };

  const runAlertCycle = async (bikes: Bike[], include?: boolean) => {
    // Check for alerts and handle any that are ready for a status update
    if (bikes.length === 0) return;
    // Get all alerts for this user
    const alerts = await BikeService.getAlerts(user, "");
    const today: Date = new Date();

    let sortedAlerts: TriggeredAlert[] = [];
    let SendBrowserNotification = false;

    // Run through list of current lists for this user, rebuilding the trigger list
    for (let alert of alerts) {
      // Attempt to find status for this alert
      let currentAlertStatus = BikeService.getAlertStatus(alert.id);

      // Skip alerts that have been cleared by user already.
      if (!currentAlertStatus || currentAlertStatus === "cleared") continue;

      let isFirstTriggered = false; // Assume not the first time triggered.
      // Find the bike referenced by this alert
      var idx = bikes.findIndex((bike) => {
        return bike.id === alert.bikeID;
      });
      if (idx > -1) {
        // The bike was found
        let triggered: boolean = currentAlertStatus === "triggered";
        let acknowledged: boolean = currentAlertStatus === "acknowledged";
        let created: boolean = currentAlertStatus === "created";
        let isNew: boolean = false; // assume not a new trigger
        let isUpcoming: boolean = false; // assume date is not upcoming
        const todayjs = dayjs();
        const alertDate = dayjs(alert.date);
        const alertNeedsTriggeredOnDate =
          alert.date &&
          (alertDate.startOf("day").isBefore(todayjs.startOf("day")) ||
            alertDate.startOf("day").isSame(todayjs.startOf("day")));
        const isAlertDateUpcoming =
          alert.date &&
          alertDate.isAfter(todayjs.add(0, "day")) &&
          alertDate.isBefore(todayjs.add(7, "day"));
        const alertNeedsTriggeredOnMiles =
          alert.miles && bikes[idx].totalMiles >= alert.miles;

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
            isNew: isNew, // Show 'New' button
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
            isNew: isNew, // Show 'New' button
            isUpcoming: false,
          });
        } else if (isAlertDateUpcoming) {
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
        } else if (triggered || acknowledged) {
          sortedAlerts.push({
            alertID: alert.id,
            userID: user,
            bikeID: alert.bikeID,
            bikeName: alert.bikeName,
            reason: alertNeedsTriggeredOnDate
              ? "Date is on or after " + alert.date?.toLocaleDateString()
              : "Bike has reached " + alert.miles + " miles",
            description: alert.description,
            isNew: triggered,
            isUpcoming: false,
          });
        }
      }
      const normal = sortedAlerts.filter((alert) => !alert.isUpcoming);
      const showAll = include !== undefined ? include : includeUpcoming;
      const upcoming = showAll
        ? sortedAlerts.filter((alert) => alert.isUpcoming)
        : [];
      setMasterAlerts([...normal, ...upcoming]);

      if (isFirstTriggered) {
        // Check alert and if it was repeating, add the next cycle
        // Clone the alert and push to the next cycle.

        let save = false;
        let cloned: Alert = { ...alert, id: uuidv4() }; // clone the alert
        if (alert.miles && alert.repeatMiles && alert.repeatMiles > 0) {
          cloned.miles = alert.miles + alert.repeatMiles;
          // If this would produce a repeating cycle
          // (ie 2+ past repeating alerts), just keep the first alert and find
          // the next alert that will be in the future.  Only create the future one.
          while (cloned.miles <= bikes[idx].totalMiles) cloned.miles += alert.repeatMiles;
          save = true;
        } else if (alert.date && alert.repeatDays && alert.repeatDays > 0) {
          let current = dayjs(alert.date);
          current = current
            .add(Math.round(alert.repeatDays * 30.4), "day");
          while (!current.isAfter(today))
            current = current.add(Math.round(alert.repeatDays * 30.4), "day");
          cloned.date = current.toDate();
          save = true;
        }
        if (save) {
          // alert was cloned, find the bike for this and add it to the alerts.  Then save.
          const success = await BikeService.addAlert(cloned);
          await BikeService.addAlertStatus(user, cloned.id, "created");
        }
      }
    }
    if (SendBrowserNotification) {
      showNotification("You have new alerts in Bike Maintenance Tracker!", {
        body: "Check the Alert Center in Bike Maintenance Tracker to see alerts.",
        requireInteraction: true,
      });
    }
  };

  // 15 minute timer:
  const timer = setInterval(() => {
    console.log("interval triggered");
    runAlertCycle(bikes);
  }, 900000);

  const handleConfirmOK = async (start: Date) => {
    setConfirmModalOpen(false);
    await handleAddSuggestedMtn(start);
  };

  const handleConfirmCancel = () => {
    setShowingButtonsAddServiceInt(false);
    setShowAddServiceInt(true);
    setConfirmModalOpen(false);
  };

  const handleAddSuggestedMtn = async (start: Date) => {
    setLoading(true);
    const alerts = await BikeService.getAlerts(user, bikes[currentBikeId].id);
    let newAlerts: Alert[] = [];
    let begin = dayjs(start);
    for (let suggested of serviceIntervalsMtn) {
      if (
        alerts.findIndex((al) => al.description === suggested.description) ===
        -1
      ) {
        const newRow: Alert = {
          id: uuidv4(),
          userID: user,
          bikeID: bikes[currentBikeId].id,
          bikeName: bikes[currentBikeId].name,
          date: suggested.repeatDays
            ? begin.add(suggested.repeatDays, "days").toDate()
            : undefined,
          repeatDays: suggested.repeatDays
            ? parseFloat((suggested.repeatDays / 30.4).toFixed(1))
            : undefined,
          miles: suggested.repeatMiles
            ? bikes[currentBikeId].totalMiles + suggested.repeatMiles
            : undefined,
          repeatMiles: suggested.repeatMiles
            ? suggested.repeatMiles
            : undefined,
          description: suggested.description,
          status: "created",
        };
        newAlerts.push(newRow);
        await BikeService.addAlertStatus(user, newRow.id, "created");
      }
    }
    await BikeService.setAlerts(newAlerts, []);
    setLoading(false);
    setShowingButtonsAddServiceInt(false);
    setShowAddServiceInt(true);
  };

  const handleAddSuggestedGravel = () => {};

  const handleAddSuggestedRoad = () => {};

  const handleAddSuggestedEnable = () => {
    setShowingButtonsAddServiceInt(true);
    setShowAddServiceInt(false);
  };

  const cancelAddSuggested = () => {
    setShowingButtonsAddServiceInt(false);
    setShowAddServiceInt(true);
  };

  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardContent>
        <>
          <TableContainer component={Paper}>
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
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 2, // Space between button and checkbox
                  padding: "14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                {showAddServiceInt && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      margin: "3px",
                      minWidth: "58px",
                      height: "35px",
                      padding: "2px 5px",
                    }}
                    onClick={handleAddSuggestedEnable}
                  >
                    <Typography sx={{ lineHeight: "1.2", fontSize: "11.5px" }}>
                      Add Recommended
                      <br /> Service Intervals
                    </Typography>
                  </Button>
                )}
                {showingButtonsAddServiceInt && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: -280,
                      zIndex: 100,
                      width: 450,
                      bgcolor: "white",
                      border: "3px solid #ccc",
                      boxShadow: "5px 5px 10px rgba(0, 0, 0, 1)",
                      padding: "6px",
                      borderRadius: "8px",
                      display: "inline-block", // Keeps the box size tight around content
                      textAlign: "center", // Aligns label and button group
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ marginBottom: "8px" }}
                    >
                      Add Recommended Service Intervals
                    </Typography>
                    <ButtonGroup variant="text">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ margin: "3px" }}
                        onClick={() => {
                          setConfirmModalOpen(true);
                        }}
                        disabled={loading}
                      >
                        Mountain Bike
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ margin: "3px" }}
                        onClick={handleAddSuggestedGravel}
                        disabled={loading}
                      >
                        Gravel Bike
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ margin: "3px" }}
                        onClick={handleAddSuggestedRoad}
                        disabled={loading}
                      >
                        Road Bike
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ margin: "3px" }}
                        onClick={cancelAddSuggested}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </ButtonGroup>
                  </Box>
                )}
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
                        <Tooltip
                          title={
                            <span style={{ fontSize: "0.8rem" }}>
                              {getLongDescription(alert.description)}
                            </span>
                          }
                        >
                          <span>{alert.description}</span>
                        </Tooltip>
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
                            size="small"
                            onClick={() => handleNewClick(alert.alertID)}
                            sx={{ marginLeft: 1 }} // Add margin to separate buttons
                          >
                            Accept
                          </OrangeButton>
                        ) : !alert.isUpcoming ? (
                          <SmallButton
                            variant="contained"
                            color="primary"
                            size="small" // Make the button small
                            onClick={() => handleAlertOkClick(alert.alertID)}
                          >
                            Clear
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
          <ConfirmAutoAlertsModal
            open={confirmModalOpen}
            handleOk={handleConfirmOK}
            handleClose={handleConfirmCancel}
          ></ConfirmAutoAlertsModal>
        </>
      </CardContent>
    </Card>
  );
};

export { AlertCenter, getLongDescription };

