import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Tooltip,
  Slider,
} from "@mui/material";
import { Alert, MaintLog } from "../services/BikeService";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { v4 as uuidv4 } from "uuid";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ConfirmModal from "./Confirm.component";
import { AlertStatus } from "../Bike.component";
import FromTodayModal from "./FromToday.component";

interface PopupModalProps {
  bikeName: string;
  bikeId: string;
  currentMiles: number;
  alerts: Alert[];
  open: boolean;
  handleClose: (logs: Alert[]) => void;
}

const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  margin: "0 3px",
  backgroundColor: "#4682B4",
  color: "white",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  margin: "0 3px",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const styleContent = {
  maxHeight: 400,
  overflowY: "auto",
  width: "100%",
};

const AlertsPopup: React.FC<PopupModalProps> = ({
  bikeName,
  bikeId,
  currentMiles,
  alerts,
  open,
  handleClose,
}) => {
  const [alertSet, setAlertSet] = useState<Alert[]>(alerts);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string>("");
  const boxRef = useRef<HTMLDivElement>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [closeLabel, setCloseLabel] = useState<string>("Close");
  const [milesDisabled, setMilesDisabled] = useState(true);
  const [dateDisabled, setDateDisabled] = useState(false);
  const [openFromTodayModal, setOpenFromTodayModal] = useState(false);
  const [fromTodayMessage, setFromTodayMessage] = useState<string>("Create alert based on number of days from today:");
  const [fromTodayUnits, setFromTodayUnits] = useState<string>("days");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const today = dayjs();
  const tomorrow = today.add(1, "day");

  console.log("  Alerts Popup, bike id: " + bikeId);
  console.log("  Alerts Popup, bike name: " + bikeName);
  //console.log(" Alert set: " + JSON.stringify(alertSet));
  const [newRow, setNewRow] = useState<Alert>({
    id: uuidv4(),
    userID: "123e4567-e89b-12d3-a456-426614174000", // set with real user ID
    bikeID: bikeId,
    bikeName: bikeName,
    date: tomorrow.toDate(),
    miles: 0, // 0 miles means not set
    description: "",
    status: "created",
  });

  const setStatuses = (set: Alert[]) => {
    console.log("Clearing old, before: " + set.length);
    const statusStr = localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    let statusList: AlertStatus[] =
      statusStr.length > 2 ? JSON.parse(statusStr) : [];

    let newset: Alert[] = [];
    for (let al of set) {
      const status = statusList.find((cl) => cl.id === al.id);
      al.status = status?.status;
      newset.push(al);
    }
    console.log("Clearing old, after: " + newset.length);
    return newset;
  };

  useEffect(() => {
    // Clear out all alerts that have triggered and been cleared
    // What now needs to happen here is I create an alertSetShow that includes only
    // 'created' alerts  BCM
    console.log("Incoming alert count: " + alerts.length);
    setAlertSet(setStatuses(alerts));
  }, [alerts]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [alertSet]);

  useEffect(() => {
    if (open) {
      // Reset form
      setCloseLabel("Close");
      setEditRowId("");
      setMilesDisabled(true);
      setDateDisabled(false);
      console.log("Incoming alert count on open: " + alerts.length);
    }
  }, [open]);

  const handleConfirmOK = () => {
    // Delete an alert
    const idx = alertSet.findIndex((alert) => alert.id === currentId);
    console.log("  DELETE ALERT, found index at: " + idx);
    console.log("     alert id: " + currentId);
    if (idx > -1) {
      setAlertSet([...alertSet.slice(0, idx), ...alertSet.slice(idx + 1)]);
      setCloseLabel("Save");
    }
    const statusStr = localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
    let statusList: AlertStatus[] =
      statusStr.length > 2 ? JSON.parse(statusStr) : [];

    statusList = statusList.filter((item) => item.id !== currentId);
    localStorage.setItem(
      "BikeMaintTrackerAlertStatus",
      JSON.stringify(statusList)
    );

    setConfirmModalOpen(false);
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
  };

  const handleAddRow = () => {
    let rowWithId = {
      ...newRow,
      id: uuidv4(),
      bikeID: bikeId,
      bikeName: bikeName,
      date: tomorrow.toDate(),
      miles: undefined,     // 0 BCM
      repeatMiles: undefined,
      repeatDays: undefined,
      description: "",
    };
    setIsEditing(true);
    console.log("  Adding new alert, bike id: " + bikeId);
    setAlertSet([...alertSet, rowWithId]);
    var aa = [...alertSet, rowWithId];
    console.log("Add Row:" + JSON.stringify(aa));
    console.log("Row id: " + rowWithId.id);
    setEditRowId(rowWithId.id);
    setCloseLabel("Save");
  };

  const handleInputChange = (
    e: { target: { name: any; value: any } },
    id: string
  ) => {
    
    let { name, value } = e.target;
    console.log("New input change: " + name);
    console.log(value);
    switch (name) {
      case "miles":
      case "repeatMiles":
      case "repeatDays":
        value = parseInt(value);
        break;
    }
    setAlertSet((prevLogs) =>
      prevLogs.map((row) => (row.id === id ? { ...row, [name]: value } : row))
    );
    console.log(name);
    console.log(value);
    setCloseLabel("Save");
  };

  const dateSort = () => {
    console.log(" sorting");
    setSortAsc(!sortAsc);
    if (sortAsc)
      setAlertSet((prev) => {
        return prev.sort((a: Alert, b: Alert) => {
          return a.description === b.description
            ? 0
            : a.description < b.description
            ? -1
            : 1;
        });
      });
    else
      setAlertSet((prev) => {
        return prev.sort((a: Alert, b: Alert) => {
          return a.description === b.description
            ? 0
            : a.description < b.description
            ? 1
            : -1;
        });
      });
  };

  // const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setNewRow((prevNewRow) => ({ ...prevNewRow, [name]: value }));
  // };

  const handleCommit = (save: boolean) => {
    // User is done editing added row, either save it or scrap it.
    console.log("wants to save");
    console.log(JSON.stringify(alertSet));
    setIsEditing(false);
    if (!save) {
      // If not saving, throw it away.
      console.log("Throw away");
      setAlertSet(alertSet.slice(0, -1));
    } else {
      setCloseLabel("Save");
      const statusStr =
        localStorage.getItem("BikeMaintTrackerAlertStatus") ?? "";
      let statusList: AlertStatus[] =
        statusStr.length > 2 ? JSON.parse(statusStr) : [];

      statusList.push({ id: editRowId ? editRowId : "na", status: "created" });
      localStorage.setItem(
        "BikeMaintTrackerAlertStatus",
        JSON.stringify(statusList)
      );

      if (milesDisabled) {
        setAlertSet((prevLogs) =>
          prevLogs.map((row) =>
            row.id === editRowId
              ? { ...row, miles: undefined, repeatMiles: undefined }
              : row
          )
        );
      } else {
        setAlertSet((prevLogs) =>
          prevLogs.map((row) =>
            row.id === editRowId
              ? { ...row, date: undefined, repeatDate: undefined }
              : row
          )
        );
      }
    }
    setEditRowId("");
  };

  const handleDateChangeAlertDate = (newValue: Dayjs | null) => {
    if (newValue)
      setAlertSet((prev) =>
        prev.map((row) =>
          row.id === editRowId ? { ...row, date: newValue.toDate() } : row
        )
      );
    setCloseLabel("Save");
  };

  const handleRowDelete = (id: string) => {
    setCurrentId(id);
    setConfirmModalOpen(true);
  };

  const [dateSliderValue, setDateSliderValue] = useState(0);

  const SmallSlider = styled(Slider)({
    width: "50px", // Adjust the width of the slider
    height: "4px", // Adjust the height of the slider track
    "& .MuiSlider-thumb": {
      width: "12px", // Adjust the size of the slider thumb
      height: "12px",
    },
    "& .MuiSlider-markLabel": {
      fontSize: "12px", // Adjust the size of the mark labels
    },
  });

  const handleSliderChange = (event: any, newValue: number | number[]) => {
    const value = newValue as number;
    setDateSliderValue(value);
    if (value === 0) {
      setDateDisabled(false);
      setMilesDisabled(true);
      setFromTodayMessage("Create alert based on number of days from today:");
      setFromTodayUnits("days");
    } else {
      setDateDisabled(true);
      setMilesDisabled(false);
      setFromTodayMessage("Create alert based on number of miles from current:");
      setFromTodayUnits("miles");
    }
  };

  const handleFromToday = (dateSlider: number) => {
    setOpenFromTodayModal(true);
  };

  const handleFromTodayOK = (value: number) => {
    console.log("  From Today: " + value);
    if (!dateDisabled) {
    setAlertSet((prev) =>
        prev.map((row) =>
          row.id === editRowId ? { ...row, date: dayjs().add(value, "day").toDate(), miles: undefined } : row
        )
      );
    }
    else {
        setAlertSet((prev) =>
            prev.map((row) => 
              row.id === editRowId ? { ...row, miles: Number(value) + (currentMiles as number)} : row
            )
          );
    }
    setOpenFromTodayModal(false);
  };

  const handleFromTodayCancel = () => {
    setOpenFromTodayModal(false);
  };

  return (
    <>
      <FromTodayModal
        message={fromTodayMessage}
        units={fromTodayUnits}
        open={openFromTodayModal}
        handleClose={handleFromTodayCancel}
        handleOk={handleFromTodayOK}
      ></FromTodayModal>
      <Modal
        open={open}
        onClose={() => {
          handleClose(alerts);
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-title" variant="h6" component="h2">
            Alerts for {bikeName}
          </Typography>
          <Typography id="modal-instructions">
            Alerts can be set up to trigger on total miles OR on a certain date,
            and can be repeating.
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            {alertSet && alertSet.length > 0 ? (
              <Box sx={styleContent} ref={boxRef}>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCellHeader
                          align="right"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={dateSort}
                        >
                          Trigger Date
                        </StyledTableCellHeader>
                        <StyledTableCellHeader align="center">
                          Trigger Miles
                        </StyledTableCellHeader>
                        <StyledTableCellHeader align="center">
                          Repeat Days
                        </StyledTableCellHeader>
                        <StyledTableCellHeader align="center">
                          Repeat Miles
                        </StyledTableCellHeader>
                        <StyledTableCellHeader align="left">
                          Description
                        </StyledTableCellHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alertSet.map((row) => {
                        if (row.status === "created") {
                          return (
                            <StyledTableRow key={row.id}>
                              <StyledTableCell
                                component="th"
                                scope="row"
                                align="right"
                              >
                                {row.id === editRowId ? (
                                  <>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Button
                                        onClick={() =>
                                          handleFromToday(dateSliderValue)
                                        }
                                        sx={{ fontSize: 11, margin: 3, height: 40, width: 30, maxWidth: 30 }}
                                        size="small"
                                        variant="outlined"
                                      >
                                        From
                                        <br />
                                        Today
                                      </Button>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                                      <Typography variant="body2" sx={{ paddingBottom: 0, fontSize: 13 }}>Type:</Typography>
                                      <SmallSlider
                                        value={dateSliderValue}
                                        onChange={handleSliderChange}
                                        aria-labelledby="continuous-slider"
                                        step={1}
                                        marks={[
                                          { value: 0, label: "Date" },
                                          { value: 1, label: "Miles" },
                                        ]}
                                        min={0}
                                        max={1}
                                        sx={{padding: 1}}
                                      />
                                      </div>
                                    </div>
                                    <LocalizationProvider
                                      dateAdapter={AdapterDayjs}
                                    >
                                      <DesktopDatePicker
                                        label="Trigger Date"
                                        name="date"
                                        value={dayjs(row.date)}
                                        sx={{ maxWidth: "170px" }}
                                        disabled={dateDisabled}
                                        onChange={handleDateChangeAlertDate}
                                      />
                                    </LocalizationProvider>
                                  </>
                                ) : (
                                  row.date?.toLocaleDateString()
                                )}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {row.id === editRowId ? (
                                  <Tooltip title="Mile to trigger">
                                    <TextField
                                      label="Trigger Miles"
                                      name="miles"
                                      type="number"
                                      size="small"
                                      style={{ width: 80, marginTop: 80 }}
                                      disabled={milesDisabled}
                                      value={row.miles || ''}
                                      onChange={(e) =>
                                        handleInputChange(e, row.id)
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  row.miles?.toLocaleString("en-US")
                                )}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {row.id === editRowId ? (
                                  <Tooltip title="Repeat every X days">
                                    <TextField
                                      label="Next Days"
                                      name="repeatDays"
                                      type="number"
                                      size="small"
                                      style={{ width: 70, marginTop: 80 }}
                                      disabled={dateDisabled}
                                      value={row.repeatDays}
                                      onChange={(e) =>
                                        handleInputChange(e, row.id)
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  row.repeatDays
                                )}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {row.id === editRowId ? (
                                  <Tooltip title="Repeat every Y miles">
                                    <TextField
                                      label="Next Miles"
                                      name="repeatMiles"
                                      size="small"
                                      type="number"
                                      disabled={milesDisabled}
                                      style={{ width: 75, marginTop: 80 }}
                                      value={row.repeatMiles}
                                      onChange={(e) =>
                                        handleInputChange(e, row.id)
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  row.repeatMiles
                                )}
                              </StyledTableCell>
                              <StyledTableCell align="left">
                                {row.id === editRowId ? (
                                  <Box display="flex" alignItems="center">
                                    <TextField
                                      label="Description"
                                      name="description"
                                      size="small"
                                      style={{ width: 190, marginTop: 80, marginLeft: 0 }}
                                      value={row.description}
                                      onChange={(e) =>
                                        handleInputChange(e, row.id)
                                      }
                                    />
                                    <Button
                                      style={{
                                        minWidth: "30px",
                                        maxWidth: "30px",
                                        maxHeight: "30px",
                                        marginTop: "80px",
                                      }}
                                      onClick={() => {
                                        handleCommit(true);
                                      }}
                                    >
                                      OK
                                    </Button>
                                    <Tooltip title="Cancel">
                                      <Button
                                        style={{
                                          minWidth: "30px",
                                          maxWidth: "30px",
                                          maxHeight: "30px",
                                          marginTop: "80px",
                                        }}
                                        onClick={() => {
                                          handleCommit(false);
                                        }}
                                      >
                                        X
                                      </Button>
                                    </Tooltip>
                                  </Box>
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    {row.description}
                                    <Tooltip title="Delete Row">
                                      <Button
                                        style={{
                                          minWidth: "30px",
                                          maxHeight: "30px",
                                        }}
                                        onClick={() => {
                                          handleRowDelete(row.id);
                                        }}
                                      >
                                        X
                                      </Button>
                                    </Tooltip>
                                  </div>
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        }
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <span>You have no alerts on this bike.</span>
            )}
          </Typography>
          <Button disabled={isEditing} onClick={handleAddRow} sx={{ mt: 2 }}>
            Add Alert
          </Button>
          <Button
            disabled={isEditing}
            onClick={() => {
              handleClose(alertSet);
            }}
            sx={{ mt: 2 }}
          >
            {closeLabel}
          </Button>
        </Box>
      </Modal>
      <ConfirmModal
        open={confirmModalOpen}
        message="Delete this row?"
        handleOk={handleConfirmOK}
        handleClose={handleConfirmCancel}
      ></ConfirmModal>
    </>
  );
};

export default AlertsPopup;

/*  Research:

https://firebase.google.com/products/data-connect?_gl=1*wf36uy*_up*MQ..&gclid=CjwKCAiA-ty8BhA_EiwAkyoa348tpp1aSYU28bFd-N-zJwFx0uE92L6Veaug4f4MBuAJ2zyK0y5ZmRoCNl0QAvD_BwE&gclsrc=aw.ds
Copilot:  what is a simple way to deploy a react app to connect to Cloud Firestore?


*/

/*
You have to start from the mindset of believing in the good and believing in the potential
of what you can do.  You have to start with believing in a bright future.
Otherwise, your strength and energy gets muted right there.

Mindset is huge!  It is hugely important in success and productivity.

*/
