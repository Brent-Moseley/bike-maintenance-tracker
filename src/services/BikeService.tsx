// UserService.ts
//import axios from 'axios';

const API_URL = "https://api.example.com/users";
export interface Bike {
  userID: string;
  id: string;
  name: string;
  brand: string;
  model: string;
  spec: string;
  notes: string;
  monthYearPurchased: string;
  dateLastServiced: Date;
  milesLastServiced: number;
  totalMiles: number;
  trackBy: string;
}

interface BikeAll {
  bike: Bike;
  maintLog: MaintLog[];
  alerts: Alerts[];
}

export interface MaintLog {
  id: string;
  userID: string;
  bikeID: string;
  date: Date;
  description: string;
}

export interface Alerts {
  id: string;
  userID: string;
  bikeID: string;
  date: Date;
  description: string;
  repeatEvery: string;
}

const bikeData: BikeAll[] = [
  {
    bike: {
      userID: "123e4567-e89b-12d3-a456-426614174000",
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "Mountain Explorer",
      brand: "Trek",
      model: "X-Caliber 8",
      spec: "29er, 12-speed, Hydraulic Disc Brakes",
      notes: "Great for trail riding and cross-country",
      monthYearPurchased: "June 2021",
      dateLastServiced: new Date("2023-10-15"),
      milesLastServiced: 1500,
      totalMiles: 1800,
      trackBy: "miles",
    },
    maintLog: [
      {
        id: "m01",
        userID: "123e4567-e89b-12d3-a456-426614174000", 
        bikeID: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        date: new Date("2024-10-15"),
        description: "installed new chain",
      },
      {
        id: "m02",
        userID: "123e4567-e89b-12d3-a456-426614174000", 
        bikeID: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        date: new Date("2024-11-18"),
        description: "Serviced fork, lubricated dropper",
      },
    ],
    alerts: [
      {
        id: "a01",
        userID: "123e4567-e89b-12d3-a456-426614174000",
        bikeID: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        date: new Date("2025-01-25"),
        description: "Check rear der for wear",
        repeatEvery: "3 months",
      },
      {
        id: "a02",
        userID: "123e4567-e89b-12d3-a456-426614174000",
        bikeID: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        date: new Date("2025-03-04"),
        description: "Replace rear tire if worn",
        repeatEvery: "3 months",
      },
    ],
  },
  {
    bike: {
      userID: "123e4567-e89b-12d3-a456-426614174000",
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
      name: "Road King",
      brand: "Giant",
      model: "Defy Advanced 2",
      spec: "Carbon Frame, 11-speed, Hydraulic Disc Brakes",
      notes: "Excellent road performance and endurance",
      monthYearPurchased: "March 2020",
      dateLastServiced: new Date("2023-09-10"),
      milesLastServiced: 3000,
      totalMiles: 3400,
      trackBy: "miles",
    },
    maintLog: [
      {
        id: "m03",
        userID: "123e4567-e89b-12d3-a456-426614174000", 
        bikeID: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        date: new Date("2024-10-15"),
        description: "installed new chain with carbon pins",
      },
      {
        id: "m04",
        userID: "123e4567-e89b-12d3-a456-426614174000", 
        bikeID: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        date: new Date("2024-11-18"),
        description: "Replaced front and rear tires, Continental air Jordans, 4 grams each.",
      },
    ],
    alerts: [],
  },
  {
    bike: {
      userID: "123e4567-e89b-12d3-a456-426614174000",
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
      name: "Urban Cruiser",
      brand: "Specialized",
      model: "Sirrus X 4.0",
      spec: "Hybrid, 10-speed, Mechanical Disc Brakes",
      notes: "Perfect for city commuting and light trails",
      monthYearPurchased: "August 2019",
      dateLastServiced: new Date("2023-11-05"),
      milesLastServiced: 500,
      totalMiles: 750,
      trackBy: "miles",
    },
    maintLog: [],
    alerts: [],
  },
];

export const BikeService = {
  getBikes: async function (user: string): Promise<Bike[]> {
    console.log("start:");
    const returnData: Bike[] = (bikeData.filter((bike) => {return bike.bike.userID == user}) ?? []).map(bike => bike.bike);
    return returnData;
  },
  getMaintLog: async function (user: string, bikeId: string): Promise<MaintLog[]> {
    const returnData: MaintLog[] = (bikeData.filter((bike) => {return bike.bike.userID == user && bike.bike.id == bikeId}) ?? [])[0].maintLog;
    return returnData;
  },
  getAlerts:  async function (user: string, bikeId: string): Promise<Alerts[]> {
    const returnData: Alerts[] = (bikeData.filter((bike) => {return bike.bike.userID == user && bike.bike.id == bikeId}) ?? [])[0].alerts;
    return returnData;
  },
  //   getUserById: async (id: string) => {
  //     const response = await axios.get(`${API_URL}/${id}`);
  //     return response.data;
  //   },
  //   getAllUsers: async () => {
  //     const response = await axios.get(API_URL);
  //     return response.data;
  //   }
};
