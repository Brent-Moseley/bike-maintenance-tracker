// UserService.ts
import axios from 'axios';/*

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

// Each alert status is approx 50 chars long, so if a user has 500 alerts (a huge amount),
// that is only 25k in size.  Whole alert set can be stored in one JSON string, and saved as 
// one record in the DB.  The Bike Service can hold this table for the UI to read, and only
// save to DB backend when a status is added, deleted, or modified.  Old alerts that drop off the
// system, when the user OKs them, can be deleted from the in memory table.  This makes the app more
// responsive, and works even if the internet connection is spotty.
interface AlertStatus {
  id: string;
  status: string;
}

/*
[
{ 
  "id": "alert1",
  "status": "created",
},
{ 
  "id": "alert10",
  "status": "created",
},  
{ 
  "id": "alert11",
  "status": "created",
},
{ 
  "id": "alert12",
  "status": "triggered",
},
{ 
  "id": "alert13",
  "status": "acknowledged",
},
]


[{"id":"alert1","status":"created"},{"id":"alert10","status":"created"},{"id":"alert11","status":"created"},{"id":"alert12","status":"triggered"},{"id":"alert13","status":"acknowledged"}]


INSERT INTO "AlertStatus" (id, "userId", "statusString")
VALUES ('123456', 'user1', '[{"id":"alert1","status":"created"},{"id":"alert10","status":"created"},{"id":"alert11","status":"created"},{"id":"alert12","status":"triggered"},{"id":"alert13","status":"acknowledged"}]');


*/

interface AlertStatusDB {
  id: string;
  userId: string;
  statusString: string;
}

let alertStatusTable: AlertStatus[] = [];

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
    // if (bikeId.length > 0) {
    //   const bike = bikeData.filter((bike) => {
    //     return bike.bike.userID === user && bike.bike.id === bikeId;
    //   });
    //   if (bike && bike.length > 0) return bike[0].alerts;
    //   else return [];
    // } else {
    //   const bike = bikeData.filter((bike) => {
    //     return bike.bike.userID == user;
    //   });
    //   if (bike.length === 0) return [];
    //   var allAlerts: Alert[] = [];
    //   // Combine alerts from all bikes.
    //   for (var value of bike) {
    //     allAlerts = allAlerts.concat(value.alerts);
    //   }
    //   return allAlerts;
    // }
    if (user === "") return [];
    try {
      const response = await axios.get<Alert[]>('https://localhost:7055/Bike/GetAlerts?user=' + user + '&bike=' + bikeId);
      for (let alert of response.data) {
        if (alert.date) alert.date = new Date(alert.date);
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }

  },
  addAlert: async function (alert: Alert): Promise<boolean> {
    // let set = await this.getAlerts(alert.userID, alert.bikeID);
    // set.push(alert);
    // const success = await this.setAlerts(alert.userID, alert.bikeID, set);
    await axios.post('https://localhost:7055/Bike/AddAlerts', [alert])
      .then(response => {
        console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
        throw error;
      });

    return true;
  },
  setAlerts: async function (
    added: Alert[],
    deleted: string[],
  ): Promise<boolean> {
    await axios.post('https://localhost:7055/Bike/AddAlerts', added)
      .then(response => {
        console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
        throw error;
      });
    await axios.delete('https://localhost:7055/Bike/DeleteAlerts/' + JSON.stringify(deleted))
      .then(response => {
        console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
        throw error;
      });

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
  populateAlertStatuses: async function (user: string) {
    console.log ("   &&&&& populate alert status");
    if (user === "") return;
    try {
      const response = await axios.get<AlertStatus[]>('https://localhost:7055/Bike/GetAlertStatus/' + user);
      debugger;

      if (response.data.length > 0) alertStatusTable = response.data;
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }
  },
  saveAlertTable: function (userId: string) {
    axios.post('https://localhost:7055/Bike/SetAlertStatus', { user: userId, update: JSON.stringify(alertStatusTable) })
      .then(response => {
        console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
        throw error;
      });

  },
  getAlertStatus: function (id: string): string | undefined {
    var result = alertStatusTable.find(al => al.id === id);
    if (result) return result.status
    else return undefined;
  },
  setAlertStatus: function (user: string, id: string, status: string) {
    var result = alertStatusTable.find(al => al.id === id);
    if (result) result.status = status;
    this.saveAlertTable(user);
  },
  addAlertStatus: function (user: string, id: string, status: string) {
    alertStatusTable.push({id: id, status: status});
    this.saveAlertTable(user);
  },
  removeAlertStatus: function (user: string, id: string) {
    var idx = alertStatusTable.findIndex(al => al.id === id);
    if (idx > -1) {
      const newArray = [
        ...alertStatusTable.slice(0, idx), // Take elements before the xth element
        ...alertStatusTable.slice(idx + 1) // Take elements after the xth element
      ];
      alertStatusTable = newArray;
      this.saveAlertTable(user);
    }
  }
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