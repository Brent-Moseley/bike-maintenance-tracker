import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Bike } from "../services/BikeService";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import "./AddEditBike.component.css";

/*

Purpose:  Show a popup, allowing the user to add a new bike to their collection, or edit data for an existing bike.

*/

// Bugs:  modal does not update miles when Add miles is used.
// Also, it does not run an alert cycle with updated miles (or bike is not updated)
interface AddEditBikeProps {
  data: Bike;
  open: boolean;
  handleClose: (updated: Bike) => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 725,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddEditBikePopup: React.FC<AddEditBikeProps> = ({
  data,
  open,
  handleClose,
}) => {
  const newData = structuredClone(data);

  const handleCloseModal = (submit: boolean) => {
    const updated = { ...formData };
    if (!submit) updated.id = "";

    handleClose(updated);
  };

  const [formData, setFormData] = useState(newData);

  useEffect(() => {
    console.log("   Add edit bike updated");
    setFormData(data);
  }, [data]);

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChangeMYPurchased = (newValue: Dayjs | null) => {
    if (newValue) setFormData({ ...formData, monthYearPurchased: newValue.toDate() });
  };

  const handleDateChangeLastServiced = (newValue: Dayjs | null) => {
    if (newValue) setFormData({ ...formData, dateLastServiced: newValue.toDate() });
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      disableEscapeKeyDown
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      BackdropProps={{ onClick: (event) => event.stopPropagation(),}}
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Add / Edit Bike
        </Typography>
        <Box sx={{ width: "100%", maxWidth: 700, margin: "auto" }}>
          <form noValidate autoComplete="off">
            <div className="form-group-container">
              <div className="left">
                <TextField
                  label="Name"
                  name="name"
                  variant="outlined"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
              <div className="left">
                <TextField
                  label="Brand"
                  name="brand"
                  variant="outlined"
                  fullWidth
                  value={formData.brand}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
            </div>
            <TextField
              label="Model"
              name="model"
              variant="outlined"
              fullWidth
              value={formData.model}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Spec"
              name="spec"
              variant="outlined"
              fullWidth
              value={formData.spec}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notes"
              name="notes"
              variant="outlined"
              fullWidth
              value={formData.notes}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date Purchased"
                name="monthYearPurchased"
                value={dayjs(formData.monthYearPurchased)}
                onChange={handleDateChangeMYPurchased}
                sx={{ mb: 2 }}
              />
              <DesktopDatePicker
                label="Date Last Serviced"
                name="dateLastServiced"
                value={dayjs(formData.dateLastServiced)}
                onChange={handleDateChangeLastServiced}
                sx={{ mb: 2 }}
              />
            </LocalizationProvider>
            <div className="form-group-container">
              <div className="left">
                <TextField
                  label="Miles Last Serviced"
                  name="milesLastServiced"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={formData.milesLastServiced}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
              <div className="right">
                <TextField
                  label="Total Miles"
                  name="totalMiles"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={formData.totalMiles}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
            </div>
          </form>
        </Box>
        <Button onClick={() => handleCloseModal(true)} sx={{ mt: 2 }}>
          Submit
        </Button>
        <Button onClick={() => handleCloseModal(false)} sx={{ mt: 2 }}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default AddEditBikePopup;
