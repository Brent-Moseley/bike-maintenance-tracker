import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  ButtonGroup,
  Button,
  Box,
} from "@mui/material";
import { Bike } from "../services/BikeService";

/*

Purpose:  Show bike data in a nice format.

*/

interface BikeProps {
  bike: Bike;
  handleOpenAddMiles: () => void;
  handleOpenAddBike: () => void;
  handleOpenEditBike: (add: boolean) => void;
  cycleLeft: () => void;
  cycleRight: () => void;
}

const BikeCard: React.FC<BikeProps> = ({ bike, handleOpenAddMiles, handleOpenAddBike, handleOpenEditBike, cycleLeft, cycleRight }) => {
  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5" component="div">
          {bike.name}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <ButtonGroup sx={{ width: "100%", justifyContent: "space-around" }}>
              <Button variant="contained" size="small" sx={{margin: '3px'}} onClick={() => handleOpenEditBike(false)}>
                Edit Bike
              </Button>
              <Button variant="contained" size="small" sx={{margin: '3px'}} onClick={handleOpenAddBike}>
                Add Bike
              </Button>
              <Button variant="contained" size="small" sx={{margin: '3px'}} onClick={handleOpenAddMiles}>
                Add Ride
              </Button>
              <Button variant="contained" size="small" sx={{margin: '3px'}} onClick={cycleLeft}>
              &lt;
              </Button>
              <Button variant="contained" size="small" sx={{margin: '3px'}} onClick={cycleRight}>
              &gt;
              </Button>
            </ButtonGroup>
            </Box>
        </Box>
        <Typography color="text.secondary">
          {bike.brand} {bike.model}
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Specifications:</strong> {bike.spec}
            </Typography>
            <Typography variant="body2">
              <strong>Notes:</strong> {bike.notes}
            </Typography>
            <Typography variant="body2">
              <strong>Purchased:</strong> {bike.monthYearPurchased.toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Last Serviced:</strong>
              {bike.dateLastServiced.toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              <strong>Miles Last Serviced:</strong> {bike.milesLastServiced}
            </Typography>
            <Typography variant="body2">
              <strong>Current Miles:</strong> {bike.totalMiles}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BikeCard;
