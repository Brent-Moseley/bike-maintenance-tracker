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
// Get data:
// localStorage.getItem("BikeMaintTracker");
let bikeData: BikeAll[] = [
  {
    bike: {
      userID: "123e4567-e89b-12d3-a456-426614174000",
      id: "a13",    // Placeholder data
      name: "",
      brand: "",
      model: "",
      spec: "",
      notes: "",
      monthYearPurchased: new Date("2013-03-15"),
      dateLastServiced: new Date("2013-03-16"),
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
    console.log("start:");
    //if (bikeData.length === 0) return []; 
    const returnData: Bike[] = (
      bikeData.filter((bike) => {
        return bike.bike.userID == user;
      }) ?? []
    ).map((bike) => bike.bike);
    return returnData;
  },
  getMaintLog: async function (
    user: string,
    bikeId: string
  ): Promise<MaintLog[]> {
    const bike = bikeData.filter((bike) => {
      return bike.bike.userID === user && bike.bike.id === bikeId;
    });
    if (bike && bike.length > 0) return bike[0].maintLog;
    else return [];
    // const returnData: MaintLog[] = (bikeData.filter((bike) => {
    //   return bike.bike.userID == user && bike.bike.id == bikeId;
    // }) ?? [])[0].maintLog;
    // return returnData;
  },
  setMaintLog: async function (
    user: string,
    bikeId: string,
    updated: MaintLog[]
  ): Promise<boolean> {
    let bike = bikeData.filter((bike) => {
      return bike.bike.userID === user && bike.bike.id === bikeId;
    });
    if (bike.length === 0) return false;
    bike[0].maintLog = updated;
    this.saveAll(bikeData);
    console.log("Service updated with: ");
    console.log(updated);
    return true;
  },
  getAlerts: async function (user: string, bikeId: string): Promise<Alert[]> {
    if (bikeId.length > 0) {
    const bike = bikeData.filter((bike) => {
      return bike.bike.userID === user && bike.bike.id === bikeId;
    });
    if (bike && bike.length > 0) return bike[0].alerts;
    else return [];
  }
  else {
    const bike = bikeData.filter((bike) => {
      return bike.bike.userID == user
    });
    if (bike.length === 0) return [];
    var allAlerts: Alert[] = [];
    // Combine alerts from all bikes.
    // Keep a separate list of acknowledged alerts.
    //  This will be a lot easier when I have it all in a table.
    for (var value of bike) {
      allAlerts = allAlerts.concat(value.alerts);
    }
    console.log("All alerts:");
    console.log(allAlerts);
    return allAlerts;
  }
    // const returnData: Alerts[] = (bikeData.filter((bike) => {
    //   return bike.bike.userID == user && bike.bike.id == bikeId;
    // }) ?? [])[0].alerts;
    // return returnData;
  },
  addAlert: async function (alert: Alert): Promise<boolean> {
    // console.log("  ^^^^^^ looking for bike to add repeatable alert to...");
    // let bike = bikeData.filter((bike) => {
    //   return bike.bike.userID == alert.userID && bike.bike.id == alert.bikeID;
    // });
    // if (bike.length === 0) return false;
    // console.log("Bike found"); 
    console.log("     Adding a new alert: " + JSON.stringify(alert));
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
    console.log("looking for bike to save alerts");
    let bike = bikeData.filter((bike) => {
      return bike.bike.userID === user && bike.bike.id === bikeId;
    });
    if (bike.length === 0) return false;
    console.log("Bike found");
    bike[0].alerts = updated;
    this.saveAll(bikeData);
    console.log("Service updated with: ");
    console.log(updated);
    return true;
  },
  saveAll: async function (data: BikeAll[]) {
    localStorage.setItem("BikeMaintTracker", JSON.stringify(data));
  },
  loadAll: async function (): Promise<BikeAll[]> {
    const data = localStorage.getItem("BikeMaintTracker");
    if (!data || data.length < 4) return [];
    else return JSON.parse(data, dateReviver);
  },
  saveBike: async function (data: Bike, idx: number) {
    if (idx === bikeData.length) {
      // New bike
      const newData: BikeAll = {
        bike: data,
        alerts: [],
        maintLog: []
      }
      bikeData.push(newData);
    }
    else bikeData[idx].bike = data;
    this.saveAll(bikeData);
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

const attemptLoad = async () => {
  let savedData: BikeAll[] = await BikeService.loadAll();
  if (savedData && savedData.length > 0) bikeData = savedData;
  console.log(`Loaded data of length: ${savedData.length}`);
};

attemptLoad();


// I can get this, I can do this, I can handle this!  I can rock this project and rock
// this career!  I have almost reached 12 years in this return career, and ballpark of
// 1.6 million dollars in salary.  Code is gold!  It is worth it!  