import { useEffect, useState } from "react";
import BikeCard from "./Components/BikeCard.component";
import { Alert, Bike, BikeService, MaintLog } from "./services/BikeService";
import BikeDropdown from "./Components/BikeDropdown.component";
import MaintLogPopup from "./Components/MaintLogPopup";
import {
  Button,
  Card,
  CardContent,
  keyframes,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddMilesPopup from "./Components/AddMiles.component";
import AddEditBikePopup from "./Components/AddEditBike.component";
import NewBikeDayModal from "./Components/NewBikeDay.component";
import { v4 as uuidv4 } from "uuid";
import AlertsPopup from "./Components/AlertsPopup.component";
import dayjs from "dayjs";

const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#009900", // Richer green
  color: "#FFFFFF", // White text for better contrast
  fontWeight: "bold", // Bold text
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
  padding: "8px", // Adjust padding as needed
}));

const SmallButton = styled(Button)(({ theme }) => ({
  padding: "2px 8px", // Reduce padding
  minWidth: "30px", // Set minimum width
  fontSize: "0.75rem", // Smaller font size
}));

const OrangeButton = styled(Button)(({ theme }) => ({
  padding: "2px 8px",
  minWidth: "30px",
  fontSize: "0.75rem",
  backgroundColor: "#FFA500",
  color: "#FFFFFF",
  animation: `${fadeInOut} 2s infinite`, // Animation
  "&:hover": {
    backgroundColor: "#FF8C00", // Darker orange on hover
  },
}));

const fadeInOut = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

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

const BikeComponent = () => {
  const [bikeData, setBikeData] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState("");
  const [selectedBikeIndex, setSelectedBikeIndex] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [openAlerts, setOpenAlerts] = useState<boolean>(false);
  const [nbdopen, setNBDOpen] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [openAddMiles, setOpenAddMiles] = useState<boolean>(false);
  const [openEditBike, setOpenEditBike] = useState<boolean>(false);

  const [log, setLog] = useState<MaintLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [masterAlerts, setMasterAlerts] = useState<TriggeredAlert[]>([]);

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
    console.log(" --------------------- ALERT CYCLE -----------");

    if (bikes.length === 0) return;
    // Get all alerts for this user
    const alerts = await BikeService.getAlerts(
      "123e4567-e89b-12d3-a456-426614174000",
      ""
    );
    setMasterAlerts([]);
    // const triggeredListStr = localStorage.getItem("BikeMaintTriggeredAlerts") ?? "";
    // let triggeredList: string[] =
    // triggeredListStr.length > 2 ? JSON.parse(triggeredListStr) : [];

    // const clearedListStr =
    //   localStorage.getItem("BikeMaintTrackerCleared") ?? "";
    // let clearedList: string[] =
    //   clearedListStr.length > 2 ? JSON.parse(clearedListStr) : [];

    // const shownListStr = localStorage.getItem("BikeMaintTrackerShown") ?? "";
    // let shownList: string[] =
    //   shownListStr.length > 2 ? JSON.parse(shownListStr) : [];

    // const repeatGeneratedListStr =
    //   localStorage.getItem("BikeMaintTrackerRepeated") ?? "";
    // let repeatedList: string[] =
    //   repeatGeneratedListStr.length > 2
    //     ? JSON.parse(repeatGeneratedListStr)
    //     : [];

    // Get current list of alert statuses
    const alertStatusStr =
      localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    let alertStatusSet: AlertStatus[] =
      alertStatusStr.length > 2 ? JSON.parse(alertStatusStr) : [];
    debugger;
    const today: Date = new Date();

    // Run through list of current lists for this user, rebuilding the trigger list
    for (let alert of alerts) {
      console.log("  Processing alert: " + alert.id);
      console.log("    bike: " + alert.bikeID);

      // Attempt to find status for this alert
      const currentAlertStatus = alertStatusSet.find(
        (alertStat) => alertStat.id === alert.id
      );

      if (!currentAlertStatus) {
        console.log(" ?????? Error: alert not found in alert status!");
        continue;
      }
      // Skip alerts that have been cleared by user already.
      if (currentAlertStatus.status === "cleared") continue;

      console.log("   ----- checking this alert for triggering");

      // Find the bike referenced by this alert
      var idx = bikes.findIndex((bike) => {
        return bike.id === alert.bikeID;
      });
      if (idx > -1) {
        // The bike was found
        console.log("     alert miles: " + alert.miles);
        console.log("      bike miles: " + bikes[idx].totalMiles);
        console.log("     alert date: " + alert.date?.toLocaleDateString());
        console.log("      today: " + today.toString());

        let triggered: boolean = currentAlertStatus.status === "triggered";
        let acknowledged: boolean =
          currentAlertStatus.status === "acknowledged";
        let created: boolean = currentAlertStatus.status === "created";
        let isNew: boolean = false; // assume not a new trigger

        // If not already triggered, check to see if we should trigger this alert based on miles.
        if (alert.miles && bikes[idx].totalMiles >= alert.miles) {
          // Trigger on number of miles
          console.log("        ---- trigger on miles!");
          if (created) {
            // Change alert from created status to triggered.
            // update the BikeMaintTrackerAlertStatus JSON
            currentAlertStatus.status = "triggered";
            // save the whole set at the end
            isNew = true;
            triggered = true;
            console.log("  This is a new alert.");
            console.log(currentAlertStatus);
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
        } else if (alert.date && alert.date <= today) {
          // Trigger on date
          console.log("        ---- trigger on date!");
          if (created) {
            // Change alert from created status to triggered.
            // update the BikeMaintTrackerAlertStatus JSON
            currentAlertStatus.status = "triggered";
            // save the whole set at the end
            isNew = true;
            triggered = true;
            console.log("  This is a new alert.");
            console.log(currentAlertStatus);
          }

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
          // BCM *** Need a list called repeatGenerated to track if the repeat alert
          //   has already been generated for this alert based on ID
          //  The alert will keep triggering until the user acknowledges.
          //  But we only want to generate the repeat alert once.
          showNotification("You have new alerts in Bike Maintenance Tracker!", {
            body: "Please check the Alert Center in Bike Maintenance Tracker to see alerts.",
            requireInteraction: true,
          });

          console.log("newly triggered");
          // Set to triggered list, so that this alert does not appear on the Alerts popup, now.
          let save = false;
          let cloned: Alert = { ...alert, id: uuidv4() }; // clone the alert
          if (alert.miles && alert.repeatMiles && alert.repeatMiles > 0) {
            console.log("    created new alert for repeat miles");
            cloned.miles = alert.miles + alert.repeatMiles;
            save = true;
          } else if (alert.date && alert.repeatDays && alert.repeatDays > 0) {
            const current = dayjs(alert.date);
            console.log("    created new alert for repeat days");
            cloned.date = current.add(alert.repeatDays, "day").toDate();
            save = true;
          }
          if (save) {
            // alert was cloned, find the bike for this and add it to the alerts.  Then save.
            const success = await BikeService.addAlert(cloned);
            console.log("     Saving this cloned alert, result: " + success);
            alertStatusSet.push({ id: cloned.id, status: "created" });
          } else console.log("    No need to save this one");
        }
      } else console.log("      !!!  This bike not found!!!");
    }
    localStorage.setItem(
      "BikeMaintTrackerAlertStatus",
      JSON.stringify(alertStatusSet)
    );
    //localStorage.setItem("BikeMaintTrackerShown", JSON.stringify(shownList));
    console.log("  MASTER ALERTS " + masterAlerts.length);
    console.log("    ALERT STATUS SET: " + alertStatusSet.length);
  };

  // 15 minute timer:
  const timer = setInterval(() => {
    console.log(" ******");
    runAlertCycle(bikeData);
  }, 900000);

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

  function requestNotificationPermission() {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }

  function showNotification(title: string, options: Object) {
    if ("Notification" in window && Notification.permission === "granted") {
      console.log("Showing " + title);
      new Notification(title, options);
    }
  }

  const handleAlertOkClick = async (id: string) => {
    // const clearedListStr =
    //   localStorage.getItem("BikeMaintTrackerCleared") ?? "";
    // let clearedList: string[] =
    //   clearedListStr.length > 2 ? JSON.parse(clearedListStr) : [];
    // clearedList.push(id);
    // localStorage.setItem(
    //   "BikeMaintTrackerCleared",
    //   JSON.stringify(clearedList)
    // );

    setAlertStatus(id, "cleared");
    await runAlertCycle(bikeData);
  };

  const handleNewClick = async (id: string) => {
    const shownListStr = localStorage.getItem("BikeMaintTrackerShown") ?? "";
    let shownList: string[] =
      shownListStr.length > 2 ? JSON.parse(shownListStr) : [];

    shownList.push(id);
    localStorage.setItem("BikeMaintTrackerShown", JSON.stringify(shownList));
    setAlertStatus(id, "acknowledged");
    await runAlertCycle(bikeData);
  };

  const handleMaintLogOpen = async () => {
    if (bikeData.length === 0) return;
    const log = await BikeService.getMaintLog(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id
    );
    setLog(log);
    setOpen(true);
  };

  const handleOpenAlerts = async () => {
    if (bikeData.length === 0) return;

    const ale = await BikeService.getAlerts(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id
    );
    // const alertStatusStr = localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    // let alertStatusSet: AlertStatus[] =
    // alertStatusStr.length > 2 ? JSON.parse(alertStatusStr) : [];

    // const onlyActive = ale.filter((alert) => {
    //   const status = alertStatusSet.find((stat) => {
    //     return alert.id === stat.id;
    //   });
    //   return status?.status === 'created';
    // });
    // console.log("Here are the created alerts:");
    // console.log(onlyActive);
    setAlerts(ale);
    setOpenAlerts(true);
  };
  const handleMaintLogClose = async (updated: MaintLog[]) => {
    console.log("Logs are now:");
    console.log(updated);
    // save updated long to the BikeService
    await BikeService.setMaintLog(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id,
      updated
    );

    setOpen(false);
  };

  const handleCloseAlerts = async (updated: Alert[]) => {
    console.log("Alerts are now:");
    console.log(updated);
    debugger;
    // The updated list only includes 'created' alerts, and newly added (no status yet).
    // Status will not have changed.  Some are added, some are deleted.
    // Need to scan main alerts list, keeping only those found in updated.
    // Then scan updated, adding those that are new (not found in original).
    // save updated alerts to the BikeService
    // -- OR --  Just keep updated, and then add in
    await BikeService.setAlerts(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id,
      updated
    );

    setOpenAlerts(false);
    await runAlertCycle(bikeData);
  };

  const handleOpenAddMiles = () => {
    console.log("Opening");
    setOpenAddMiles(true);
  };

  const handleCycleLeft = () => {
    let next = selectedBikeIndex - 1;
    next = next > -1 ? next : bikeData.length - 1;
    setSelectedBikeIndex(next);
    // showNotification("You have new alerts!", {
    //   body: "Please check the Alert Center in Bike Maintenance Tracker to see your alerts.",
    //   requireInteraction: true,
    // });
  };

  const handleCycleRight = () => {
    let next = selectedBikeIndex + 1;
    next = next === bikeData.length ? 0 : next;
    setSelectedBikeIndex(next);
  };

  const handleNBDOK = () => {
    handleOpenEditBike(true);
    setNBDOpen(false);
  };

  const handleNBDCancel = () => {
    setNBDOpen(false);
  };

  const handleAddBike = () => {
    console.log("Opening add bike");
    setNBDOpen(true);
  };

  const emptyBike: Bike = {
    userID: "123e4567-e89b-12d3-a456-426614174000",
    id: "123456",
    trackBy: "",
    name: "",
    brand: "",
    model: "",
    spec: "",
    notes: "",
    monthYearPurchased: new Date(),
    dateLastServiced: new Date(),
    milesLastServiced: 0,
    totalMiles: 0,
  };

  const handleOpenEditBike = (add: boolean) => {
    console.log("Opening");
    const newIdx = bikeData.length;
    if (add) {
      // Add a new bike.
      const updatedData = bikeData.map((item, idx) => {
        return { ...item };
      });
      emptyBike.id = uuidv4();
      updatedData.push(emptyBike);
      setAddMode(true);
      setBikeData(updatedData);
      setSelectedBikeIndex(newIdx);
    } else {
      setAddMode(false);
    }
    setOpenEditBike(true);
  };

  const handleCloseAddMiles = async (add: number) => {
    console.log("Closing...." + add);
    bikeData[selectedBikeIndex].totalMiles += add;
    BikeService.saveBike(bikeData[selectedBikeIndex], selectedBikeIndex);
    setOpenAddMiles(false);
    await runAlertCycle(bikeData);
  };

  const handleModfyBike = async (data: Bike) => {
    //console.log('Closing....' + add);
    //bikeData[selectedBikeIndex].totalMiles += add;
    //debugger;
    setOpenEditBike(false);

    console.log("Returned from edit:");
    console.log(data);
    console.log(data.id);
    if (data.id.length > 0) {
      // Submit clicked
      console.log("Updating bike info");
      // If we are editing a bike, and Submit was hit.
      const updatedData = bikeData.map((item, idx) => {
        if (idx === selectedBikeIndex) return { ...data };
        else return { ...item };
      });
      setBikeData(updatedData);
      console.log("Now updated to: ");
      console.log(updatedData);
      await BikeService.saveBike(
        updatedData[selectedBikeIndex],
        selectedBikeIndex
      );
      await runAlertCycle(updatedData);
    } else {
      // Cancel clicked
      if (addMode) {
        // Delete the newly added bike
        setBikeData((prevItems) => prevItems.slice(0, -1));
        setSelectedBikeIndex(selectedBikeIndex - 1);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const bikedata = await BikeService.getBikes(
        "123e4567-e89b-12d3-a456-426614174000" // user
      );
      setBikeData(bikedata);
      //console.log("Running alert cycle after main useEffect");
      //await runAlertCycle(bikedata);
    };
    fetchData();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    runAlertCycle(bikeData);
  }, [bikeData]);

  const handleDataFromChild = (data: string) => {
    setSelectedBike(data);
    console.log("Data from child:", data);
    const idx = bikeData.findIndex((bike) => bike.id === data);
    setSelectedBikeIndex(idx);
  };

  return (
    <div>
      {bikeData.length > 0 ? (
        <div>
          <BikeDropdown
            bikes={bikeData}
            onDataFromChild={handleDataFromChild}
          ></BikeDropdown>
          <BikeCard
            bike={bikeData[selectedBikeIndex]}
            handleOpenAddMiles={handleOpenAddMiles}
            handleOpenAddBike={handleAddBike}
            handleOpenEditBike={handleOpenEditBike}
            cycleLeft={handleCycleLeft}
            cycleRight={handleCycleRight}
          ></BikeCard>
          <MaintLogPopup
            bikeName={bikeData[selectedBikeIndex].name}
            bikeId={bikeData[selectedBikeIndex].id}
            log={log}
            open={open}
            handleClose={handleMaintLogClose}
          ></MaintLogPopup>
          <AlertsPopup
            bikeName={bikeData[selectedBikeIndex].name}
            bikeId={bikeData[selectedBikeIndex].id}
            alerts={alerts}
            open={openAlerts}
            handleClose={handleCloseAlerts}
          ></AlertsPopup>
          <AddMilesPopup
            miles={bikeData[selectedBikeIndex].totalMiles}
            open={openAddMiles}
            handleClose={handleCloseAddMiles}
          ></AddMilesPopup>
          <AddEditBikePopup
            data={bikeData[selectedBikeIndex]}
            open={openEditBike}
            handleClose={handleModfyBike}
          ></AddEditBikePopup>
          <NewBikeDayModal
            open={nbdopen}
            handleOk={handleNBDOK}
            handleClose={handleNBDCancel}
          ></NewBikeDayModal>
        </div>
      ) : (
        <Button variant="contained" onClick={handleAddBike} style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '10px 20px'
        }}>
          Add my first bike!
        </Button>
      )}
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
                <Typography variant="body2" sx={{padding: 1}}>
                  There are no active alerts.
                </Typography>
              )}
            </TableContainer>
          </>
        </CardContent>
      </Card>
      <Button
        variant="contained"
        color="primary"
        onClick={handleMaintLogOpen}
        sx={{ margin: "3px" }}
      >
        Maintenance Log
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenAlerts}
        sx={{ margin: "3px" }}
      >
        Alerts
      </Button>
    </div>
  );
};

export default BikeComponent;
