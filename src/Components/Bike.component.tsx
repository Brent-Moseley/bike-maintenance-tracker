import { useEffect, useState } from "react";
import BikeCard from "./BikeCard.component";
import { Alert, Bike, BikeService, MaintLog } from "../services/BikeService";
import BikeDropdown from "./BikeDropdown.component";
import MaintLogPopup from "./MaintLogPopup";
import { Button } from "@mui/material";
import AddMilesPopup from "./AddMiles.component";
import AddEditBikePopup from "./AddEditBike.component";
import NewBikeDayModal from "./NewBikeDay.component";
import { v4 as uuidv4 } from "uuid";
import AlertsPopup from "./AlertsPopup.component";
import AlertCenter from "./AlertCenter.component";

/*

Purpose:  The main Bike component and parent of all related components.

*/
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
  const [triggerAlertCycle, setTriggerAlertCycle] = useState<boolean>(false);

  const [log, setLog] = useState<MaintLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

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
    // save updated log to the BikeService
    await BikeService.setMaintLog(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id,
      updated
    );

    setOpen(false);
  };

  const handleCloseAlerts = async (updated: Alert[]) => {
    await BikeService.setAlerts(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id,
      updated
    );

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
    //await runAlertCycle(bikeData);
    // run the alert cycle, since miles were added.
    setTriggerAlertCycle((prev) => !prev);
  };

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
    const fetchData = async () => {
      const bikedata = await BikeService.getBikes(
        "123e4567-e89b-12d3-a456-426614174000" // user
      );
      setBikeData(bikedata);
      if (bikedata.length > 0 && bikedata[0].id !== "a13") {
        // Real bike data has been loaded.
        setRealData(true);
      }
    };
    fetchData();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    setTriggerAlertCycle((prev) => !prev);
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
      <AlertCenter bikes={bikeData} toggle={triggerAlertCycle}></AlertCenter>
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
