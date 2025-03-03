// UserService.ts
import axios from 'axios';

/*

Purpose:  Handle all output with data storage outside of the React app.

*/

const API_URL = "https://api.example.com/users";
export interface Bike {
  userID: string;
  id: string;
  name: string;
  brand: string;
  model: string;
  spec: string;
  notes: string;
  monthYearPurchased: Date;
  dateLastServiced: Date;
  milesLastServiced: number;
  totalMiles: number;
  trackBy: string;
}

interface BikeAll {
  bike: Bike;
  maintLog: MaintLog[];
  alerts: Alert[];
}

export interface MaintLog {
  id: string;
  userID: string;
  bikeID: string;
  date: Date;
  miles?: number;
  description?: string;
}

export interface Alert {
  id: string;
  userID: string;
  bikeID: string;
  bikeName: string;
  date?: Date;
  description: string;
  miles?: number;
  repeatMiles?: number;
  repeatDays?: number;
  status?: string;
}

// Manual reset:
// localStorage.setItem("BikeMaintTrackerAlertStatus", '[{"id": "a01", "status": "created"},{"id": "a02", "status": "created"}]');
// localStorage.setItem("BikeMaintTracker", "");
// localStorage.setItem("BikeMaintTrackerAlertStatus","");
// Get data:
// localStorage.getItem("BikeMaintTracker");
let bikeData: BikeAll[] = [
  {
    bike: {
      userID: "123e4567-e89b-12d3-a456-426614174000",
      id: "a13", // Placeholder data
      name: "",
      brand: "",
      model: "",
      spec: "",
      notes: "",
      monthYearPurchased: new Date(),
      dateLastServiced: new Date(),
      milesLastServiced: 0,
      totalMiles: 0,
      trackBy: "miles",
    },
    maintLog: [],
    alerts: [],
  },
];

function dateReviver(key: string, value: any) {
  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  if (typeof value === "string" && datePattern.test(value)) {
    return new Date(value);
  }
  switch (key) {
    case "milesLastServiced":
    case "totalMiles":
    case "miles":
    case "repeatMiles":
    case "repeatDays":
      return parseInt(value);
  }

  return value;
}

export const BikeService = {
  getBikes: async function (user: string): Promise<Bike[]> {
    // const returnData: Bike[] = (
    //   bikeData.filter((bike) => {
    //     return bike.bike.userID === user;
    //   }) ?? []
    // ).map((bike) => bike.bike);
    if (user === "") return [];
    try {
      const response = await axios.get<Bike[]>('https://localhost:7055/Bike/' + user);
      for (let bike of response.data) {
        bike.dateLastServiced = new Date(bike.dateLastServiced);
        bike.monthYearPurchased = new Date(bike.monthYearPurchased);
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }
    //return returnData;
  },

  getMaintLog: async function (
    user: string,
    bikeId: string
  ): Promise<MaintLog[]> {
    // const bike = bikeData.filter((bike) => {
    //   return bike.bike.userID === user && bike.bike.id === bikeId;
    // });
    // if (bike && bike.length > 0) return bike[0].maintLog;
    // else return [];
    //https://localhost:7055/Bike/GetMaintLog?user=user1&bike=bike1
    if (user === "" || bikeId === "") return [];
    try {
      const response = await axios.get<MaintLog[]>('https://localhost:7055/Bike/GetMaintLog?user=' + user + '&bike=' + bikeId);
      for (let log of response.data) {
        log.date = new Date(log.date);
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }


  },
  setMaintLog: async function (
    added: MaintLog[],
    deleted: string[],
  ): Promise<boolean> {
    // let bike = bikeData.filter((bike) => {
    //   return bike.bike.userID === user && bike.bike.id === bikeId;
    // });
    // if (bike.length === 0) return false;
    // bike[0].maintLog = updated;
    // this.saveAll(bikeData);
    await axios.post('https://localhost:7055/Bike/AddMaintLog', added)
    .then(response => {
      console.log('Response:', response.data); // Handle successful response
    })
    .catch(error => {
      console.error('Error:', error); // Handle any errors
      throw error;
    });
    await axios.delete('https://localhost:7055/Bike/DeleteMaintLog/' + JSON.stringify(deleted))
    .then(response => {
      console.log('Response:', response.data); // Handle successful response
    })
    .catch(error => {
      console.error('Error:', error); // Handle any errors
      throw error;
    });

    return true;
  },
  getAlerts: async function (user: string, bikeId: string): Promise<Alert[]> {
    if (bikeId.length > 0) {
      const bike = bikeData.filter((bike) => {
        return bike.bike.userID === user && bike.bike.id === bikeId;
      });
      if (bike && bike.length > 0) return bike[0].alerts;
      else return [];
    } else {
      const bike = bikeData.filter((bike) => {
        return bike.bike.userID == user;
      });
      if (bike.length === 0) return [];
      var allAlerts: Alert[] = [];
      // Combine alerts from all bikes.
      for (var value of bike) {
        allAlerts = allAlerts.concat(value.alerts);
      }
      return allAlerts;
    }
  },
  addAlert: async function (alert: Alert): Promise<boolean> {
    let set = await this.getAlerts(alert.userID, alert.bikeID);
    set.push(alert);
    const success = await this.setAlerts(alert.userID, alert.bikeID, set);
    return success;
  },
  setAlerts: async function (
    user: string,
    bikeId: string,
    updated: Alert[]
  ): Promise<boolean> {
    let bike = bikeData.filter((bike) => {
      return bike.bike.userID === user && bike.bike.id === bikeId;
    });
    if (bike.length === 0) return false;
    bike[0].alerts = updated;
    this.saveAll(bikeData);
    return true;
  },
  saveAll: async function (data: BikeAll[]) {
    //localStorage.setItem("BikeMaintTracker", JSON.stringify(data));
  },
  // loadAll: async function (): Promise<BikeAll[]> {
  //   const data = localStorage.getItem("BikeMaintTracker");
  //   if (!data || data.length < 4) return [];
  //   else return JSON.parse(data, dateReviver);
  // },
  saveBike: async function (data: Bike, newBike: boolean, idx: number) {
    // need better way to determine new bike vs editing last bike
    if (newBike) {
      // New bike
      debugger;
      const newData: BikeAll = {
        bike: data,
        alerts: [],
        maintLog: [],
      };
      bikeData.push(newData);
      await axios.post('https://localhost:7055/Bike', data)
        .then(response => {
          console.log('Response:', response.data); // Handle successful response
        })
        .catch(error => {
          console.error('Error:', error); // Handle any errors
          throw error;
        });
    } else {
      debugger;
      //bikeData[idx].bike = data;
      await axios.put('https://localhost:7055/Bike', data)
        .then(response => {
          console.log('Response:', response.data); // Handle successful response
        })
        .catch(error => {
          console.error('Error:', error); // Handle any errors
          throw error;
        });

    }
    //this.saveAll(bikeData);
  },
};

// const attemptLoad = async () => {
//   let savedData: BikeAll[] = await BikeService.loadAll();
//   if (savedData && savedData.length > 0) bikeData = savedData;
// };

// attemptLoad();

// I can get this, I can do this, I can handle this!  I can rock this project and rock
// this career!  I have reached 12 years in this return career, and ballpark of
// 1.6 million dollars in salary.  Code is gold!  It is worth it!
// If I had stayed in music and small business website design, I would have made only
// 264k!!  I have made 6x more being a developer! 