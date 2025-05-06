import { useEffect, useState } from "react";
import BikeCard from "./BikeCard.component";
import { Alert, Bike, BikeService, MaintLog } from "../services/BikeService";
import BikeDropdown from "./BikeDropdown.component";
import MaintLogPopup from "./MaintLogPopup";
import { Button, CircularProgress, Typography } from "@mui/material";
import AddMilesPopup from "./AddMiles.component";
import AddEditBikePopup from "./AddEditBike.component";
import NewBikeDayModal from "./NewBikeDay.component";
import { v4 as uuidv4 } from "uuid";
import AlertsPopup from "./AlertsPopup.component";
import { AlertCenter } from "./AlertCenter.component";
import UserLoginPopup from "./UserLogin.component";

/*

Purpose:  The main Bike component and parent of all related components.

*/
interface BikeComponentProps {
  userName: string;
}

const BikeComponent: React.FC<BikeComponentProps> = ({ userName }) => {
  let emptyBike: Bike = {
    userID: "testUser",
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

  const [bikeData, setBikeData] = useState<Bike[]>([emptyBike]);
  const [selectedBikeIndex, setSelectedBikeIndex] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const [openAlerts, setOpenAlerts] = useState<boolean>(false);
  const [nbdopen, setNBDOpen] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [openAddMiles, setOpenAddMiles] = useState<boolean>(false);
  const [openEditBike, setOpenEditBike] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [realData, setRealData] = useState<boolean>(false);
  const [triggerAlertCycle, setTriggerAlertCycle] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [log, setLog] = useState<MaintLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setCurrentUser(userName);
    console.log("  User is: " + userName);
    if (userName.length > 0) {
      loadBikes (userName);
    }
    else {
      // user logged out or no login yet
      console.log("   Adding empty bike");
      setRealData(false);
      emptyBike.userID = "testUser"; // set test user for empty bike
      setBikeData([emptyBike]);
      // TODO:  Log out is not fully working.
    }
  }, [userName]);


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

  const loadBikes = async (userName: string) => {
    setLoading(true);
    var result = await BikeService.getBikes(userName);
    console.log("  Loaded bikes, size = " + result.length);
    await BikeService.populateAlertStatuses(userName);
    setLoading(false);
    if (result.length > 0) {
      setRealData(true);
      setBikeData(result);
    }
    else {
      // User logged in, but they have no bikes yet.
      emptyBike.id = uuidv4();
      emptyBike.userID = currentUser;
    }
  }

  const handleMaintLogOpen = async () => {
    if (bikeData.length === 0) return;
    const log = await BikeService.getMaintLog(
      currentUser,
      bikeData[selectedBikeIndex].id
    );
    setLog(log);
    setOpen(true);
  };

  const handleOpenAlerts = async () => {
    if (bikeData.length === 0) return;

    const ale = await BikeService.getAlerts(
      currentUser,
      bikeData[selectedBikeIndex].id
    );
    setAlerts(ale);
    setOpenAlerts(true);
  };

  const handleMaintLogClose = async (added: MaintLog[], deleted: string[]) => {
    // save updated log to the BikeService
    // await BikeService.setMaintLog(
    //   currentUser,
    //   bikeData[selectedBikeIndex].id,
    //   updated
    // );
    await BikeService.setMaintLog(added, deleted);

    setOpen(false);
  };

  const handleCloseAlerts = async (updated: Alert[], deleted: string[]) => {
    await BikeService.setAlerts(
      updated,
      deleted
    );
    for (let item of deleted) {
      BikeService.removeAlertStatus(currentUser, item, false);
    }
    for (let item of updated) {
      BikeService.addAlertStatus(currentUser, item.id, "created", false);
    }
    BikeService.saveAlertTable(currentUser);

    setOpenAlerts(false);
    //await runAlertCycle(bikeData);
    setTriggerAlertCycle((prev) => !prev);
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

  const handleAddFirstBike = () => {
    handleOpenEditBike(false);
    setAddMode(true);
  };

  const handleOpenEditBike = (add: boolean) => {
    const newIdx = bikeData.length;
    if (add) {
      // Add a new bike.
      const updatedData = bikeData.map((item, idx) => {
        return { ...item };
      });
      emptyBike.id = uuidv4();
      emptyBike.userID = currentUser;
      updatedData.push(emptyBike);
      setAddMode(true);
      setBikeData(updatedData);
      setSelectedBikeIndex(newIdx);
    } else {
      // Editing existing bike
      setAddMode(false);
      if (newIdx === 1 && bikeData[0].userID === "testUser") {
        // Editing the test user empty bike, set a real id.
        bikeData[0].id = uuidv4();
        bikeData[0].userID = currentUser;  
      }
    }
    setOpenEditBike(true);
  };

  const handleCloseAddMiles = async (add: number) => {

    bikeData[selectedBikeIndex].totalMiles += Math.round(add);
    BikeService.saveBike(bikeData[selectedBikeIndex], false, selectedBikeIndex);
    setOpenAddMiles(false);
    //await runAlertCycle(bikeData);
    // run the alert cycle, since miles were added.
    setTriggerAlertCycle((prev) => !prev);
  };

  // const handleLoginClose = (user: string) => {
  //   setCurrentUser(user);
  // }

  const handleModfyBike = async (data: Bike) => {
    setOpenEditBike(false);

    if (data.id.length > 0) {
      // Submit clicked
      if (data.id === "a13") {
        data.id = uuidv4(); // user edited initial dummy data bike, set a real id
        setRealData(true);
      }
      // If we are editing a bike, and Submit was hit.
      const updatedData = bikeData.map((item, idx) => {
        if (idx === selectedBikeIndex)
          return { ...data, totalMiles: Number(data.totalMiles) };
        else return { ...item };
      });
      console.log("  Setting updated bike data:");
      console.log(JSON.stringify(updatedData));
      setBikeData(updatedData);
      setRealData(true);

      // Run alert cycle, in case miles were changed.
      setTriggerAlertCycle((prev) => !prev);
      // for some reason the toggle above has to happen before the await below,
      // or the state of the toggle value is lost and the Alert Center never sees it.

      await BikeService.saveBike(
        updatedData[selectedBikeIndex],
        addMode,
        selectedBikeIndex
      );
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
    // const fetchData = async () => {
    //   const bikedata = await BikeService.getBikes(
    //     currentUser,
    //   );
    //   setBikeData(bikedata);
    //   if (bikedata.length > 0 && bikedata[0].id !== "a13") {
    //     // Real bike data has been loaded.
    //     setRealData(true);
    //   }
    // };
    // fetchData();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    console.log("  New bike data in, checking to run alert cycle");
    console.log("   current user: " + currentUser);
    console.log("   Real data: " + realData);
    console.log("   Bike data: " + bikeData[0].id);
    if (currentUser.length > 0 && realData) setTriggerAlertCycle((prev) => !prev);
  }, [bikeData]);

  const handleDataFromChild = (data: string) => {
    //setSelectedBike(data);
    const idx = bikeData.findIndex((bike) => bike.id === data);
    setSelectedBikeIndex(idx);
  };

  return (
    <div>
      {bikeData.length > 0 && currentUser.length > 0 && (
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
      {!realData && currentUser.length > 0 && !loading && (
        // New logged in user, they have not added any bikes yet.
        <>
          <Button
            variant="contained"
            onClick={handleAddFirstBike}
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
      {loading && (
         <Typography variant="h5" component="div">Bikes Loading <CircularProgress /> </Typography>
      )}
      {bikeData.length > 0 && realData && currentUser.length > 0 ? (
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
            handleOpenMaint={handleMaintLogOpen}
            cycleLeft={handleCycleLeft}
            cycleRight={handleCycleRight}
          ></BikeCard>
          <MaintLogPopup
            bikeName={bikeData[selectedBikeIndex].name}
            bikeId={bikeData[selectedBikeIndex].id}
            userId={currentUser}
            currentMiles={bikeData[selectedBikeIndex].totalMiles}
            log={log}
            open={open}
            handleClose={handleMaintLogClose}
          ></MaintLogPopup>
          <AlertsPopup
            bikeName={bikeData[selectedBikeIndex].name}
            userId={currentUser}
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
      { currentUser.length == 0 && <span>Please log in to continue.</span> }
      {currentUser.length > 0 &&
        <><AlertCenter bikes={bikeData} currentBikeId={selectedBikeIndex} user={currentUser} toggle={triggerAlertCycle}></AlertCenter>
        <Button
          variant="contained"
          color="primary"
          disabled={!realData}
          onClick={handleMaintLogOpen}
          sx={{ margin: "3px" }}
        >
          Maintenance Log
        </Button><Button
          variant="contained"
          color="primary"
          disabled={!realData}
          onClick={handleOpenAlerts}
          sx={{ margin: "3px" }}
        >
            Alerts
          </Button></>
      }
    </div>
  );
};

export default BikeComponent;

// Responsive Tables : https://muhimasri.com/blogs/react-responsive-table/
