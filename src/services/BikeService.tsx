// UserService.ts
import axios from 'axios';/*

Purpose:  Handle all output with data storage outside of the React app.

*/

// Local testing:  "https://localhost:7055";
// Prod (Azure) testing: "https://bike-maint-tracker-hxafcdavbkghcmbw.canadacentral-01.azurewebsites.net/";
const API_URL = "https://bike-maint-tracker-hxafcdavbkghcmbw.canadacentral-01.azurewebsites.net/";
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
      const response = await axios.get<Bike[]>(API_URL + '/Bike/' + user);
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
      const response = await axios.get<MaintLog[]>(API_URL + '/Bike/GetMaintLog?user=' + user + '&bike=' + bikeId);
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
  getUser: async function (
    user: string,
    passCode: string
  ): Promise<User | undefined> {
    // const bike = bikeData.filter((bike) => {
    //   return bike.bike.userID === user && bike.bike.id === bikeId;
    // });
    // if (bike && bike.length > 0) return bike[0].maintLog;
    // else return [];
    //https://localhost:7055/Bike/GetMaintLog?user=user1&bike=bike1
    if (user === "" || passCode === "") return undefined;
    try {
      const response = await axios.get<User>(API_URL + '/Bike/GetUser?user=' + user + '&passCode=' + passCode);
      console.log(response.data);
      if (!response.data.id) return undefined;
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
    // let bike = bikeData.filter((bike) => {
    //   return bike.bike.userID === user && bike.bike.id === bikeId;
    // });
    // if (bike.length === 0) return false;
    // bike[0].maintLog = updated;
    // this.saveAll(bikeData);
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
      const response = await axios.get<Alert[]>(API_URL + '/Bike/GetAlerts?user=' + user + '&bike=' + bikeId);
      for (let alert of response.data) {
        if (alert.date) alert.date = new Date(alert.date);
        // Auto convert repeat days to months, with one decimal point precision
        if (alert.repeatDays) alert.repeatDays = parseFloat((alert.repeatDays / 30.4).toFixed(1));
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
    // Auto convert repeat months back to days, rounded to nearest day
    //if (alert.date) alert.isoDate = alert.date.toISOString(); 
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
  // https://www.reddit.com/r/dotnet/comments/1alkpiz/a_question_regarding_date_conversion_from/
  // https://softwareengineering.stackexchange.com/questions/436540/is-the-frontend-or-backend-api-responsible-for-formatting-data-in-a-specific-l
  // https://stackoverflow.com/questions/7374731/net-save-datetime-and-completely-ignore-timezone
  // https://www.reddit.com/r/csharp/comments/10jl7tl/date_displays_differently_between_timezones/
  // **  https://softwareengineering.stackexchange.com/questions/209421/best-practice-to-store-datetime-based-on-timezone
// https://www.msn.com/en-us/money/careersandeducation/stop-being-too-nice-at-work-says-psychologist-this-is-what-successful-people-do-to-be-more-genuine-trustworthy/ar-AA1DxllG?ocid=winp2fptaskbarhover&cvid=83d8a5a8f05d451594acf0aa49b49cb5&ei=17 


  setAlerts: async function (
    added: Alert[],
    deleted: string[],
  ): Promise<boolean> {
    for (let alert of added) {
      //if (alert.date) alert.date = alert.date.toISOString();
      // Auto convert repeat months back to days, rounded to nearest day
      if (alert.repeatDays) alert.repeatDays = parseFloat((alert.repeatDays * 30.4).toFixed(0));
    }
    console.log("------ Savings alerts:");
    console.log(added);
    // BCM Add an edit ability, where we have an array of edited alerts.  Put them in
    // the delete set, and then in the add alerts set.  There should not be a primary
    // key violation.  
    await axios.delete(API_URL + '/Bike/DeleteAlerts/' + JSON.stringify(deleted))
    .then(response => {
      console.log('Response:', response.data); // Handle successful response
    })
    .catch(error => {
      console.error('Error:', error); // Handle any errors
      throw error;
    });
    await axios.post(API_URL + '/Bike/AddAlerts', added)
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
      const newData: BikeAll = {
        bike: data,
        alerts: [],
        maintLog: [],
      };
      bikeData.push(newData);
      await axios.post(API_URL + '/Bike', data)
        .then(response => {
          console.log('Response:', response.data); // Handle successful response
        })
        .catch(error => {
          console.error('Error:', error); // Handle any errors
          throw error;
        });
    } else {
      //bikeData[idx].bike = data;
      await axios.put(API_URL + '/Bike', data)
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
    console.log("   &&&&& populate alert status");
    if (user === "") return;
    try {
      const response = await axios.get<AlertStatus[]>(API_URL + '/Bike/GetAlertStatus/' + user);

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
    console.log("   ----- saving alert table:");
    console.log(JSON.stringify(alertStatusTable));
    axios.post(API_URL + '/Bike/SetAlertStatus', { user: userId, update: JSON.stringify(alertStatusTable) })
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
    console.log(`     retrieve alert status for ${id}, ${result?.status}`);
    if (result) return result.status
    else return undefined;
  },
  setAlertStatus: function (user: string, id: string, status: string) {
    var result = alertStatusTable.find(al => al.id === id);
    console.log(`     set alert status for ${id}, ${result?.status}`);
    if (result) result.status = status;
    this.saveAlertTable(user);
  },
  addAlertStatus: function (user: string, id: string, status: string, save: boolean = true) {
    alertStatusTable.push({ id: id, status: status });
    console.log(`     add alert status for ${id}, ${status}`);
    if (save) this.saveAlertTable(user);
  },
  removeAlertStatus: function (user: string, id: string, save: boolean = true) {
    console.log(`     remove alert status for ${user}, ${id}`);
    var idx = alertStatusTable.findIndex(al => al.id === id);
    if (idx > -1) {
      const newArray = [
        ...alertStatusTable.slice(0, idx), // Take elements before the xth element
        ...alertStatusTable.slice(idx + 1) // Take elements after the xth element
      ];
      alertStatusTable = newArray;
      console.log("     New value: " + JSON.stringify(alertStatusTable));
      if (save) this.saveAlertTable(user);
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

/*
  I love coding and development, code is gold!  This is leading to a very bright future!
  Keep practicing skills, creative ideas. 


*/