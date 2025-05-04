import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import { MaintLog } from "../services/BikeService";
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
import EditFieldStringModal from "./EditFieldString.component";

/*

Purpose:  Display a popup that shows a maintenance log in table form, and allows deleting of
existing entries and the adding of new entries.

*/

interface PopupModalProps {
  bikeName: string;
  bikeId: string;
  userId: string;
  currentMiles: number;
  log: MaintLog[];
  open: boolean;
  handleClose: (logs: MaintLog[], deleted: string[]) => void;
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


// TODO:  Convert this to the newer 'styled' form
const styleBox = {
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

const MaintLogPopup: React.FC<PopupModalProps> = ({
  bikeName,
  bikeId,
  userId,
  currentMiles,
  log,
  open,
  handleClose,
}) => {
  const [logs, setLogs] = useState<MaintLog[]>(log);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [editStringModalOpen, setEditStringModalOpen] =
    useState<boolean>(false);
  const [editStringData, setEditStringData] = useState<any>("");
  const [editFieldRowId, setEditFieldRowId] = useState<string>("");
  const [editFieldName, setEditFieldName] = useState<string>("");
  const [currentId, setCurrentId] = useState<string>("");
  const boxRef = useRef<HTMLDivElement>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [closeLabel, setCloseLabel] = useState<string>("Close");
  const [confirmCancelModalOpen, setConfirmCancelModalOpen] = useState<boolean>(false);
  const [updates, setUpdates] = useState<number>(0);
  const [cancelLabel, setCancelLabel] = useState<string>("Cancel All");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const newRow: MaintLog = {
    id: uuidv4(),
    userID: userId,
    bikeID: bikeId,
    date: new Date(),
    miles: currentMiles,
    description: "",
  };
  const [newLogs, setNewLogs] = useState<MaintLog[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [edited, setEdited] = useState<string[]>([]);  // List of existing alerts that have

  useEffect(() => {
    setLogs(log);
  }, [log]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    debugger;
    if (open) {
      // Reset form
      setCloseLabel("Close");
      setEditRowId("");
      setNewLogs([]);
      setDeleted([]);
      setEdited([]);
      setUpdates(0);
      setCancelLabel("Cancel All");
    }
  }, [open]);

  const handleConfirmOK = () => {
    if (confirmCancelModalOpen) {
      setConfirmModalOpen(false);
      setConfirmCancelModalOpen(false);
      handleClose([], []);
      return;
    }
    // Delete a log entry
    const idx = logs.findIndex((log) => log.id === currentId);
    if (idx > -1) {
      setDeleted([...deleted, currentId]);
      setLogs([...logs.slice(0, idx), ...logs.slice(idx + 1)]);
      const newCount = updates + 1;
      setUpdates(prev => prev + 1);
      setCloseLabel(`Save ${newCount} Changes`);      //setNewAlerts ([...newAlerts, alertSet[alertSet.length-1]]);
    }
    setConfirmModalOpen(false);
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
    setConfirmCancelModalOpen(false);
  };

  const confirmCancelButton = () => {
    setConfirmCancelModalOpen(true);
  }

  const handleAddRow = () => {
    const rowWithId = {
      ...newRow,
      id: uuidv4(),
      bikeID: bikeId,
      date: new Date(),
      miles: currentMiles,
      description: "",
    };
    setIsEditing(true);
    setLogs([...logs, rowWithId]);
    setEditRowId(rowWithId.id);
    //setCloseLabel("Save Changes");
  };

  const handleInputChange = (
    e: { target: { name: any; value: any } },
    id: string
  ) => {
    const { name, value } = e.target;
    setLogs((prevLogs) =>
      prevLogs.map((row) => (row.id === id ? { ...row, [name]: value } : row))
    );
    //setCloseLabel("Save Changes");
  };

  const dateSort = () => {
    setSortAsc(!sortAsc);
    if (sortAsc)
      setLogs((prev) => {
        return prev.sort((a: MaintLog, b: MaintLog) => {
          return a.date === b.date ? 0 : a.date < b.date ? -1 : 1;
        });
      });
    else
      setLogs((prev) => {
        return prev.sort((a: MaintLog, b: MaintLog) => {
          return a.date === b.date ? 0 : a.date < b.date ? 1 : -1;
        });
      });
  };

  const handleCommit = (save: boolean) => {
    setIsEditing(false);
    debugger;
    if (!save) {
      // We are not saving the new row, delete it.
      setLogs(logs.slice(0, -1));
      //setCloseLabel("Save Changes");
    }
    else {
      // Save the new row, rounding the miles value if provided.
      if (logs[logs.length - 1].miles != undefined) {
        const mi = logs[logs.length - 1].miles as number;  // help typescript understand that this number is defined
        logs[logs.length - 1].miles = Math.round(mi);
      }
      setNewLogs([...newLogs, logs[logs.length - 1]]);
      const newCount = updates + 1;
      setUpdates(prev => prev + 1);
      setCloseLabel(`Save ${newCount} Changes`);      //setNewAlerts ([...newAlerts, alertSet[alertSet.length-1]]);
      
      let addedRow = logs.find((row) => row.id === editRowId);
      if (addedRow) setEdited([...edited, addedRow.id]);  // This should ALWAYS be found, but TS does not know that.
    }
    setEditRowId("");
  };

  const handleDateChangeMYService = (newValue: Dayjs | null) => {
    if (newValue)
      setLogs((prevLogs) =>
        prevLogs.map((row) =>
          row.id === editRowId ? { ...row, date: newValue.toDate() } : row
        )
      );
    // setCloseLabel("Save Changes");
  };

  const handleRowDelete = (id: string) => {
    setCurrentId(id);
    setConfirmModalOpen(true);
  };

  const handleDoubleClickStringField = (row: MaintLog, name: string) => {
    const access: keyof MaintLog = name as keyof MaintLog; // typesafe way to do dynamic indexing
    setEditStringData(row[access]);
    setEditFieldRowId(row.id); // which row is the field in?
    setEditFieldName(name);
    setEditStringModalOpen(true);
  };

  const handleStringEditModeOK = (text: string, id: string, field: string) => {
    debugger;
    setLogs((prevLogs) =>
      prevLogs.map((row) => (row.id === id ? { ...row, [field]: text } : row))
    );
    const newCount = updates + 1;
    setUpdates((prev) => prev + 1);
    setCloseLabel(`Save ${newCount} Changes`);

    if (!edited.includes(id)) setEdited([...edited, id]);  // Add this, unless we have already noted that this row has edits.
    setEditStringModalOpen(false);
  };

  const handleEditModeClose = () => {
    setEditStringModalOpen(false);
  };

    const finalPreSave = () => {
      // Perform final edit processing to prepare for save operation.
      debugger;
      let finalDeleted: string[] = [...deleted];
      let finalNewAlerts: MaintLog[] = [];
      // For every record in the edited list, add to deleted.  We are going to add it as if new.
      edited.forEach((item) => {
        // Add to deleted list
        //setDeleted((prevDeleted) => [...prevDeleted, item]);
        finalDeleted.push(item);
        // Find it in alertSet
        let copyOver = logs.find((al) => al.id === item);
        // ... and copy to new alerts.
        if (copyOver) finalNewAlerts.push(copyOver);
        //if (copyOver) setNewAlerts((prevNewAlerts) => [...prevNewAlerts, copyOver]);  // Should always be found, but have to satisfy TS which does not know
        // This is how we handle the use case if user adds a new alert, and then edits it.
        // All records are handled as if they are edited... delete and then add again.
      });
      //debugger;
      console.log("End of edits:");
      console.log(finalNewAlerts);
      console.log(finalDeleted);
      handleClose(finalNewAlerts, finalDeleted);
    }
  
  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          handleClose(newLogs, deleted);
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={styleBox}>
          <Typography id="modal-title" variant="h6" component="h2">
            Maintenance Log for {bikeName}
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            {logs && logs.length > 0 ? (
              <Box sx={styleContent} ref={boxRef}>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCellHeader
                          style={{ cursor: "pointer" }}
                          onClick={dateSort}
                          align="center"
                        >
                          Date
                        </StyledTableCellHeader>
                        <StyledTableCellHeader align="center">
                          Miles
                        </StyledTableCellHeader>
                        <StyledTableCellHeader align="left">
                          Description
                        </StyledTableCellHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((row) => (
                        <StyledTableRow key={row.id}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {row.id === editRowId ? (
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DesktopDatePicker
                                  label="Date of Service"
                                  name="monthYearService"
                                  value={dayjs(row.date)}
                                  sx={{ maxWidth: "180px;" }}
                                  onChange={handleDateChangeMYService}
                                />
                              </LocalizationProvider>
                            ) : (
                              row.date?.toLocaleDateString()
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {row.id === editRowId ? (
                              <Tooltip title="Miles when serviced">
                                <TextField
                                  label="Miles When Serviced"
                                  name="miles"
                                  size="small"
                                  style={{ width: 100 }}
                                  value={row.miles}
                                  onChange={(e) => handleInputChange(e, row.id)}
                                />
                              </Tooltip>
                            ) : (
                              row.miles
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {row.id === editRowId ? (
                              <>
                                <TextField
                                  label="Description"
                                  name="description"
                                  size="small"
                                  style={{ width: 350 }}
                                  value={row.description}
                                  onChange={(e) => handleInputChange(e, row.id)}
                                />
                                <Button
                                  style={{
                                    minWidth: "40px",
                                    maxHeight: "30px",
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
                                      maxHeight: "30px",
                                    }}
                                    onClick={() => {
                                      handleCommit(false);
                                    }}
                                  >
                                    X
                                  </Button>
                                </Tooltip>
                              </>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  onDoubleClick={() => {
                                    handleDoubleClickStringField(
                                      row,
                                      "description"
                                    );
                                  }}
                                >
                                  {row.description}
                                </span>
                                <Tooltip title="Delete Item">
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <span>There are no log entries yet</span>
            )}
          </Typography>
          <Button disabled={isEditing} onClick={handleAddRow} sx={{ mt: 2 }}>
            Add New Item
          </Button>
          <Button
            disabled={isEditing}
            onClick={() => {
              finalPreSave();
            }}
            sx={{ mt: 2 }}
          >
            {closeLabel}
          </Button>
          {updates > 0 && <Button
            onClick={() => {
              confirmCancelButton();
            }}
            sx={{ mt: 2 }}
          >
            {cancelLabel}
          </Button>}
        </Box>
      </Modal>
      <ConfirmModal
        open={confirmModalOpen}
        message="Delete this row?"
        handleOk={handleConfirmOK}
        handleClose={handleConfirmCancel}
      ></ConfirmModal>
      <ConfirmModal
        open={confirmCancelModalOpen}
        message="Cancel all changes and exit to main page?"
        handleOk={handleConfirmOK}
        cancelText="Go Back"
        handleClose={handleConfirmCancel}
      ></ConfirmModal>
      <EditFieldStringModal
        open={editStringModalOpen}
        data={editStringData}
        rowId={editFieldRowId}
        fieldName={editFieldName}
        handleClose={handleEditModeClose}
        handleOk={handleStringEditModeOK}
      ></EditFieldStringModal>
    </>
  );
};

export default MaintLogPopup;
