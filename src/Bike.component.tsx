import { useEffect, useState } from "react";
import BikeCard from "./Components/BikeCard.component";
import { Bike, BikeService, MaintLog } from "./services/BikeService";
import BikeDropdown from "./Components/BikeDropdown.component";
import MaintLogPopup from "./Components/MaintLogPopup";
import { Button } from "@mui/material";
import AddMilesPopup from "./Components/AddMiles.component";
import AddEditBikePopup from "./Components/AddEditBike.component";
import NewBikeDayModal from "./Components/NewBikeDay.component";
import { v4 as uuidv4 } from "uuid";

const BikeComponent = () => {
  const [bikeData, setBikeData] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState("");
  const [selectedBikeIndex, setSelectedBikeIndex] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const [nbdopen, setNBDOpen] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [openAddMiles, setOpenAddMiles] = useState<boolean>(false);
  const [openEditBike, setOpenEditBike] = useState<boolean>(false);

  const [log, setLog] = useState<MaintLog[]>([]);

  const handleOpen = async () => {
    const log = await BikeService.getMaintLog(
      "123e4567-e89b-12d3-a456-426614174000",
      bikeData[selectedBikeIndex].id
    );
    setLog(log);
    setOpen(true);
  };
  const handleClose = async (updated: MaintLog[]) => {
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

  const handleOpenAddMiles = () => {
    console.log("Opening");
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

  const handleCloseAddMiles = (add: number) => {
    console.log("Closing...." + add);
    bikeData[selectedBikeIndex].totalMiles += add;
    BikeService.saveBike(bikeData[selectedBikeIndex], selectedBikeIndex);
    setOpenAddMiles(false);
  };

  const handleModfyBike = (data: Bike) => {
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
      BikeService.saveBike(updatedData[selectedBikeIndex], selectedBikeIndex);
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
    };
    fetchData();
  }, []);

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
            bikeId={bikeData[selectedBikeIndex].name}
            log={log}
            open={open}
            handleClose={handleClose}
          ></MaintLogPopup>
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
        <p>Loading...</p>
      )}
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ margin: "3px" }}
      >
        Maintenance Log
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={undefined}
        sx={{ margin: "3px" }}
      >
        Alerts (coming soon)
      </Button>
    </div>
  );
};

export default BikeComponent;


