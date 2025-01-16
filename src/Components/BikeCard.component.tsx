import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Bike } from '../services/BikeService';
import BikeDropdown from './BikeDropdown.component';

interface BikeProps {
  bike: Bike;
}

const BikeCard: React.FC<BikeProps> = ({ bike }) => {
  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {bike.name}
        </Typography>
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
              <strong>Purchased:</strong> {bike.monthYearPurchased}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Last Serviced:</strong> {bike.dateLastServiced.toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              <strong>Miles Last Serviced:</strong> {bike.milesLastServiced}
            </Typography>
            <Typography variant="body2">
              <strong>Total Miles:</strong> {bike.totalMiles}
            </Typography>
            <Typography variant="body2">
              <strong>Track By:</strong> {bike.trackBy}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BikeCard;
