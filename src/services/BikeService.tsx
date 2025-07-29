// UserService.ts
import axios from 'axios';/*

Purpose:  Handle all output with data storage outside of the React app.

*/

// Local testing:  "https://localhost:7055";
// Prod (Azure) testing: "https://bike-maint-tracker-hxafcdavbkghcmbw.canadacentral-01.azurewebsites.net/";
const API_URL = "https://bike-maint-tracker-hxafcdavbkghcmbw.canadacentral-01.azurewebsites.net/";
//const API_URL = "https://localhost:7055";
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

export interface User {
  id: string;
  passCode: string;
  name: string;
  email?: string;
  token: string;
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
  [key: string]: any; // Allows indexing with string keys
  id: string;
  userID: string;
  bikeID: string;
  bikeName: string;
  date?: Date;
  //isoDate?: string;
  description: string;
  miles?: number;
  repeatMiles?: number;
  repeatDays?: number;
  status?: string;
}

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

let alertStatusLock = false;
type TimeoutId = ReturnType<typeof setTimeout> | undefined ;
let currentTimeout: TimeoutId = undefined;

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

interface AlertStatus {
  id: string;
  status: string;
}

// interface AlertStatusDB {
//   id: string;
//   userId: string;
//   statusString: string;
// }

let alertStatusTable: AlertStatus[] = [];
let userToken = "";

export const BikeService = {
  getBikes: async function (user: string): Promise<Bike[]> {
    if (user === "") return [];
    try {
      const response = await axios.get<Bike[]>(API_URL + '/Bike/' + user);
      for (let bike of response.data) {
        bike.dateLastServiced = new Date(bike.dateLastServiced);
        bike.monthYearPurchased = new Date(bike.monthYearPurchased);
      }
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }
  },

  getMaintLog: async function (
    user: string,
    bikeId: string
  ): Promise<MaintLog[]> {
    if (user === "" || bikeId === "") return [];
    try {
      const response = await axios.get<MaintLog[]>(API_URL + '/Bike/GetMaintLog?user=' + user + '&bike=' + bikeId);
      for (let log of response.data) {
        log.date = new Date(log.date);
      }
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }


  },
  getUser: async function (
    user: string,
    passCode: string
  ): Promise<User | undefined> {
    if (user === "" || passCode === "") return undefined;
    try {
      const response = await axios.get<User>(API_URL + '/Bike/GetUser?user=' + user + '&passCode=' + passCode);
      if (!response.data.id) {
        console.log('  Login denied');

        return undefined;
      }
      userToken = response.data.token;
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return undefined;
    }
  },
  setMaintLog: async function (
    added: MaintLog[],
    deleted: string[],
  ): Promise<boolean> {
    await axios.delete(API_URL + '/Bike/DeleteMaintLog/' + JSON.stringify(deleted))
      .then(response => {
        console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
        throw error;
      });

    await axios.post(API_URL + '/Bike/AddMaintLog', added)
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
    if (user === "") return [];
    try {
      const response = await axios.get<Alert[]>(API_URL + '/Bike/GetAlerts?user=' + user + '&bike=' + bikeId);
      for (let alert of response.data) {
        if (alert.date) alert.date = new Date(alert.date);
        // Auto convert repeat days to months, with one decimal point precision
        if (alert.repeatDays) alert.repeatDays = parseFloat((alert.repeatDays / 30.4).toFixed(1));
      }
      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }

  },
  addAlert: async function (alert: Alert): Promise<boolean> {
    if (alert.repeatDays) alert.repeatDays = parseFloat((alert.repeatDays * 30.4).toFixed(0));

    await axios.post(API_URL + '/Bike/AddAlerts', [alert])
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
    for (let alert of added) {
      //if (alert.date) alert.date = alert.date.toISOString();
      // Auto convert repeat months back to days, rounded to nearest day
      if (alert.repeatDays) alert.repeatDays = parseFloat((alert.repeatDays * 30.4).toFixed(0));
    }
    await axios.delete(API_URL + '/Bike/DeleteAlerts/' + JSON.stringify(deleted))
      .then(response => {
        //console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        //console.error('Error:', error); // Handle any errors
        throw error;
      });
    await axios.post(API_URL + '/Bike/AddAlerts', added)
      .then(response => {
        //console.log('Response:', response.data); // Handle successful response
      })
      .catch(error => {
        console.error('Error:', error); // Handle any errors
        throw error;
      });

    return true;
  },
  saveAll: async function (data: BikeAll[]) {
  },
  saveBike: async function (data: Bike, newBike: boolean, idx: number) {
    if (newBike) {
      const newData: BikeAll = {
        bike: data,
        alerts: [],
        maintLog: [],
      };
      bikeData.push(newData);
      await axios.post(API_URL + '/Bike', data)
        .then(response => {
          //console.log('Response:', response.data); // Handle successful response
        })
        .catch(error => {
          console.error('Error:', error); // Handle any errors
          throw error;
        });
    } else {
      await axios.put(API_URL + '/Bike', data)
        .then(response => {
          //console.log('Response:', response.data); // Handle successful response
        })
        .catch(error => {
          console.error('Error:', error); // Handle any errors
          throw error;
        });

    }
  },
  populateAlertStatuses: async function (user: string) {
    if (user === "") return;
    try {
      const response = await axios.get<AlertStatus[]>(API_URL + '/Bike/GetAlertStatus/' + user);

      if (response.data.length > 0) alertStatusTable = response.data;   // axios does the JSON parse automatically
      alertStatusLock = false;

      return response.data;
    } catch (error) {
      console.error(error);
      //throw error;
      return [];
    }
  },
  saveAlertTable: function (userId: string) {
    if (!alertStatusLock) {
      alertStatusLock = true;
      axios.post(API_URL + '/Bike/SetAlertStatus', { user: userId, update: JSON.stringify(alertStatusTable) })
        .then(response => {
          alertStatusLock = false;
          currentTimeout = undefined;
        })
        .catch(error => {
          console.error('Error saving alert statuses:', error); // Handle any errors
          throw error;
        });
    }
    else {
      // Busy saving other alert statuses, try again in 3 seconds.
      if (currentTimeout != undefined ) {
        // Cancel the last one that is still pending.
        clearTimeout(currentTimeout);
      }
      currentTimeout = setTimeout(() => {
        this.saveAlertTable(userId);
      }, 3000);
    }
  },
  getAlertStatus: function (id: string): string | undefined {
    var result = alertStatusTable.find(al => al.id === id);
    if (result) return result.status
    else return undefined;
  },
  setAlertStatus: function (user: string, id: string, status: string) {
    var result = alertStatusTable.find(al => al.id === id);
    if (result) result.status = status;
    // Then also save update on back end
    this.saveAlertTable(user);
  },
  addAlertStatus: function (user: string, id: string, status: string, save: boolean = true) {
    alertStatusTable.push({ id: id, status: status });
    // Then also save update on back end

    if (save) this.saveAlertTable(user);
  },
  removeAlertStatus: function (user: string, id: string, save: boolean = true) {
    var idx = alertStatusTable.findIndex(al => al.id === id);
    if (idx > -1) {
      const newArray = [
        ...alertStatusTable.slice(0, idx), // Take elements before the xth element
        ...alertStatusTable.slice(idx + 1) // Take elements after the xth element
      ];
      alertStatusTable = newArray;
      if (save) this.saveAlertTable(user);
    }
  }
};

