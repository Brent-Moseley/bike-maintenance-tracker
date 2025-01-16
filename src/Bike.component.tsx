import { useEffect, useState } from "react";
import AlertsComponent from "./Alerts.component";
import BikeCard from "./Components/BikeCard.component";
import MaintLogComponent from "./MaintLog.component";
import { Bike, BikeService } from "./services/BikeService";
import BikeDropdown from "./Components/BikeDropdown.component";

const BikeComponent = () => {
  //const { data, error, isLoading } = useQuery('myData', fetchMyData);

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error loading data</div>;
  const [bikeData, setBikeData] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState("");
  const [selectedBikeIndex, setSelectedBikeIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const bikedata = await BikeService.getBikes(
        "123e4567-e89b-12d3-a456-426614174000"  // user
      );
      debugger;
      setBikeData(bikedata);
    };
    fetchData();
  }, []);

  const handleDataFromChild = (data: string) => {
    setSelectedBike(data);
    console.log("Data from child:", data);
    const idx = bikeData.findIndex(bike => bike.id === data);
    setSelectedBikeIndex(idx);
  };

  return (
    <div>
      {bikeData.length > 0 ? (
        <div>
          <BikeDropdown bikes={bikeData} onDataFromChild={handleDataFromChild}></BikeDropdown>
          <BikeCard bike={bikeData[selectedBikeIndex]}></BikeCard>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <br />
      <MaintLogComponent></MaintLogComponent>
      <AlertsComponent></AlertsComponent>
    </div>
  );
};

export default BikeComponent;
