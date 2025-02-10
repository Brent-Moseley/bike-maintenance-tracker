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
import { Description, WidthFull } from "@mui/icons-material";

interface PopupModalProps {
  bikeName: string;
  bikeId: string;
  currentMiles: number;
  log: MaintLog[];
  open: boolean;
  handleClose: (logs: MaintLog[]) => void;
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

const headerStyle = {
  backgroundColor: "#f5f5f5",
  fontWeight: "bold",
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

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

const MaintLogPopup: React.FC<PopupModalProps> = ({
  bikeName,
  bikeId,
  currentMiles,
  log,
  open,
  handleClose,
}) => {
  const [logs, setLogs] = useState<MaintLog[]>(log);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string>("");
  const boxRef = useRef<HTMLDivElement>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [closeLabel, setCloseLabel] = useState<string>("Close");
  const [newRow, setNewRow] = useState<MaintLog>({
    id: uuidv4(),
    userID: "123e4567-e89b-12d3-a456-426614174000", // set with real user ID
    bikeID: bikeId,
    date: new Date(),
    miles: currentMiles,
    description: "",
  });

  useEffect(() => {
    setLogs(log);
  }, [log]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    //console.log("Just opened Maint log " + open)
    if (open) {
      // Reset form
      setCloseLabel("Close");
      setEditRowId("");
    }
  }, [open]);

  const handleConfirmOK = () => {
    // Delete a log entry
    const idx = logs.findIndex((log) => log.id === currentId);
    if (idx > -1) {
      setLogs([...logs.slice(0, idx), ...logs.slice(idx + 1)]);
      setCloseLabel("Save");
    }
    setConfirmModalOpen(false);
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
  };

  const handleAddRow = () => {
    const rowWithId = {
      ...newRow,
      id: uuidv4(),
      bikeID: bikeId,
      date: new Date(),
      miles: currentMiles,
      description: "",
    };
    console.log("  Adding new maint log, bike id: " + bikeId);
    setLogs([...logs, rowWithId]);
    setEditRowId(rowWithId.id);
    setCloseLabel("Save");
  };

  const handleInputChange = (
    e: { target: { name: any; value: any } },
    id: string
  ) => {
    const { name, value } = e.target;
    setLogs((prevLogs) =>
      prevLogs.map((row) => (row.id === id ? { ...row, [name]: value } : row))
    );
    setCloseLabel("Save");
  };

  const dateSort = () => {
    console.log(" sorting");
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

  // const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setNewRow((prevNewRow) => ({ ...prevNewRow, [name]: value }));
  // };

  const handleCommit = (save: boolean) => {
    console.log("wants to save");
    console.log(logs);
    if (!save) {
      setLogs(logs.slice(0, -1));
      setCloseLabel("Save");
    }
    setEditRowId("");
  };

  const handleDateChangeMYPurchased = (newValue: Dayjs | null) => {
    debugger;
    if (newValue)
      setLogs((prevLogs) =>
        prevLogs.map((row) =>
          row.id === editRowId ? { ...row, date: newValue.toDate() } : row
        )
      );
    setCloseLabel("Save");
  };

  const handleRowDelete = (id: string) => {
    setCurrentId(id);
    setConfirmModalOpen(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          handleClose(logs);
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
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
                                  label="Date Purchased"
                                  name="monthYearPurchased"
                                  value={dayjs(row.date)}
                                  sx={{ maxWidth: "180px;" }}
                                  onChange={handleDateChangeMYPurchased}
                                />
                              </LocalizationProvider>
                            ) : (
                              row.date?.toLocaleDateString()
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {row.id === editRowId ? (
                              <TextField
                                label="Miles"
                                name="miles"
                                size="small"
                                style={{ width: 100 }}
                                value={row.miles}
                                onChange={(e) => handleInputChange(e, row.id)}
                              />
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <span>There are no log entries yet</span>
            )}
          </Typography>
          <Button onClick={handleAddRow} sx={{ mt: 2 }}>
            Add Row
          </Button>
          <Button
            onClick={() => {
              handleClose(logs);
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

export default MaintLogPopup;
