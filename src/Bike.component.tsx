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
  const [selectedBikeIndex, setSelectedBikeIndex] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const [openAlerts, setOpenAlerts] = useState<boolean>(false);
  const [nbdopen, setNBDOpen] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [openAddMiles, setOpenAddMiles] = useState<boolean>(false);
  const [openEditBike, setOpenEditBike] = useState<boolean>(false);
  const [realData, setRealData] = useState<boolean>(false);

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
      const currentAlertStatus = alertStatusSet.find(
        (alertStat) => alertStat.id === alert.id
      );

      if (!currentAlertStatus) {
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
        let triggered: boolean = currentAlertStatus.status === "triggered";
        let acknowledged: boolean =
          currentAlertStatus.status === "acknowledged";
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
        } else if (alert.date && alert.date <= today) {
          // Trigger on date
          if (created) {
            // Change alert from created status to triggered.
            // update the BikeMaintTrackerAlertStatus JSON
            currentAlertStatus.status = "triggered";
            // save the whole set at the end
            isNew = true;
            triggered = true;
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
          showNotification("You have new alerts in Bike Maintenance Tracker!", {
            body: "Please check the Alert Center in Bike Maintenance Tracker to see alerts.",
            requireInteraction: true,
          });

          // Set to triggered list, so that this alert does not appear on the Alerts popup, now.
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
    setAlertStatus(id, "cleared");
    await runAlertCycle(bikeData);
  };

  const handleNewClick = async (id: string) => {
    // BCM see if this list is still used: 
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
    setAlerts(ale);
    setOpenAlerts(true);
  };
  const handleMaintLogClose = async (updated: MaintLog[]) => {
    // save updated long to the BikeService
    await BikeService.setMaintLog(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id,
      updated
    );

    setOpen(false);
  };

  const handleCloseAlerts = async (updated: Alert[]) => {
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
    setOpenAddMiles(true);
  };

  const handleCycleLeft = () => {
    let next = selectedBikeIndex - 1;
    next = next > -1 ? next : bikeData.length - 1;
    setSelectedBikeIndex(next);
  };

  const handleCycleRight = () => {
    let next = selectedBikeIndex + 1;
    next = next === bikeData.length ? 0 : next;
    setSelectedBikeIndex(next);
  };

  const handleNBDOK = () => {
    if (realData) handleOpenEditBike(true);
    else handleOpenEditBike(false);
    setNBDOpen(false);
  };

  const handleNBDCancel = () => {
    setNBDOpen(false);
  };

  const handleAddBike = () => {
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
    bikeData[selectedBikeIndex].totalMiles += add;
    BikeService.saveBike(bikeData[selectedBikeIndex], selectedBikeIndex);
    setOpenAddMiles(false);
    await runAlertCycle(bikeData);
  };

  const handleModfyBike = async (data: Bike) => {
    setOpenEditBike(false);

    if (data.id.length > 0) {
      // Submit clicked
      if (data.id === 'a13') {
        data.id = uuidv4();  // user edited initial dummy data bike
        setRealData(true);
      }
      // If we are editing a bike, and Submit was hit.
      const updatedData = bikeData.map((item, idx) => {
        if (idx === selectedBikeIndex) return { ...data };
        else return { ...item };
      });
      setBikeData(updatedData);
      setRealData(true);
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
      if (bikedata.length > 0) console.log("ID is: " + bikedata[0].id);
      if (bikedata.length > 0 && bikedata[0].id !== "a13") {
        setRealData(true);
      }
    };
    fetchData();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    runAlertCycle(bikeData);
  }, [bikeData]);

  const handleDataFromChild = (data: string) => {
    //setSelectedBike(data);
    const idx = bikeData.findIndex((bike) => bike.id === data);
    setSelectedBikeIndex(idx);
  };

  return (
    <div>
      {bikeData.length > 0 && (
        <AddEditBikePopup
          data={bikeData[selectedBikeIndex]}
          open={openEditBike}
          handleClose={handleModfyBike}
        ></AddEditBikePopup>
      )}
      <NewBikeDayModal
        open={nbdopen}
        handleOk={handleNBDOK}
        handleClose={handleNBDCancel}
      ></NewBikeDayModal>
      {bikeData.length > 0 && !realData && (
        <>
          <Button
            variant="contained"
            onClick={handleAddBike}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px 20px",
            }}
          >
            Add my first bike!
          </Button>
        </>
      )}
      {bikeData.length > 0 && realData ? (
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
            currentMiles={bikeData[selectedBikeIndex].totalMiles}
            log={log}
            open={open}
            handleClose={handleMaintLogClose}
          ></MaintLogPopup>
          <AlertsPopup
            bikeName={bikeData[selectedBikeIndex].name}
            bikeId={bikeData[selectedBikeIndex].id}
            currentMiles={bikeData[selectedBikeIndex].totalMiles}
            alerts={alerts}
            open={openAlerts}
            handleClose={handleCloseAlerts}
          ></AlertsPopup>
          <AddMilesPopup
            miles={bikeData[selectedBikeIndex].totalMiles}
            open={openAddMiles}
            handleClose={handleCloseAddMiles}
          ></AddMilesPopup>
        </div>
      ) : (
        <span></span>
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
                <Typography variant="body2" sx={{ padding: 1 }}>
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
